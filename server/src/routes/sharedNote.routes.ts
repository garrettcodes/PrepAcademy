import { Router } from 'express';
import * as sharedNoteController from '../controllers/sharedNote.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { checkSubscriptionMiddleware } from '../middleware/subscription.middleware';

const router = Router();

// All shared note routes require authentication and an active subscription
router.use(authMiddleware);
router.use(checkSubscriptionMiddleware);

// Create a new shared note
router.post('/', sharedNoteController.createSharedNote);

// Get public shared notes
router.get('/public', sharedNoteController.getPublicSharedNotes);

// Get user's shared notes
router.get('/my-notes', sharedNoteController.getUserSharedNotes);

// Get notes for a specific study group
router.get('/group/:groupId', sharedNoteController.getGroupSharedNotes);

// Get a specific shared note
router.get('/:noteId', sharedNoteController.getSharedNote);

// Update a shared note
router.put('/:noteId', sharedNoteController.updateSharedNote);

// Delete a shared note
router.delete('/:noteId', sharedNoteController.deleteSharedNote);

// Vote on a shared note
router.post('/:noteId/vote', sharedNoteController.voteOnSharedNote);

// Add comment to a shared note
router.post('/:noteId/comments', sharedNoteController.addCommentToSharedNote);

// Remove comment from a shared note
router.delete('/:noteId/comments/:commentId', sharedNoteController.removeCommentFromSharedNote);

export default router; 