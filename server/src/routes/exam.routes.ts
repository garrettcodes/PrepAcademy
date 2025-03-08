import express from 'express';
import { getExams, getExamById, submitExam, getNextQuestion, createExam } from '../controllers/exam.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

// GET /api/exams - Get all available exams
router.get('/', protect, getExams);

// GET /api/exams/:id - Get a specific exam with questions
router.get('/:id', protect, getExamById);

// POST /api/exams/:id/submit - Submit an exam
router.post('/:id/submit', protect, submitExam);

// POST /api/exams/next-question - Get next question for adaptive exam
router.post('/next-question', protect, getNextQuestion);

// POST /api/exams - Create a new exam (admin only)
router.post('/', protect, createExam);

export default router; 