const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Franchise = sequelize.define('Franchise', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  ownerId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'owner_id'
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  commissionRate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 10.00,
    field: 'commission_rate'
  },
  earnings: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00
  }
});

module.exports = Franchise;
