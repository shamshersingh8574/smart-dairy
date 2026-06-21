const subscriptionService = require('../services/subscription.service');

const createSubscription = async (req, res, next) => {
  try {
    const subscription = await subscriptionService.createSubscription(req.user.id, req.body);
    return res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      data: subscription
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const getMySubscriptions = async (req, res, next) => {
  try {
    const subscriptions = await subscriptionService.getMySubscriptions(req.user.id);
    return res.status(200).json({
      success: true,
      data: subscriptions
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const subscription = await subscriptionService.updateStatus(req.user.id, id, req.body);
    return res.status(200).json({
      success: true,
      message: 'Subscription status updated successfully',
      data: subscription
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Triggered manually or by cron
const triggerDailyDeliveries = async (req, res, next) => {
  try {
    const { targetDate } = req.body;
    const dateToProcess = targetDate || new Date().toISOString().split('T')[0];
    const result = await subscriptionService.processDailyDeliveries(dateToProcess);
    return res.status(200).json({
      success: true,
      message: 'Daily subscription processing complete',
      data: result
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  createSubscription,
  getMySubscriptions,
  updateStatus,
  triggerDailyDeliveries
};
