import express from 'express';
import { 
  getActiveChallenges, 
  joinChallenge, 
  createChallenge, 
  getUserChallenges 
} from '../controllers/challenge.controller';
import { protect, admin } from '../middleware/auth.middleware';

const router = express.Router();

// GET /api/challenges - Get all active challenges
router.get('/', protect, getActiveChallenges);

// GET /api/challenges/user - Get user's challenges
router.get('/user', protect, getUserChallenges);

// POST /api/challenges/:challengeId/join - Join a challenge
router.post('/:challengeId/join', protect, joinChallenge);

// POST /api/challenges - Create a new challenge (admin only)
router.post('/', protect, admin, createChallenge);

export default router; 