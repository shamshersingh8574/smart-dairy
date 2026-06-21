const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscription.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');

router.use(protect);

router.post('/', subscriptionController.createSubscription);
router.get('/', subscriptionController.getMySubscriptions);
router.put('/:id/status', subscriptionController.updateStatus);

// Admin-only trigger to run subscription deliveries engine manually
router.post('/trigger-daily', restrictTo('admin'), subscriptionController.triggerDailyDeliveries);

module.exports = router;
