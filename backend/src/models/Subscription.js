const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Subscription = sequelize.define('Subscription', {
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
  variantId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'variant_id'
  },
  addressId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'address_id'
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  },
  frequency: {
    type: DataTypes.ENUM('daily', 'alternate', 'custom'),
    defaultValue: 'daily'
  },
  customDays: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'custom_days' // e.g., "Monday,Wednesday,Friday"
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'start_date'
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'end_date'
  },
  nextDeliveryDate: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    field: 'next_delivery_date'
  },
  status: {
    type: DataTypes.ENUM('active', 'paused', 'cancelled'),
    defaultValue: 'active'
  }
});

module.exports = Subscription;
