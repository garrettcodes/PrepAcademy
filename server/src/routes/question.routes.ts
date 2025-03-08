import express from 'express';
import { getQuestions, submitAnswer, createQuestion } from '../controllers/question.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

// GET /api/questions - Get practice questions
router.get('/', protect, getQuestions);

// POST /api/questions/answer - Submit answer for a question
router.post('/answer', protect, submitAnswer);

// POST /api/questions - Create a new question (admin only)
router.post('/', protect, createQuestion);

export default router; 