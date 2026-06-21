const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Referral = sequelize.define('Referral', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  referrerId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'referrer_id'
  },
  referredId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'referred_id'
  },
  rewardAmount: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 50.00, // Default ₹50 or $50 reward
    field: 'reward_amount'
  },
  status: {
    type: DataTypes.ENUM('pending', 'credited'),
    defaultValue: 'pending'
  }
});

module.exports = Referral;
