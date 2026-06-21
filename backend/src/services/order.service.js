const {
  Cart,
  Order,
  OrderItem,
  ProductVariant,
  Product,
  Inventory,
  Address,
  ServiceArea,
  Wallet,
  WalletTransaction,
  Payment,
  Delivery,
  sequelize
} = require('../models');

// 1. Cart Actions
const getCart = async (userId) => {
  return await Cart.findAll({
    where: { userId },
    include: [
      {
        model: ProductVariant,
        as: 'variant',
        include: [{ model: Product, as: 'product' }]
      }
    ]
  });
};

const addToCart = async (userId, { variantId, quantity }) => {
  const variant = await ProductVariant.findByPk(variantId);
  if (!variant) {
    throw new Error('Product variant not found');
  }

  const [cartItem, created] = await Cart.findOrCreate({
    where: { userId, variantId },
    defaults: { quantity: quantity || 1 }
  });

  if (!created) {
    cartItem.quantity += quantity || 1;
    await cartItem.save();
  }

  return cartItem;
};

const updateCartItem = async (userId, cartItemId, { quantity }) => {
  const cartItem = await Cart.findOne({ where: { id: cartItemId, userId } });
  if (!cartItem) {
    throw new Error('Cart item not found');
  }

  if (quantity <= 0) {
    await cartItem.destroy();
    return null;
  }

  cartItem.quantity = quantity;
  await cartItem.save();
  return cartItem;
};

const removeFromCart = async (userId, cartItemId) => {
  const cartItem = await Cart.findOne({ where: { id: cartItemId, userId } });
  if (!cartItem) {
    throw new Error('Cart item not found');
  }
  await cartItem.destroy();
  return true;
};

const clearCart = async (userId, transaction = null) => {
  await Cart.destroy({ where: { userId }, transaction });
};

// 2. Checkout & Order Placement
const placeOrder = async (userId, { addressId, paymentMethod, deliverySlot }) => {
  const transaction = await sequelize.transaction();

  try {
    // a. Load address and check pincode for service area/franchise matching
    const address = await Address.findOne({ where: { id: addressId, userId } }, { transaction });
    if (!address) {
      throw new Error('Shipping address not found');
    }

    const serviceArea = await ServiceArea.findOne({
      where: { pincode: address.postalCode, status: 'active' }
    }, { transaction });

    // Match franchise, default to null (main warehouse) if pincode not serviced
    const franchiseId = serviceArea ? serviceArea.franchiseId : null;
    const deliveryCharge = serviceArea ? parseFloat(serviceArea.deliveryCharge) : 0.00;

    // b. Load Cart items
    const cartItems = await Cart.findAll({
      where: { userId },
      include: [{ model: ProductVariant, as: 'variant', include: [{ model: Product, as: 'product' }] }]
    }, { transaction });

    if (cartItems.length === 0) {
      throw new Error('Your cart is empty');
    }

    // c. Check stock and calculate total price
    let subTotal = 0;
    const itemsToCreate = [];

    for (const item of cartItems) {
      const variant = item.variant;
      const qty = item.quantity;

      // Check Inventory stock
      const inventory = await Inventory.findOne({
        where: {
          variantId: variant.id,
          ...(franchiseId ? { franchiseId } : { franchiseId: null }) // stock from matched franchise or warehouse
        }
      }, { transaction });

      if (!inventory || inventory.stockCount < qty) {
        throw new Error(`Insufficient stock for: ${variant.product.name} (${variant.volumeWeight}). Available: ${inventory ? inventory.stockCount : 0}`);
      }

      const price = variant.discountPrice ? parseFloat(variant.discountPrice) : parseFloat(variant.price);
      subTotal += price * qty;

      itemsToCreate.push({
        variantId: variant.id,
        quantity: qty,
        price: price,
        inventoryRecord: inventory // store for stock deduction
      });
    }

    const totalAmount = subTotal + deliveryCharge;

    // d. Payment handling (if wallet-based)
    let wallet = null;
    if (paymentMethod === 'wallet') {
      wallet = await Wallet.findOne({ where: { userId } }, { transaction });
      if (!wallet || parseFloat(wallet.balance) < totalAmount) {
        throw new Error(`Insufficient wallet balance. Required: ₹${totalAmount.toFixed(2)}, Available: ₹${wallet ? parseFloat(wallet.balance).toFixed(2) : '0.00'}`);
      }
    }

    // e. Create the Order
    const order = await Order.create({
      userId,
      addressId,
      franchiseId,
      orderType: 'one-time',
      status: paymentMethod === 'wallet' ? 'paid' : 'pending',
      totalAmount,
      deliveryCharge,
      deliverySlot
    }, { transaction });

    // f. Create Order Items and deduct inventory stock
    for (const itemData of itemsToCreate) {
      await OrderItem.create({
        orderId: order.id,
        variantId: itemData.variantId,
        quantity: itemData.quantity,
        price: itemData.price
      }, { transaction });

      // Deduct inventory
      await itemData.inventoryRecord.update({
        stockCount: itemData.inventoryRecord.stockCount - itemData.quantity
      }, { transaction });
    }

    // g. Process Wallet transaction & Payment log if wallet chosen
    const transactionId = 'TXN-' + Math.random().toString(36).substring(2, 10).toUpperCase();

    if (paymentMethod === 'wallet') {
      // Deduct balance
      await wallet.update({
        balance: parseFloat(wallet.balance) - totalAmount
      }, { transaction });

      // Log transaction
      await WalletTransaction.create({
        walletId: wallet.id,
        amount: totalAmount,
        transactionType: 'debit',
        description: `Paid for order #${order.id.substring(0, 8)}`,
        referenceId: order.id
      }, { transaction });

      // Create Payment log
      await Payment.create({
        orderId: order.id,
        amount: totalAmount,
        transactionId,
        paymentMethod: 'wallet',
        status: 'success'
      }, { transaction });

      // Update order status
      order.status = 'placed';
      await order.save({ transaction });
    } else {
      // Create pending payment log for COD, Card or UPI
      await Payment.create({
        orderId: order.id,
        amount: totalAmount,
        transactionId,
        paymentMethod,
        status: 'pending'
      }, { transaction });
    }

    // h. Initialize Delivery Assignment
    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit delivery OTP
    await Delivery.create({
      orderId: order.id,
      status: 'assigned',
      otp
    }, { transaction });

    // i. Clear User Cart
    await clearCart(userId, transaction);

    await transaction.commit();

    // Return fully details order
    return await Order.findByPk(order.id, {
      include: [
        { model: OrderItem, as: 'items', include: [{ model: ProductVariant, as: 'variant', include: [{ model: Product, as: 'product' }] }] },
        { model: Payment, as: 'payment' },
        { model: Delivery, as: 'delivery' }
      ]
    });

  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const getOrderById = async (userId, orderId) => {
  const order = await Order.findOne({
    where: { id: orderId, userId },
    include: [
      { model: OrderItem, as: 'items', include: [{ model: ProductVariant, as: 'variant', include: [{ model: Product, as: 'product' }] }] },
      { model: Payment, as: 'payment' },
      { model: Delivery, as: 'delivery' },
      { model: Address, as: 'address' }
    ]
  });

  if (!order) {
    throw new Error('Order not found');
  }
  return order;
};

const getMyOrders = async (userId) => {
  return await Order.findAll({
    where: { userId },
    include: [
      { model: OrderItem, as: 'items', include: [{ model: ProductVariant, as: 'variant', include: [{ model: Product, as: 'product' }] }] },
      { model: Payment, as: 'payment' },
      { model: Delivery, as: 'delivery' }
    ],
    order: [['createdAt', 'DESC']]
  });
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  placeOrder,
  getOrderById,
  getMyOrders
};
