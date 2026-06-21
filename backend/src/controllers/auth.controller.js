const authService = require('../services/auth.service');

const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, role, referredByCode } = req.body;
    const data = await authService.register({ name, email, password, phone, role, referredByCode });
    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      ...data
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const data = await authService.login({ email, password });
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      ...data
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const getProfile = async (req, res, next) => {
  try {
    const user = await authService.getProfile(req.user.id);
    return res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const addAddress = async (req, res, next) => {
  try {
    const address = await authService.addAddress(req.user.id, req.body);
    return res.status(201).json({
      success: true,
      message: 'Address added successfully',
      data: address
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const getAddresses = async (req, res, next) => {
  try {
    const addresses = await authService.getAddresses(req.user.id);
    return res.status(200).json({
      success: true,
      data: addresses
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const deleteAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    await authService.deleteAddress(req.user.id, id);
    return res.status(200).json({
      success: true,
      message: 'Address deleted successfully'
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  addAddress,
  getAddresses,
  deleteAddress
};
