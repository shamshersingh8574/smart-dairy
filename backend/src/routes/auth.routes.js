const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { protect } = require('../middlewares/auth.middleware');

router.post('/register', authController.register);
router.post('/login', authController.login);

router.get('/profile', protect, authController.getProfile);
router.get('/addresses', protect, authController.getAddresses);
router.post('/addresses', protect, authController.addAddress);
router.delete('/addresses/:id', protect, authController.deleteAddress);

module.exports = router;
