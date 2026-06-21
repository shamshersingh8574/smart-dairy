const { Wallet, WalletTransaction, sequelize } = require('../models');

const getWallet = async (userId) => {
  const wallet = await Wallet.findOne({
    where: { userId },
    include: [{ model: WalletTransaction, as: 'transactions' }]
  });

  if (!wallet) {
    // Auto-create wallet if missing
    return await Wallet.create({ userId, balance: 0.00 });
  }

  return wallet;
};

const rechargeWallet = async (userId, { amount, paymentMethod }) => {
  const transaction = await sequelize.transaction();

  try {
    if (amount <= 0) {
      throw new Error('Recharge amount must be greater than zero');
    }

    let wallet = await Wallet.findOne({ where: { userId } }, { transaction });
    if (!wallet) {
      wallet = await Wallet.create({ userId, balance: 0.00 }, { transaction });
    }

    const newBalance = parseFloat(wallet.balance) + parseFloat(amount);
    await wallet.update({ balance: newBalance }, { transaction });

    const referenceId = 'RECHG-' + Math.random().toString(36).substring(2, 10).toUpperCase();

    const walletTxn = await WalletTransaction.create({
      walletId: wallet.id,
      amount: parseFloat(amount),
      transactionType: 'credit',
      description: `Wallet recharge via ${paymentMethod || 'card'}`,
      referenceId
    }, { transaction });

    await transaction.commit();
    return { wallet, transaction: walletTxn };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const getTransactionHistory = async (userId) => {
  const wallet = await Wallet.findOne({ where: { userId } });
  if (!wallet) {
    return [];
  }

  return await WalletTransaction.findAll({
    where: { walletId: wallet.id },
    order: [['createdAt', 'DESC']]
  });
};

module.exports = {
  getWallet,
  rechargeWallet,
  getTransactionHistory
};
