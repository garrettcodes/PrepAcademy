import express from 'express';
import payoutController from '../controllers/payout.controller';
import { isAuthenticated, isAdmin } from '../middleware/auth.middleware';

const router = express.Router();

// Routes for payout operations (admin only access)
router.post('/create', isAuthenticated, isAdmin, payoutController.createManualPayout);
router.get('/list', isAuthenticated, isAdmin, payoutController.getPayouts);
router.get('/details/:payoutId', isAuthenticated, isAdmin, payoutController.getPayoutDetails);
router.post('/cancel/:payoutId', isAuthenticated, isAdmin, payoutController.cancelPendingPayout);
router.get('/schedule', isAuthenticated, isAdmin, payoutController.getPayoutScheduleStatus);

export default router; 