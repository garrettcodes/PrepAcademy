import express from 'express';
import {
  getAllContent,
  getContentById,
  getContentWithProgress,
  updateProgress,
  createContent,
  getFavorites,
} from '../controllers/stressManagement.controller';
import { protect, admin } from '../middleware/auth.middleware';

const router = express.Router();

// GET /api/stress-management - Get all content
router.get('/', protect, getAllContent);

// GET /api/stress-management/progress - Get all content with user progress
router.get('/progress', protect, getContentWithProgress);

// GET /api/stress-management/favorites - Get user favorites
router.get('/favorites', protect, getFavorites);

// GET /api/stress-management/:contentId - Get single content by ID
router.get('/:contentId', protect, getContentById);

// PATCH /api/stress-management/:contentId/progress - Update user progress
router.patch('/:contentId/progress', protect, updateProgress);

// POST /api/stress-management - Create new content (admin only)
router.post('/', protect, admin, createContent);

export default router; 