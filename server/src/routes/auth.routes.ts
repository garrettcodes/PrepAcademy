import express from 'express';
import { register, login, getCurrentUser, refreshToken } from '../controllers/auth.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

// POST /api/auth/register - Register a new user
router.post('/register', register);

// POST /api/auth/login - Login a user
router.post('/login', login);

// POST /api/auth/refresh - Refresh access token
router.post('/refresh', refreshToken);

// GET /api/auth/me - Get current user (protected route)
router.get('/me', protect, getCurrentUser);

export default router; 