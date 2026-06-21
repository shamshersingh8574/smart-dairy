const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Inventory = sequelize.define('Inventory', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  variantId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'variant_id'
  },
  franchiseId: {
    type: DataTypes.UUID,
    allowNull: true, // Nullable means global warehouse stock
    field: 'franchise_id'
  },
  stockCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    field: 'stock_count'
  },
  lowStockThreshold: {
    type: DataTypes.INTEGER,
    defaultValue: 10,
    field: 'low_stock_threshold'
  }
});

module.exports = Inventory;
