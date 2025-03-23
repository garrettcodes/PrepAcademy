import { Router } from 'express';
import * as performanceController from '../controllers/performance.controller';
import { protect } from '../middleware/auth.middleware';
import { checkTrialMiddleware, checkSubscriptionMiddleware } from '../middleware/subscription.middleware';

const router = Router();

// All routes require authentication
router.use(protect);

// Basic performance routes - available in trial
// Get basic performance overview (limited data)
router.get('/basic', checkTrialMiddleware, performanceController.getBasicPerformanceOverview);

// Premium performance analytics - require subscription
// Get detailed performance analytics and insights
router.get('/analytics', checkSubscriptionMiddleware, performanceController.getPerformanceAnalytics);

// Get detailed subject performance breakdown
router.get('/subjects', checkSubscriptionMiddleware, performanceController.getSubjectPerformance);

// Get question-level performance details
router.get('/questions', checkSubscriptionMiddleware, performanceController.getQuestionPerformance);

// Get progress over time analytics
router.get('/progress', checkSubscriptionMiddleware, performanceController.getProgressOverTime);

// Get personalized recommendations based on performance
router.get('/recommendations', checkSubscriptionMiddleware, performanceController.getRecommendations);

// Get comparison with peer group
router.get('/peer-comparison', checkSubscriptionMiddleware, performanceController.getPeerComparison);

// Get time analytics (time spent per question type)
router.get('/time-analytics', checkSubscriptionMiddleware, performanceController.getTimeAnalytics);

export default router; 