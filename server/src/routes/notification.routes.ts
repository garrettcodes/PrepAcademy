import { Router } from 'express';
import * as notificationController from '../controllers/notification.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(protect);

// Get all notifications
router.get('/', notificationController.getNotifications);

// Mark notification as read
router.put('/:notificationId/read', notificationController.markNotificationAsRead);

// Mark all notifications as read
router.put('/read-all', notificationController.markAllNotificationsAsRead);

export default router; 