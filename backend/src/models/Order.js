const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  userId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'user_id'
  },
  addressId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'address_id'
  },
  franchiseId: {
    type: DataTypes.UUID,
    allowNull: true, // Optional if order is directly fulfilled by main warehouse
    field: 'franchise_id'
  },
  orderType: {
    type: DataTypes.ENUM('one-time', 'subscription'),
    defaultValue: 'one-time',
    field: 'order_type'
  },
  status: {
    type: DataTypes.ENUM('pending', 'paid', 'placed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'),
    defaultValue: 'pending'
  },
  totalAmount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false,
    field: 'total_amount'
  },
  discountAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    field: 'discount_amount'
  },
  deliveryCharge: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    field: 'delivery_charge'
  },
  deliverySlot: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'delivery_slot'
  }
});

module.exports = Order;
