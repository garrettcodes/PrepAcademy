import express from 'express';
import { getDiagnosticQuestions, submitDiagnosticTest } from '../controllers/diagnostic.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

// GET /api/diagnostic/questions - Get diagnostic test questions
router.get('/questions', protect, getDiagnosticQuestions);

// POST /api/diagnostic/submit - Submit diagnostic test answers
router.post('/submit', protect, submitDiagnosticTest);

export default router; 