const express = require('express');
const router = express.Router();
const franchiseController = require('../controllers/franchise.controller');
const { protect, restrictTo } = require('../middlewares/auth.middleware');

router.get('/service-areas', franchiseController.getServiceAreas);

// Protected routes
router.post('/', protect, restrictTo('admin'), franchiseController.createFranchise);
router.get('/my', protect, restrictTo('franchise'), franchiseController.getMyFranchise);
router.get('/inventory', protect, restrictTo('franchise'), franchiseController.getInventory);
router.put('/inventory', protect, restrictTo('franchise'), franchiseController.updateInventory);
router.post('/service-areas', protect, restrictTo('franchise'), franchiseController.addServiceArea);

module.exports = router;
