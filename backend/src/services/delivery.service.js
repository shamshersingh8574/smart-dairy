const { Delivery, Order, Franchise, Payment, sequelize } = require('../models');

const assignAgent = async (deliveryId, { agentId }) => {
  const delivery = await Delivery.findByPk(deliveryId);
  if (!delivery) {
    throw new Error('Delivery record not found');
  }
  delivery.deliveryAgentId = agentId;
  await delivery.save();
  return delivery;
};

const getAgentDeliveries = async (agentId) => {
  return await Delivery.findAll({
    where: { deliveryAgentId: agentId },
    include: [{ model: Order, as: 'order' }]
  });
};

const verifyOtpAndCompleteDelivery = async (deliveryId, { otp }) => {
  const transaction = await sequelize.transaction();

  try {
    const delivery = await Delivery.findOne({
      where: { id: deliveryId },
      include: [{ model: Order, as: 'order', include: [{ model: Payment, as: 'payment' }] }]
    }, { transaction });

    if (!delivery) {
      throw new Error('Delivery record not found');
    }

    if (delivery.status === 'delivered') {
      throw new Error('Delivery is already completed');
    }

    if (delivery.otp !== otp) {
      throw new Error('Invalid OTP code. Access denied.');
    }

    // Update delivery details
    delivery.status = 'delivered';
    delivery.deliveryTime = new Date();
    await delivery.save({ transaction });

    // Update associated order status
    const order = delivery.order;
    order.status = 'delivered';
    await order.save({ transaction });

    // If COD, mark payment as success now
    if (order.payment && order.payment.status !== 'success') {
      order.payment.status = 'success';
      await order.payment.save({ transaction });
    }

    // Calculate Franchise Commission and Credit Earnings
    if (order.franchiseId) {
      const franchise = await Franchise.findByPk(order.franchiseId, { transaction });
      if (franchise) {
        const rate = parseFloat(franchise.commissionRate) / 100;
        const orderAmount = parseFloat(order.totalAmount);
        const commissionEarned = orderAmount * rate;

        await franchise.update({
          earnings: parseFloat(franchise.earnings) + commissionEarned
        }, { transaction });
      }
    }

    await transaction.commit();
    return delivery;
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

module.exports = {
  assignAgent,
  getAgentDeliveries,
  verifyOtpAndCompleteDelivery
};
