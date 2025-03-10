import { Request, Response } from 'express';
import User from '../models/user.model';
import Leaderboard from '../models/leaderboard.model';
import mongoose from 'mongoose';

// Get leaderboard data
export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    const { category = 'points', limit = 10, skip = 0 } = req.query;
    
    // Validate category
    const validCategories = ['points', 'questions', 'exams', 'weekly', 'monthly'];
    if (!validCategories.includes(category as string)) {
      return res.status(400).json({ message: 'Invalid leaderboard category' });
    }
    
    // Get leaderboard entries sorted by rank
    const entries = await Leaderboard.find({ category })
      .sort({ rank: 1 })
      .skip(Number(skip))
      .limit(Number(limit))
      .populate('user', 'name email points'); // Only return necessary user fields
      
    // Check if the requesting user is in the returned leaderboard
    const userId = req.user.userId;
    const userEntry = entries.find(entry => 
      entry.user._id.toString() === userId
    );
    
    // If user not in current page, get their rank
    let userRank = null;
    if (!userEntry) {
      const userRankEntry = await Leaderboard.findOne({ 
        user: userId,
        category 
      });
      
      if (userRankEntry) {
        userRank = {
          rank: userRankEntry.rank,
          score: userRankEntry.score,
        };
      }
    }
    
    // Get total count of entries for pagination
    const totalEntries = await Leaderboard.countDocuments({ category });
    
    res.status(200).json({
      entries,
      userRank,
      pagination: {
        total: totalEntries,
        page: Math.floor(Number(skip) / Number(limit)) + 1,
        pages: Math.ceil(totalEntries / Number(limit)),
      }
    });
  } catch (error: any) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update leaderboard (called internally, not exposed as API)
export const updateLeaderboard = async (category: string = 'points') => {
  try {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // Get all users sorted by points
      let users;
      
      if (category === 'points') {
        users = await User.find({})
          .sort({ points: -1 })
          .select('_id points')
          .session(session);
      } else if (category === 'questions') {
        // Logic for questions completed would need to be implemented
        users = await User.find({})
          .sort({ points: -1 }) // Replace with appropriate field
          .select('_id points')
          .session(session);
      } else if (category === 'exams') {
        // Logic for exam performance would need to be implemented
        users = await User.find({})
          .sort({ points: -1 }) // Replace with appropriate field
          .select('_id points')
          .session(session);
      }
      
      // Clear current leaderboard for this category
      await Leaderboard.deleteMany({ category }).session(session);
      
      // Create new entries with updated ranks
      const leaderboardEntries = users.map((user, index) => ({
        user: user._id,
        score: user.points, // Use appropriate score field based on category
        rank: index + 1,
        category,
        lastUpdated: new Date()
      }));
      
      // Insert new entries
      await Leaderboard.insertMany(leaderboardEntries, { session });
      
      await session.commitTransaction();
      console.log(`Leaderboard updated for category: ${category}`);
      return true;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  } catch (error: any) {
    console.error('Update leaderboard error:', error);
    return false;
  }
};

// Update all leaderboards - can be called by cron job
export const updateAllLeaderboards = async () => {
  try {
    await updateLeaderboard('points');
    await updateLeaderboard('questions');
    await updateLeaderboard('exams');
    return true;
  } catch (error) {
    console.error('Update all leaderboards error:', error);
    return false;
  }
}; 