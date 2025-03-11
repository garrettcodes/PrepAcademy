import { Router } from 'express';
import * as subscriptionController from '../controllers/subscription.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Routes requiring authentication
router.post('/trial', authMiddleware, subscriptionController.startFreeTrial);
router.get('/plans', subscriptionController.getSubscriptionPlans);
router.post('/create', authMiddleware, subscriptionController.createSubscription);
router.post('/success', authMiddleware, subscriptionController.handleSubscriptionSuccess);
router.get('/current', authMiddleware, subscriptionController.getCurrentSubscription);
router.post('/cancel', authMiddleware, subscriptionController.cancelSubscription);
router.post('/customer-portal', authMiddleware, subscriptionController.createCustomerPortal);

// Webhook endpoint doesn't need authentication as it's called by Stripe
router.post('/webhook', subscriptionController.handleStripeWebhook);

export default router; 