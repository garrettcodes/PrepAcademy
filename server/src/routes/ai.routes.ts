import express from 'express';
import { getHint, getExplanation, getRecommendations, getAiStatus } from '../controllers/ai.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

// GET /api/ai/status - Check if AI integration is enabled
router.get('/status', protect, getAiStatus);

// POST /api/ai/hint - Get a hint for a question
router.post('/hint', protect, getHint);

// POST /api/ai/explanation - Get an explanation for a question
router.post('/explanation', protect, getExplanation);

// POST /api/ai/recommendations - Get personalized study recommendations
router.post('/recommendations', protect, getRecommendations);

export default router; 