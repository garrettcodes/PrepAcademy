import express from 'express';
import { authenticate } from '../middleware/auth';
import * as sharedNoteController from '../controllers/sharedNote.controller';

const router = express.Router();

// Shared notes routes (all require authentication)
router.use(authenticate);

// Create a new shared note
router.post('/', sharedNoteController.createSharedNote);

// Get all public shared notes
router.get('/public', sharedNoteController.getPublicSharedNotes);

// Get all notes shared in a study group
router.get('/group/:groupId', sharedNoteController.getGroupSharedNotes);

// Get user's own notes
router.get('/my-notes', sharedNoteController.getUserNotes);

// Get a single note by ID
router.get('/:noteId', sharedNoteController.getSharedNote);

// Update a note
router.put('/:noteId', sharedNoteController.updateSharedNote);

// Delete a note
router.delete('/:noteId', sharedNoteController.deleteSharedNote);

// Add a comment to a note
router.post('/:noteId/comments', sharedNoteController.addComment);

// Vote on a note (upvote or downvote)
router.post('/:noteId/vote', sharedNoteController.voteOnNote);

export default router; 