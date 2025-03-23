import { Router } from 'express';
import * as subscriptionController from '../controllers/subscription.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = Router();

// Public routes (no auth required)
router.get('/plans', subscriptionController.getSubscriptionPlans);
router.post('/webhook', subscriptionController.handleStripeWebhook);

// Routes requiring authentication
router.use(protect);

// User subscription management
router.get('/status', subscriptionController.checkSubscriptionStatus);
router.post('/create-checkout-session', subscriptionController.createSubscription);
router.post('/create-portal-session', subscriptionController.getCustomerPortalSession);
router.post('/cancel', subscriptionController.cancelSubscription);

// Admin routes
router.get('/admin/subscriptions', authorize('admin'), subscriptionController.getSubscriptionPlans);
router.get('/admin/metrics', authorize('admin'), subscriptionController.checkSubscriptionStatuses);
router.post('/admin/extend/:userId', authorize('admin'), subscriptionController.createSubscription);

export default router; 