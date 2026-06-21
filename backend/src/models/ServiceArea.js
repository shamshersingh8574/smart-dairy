const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ServiceArea = sequelize.define('ServiceArea', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  pincode: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  areaName: {
    type: DataTypes.STRING,
    allowNull: false,
    field: 'area_name'
  },
  franchiseId: {
    type: DataTypes.UUID,
    allowNull: true, // Null means main warehouse deliveries
    field: 'franchise_id'
  },
  deliveryCharge: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    field: 'delivery_charge'
  },
  status: {
    type: DataTypes.ENUM('active', 'inactive'),
    defaultValue: 'active'
  }
}, {
  tableName: 'service_areas'
});

module.exports = ServiceArea;
