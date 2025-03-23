import { Router } from 'express';
import * as payoutController from '../controllers/payout.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(protect);

// Expert routes
router.get('/account-status', payoutController.getStripeAccountStatus);
router.post('/create-account', payoutController.createStripeAccount);
router.post('/onboard-account', payoutController.onboardStripeAccount);
router.get('/balance', payoutController.getBalance);
router.get('/payouts', payoutController.getPayoutHistory);

// Admin routes
router.get('/admin/accounts', authorize('admin'), payoutController.getAllConnectedAccounts);
router.post('/admin/transfer', authorize('admin'), payoutController.createTransfer);

export default router; 