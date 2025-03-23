import { Request, Response } from 'express';
import mongoose from 'mongoose';
import { AuthRequest } from '../types';

// Import notification model
import Notification from '../models/notification.model';

// Interface for notification data
export interface NotificationData {
  user: string;
  title: string;
  message: string;
  type?: string;
  link?: string;
  relatedId?: string; // Add relatedId for references to other objects
}

// Create a notification
export const createNotification = async (data: NotificationData) => {
  try {
    const notification = new Notification({
      userId: data.user,
      title: data.title,
      message: data.message,
      type: data.type || 'info',
      link: data.link,
      read: false,
    });
    
    await notification.save();
    return notification;
  } catch (error) {
    console.error('Create notification error:', error);
    throw error;
  }
};

// Get all notifications for a user
export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Add optional query params
    const limit = parseInt(req.query.limit as string) || 10;
    const unreadOnly = req.query.unreadOnly === 'true';
    
    // Create query
    const query: any = { userId };
    
    if (unreadOnly) {
      query.read = false;
    }
    
    // Get notifications
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit);
    
    // Get unread count
    const unreadCount = await Notification.countDocuments({ userId, read: false });
    
    res.status(200).json({
      notifications,
      unreadCount,
    });
  } catch (error: any) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark a notification as read
export const markNotificationAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { notificationId } = req.params;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Ensure the notification belongs to the user
    const notification = await Notification.findOne({
      _id: notificationId,
      userId,
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    // Update notification
    notification.read = true;
    await notification.save();

    res.status(200).json({
      message: 'Notification marked as read',
      notification,
    });
  } catch (error: any) {
    console.error('Mark notification as read error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Update all unread notifications for the user
    await Notification.updateMany(
      { userId, read: false },
      { read: true }
    );

    res.status(200).json({
      message: 'All notifications marked as read',
    });
  } catch (error: any) {
    console.error('Mark all notifications as read error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 