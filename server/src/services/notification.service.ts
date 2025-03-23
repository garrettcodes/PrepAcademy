import Notification from '../models/notification.model';
import User from '../models/user.model';
import mongoose from 'mongoose';

interface NotificationData {
  userId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: string;
  data?: Record<string, any>;
}

// Send a notification to a user
export const sendNotification = async (notificationData: NotificationData): Promise<boolean> => {
  try {
    const { userId, title, message, type, data } = notificationData;

    // Check if user exists
    const user = await User.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check user notification preferences
    if (!user.notificationSettings?.inApp) {
      // User has disabled in-app notifications
      return false;
    }

    // Create notification
    await Notification.create({
      user: userId,
      title,
      message,
      type,
      data: data || {},
      isRead: false,
    });

    // TODO: Handle push notifications here if implemented in the future

    return true;
  } catch (error) {
    console.error('Error sending notification:', error);
    return false;
  }
};

// Get all unread notifications for a user
export const getUnreadNotifications = async (userId: mongoose.Types.ObjectId): Promise<any[]> => {
  try {
    const notifications = await Notification.find({
      user: userId,
      isRead: false,
    }).sort({ createdAt: -1 });

    return notifications;
  } catch (error) {
    console.error('Error getting notifications:', error);
    return [];
  }
};

// Mark a notification as read
export const markNotificationAsRead = async (
  notificationId: mongoose.Types.ObjectId,
  userId: mongoose.Types.ObjectId
): Promise<boolean> => {
  try {
    const notification = await Notification.findOne({
      _id: notificationId,
      user: userId,
    });

    if (!notification) {
      return false;
    }

    notification.read = true;
    await notification.save();

    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
};

// Mark all notifications as read for a user
export const markAllNotificationsAsRead = async (
  userId: mongoose.Types.ObjectId
): Promise<boolean> => {
  try {
    await Notification.updateMany(
      { user: userId, isRead: false },
      { isRead: true }
    );

    return true;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }
}; 