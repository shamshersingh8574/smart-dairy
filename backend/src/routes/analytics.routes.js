const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analytics.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');

router.get('/', protect, restrictTo('admin', 'franchise'), analyticsController.getStats);

module.exports = router;
