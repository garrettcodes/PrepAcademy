import express from 'express';
import {
  flagContent,
  getPendingReviews,
  getReviewById,
  updateReviewStatus,
  getReviewStats,
  createContentUpdate,
  getSatActUpdates
} from '../controllers/contentReview.controller';
import { protect, authorize, authorizeExpertise, expert, admin } from '../middleware/auth.middleware';

const router = express.Router();

// Public routes
// None

// Protected routes
router.post('/flag', protect, flagContent); // Any user can flag content

// Expert routes
router.get('/pending', protect, expert, getPendingReviews);
router.get('/:reviewId', protect, expert, getReviewById);
router.put('/:reviewId', protect, expert, updateReviewStatus);

// Admin routes
router.get('/stats', protect, admin, getReviewStats);
router.post('/sat-act-update', protect, admin, createContentUpdate);
router.get('/sat-act-updates', protect, admin, getSatActUpdates);

export default router; 