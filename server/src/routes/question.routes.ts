import { Router } from 'express';
import * as questionController from '../controllers/question.controller';
import { protect, authorize } from '../middleware/auth.middleware';
import { checkTrialMiddleware, checkSubscriptionMiddleware } from '../middleware/subscription.middleware';

const router = Router();

// All routes require authentication
router.use(protect);

// Routes accessible during trial period
// Get limited practice questions (trial users get limited questions)
router.get('/practice', checkTrialMiddleware, questionController.getPracticeQuestions);

// Get a specific question
router.get('/:questionId', checkTrialMiddleware, questionController.getQuestionById);

// Submit an answer to a question
router.post('/:questionId/answer', checkTrialMiddleware, questionController.submitAnswer);

// Premium features - require active subscription (not available during trial)
// Get unlimited practice questions
router.get('/unlimited', checkSubscriptionMiddleware, questionController.getUnlimitedQuestions);

// Get detailed analytics for questions
router.get('/analytics', checkSubscriptionMiddleware, questionController.getQuestionAnalytics);

// Admin routes
router.post('/', authorize('admin'), questionController.createQuestion);
router.put('/:questionId', authorize('admin'), questionController.updateQuestion);
router.delete('/:questionId', authorize('admin'), questionController.deleteQuestion);

export default router; 