import express from 'express';
import {
  getMiniAssessmentStatus,
  getMiniAssessmentQuestions,
  submitMiniAssessment,
  triggerMiniAssessmentNotifications
} from '../controllers/miniAssessment.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

// GET /api/mini-assessment/status - Check if mini-assessment is due
router.get('/status', protect, getMiniAssessmentStatus);

// GET /api/mini-assessment/questions - Get questions for mini-assessment
router.get('/questions', protect, getMiniAssessmentQuestions);

// POST /api/mini-assessment/submit - Submit mini-assessment answers
router.post('/submit', protect, submitMiniAssessment);

// POST /api/mini-assessment/notify - Trigger notifications for due assessments (admin only)
router.post('/notify', triggerMiniAssessmentNotifications);

export default router; 