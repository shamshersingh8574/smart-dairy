const {
  Subscription,
  ProductVariant,
  Product,
  Address,
  ServiceArea,
  Wallet,
  WalletTransaction,
  Order,
  OrderItem,
  Payment,
  Delivery,
  Inventory,
  Notification,
  sequelize
} = require('../models');

const createSubscription = async (userId, { variantId, addressId, quantity, frequency, customDays, startDate }) => {
  const variant = await ProductVariant.findByPk(variantId);
  if (!variant) {
    throw new Error('Product variant not found');
  }

  const address = await Address.findOne({ where: { id: addressId, userId } });
  if (!address) {
    throw new Error('Address not found');
  }

  // Set first delivery date
  const firstDelivery = startDate || new Date().toISOString().split('T')[0];

  const subscription = await Subscription.create({
    userId,
    variantId,
    addressId,
    quantity: quantity || 1,
    frequency: frequency || 'daily',
    customDays: customDays || null,
    startDate: firstDelivery,
    nextDeliveryDate: firstDelivery,
    status: 'active'
  });

  return subscription;
};

const getMySubscriptions = async (userId) => {
  return await Subscription.findAll({
    where: { userId },
    include: [
      { model: ProductVariant, as: 'variant', include: [{ model: Product, as: 'product' }] },
      { model: Address, as: 'address' }
    ]
  });
};

const updateStatus = async (userId, subscriptionId, { status }) => {
  const subscription = await Subscription.findOne({ where: { id: subscriptionId, userId } });
  if (!subscription) {
    throw new Error('Subscription not found');
  }

  if (!['active', 'paused', 'cancelled'].includes(status)) {
    throw new Error('Invalid subscription status');
  }

  subscription.status = status;
  await subscription.save();
  return subscription;
};

// Engine: Process automated deliveries for a target date
const processDailyDeliveries = async (targetDateString) => {
  const date = new Date(targetDateString);
  const dateOnlyStr = date.toISOString().split('T')[0];
  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const currentDayName = daysOfWeek[date.getDay()];

  console.log(`[Subscription Engine] Processing deliveries for date: ${dateOnlyStr} (${currentDayName})...`);

  // Fetch all active subscriptions
  const activeSubs = await Subscription.findAll({
    where: { status: 'active', nextDeliveryDate: dateOnlyStr },
    include: [
      { model: ProductVariant, as: 'variant', include: [{ model: Product, as: 'product' }] },
      { model: Address, as: 'address' }
    ]
  });

  const results = {
    processed: 0,
    successCount: 0,
    failedCount: 0,
    failures: []
  };

  for (const sub of activeSubs) {
    results.processed++;
    const transaction = await sequelize.transaction();

    try {
      // 1. Verify if due today based on frequency details
      let isDue = false;
      if (sub.frequency === 'daily') {
        isDue = true;
      } else if (sub.frequency === 'alternate') {
        // Check days difference since start date
        const start = new Date(sub.startDate);
        const diffTime = Math.abs(date - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (diffDays % 2 === 0) {
          isDue = true;
        }
      } else if (sub.frequency === 'custom' && sub.customDays) {
        const daysArr = sub.customDays.split(',').map(d => d.trim().toLowerCase());
        if (daysArr.includes(currentDayName.toLowerCase())) {
          isDue = true;
        }
      }

      if (!isDue) {
        // Skip today, set next date
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);
        sub.nextDeliveryDate = nextDate.toISOString().split('T')[0];
        await sub.save({ transaction });
        await transaction.commit();
        continue;
      }

      // 2. Fetch Customer Wallet and verify funds
      const wallet = await Wallet.findOne({ where: { userId: sub.userId } }, { transaction });
      const price = sub.variant.discountPrice ? parseFloat(sub.variant.discountPrice) : parseFloat(sub.variant.price);
      const subTotal = price * sub.quantity;

      // Check pincode for service delivery fee
      const serviceArea = await ServiceArea.findOne({
        where: { pincode: sub.address.postalCode, status: 'active' }
      }, { transaction });

      const franchiseId = serviceArea ? serviceArea.franchiseId : null;
      const deliveryCharge = serviceArea ? parseFloat(serviceArea.deliveryCharge) : 0.00;
      const totalAmount = subTotal + deliveryCharge;

      if (!wallet || parseFloat(wallet.balance) < totalAmount) {
        throw new Error(`Insufficient wallet balance (Required: ₹${totalAmount.toFixed(2)}, Available: ₹${wallet ? parseFloat(wallet.balance).toFixed(2) : '0.00'})`);
      }

      // 3. Verify Franchise Inventory Stock
      const inventory = await Inventory.findOne({
        where: {
          variantId: sub.variantId,
          ...(franchiseId ? { franchiseId } : { franchiseId: null })
        }
      }, { transaction });

      if (!inventory || inventory.stockCount < sub.quantity) {
        throw new Error(`Insufficient stock for: ${sub.variant.product.name}. Available: ${inventory ? inventory.stockCount : 0}`);
      }

      // 4. Create Order & OrderItem
      const order = await Order.create({
        userId: sub.userId,
        addressId: sub.addressId,
        franchiseId,
        orderType: 'subscription',
        status: 'placed',
        totalAmount,
        deliveryCharge,
        deliverySlot: '6:00 AM - 9:00 AM' // Standard subscription morning slot
      }, { transaction });

      await OrderItem.create({
        orderId: order.id,
        variantId: sub.variantId,
        quantity: sub.quantity,
        price
      }, { transaction });

      // 5. Deduct Wallet Balance & Log Transaction
      await wallet.update({ balance: parseFloat(wallet.balance) - totalAmount }, { transaction });
      await WalletTransaction.create({
        walletId: wallet.id,
        amount: totalAmount,
        transactionType: 'debit',
        description: `Daily subscription charge for ${sub.variant.product.name}`,
        referenceId: order.id
      }, { transaction });

      // 6. Deduct Inventory Stock
      await inventory.update({ stockCount: inventory.stockCount - sub.quantity }, { transaction });

      // 7. Create Payment and Delivery assignments
      const transactionId = 'SUB-' + Math.random().toString(36).substring(2, 10).toUpperCase();
      await Payment.create({
        orderId: order.id,
        transactionId,
        amount: totalAmount,
        paymentMethod: 'wallet',
        status: 'success'
      }, { transaction });

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      await Delivery.create({
        orderId: order.id,
        status: 'assigned',
        otp
      }, { transaction });

      // 8. Update Subscription next delivery date to tomorrow
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      sub.nextDeliveryDate = nextDate.toISOString().split('T')[0];
      await sub.save({ transaction });

      // 9. Send Notification to User
      await Notification.create({
        userId: sub.userId,
        title: 'Subscription Delivery Placed!',
        message: `Your daily subscription order for ${sub.variant.product.name} (${sub.variant.volumeWeight}) has been billed and scheduled.`
      }, { transaction });

      await transaction.commit();
      results.successCount++;

    } catch (error) {
      await transaction.rollback();
      results.failedCount++;
      results.failures.push({ subscriptionId: sub.id, error: error.message });

      // Skip this delivery for today so it doesn't block processing, but set next date to tomorrow
      try {
        const nextDate = new Date(date);
        nextDate.setDate(nextDate.getDate() + 1);
        await sub.update({ nextDeliveryDate: nextDate.toISOString().split('T')[0] });

        // Send warning notification
        await Notification.create({
          userId: sub.userId,
          title: 'Subscription Delivery Failed',
          message: `Your subscription delivery for ${sub.variant.product.name} today failed: ${error.message}. Please recharge your wallet.`
        });
      } catch (notifierErr) {
        console.error('Failed to notify client about subscription error', notifierErr);
      }
    }
  }

  return results;
};

module.exports = {
  createSubscription,
  getMySubscriptions,
  updateStatus,
  processDailyDeliveries
};
