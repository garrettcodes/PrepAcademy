import express from 'express';
import { getUserProfile, updateUserProfile, addPoints } from '../controllers/user.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

// GET /api/users/profile - Get user profile
router.get('/profile', protect, getUserProfile);

// PUT /api/users/profile - Update user profile
router.put('/profile', protect, updateUserProfile);

// POST /api/users/points - Add points to user (for testing)
router.post('/points', protect, addPoints);

export default router; 