const orderService = require('../services/order.service');

// Cart Handlers
const getCart = async (req, res, next) => {
  try {
    const cart = await orderService.getCart(req.user.id);
    return res.status(200).json({
      success: true,
      data: cart
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const addToCart = async (req, res, next) => {
  try {
    const cartItem = await orderService.addToCart(req.user.id, req.body);
    return res.status(201).json({
      success: true,
      message: 'Product added to cart successfully',
      data: cartItem
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const updateCartItem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cartItem = await orderService.updateCartItem(req.user.id, id, req.body);
    return res.status(200).json({
      success: true,
      message: 'Cart updated successfully',
      data: cartItem
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const removeFromCart = async (req, res, next) => {
  try {
    const { id } = req.params;
    await orderService.removeFromCart(req.user.id, id);
    return res.status(200).json({
      success: true,
      message: 'Product removed from cart successfully'
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Order Handlers
const placeOrder = async (req, res, next) => {
  try {
    const order = await orderService.placeOrder(req.user.id, req.body);
    return res.status(201).json({
      success: true,
      message: 'Order placed successfully',
      data: order
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const order = await orderService.getOrderById(req.user.id, id);
    return res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: error.message
    });
  }
};

const getMyOrders = async (req, res, next) => {
  try {
    const orders = await orderService.getMyOrders(req.user.id);
    return res.status(200).json({
      success: true,
      data: orders
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  placeOrder,
  getOrderById,
  getMyOrders
};
