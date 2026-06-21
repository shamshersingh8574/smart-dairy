const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Cart = sequelize.define('Cart', {
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
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1
  }
}, {
  tableName: 'cart_items' // Pluralize properly as cart_items
});

module.exports = Cart;
