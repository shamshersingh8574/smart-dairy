const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Delivery = sequelize.define('Delivery', {
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
  deliveryAgentId: {
    type: DataTypes.UUID,
    allowNull: true, // Nullable initially until assigned
    field: 'delivery_agent_id'
  },
  status: {
    type: DataTypes.ENUM('assigned', 'picked_up', 'delivered', 'failed'),
    defaultValue: 'assigned'
  },
  otp: {
    type: DataTypes.STRING,
    allowNull: true
  },
  deliveryTime: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'delivery_time'
  }
});

module.exports = Delivery;
