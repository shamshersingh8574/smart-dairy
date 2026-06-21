const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProductVariant = sequelize.define('ProductVariant', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  productId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'product_id'
  },
  sku: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  volumeWeight: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'volume_weight' // e.g., "500ml", "1L", "1kg"
  },
  price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  discountPrice: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: true,
    field: 'discount_price'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active'
  }
});

module.exports = ProductVariant;
