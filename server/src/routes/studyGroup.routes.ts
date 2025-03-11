import { Router } from 'express';
import * as studyGroupController from '../controllers/studyGroup.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { checkSubscriptionMiddleware } from '../middleware/subscription.middleware';

const router = Router();

// All study group routes require authentication and an active subscription
router.use(authMiddleware);
router.use(checkSubscriptionMiddleware);

// Create a new study group
router.post('/', studyGroupController.createStudyGroup);

// Get public study groups
router.get('/public', studyGroupController.getPublicStudyGroups);

// Get user's study groups
router.get('/my-groups', studyGroupController.getUserStudyGroups);

// Get a specific study group
router.get('/:groupId', studyGroupController.getStudyGroup);

// Join a study group
router.post('/join', studyGroupController.joinStudyGroup);

// Leave a study group
router.delete('/:groupId/leave', studyGroupController.leaveStudyGroup);

// Update a study group
router.put('/:groupId', studyGroupController.updateStudyGroup);

// Delete a study group
router.delete('/:groupId', studyGroupController.deleteStudyGroup);

export default router; 