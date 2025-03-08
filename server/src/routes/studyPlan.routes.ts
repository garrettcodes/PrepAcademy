import express from 'express';
import { 
  getStudyPlan, 
  updateStudyPlan, 
  generateStudyPlan,
  updateTaskStatus
} from '../controllers/studyPlan.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

// GET /api/studyplan - Get user's study plan
router.get('/', protect, getStudyPlan);

// POST /api/studyplan/update - Update study plan
router.post('/update', protect, updateStudyPlan);

// POST /api/studyplan/generate - Generate adaptive study plan
router.post('/generate', protect, generateStudyPlan);

// PATCH /api/studyplan/task - Update task status
router.patch('/task', protect, updateTaskStatus);

export default router; 