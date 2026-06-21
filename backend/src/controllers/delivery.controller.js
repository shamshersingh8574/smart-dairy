const deliveryService = require('../services/delivery.service');

const assignAgent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const delivery = await deliveryService.assignAgent(id, req.body);
    return res.status(200).json({
      success: true,
      message: 'Delivery agent assigned successfully',
      data: delivery
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const getMyDeliveries = async (req, res, next) => {
  try {
    const deliveries = await deliveryService.getAgentDeliveries(req.user.id);
    return res.status(200).json({
      success: true,
      data: deliveries
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const verifyOtp = async (req, res, next) => {
  try {
    const { id } = req.params;
    const delivery = await deliveryService.verifyOtpAndCompleteDelivery(id, req.body);
    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully. Delivery completed.',
      data: delivery
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  assignAgent,
  getMyDeliveries,
  verifyOtp
};
