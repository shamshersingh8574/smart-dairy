const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const WalletTransaction = sequelize.define('WalletTransaction', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  walletId: {
    type: DataTypes.UUID,
    allowNull: false,
    field: 'wallet_id'
  },
  amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  transactionType: {
    type: DataTypes.ENUM('credit', 'debit'),
    allowNull: false,
    field: 'transaction_type'
  },
  description: {
    type: DataTypes.STRING,
    allowNull: true
  },
  referenceId: {
    type: DataTypes.STRING,
    allowNull: true,
    field: 'reference_id'
  }
}, {
  tableName: 'wallet_transactions'
});

module.exports = WalletTransaction;
