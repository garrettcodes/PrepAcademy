import { Request, Response } from 'express';
import Badge from '../models/badge.model';
import User from '../models/user.model';
import mongoose from 'mongoose';
import PerformanceData from '../models/performanceData.model';

// Extend the criteria interface to match what's used in the controller
interface ExtendedCriteria {
  type: string;
  subject?: string;
  score?: number;
  questionCount?: number;
  action?: string;
  threshold?: number;
}

// Extend the Badge interface to include the additional fields used
interface ExtendedBadge extends mongoose.Document {
  name: string;
  description: string;
  icon: string;
  category: string;
  type?: string;
  criteria: ExtendedCriteria;
  rarity: string;
  requiredScore?: number;
  requiredTasks?: string[] | Array<string>;
  subject?: string;
}

// Extend User to include the streak property
interface ExtendedUser extends mongoose.Document {
  name: string;
  email: string;
  streak?: number;
  badges: mongoose.Types.ObjectId[];
  save(): Promise<this>;
}

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
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'User not authenticated' });
    }
    
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

// Check if a user is eligible for badges
export const checkBadgeEligibility = async (userId: string, subject?: string, score?: number) => {
  try {
    const user = await User.findById(userId) as ExtendedUser;
    
    if (!user) {
      return [];
    }

    // Get all badges
    const allBadges = await Badge.find() as ExtendedBadge[];
    
    // Filter out badges the user already has
    const userBadgeIds = user.badges.map(badge => badge.toString());
    const eligibleBadges = allBadges.filter(badge => !userBadgeIds.includes(badge._id.toString()));
    
    if (eligibleBadges.length === 0) {
      return [];
    }

    // Get performance data for criteria checking
    const performanceData = await PerformanceData.find({ userId });
    
    // Check each badge's criteria
    for (const badge of eligibleBadges) {
      let awarded = false;
      
      // Check criteria based on badge type
      switch (badge.type || badge.category) {
        case 'achievement': {
          // Achievement badges based on specific milestones
          if (badge.criteria.action === 'complete_questions') {
            const count = performanceData.length;
            if (badge.criteria.threshold && count >= badge.criteria.threshold) {
              awarded = true;
            }
          } else if (badge.criteria.action === 'streak' && user.streak && badge.criteria.threshold && user.streak >= badge.criteria.threshold) {
            awarded = true;
          }
          break;
        }
        
        case 'mastery': {
          // Mastery badges based on subject proficiency
          if (subject && subject === badge.criteria.subject) {
            const subjectData = performanceData.filter(p => p.subject === subject);
            
            if (badge.criteria.threshold && subjectData.length >= badge.criteria.threshold) {
              const avgScore = subjectData.reduce((sum, data) => sum + data.score, 0) / subjectData.length;
              
              if (badge.criteria.score !== undefined && avgScore >= badge.criteria.score) {
                awarded = true;
              }
            }
          }
          break;
        }
        
        case 'performance': {
          // Performance badges based on scores
          if (badge.criteria.score !== undefined && score && score >= badge.criteria.score) {
            awarded = true;
          }
          break;
        }
      }
      
      // Award badge if criteria met
      if (awarded) {
        // Add badge to user's collection
        await User.findByIdAndUpdate(
          userId,
          { $addToSet: { badges: badge._id } }
        );
      }
    }
    
    return eligibleBadges;
  } catch (error) {
    console.error('Check badge eligibility error:', error);
    return [];
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