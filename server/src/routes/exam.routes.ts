import { Router } from 'express';
import * as examController from '../controllers/exam.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { checkTrialMiddleware, checkSubscriptionMiddleware } from '../middleware/subscription.middleware';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// Routes accessible during trial period
// Get basic/sample exams (limited content for trial users)
router.get('/basic', checkTrialMiddleware, examController.getBasicExams);

// Get a specific basic exam
router.get('/basic/:examId', checkTrialMiddleware, examController.getBasicExamById);

// Start a basic exam
router.post('/basic/:examId/start', checkTrialMiddleware, examController.startBasicExam);

// Submit a basic exam
router.post('/basic/:examId/submit', checkTrialMiddleware, examController.submitBasicExam);

// Premium features - require active subscription
// Get all full practice exams
router.get('/full', checkSubscriptionMiddleware, examController.getFullExams);

// Get a specific full practice exam
router.get('/full/:examId', checkSubscriptionMiddleware, examController.getFullExamById);

// Start a full practice exam
router.post('/full/:examId/start', checkSubscriptionMiddleware, examController.startFullExam);

// Submit a full practice exam
router.post('/full/:examId/submit', checkSubscriptionMiddleware, examController.submitFullExam);

// Get detailed exam results with performance analytics
router.get('/results/:attemptId', checkSubscriptionMiddleware, examController.getExamResults);

// Get user's exam history with analytics
router.get('/user/history', checkSubscriptionMiddleware, examController.getUserExamHistory);

// Admin routes
router.post('/', authMiddleware, examController.createExam);
router.put('/:examId', authMiddleware, examController.updateExam);
router.delete('/:examId', authMiddleware, examController.deleteExam);

export default router; 