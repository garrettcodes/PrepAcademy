import { Router } from 'express';
import * as studyGroupController from '../controllers/studyGroup.controller';
import { protect } from '../middleware/auth.middleware';

const router = Router();

// All routes require authentication
router.use(protect);

// Get all study groups
router.get('/', studyGroupController.getStudyGroups);

// Get study group by ID
router.get('/:id', studyGroupController.getStudyGroup);

// Create study group
router.post('/', studyGroupController.createStudyGroup);

// Update study group
router.put('/:id', studyGroupController.updateStudyGroup);

// Delete study group
router.delete('/:id', studyGroupController.deleteStudyGroup);

// Join study group
router.post('/:id/join', studyGroupController.joinStudyGroup);

// Leave study group
router.post('/:id/leave', studyGroupController.leaveStudyGroup);

// Add message to study group
router.post('/:id/message', studyGroupController.addMessage);

// Get user's study groups
router.get('/user/:userId', studyGroupController.getUserStudyGroups);

export default router; 