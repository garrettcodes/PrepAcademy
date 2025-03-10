import express from 'express';
import { authenticate } from '../middleware/auth';
import * as feedbackController from '../controllers/feedback.controller';

const router = express.Router();

// Feedback routes (all require authentication)
router.use(authenticate);

// Submit new feedback
router.post('/', feedbackController.submitFeedback);

// Get user's feedback submissions
router.get('/my-feedback', feedbackController.getUserFeedback);

// Get all feedback (admin only)
router.get('/', feedbackController.getAllFeedback);

// Get single feedback by ID
router.get('/:feedbackId', feedbackController.getFeedbackById);

// Update feedback status (admin only)
router.put('/:feedbackId', feedbackController.updateFeedbackStatus);

// Delete feedback (admin only or owner)
router.delete('/:feedbackId', feedbackController.deleteFeedback);

export default router; 