import express from 'express';
import { 
  register, 
  login, 
  getCurrentParent,
  linkToStudent,
  getStudentDetails,
  updateNotificationSettings
} from '../controllers/parent.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

// Public routes
router.post('/register', register);
router.post('/login', login);

// Protected routes - require authentication
router.get('/me', protect, getCurrentParent);
router.post('/link-student', protect, linkToStudent);
router.get('/student/:studentId', protect, getStudentDetails);
router.put('/notifications', protect, updateNotificationSettings);

export default router; 