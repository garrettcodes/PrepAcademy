import express from 'express';
import { getAllBadges, getUserBadges, createBadge } from '../controllers/badge.controller';
import { protect, authorize } from '../middleware/auth.middleware';

const router = express.Router();

// Public routes
router.get('/', getAllBadges);

// Protected routes (require authentication)
router.get('/user', protect, getUserBadges);

// Admin routes
router.post('/', protect, authorize('admin'), createBadge);

export default router; 