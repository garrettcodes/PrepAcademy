import { Request, Response } from 'express';
import mongoose from 'mongoose';
import StressManagementContent from '../models/stressManagement.model';
import StressManagementProgress from '../models/stressManagementProgress.model';
import User from '../models/user.model';
import { updateChallengeProgress } from './challenge.controller';

// Helper to convert string ID to ObjectId
const toObjectId = (id: string) => new mongoose.Types.ObjectId(id);

// Get all stress management content
export const getAllContent = async (req: Request, res: Response) => {
  try {
    const { category } = req.query;
    
    let query = {};
    if (category) {
      query = { category };
    }
    
    const content = await StressManagementContent.find(query)
      .sort({ category: 1, order: 1 });
      
    res.status(200).json(content);
  } catch (error: any) {
    console.error('Get stress management content error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single content by ID
export const getContentById = async (req: Request, res: Response) => {
  try {
    const { contentId } = req.params;
    
    const content = await StressManagementContent.findById(contentId);
    
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    
    res.status(200).json(content);
  } catch (error: any) {
    console.error('Get content by ID error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all content with user progress
export const getContentWithProgress = async (req: Request, res: Response) => {
  try {
    // Use userId if available, fall back to _id for compatibility
    const userId = req.user?.userId || req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { category } = req.query;
    
    let query = {};
    if (category) {
      query = { category };
    }
    
    // Get all content
    const content = await StressManagementContent.find(query)
      .sort({ category: 1, order: 1 });
      
    // Get user progress for all content
    const progress = await StressManagementProgress.find({
      user: userId,
    });
    
    // Combine content with progress
    const contentWithProgress = content.map(item => {
      const userProgress = progress.find(
        p => p.contentId.toString() === item._id.toString()
      );
      
      return {
        ...item.toObject(),
        userProgress: userProgress ? {
          completed: userProgress.completed,
          progress: userProgress.progress,
          rating: userProgress.rating,
          favorite: userProgress.favorite,
          notes: userProgress.notes,
        } : {
          completed: false,
          progress: 0,
          favorite: false,
        }
      };
    });
    
    res.status(200).json(contentWithProgress);
  } catch (error: any) {
    console.error('Get content with progress error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update user progress for content
export const updateProgress = async (req: Request, res: Response) => {
  try {
    // Use userId if available, fall back to _id for compatibility
    const userId = req.user?.userId || req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const { contentId } = req.params;
    const { progress, completed, rating, favorite, notes } = req.body;
    
    // Validate content exists
    const content = await StressManagementContent.findById(contentId);
    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }
    
    // Find or create progress record
    let progressRecord = await StressManagementProgress.findOne({
      user: userId,
      contentId: contentId,
    });
    
    const wasCompleted = progressRecord?.completed || false;
    
    if (!progressRecord) {
      progressRecord = new StressManagementProgress({
        user: userId,
        contentId: contentId,
      });
    }
    
    // Update fields if provided
    if (progress !== undefined) progressRecord.progress = progress;
    if (completed !== undefined) progressRecord.completed = completed;
    if (rating !== undefined) progressRecord.rating = rating;
    if (favorite !== undefined) progressRecord.favorite = favorite;
    if (notes !== undefined) progressRecord.notes = notes;
    
    // If newly completed, set completedDate
    if (completed && !wasCompleted) {
      progressRecord.completedDate = new Date();
      
      // Update challenge progress if applicable
      await updateChallengeProgress(userId, 'studyTime', content.duration || 10);
      
      // Add points for completion
      await User.findByIdAndUpdate(userId, { $inc: { points: 10 } });
    }
    
    await progressRecord.save();
    
    res.status(200).json({
      message: 'Progress updated',
      progress: progressRecord,
    });
  } catch (error: any) {
    console.error('Update progress error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create new stress management content (admin only)
export const createContent = async (req: Request, res: Response) => {
  try {
    const {
      title,
      description,
      type,
      content,
      duration,
      category,
      tags,
      mediaUrl,
      order,
    } = req.body;
    
    // Validate required fields
    if (!title || !description || !type || !content || !category) {
      return res.status(400).json({ message: 'Required fields missing' });
    }
    
    // Create new content
    const newContent = await StressManagementContent.create({
      title,
      description,
      type,
      content,
      duration: duration || 0,
      category,
      tags: tags || [],
      mediaUrl,
      order: order || 0,
    });
    
    res.status(201).json({
      message: 'Content created successfully',
      content: newContent,
    });
  } catch (error: any) {
    console.error('Create content error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get user favorites
export const getFavorites = async (req: Request, res: Response) => {
  try {
    // Use userId if available, fall back to _id for compatibility
    const userId = req.user?.userId || req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    // Get user's favorites
    const favorites = await StressManagementProgress.find({
      user: userId,
      favorite: true,
    }).populate('contentId');
    
    res.status(200).json(favorites.map(f => {
      // Check if contentId is a populated document or an ObjectId
      const contentObj = typeof f.contentId === 'object' && f.contentId !== null && 'toObject' in f.contentId && typeof f.contentId.toObject === 'function'
        ? f.contentId.toObject()
        : { _id: f.contentId };
        
      return {
        ...contentObj,
        userProgress: {
          completed: f.completed,
          progress: f.progress,
          rating: f.rating,
          favorite: f.favorite,
          notes: f.notes,
        }
      };
    }));
  } catch (error: any) {
    console.error('Get favorites error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 