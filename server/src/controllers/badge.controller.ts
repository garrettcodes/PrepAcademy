import { Request, Response } from 'express';
import Badge from '../models/badge.model';
import User from '../models/user.model';
import PerformanceData from '../models/performanceData.model';

// Get all badges
export const getAllBadges = async (req: Request, res: Response) => {
  try {
    const badges = await Badge.find();
    res.status(200).json(badges);
  } catch (error: any) {
    console.error('Get all badges error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user badges
export const getUserBadges = async (req: Request, res: Response) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).populate('badges');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.status(200).json(user.badges);
  } catch (error: any) {
    console.error('Get user badges error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Check and award badges based on performance
export const checkBadgeEligibility = async (userId: string, subject?: string, score?: number) => {
  try {
    // Get user
    const user = await User.findById(userId).populate('badges');
    
    if (!user) {
      console.error('User not found for badge check');
      return null;
    }
    
    // Get available badges
    const allBadges = await Badge.find();
    const userBadgeIds = user.badges.map(badge => badge._id.toString());
    
    // Filter badges the user doesn't have yet
    const eligibleBadges = allBadges.filter(badge => !userBadgeIds.includes(badge._id.toString()));
    
    // Array to store newly earned badges
    const newlyEarnedBadges = [];
    
    // Check each badge's criteria
    for (const badge of eligibleBadges) {
      let awarded = false;
      
      switch (badge.criteria.type) {
        case 'subject-mastery':
          // Subject mastery badges are awarded when a user achieves 100% in a specific subject
          if (subject && score === 100 && badge.criteria.subject === subject) {
            awarded = true;
          }
          break;
          
        case 'question-count':
          // Question count badges are awarded after answering a certain number of questions
          if (badge.criteria.questionCount) {
            const questionCount = await PerformanceData.countDocuments({ userId });
            if (questionCount >= badge.criteria.questionCount) {
              awarded = true;
            }
          }
          break;
          
        case 'perfect-score':
          // Perfect score badges are awarded after achieving perfect scores
          if (score === 100) {
            const perfectScores = await PerformanceData.countDocuments({ 
              userId, 
              score: 100 
            });
            
            // Default to 5 perfect scores if not specified in criteria
            const requiredPerfectScores = badge.criteria.questionCount || 5;
            
            if (perfectScores >= requiredPerfectScores) {
              awarded = true;
            }
          }
          break;
          
        case 'point-milestone':
          // Point milestone badges are awarded at certain point thresholds
          if (badge.criteria.score && user.points >= badge.criteria.score) {
            awarded = true;
          }
          break;
      }
      
      // Award badge if criteria met
      if (awarded) {
        await User.findByIdAndUpdate(
          userId,
          { $addToSet: { badges: badge._id } }
        );
        newlyEarnedBadges.push(badge);
      }
    }
    
    return newlyEarnedBadges;
  } catch (error) {
    console.error('Check badge eligibility error:', error);
    return null;
  }
};

// Create a new badge (admin only)
export const createBadge = async (req: Request, res: Response) => {
  try {
    const { name, description, icon, category, criteria } = req.body;
    
    const badge = await Badge.create({
      name,
      description,
      icon: icon || 'trophy',
      category: category || 'achievement',
      criteria,
    });
    
    res.status(201).json(badge);
  } catch (error: any) {
    console.error('Create badge error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 