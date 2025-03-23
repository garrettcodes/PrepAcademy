import express from 'express';
import { 
  getOnboardingStatus, 
  updateOnboardingStep, 
  skipOnboarding, 
  resetOnboarding 
} from '../controllers/onboarding.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

// Require authentication for all onboarding routes
router.use(protect);

// Get onboarding status
router.get('/status', getOnboardingStatus);

// Update onboarding step
router.patch('/step/:step', updateOnboardingStep);

// Skip onboarding
router.post('/skip', skipOnboarding);

// Reset onboarding (start over)
router.post('/reset', resetOnboarding);

export default router; 