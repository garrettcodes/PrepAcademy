import express from 'express';
import { 
  getQuestions, 
  submitAnswer, 
  createQuestion, 
  getQuestionHint,
  getQuestionExplanation
} from '../controllers/question.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

// GET /api/questions - Get practice questions
router.get('/', protect, getQuestions);

// POST /api/questions/answer - Submit answer for a question
router.post('/answer', protect, submitAnswer);

// POST /api/questions - Create a new question (admin only)
router.post('/', protect, createQuestion);

// GET /api/questions/:questionId/hint - Get a hint for a question
router.get('/:questionId/hint', protect, getQuestionHint);

// GET /api/questions/:questionId/explanation - Get an explanation for a question
router.get('/:questionId/explanation', protect, getQuestionExplanation);

export default router; 