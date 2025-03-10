import express from 'express';
import { 
  generateProgressReport,
  generateStudyTimeReport,
  generateTaskCompletionReport
} from '../controllers/report.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

// All routes are protected - require authentication
router.get('/progress/:studentId', protect, generateProgressReport);
router.get('/study-time/:studentId', protect, generateStudyTimeReport);
router.get('/task-completion/:studentId', protect, generateTaskCompletionReport);

export default router; 