import { Router } from 'express';
import * as sharedNoteController from '../controllers/sharedNote.controller';
import { protect } from '../middleware/auth.middleware';
import { checkSubscriptionMiddleware } from '../middleware/subscription.middleware';

const router = Router();

// All routes require authentication
router.use(protect);

// All shared note routes require authentication and an active subscription
router.use(checkSubscriptionMiddleware);

// Get all shared notes
router.get('/', sharedNoteController.getSharedNotes);

// Get shared note by ID
router.get('/:id', sharedNoteController.getSharedNote);

// Create shared note
router.post('/', sharedNoteController.createSharedNote);

// Update shared note
router.put('/:id', sharedNoteController.updateSharedNote);

// Delete shared note
router.delete('/:id', sharedNoteController.deleteSharedNote);

// Get user's shared notes
router.get('/user/:userId', sharedNoteController.getSharedNote);

// Vote on shared note
router.post('/:id/vote', sharedNoteController.voteOnSharedNote);

// Add comment to shared note
router.post('/:id/comment', sharedNoteController.addCommentToSharedNote);

// Remove comment from shared note
router.delete('/:noteId/comment/:commentId', sharedNoteController.removeCommentFromSharedNote);

// Get public shared notes
router.get('/public', sharedNoteController.getPublicSharedNotes);

// Get notes for a specific study group
router.get('/group/:groupId', sharedNoteController.getGroupSharedNotes);

export default router; 