import { Request, Response } from 'express';
import Challenge from '../models/challenge.model';
import ChallengeParticipation from '../models/challengeParticipation.model';
import User from '../models/user.model';
import { createNotification } from './notification.controller';
import mongoose from 'mongoose';

// Get all active challenges
export const getActiveChallenges = async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;
    
    // Get all active challenges
    const now = new Date();
    const challenges = await Challenge.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    });
    
    // Get user's participation in these challenges
    const participations = await ChallengeParticipation.find({
      user: userId,
      challenge: { $in: challenges.map(c => c._id) },
    });
    
    // Combine challenge data with participation data
    const challengesWithProgress = challenges.map(challenge => {
      const participation = participations.find(
        p => p.challenge.toString() === challenge._id.toString()
      );
      
      return {
        ...challenge.toObject(),
        userProgress: participation ? participation.progress : 0,
        isCompleted: participation ? participation.isCompleted : false,
        isRewarded: participation ? participation.isRewarded : false,
        participationId: participation ? participation._id : null,
      };
    });
    
    res.status(200).json(challengesWithProgress);
  } catch (error: any) {
    console.error('Get active challenges error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Join a challenge
export const joinChallenge = async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;
    const { challengeId } = req.params;
    
    // Check if challenge exists and is active
    const challenge = await Challenge.findOne({
      _id: challengeId,
      isActive: true,
    });
    
    if (!challenge) {
      return res.status(404).json({ message: 'Challenge not found or inactive' });
    }
    
    // Check if user is already participating
    const existingParticipation = await ChallengeParticipation.findOne({
      user: userId,
      challenge: challengeId,
    });
    
    if (existingParticipation) {
      return res.status(400).json({ message: 'Already participating in this challenge' });
    }
    
    // Create new participation
    const participation = await ChallengeParticipation.create({
      user: userId,
      challenge: challengeId,
      progress: 0,
      isCompleted: false,
      isRewarded: false,
    });
    
    res.status(201).json({
      message: 'Successfully joined the challenge',
      participation,
    });
  } catch (error: any) {
    console.error('Join challenge error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update challenge progress
export const updateChallengeProgress = async (
  userId: string,
  challengeType: string,
  progressIncrement: number
) => {
  try {
    // Find active challenges of the specified type
    const now = new Date();
    const challenges = await Challenge.find({
      isActive: true,
      type: challengeType,
      startDate: { $lte: now },
      endDate: { $gte: now },
    });
    
    if (challenges.length === 0) return null;
    
    // Find user participations in these challenges
    const participations = await ChallengeParticipation.find({
      user: userId,
      challenge: { $in: challenges.map(c => c._id) },
      isCompleted: false,
    });
    
    if (participations.length === 0) return null;
    
    const completedChallenges = [];
    
    // Update each participation
    for (const participation of participations) {
      const challenge = challenges.find(
        c => c._id.toString() === participation.challenge.toString()
      );
      
      if (!challenge) continue;
      
      // Update progress
      participation.progress += progressIncrement;
      
      // Check if challenge is completed
      if (participation.progress >= challenge.target && !participation.isCompleted) {
        participation.isCompleted = true;
        participation.completedDate = new Date();
        
        completedChallenges.push({
          participation,
          challenge,
        });
      }
      
      await participation.save();
    }
    
    // Process rewards for completed challenges
    for (const { participation, challenge } of completedChallenges) {
      // Create notification
      await createNotification({
        user: userId,
        title: 'Challenge Completed!',
        message: `You've completed the "${challenge.title}" challenge!`,
        type: 'challenge',
        relatedId: challenge._id,
      });
      
      // Award points if not already rewarded
      if (!participation.isRewarded) {
        await User.findByIdAndUpdate(
          userId,
          { $inc: { points: challenge.reward.points } }
        );
        
        // If there's a badge, add it to the user
        if (challenge.reward.badgeId) {
          await User.findByIdAndUpdate(
            userId,
            { $addToSet: { badges: challenge.reward.badgeId } }
          );
        }
        
        participation.isRewarded = true;
        await participation.save();
      }
    }
    
    return completedChallenges.length > 0 ? completedChallenges : null;
  } catch (error) {
    console.error('Update challenge progress error:', error);
    return null;
  }
};

// Create a new challenge (admin only)
export const createChallenge = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      type,
      target,
      reward,
      startDate,
      endDate,
      isActive,
    } = req.body;
    
    // Validate required fields
    if (!title || !description || !type || !target || !reward || !startDate || !endDate) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Create challenge
    const challenge = await Challenge.create({
      title,
      description,
      type,
      target,
      reward,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      isActive: isActive !== undefined ? isActive : true,
    });
    
    // Notify all users about the new challenge
    // This would be better with a more targeted approach in a production app
    const users = await User.find({}, '_id');
    
    for (const user of users) {
      await createNotification({
        user: user._id,
        title: 'New Challenge Available!',
        message: `A new challenge "${title}" is now available. Join now to earn rewards!`,
        type: 'challenge',
        relatedId: challenge._id,
      });
    }
    
    res.status(201).json({
      message: 'Challenge created successfully',
      challenge,
    });
  } catch (error: any) {
    console.error('Create challenge error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user's challenge progress
export const getUserChallenges = async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;
    
    // Get user's participations with populated challenge data
    const participations = await ChallengeParticipation.find({ user: userId })
      .populate('challenge')
      .sort({ createdAt: -1 });
    
    res.status(200).json(participations);
  } catch (error: any) {
    console.error('Get user challenges error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 