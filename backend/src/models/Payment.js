const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  orderId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'order_id'
  },
  transactionId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    field: 'transaction_id'
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  paymentMethod: {
    type: DataTypes.ENUM('wallet', 'card', 'upi', 'cod'),
    defaultValue: 'wallet',
    field: 'payment_method'
  },
  status: {
    type: DataTypes.ENUM('pending', 'success', 'failed'),
    defaultValue: 'pending'
  }
});

module.exports = Payment;
