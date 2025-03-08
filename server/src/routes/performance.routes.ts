import express from 'express';
import { getPerformanceData, saveStudyTime } from '../controllers/performance.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

// GET /api/performance - Get user's performance data
router.get('/', protect, getPerformanceData);

// POST /api/performance - Save study time for a subject
router.post('/', protect, saveStudyTime);

export default router; 