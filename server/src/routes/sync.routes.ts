import express from 'express';
import { syncOfflineProgress } from '../controllers/sync.controller';
import { protect } from '../middleware/auth.middleware';

const router = express.Router();

// POST /api/sync - Sync offline progress
router.post('/', protect, syncOfflineProgress);

export default router; 