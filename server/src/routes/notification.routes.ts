import express from 'express';
import { protect } from '../middleware/auth';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '../controllers/notification.controller';

const router = express.Router();

// GET /api/notifications - Get all notifications for a user
router.get('/', protect, getNotifications);

// PUT /api/notifications/:notificationId - Mark a notification as read
router.put('/:notificationId', protect, markNotificationAsRead);

// PUT /api/notifications/read/all - Mark all notifications as read
router.put('/read/all', protect, markAllNotificationsAsRead);

export default router; 