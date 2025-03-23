import { Router } from 'express';
import * as feedbackController from '../controllers/feedback.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// Public route for submitting feedback
router.post('/', feedbackController.submitFeedback);

// Routes requiring authentication
router.use(protect);

// Get user's feedback
router.get('/user', feedbackController.getUserFeedback);

// Admin routes
router.get('/all', feedbackController.getAllFeedback);
router.put('/:id/status', feedbackController.updateFeedbackStatus);
router.delete('/:id', feedbackController.deleteFeedback);

export default router; 