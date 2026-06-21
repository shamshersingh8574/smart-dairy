const walletService = require('../services/wallet.service');

const getWallet = async (req, res, next) => {
  try {
    const wallet = await walletService.getWallet(req.user.id);
    return res.status(200).json({
      success: true,
      data: wallet
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const rechargeWallet = async (req, res, next) => {
  try {
    const { amount, paymentMethod } = req.body;
    const data = await walletService.rechargeWallet(req.user.id, { amount, paymentMethod });
    return res.status(200).json({
      success: true,
      message: 'Wallet recharged successfully',
      data
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const getTransactionHistory = async (req, res, next) => {
  try {
    const history = await walletService.getTransactionHistory(req.user.id);
    return res.status(200).json({
      success: true,
      data: history
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getWallet,
  rechargeWallet,
  getTransactionHistory
};
