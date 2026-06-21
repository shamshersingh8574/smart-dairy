const express = require('express');
const router = express.Router();

const authRoutes = require('./auth.routes');
const productRoutes = require('./product.routes');
const orderRoutes = require('./order.routes');
const subscriptionRoutes = require('./subscription.routes');
const walletRoutes = require('./wallet.routes');
const franchiseRoutes = require('./franchise.routes');
const supportRoutes = require('./support.routes');
const analyticsRoutes = require('./analytics.routes');
const deliveryRoutes = require('./delivery.routes');
const notificationRoutes = require('./notification.routes');

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/orders', orderRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/wallet', walletRoutes);
router.use('/franchises', franchiseRoutes);
router.use('/support', supportRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/deliveries', deliveryRoutes);
router.use('/notifications', notificationRoutes);

module.exports = router;
