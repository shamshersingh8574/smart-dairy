const express = require('express');
const router = express.Router();
const deliveryController = require('../controllers/delivery.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');

router.use(protect);

router.put('/:id/assign', restrictTo('admin', 'franchise'), deliveryController.assignAgent);
router.get('/my', restrictTo('delivery'), deliveryController.getMyDeliveries);
router.put('/:id/verify', restrictTo('delivery'), deliveryController.verifyOtp);

module.exports = router;
