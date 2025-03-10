import express from 'express';
import { getLeaderboard } from '../controllers/leaderboard.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

// GET /api/leaderboard - Get leaderboard data
router.get('/', protect, getLeaderboard);

export default router; 