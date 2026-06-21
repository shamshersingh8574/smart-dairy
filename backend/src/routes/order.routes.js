const express = require('express');
const router = express.Router();
const orderController = require('../controllers/order.controller');
const { protect } = require('../middlewares/auth.middleware');

router.use(protect); // Secure all order & cart routes

router.get('/cart', orderController.getCart);
router.post('/cart', orderController.addToCart);
router.put('/cart/:id', orderController.updateCartItem);
router.delete('/cart/:id', orderController.removeFromCart);

router.post('/place', orderController.placeOrder);
router.get('/my', orderController.getMyOrders);
router.get('/:id', orderController.getOrderById);

module.exports = router;
