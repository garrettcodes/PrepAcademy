import express from 'express';
import { getStudyPlan, updateStudyPlan, generateAdaptiveStudyPlan } from '../controllers/studyPlan.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

// GET /api/studyplan - Get user's study plan
router.get('/', protect, getStudyPlan);

// POST /api/studyplan/update - Update study plan
router.post('/update', protect, updateStudyPlan);

// POST /api/studyplan/generate - Generate adaptive study plan
router.post('/generate', protect, generateAdaptiveStudyPlan);

export default router; 