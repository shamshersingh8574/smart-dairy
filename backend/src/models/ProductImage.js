const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProductImage = sequelize.define('ProductImage', {
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
  imageUrl: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'image_url'
  },
  isPrimary: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_primary'
  }
});

module.exports = ProductImage;
