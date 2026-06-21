const { Notification } = require('../models');

const getNotifications = async (userId) => {
  return await Notification.findAll({
    where: { userId },
    order: [['createdAt', 'DESC']]
  });
};

const markAsRead = async (userId, notificationId) => {
  const notification = await Notification.findOne({
    where: { id: notificationId, userId }
  });

  if (!notification) {
    throw new Error('Notification not found');
  }

  notification.isRead = true;
  await notification.save();
  return notification;
};

module.exports = {
  getNotifications,
  markAsRead
};
