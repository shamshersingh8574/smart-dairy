const express = require('express');
const router = express.Router();
const walletController = require('../controllers/wallet.controller');
const { protect } = require('../middlewares/auth.middleware');

router.use(protect);

router.get('/', walletController.getWallet);
router.post('/recharge', walletController.rechargeWallet);
router.get('/history', walletController.getTransactionHistory);

module.exports = router;
