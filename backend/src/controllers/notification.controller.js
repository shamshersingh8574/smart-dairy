const notificationService = require('../services/notification.service');

const getNotifications = async (req, res, next) => {
  try {
    const list = await notificationService.getNotifications(req.user.id);
    return res.status(200).json({
      success: true,
      data: list
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const notification = await notificationService.markAsRead(req.user.id, id);
    return res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: notification
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = {
  getNotifications,
  markAsRead
};
