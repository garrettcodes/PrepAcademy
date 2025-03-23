import { Request, Response } from 'express';
import User from '../models/user.model';
import { checkBadgeEligibility } from './badge.controller';

// Define interfaces for request bodies
interface UpdateProfileBody {
  name?: string;
  email?: string;
  learningStyle?: string;
  targetScore?: number;
  testDate?: string | Date;
}

interface AddPointsBody {
  points: number;
  reason?: string;
}

// Get user profile
export const getUserProfile = async (req: Request, res: Response) => {
  try {
    // Ensure the user exists in the request
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const userId = req.user.userId;
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user);
  } catch (error: unknown) {
    console.error('Get user profile error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};

// Update user profile
export const updateUserProfile = async (req: Request<{}, {}, UpdateProfileBody>, res: Response) => {
  try {
    // Ensure the user exists in the request
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const userId = req.user.userId;
    const { name, email, learningStyle, targetScore, testDate } = req.body;
    
    // Find the user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Update fields if provided
    if (name) user.name = name;
    if (email) user.email = email;
    if (learningStyle) user.learningStyle = learningStyle;
    if (targetScore) user.targetScore = targetScore;
    if (testDate) user.testDate = new Date(testDate);
    
    // Save updated user
    const updatedUser = await user.save();
    
    res.status(200).json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      learningStyle: updatedUser.learningStyle,
      targetScore: updatedUser.targetScore,
      testDate: updatedUser.testDate,
    });
  } catch (error: unknown) {
    console.error('Update user profile error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
};

// Add points to user (for testing purposes)
export const addPoints = async (req: Request<{}, {}, AddPointsBody>, res: Response) => {
  try {
    // Ensure the user exists in the request
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const userId = req.user.userId;
    const { points, reason } = req.body;
    
    // Validate points
    if (!points || isNaN(points) || points <= 0) {
      return res.status(400).json({ message: 'Please provide a valid positive number of points' });
    }
    
    // Add points to user
    const user = await User.findByIdAndUpdate(
      userId,
      { $inc: { points } },
      { new: true }
    ).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check for new badges based on points
    const earnedBadges = await checkBadgeEligibility(userId);
    
    res.status(200).json({
      message: `Added ${points} points to user${reason ? ` for: ${reason}` : ''}`,
      user,
      earnedBadges: earnedBadges || []
    });
  } catch (error: unknown) {
    console.error('Add points error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ message: 'Server error', error: errorMessage });
  }
}; 