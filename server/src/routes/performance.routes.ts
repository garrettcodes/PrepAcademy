import express from 'express';
import { getPerformanceData } from '../controllers/performance.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

// GET /api/performance - Get user's performance data
router.get('/', protect, getPerformanceData);

export default router; 