import express from 'express';
import { authenticate } from '../middleware/auth';
import * as studyGroupController from '../controllers/studyGroup.controller';

const router = express.Router();

// Study group routes (all require authentication)
router.use(authenticate);

// Create a new study group
router.post('/', studyGroupController.createStudyGroup);

// Get all public study groups
router.get('/public', studyGroupController.getPublicStudyGroups);

// Get user's study groups
router.get('/my-groups', studyGroupController.getUserStudyGroups);

// Get single study group
router.get('/:groupId', studyGroupController.getStudyGroup);

// Join a study group
router.post('/join', studyGroupController.joinStudyGroup);

// Leave a study group
router.delete('/:groupId/leave', studyGroupController.leaveStudyGroup);

// Update study group
router.put('/:groupId', studyGroupController.updateStudyGroup);

// Delete study group
router.delete('/:groupId', studyGroupController.deleteStudyGroup);

export default router; 