import { Request, Response } from 'express';
import Feedback from '../models/feedback.model';
import User from '../models/user.model';
import { sendNotification } from '../services/notification.service';

// Submit new feedback
export const submitFeedback = async (req: Request, res: Response) => {
  try {
    const { title, description, category, relatedTo } = req.body;
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const feedback = await Feedback.create({
      user: userId,
      title,
      description,
      category,
      relatedTo: relatedTo || null,
      status: 'pending',
      priority: 'medium', // Default priority
      isUserNotified: false,
    });

    res.status(201).json({
      success: true,
      data: feedback,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get user's feedback submissions
export const getUserFeedback = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const feedback = await Feedback.find({ user: userId }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: feedback.length,
      data: feedback,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get all feedback (admin only)
export const getAllFeedback = async (req: Request, res: Response) => {
  try {
    const userId = req.user?._id;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Only admins can see all feedback
    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only admins can view all feedback.',
      });
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    
    // Filter parameters
    const status = req.query.status as string;
    const category = req.query.category as string;
    const priority = req.query.priority as string;
    
    // Build filter object
    let filter: any = {};
    
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (priority) filter.priority = priority;

    const feedback = await Feedback.find(filter)
      .populate('user', 'name email')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    const total = await Feedback.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: feedback.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: feedback,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Get single feedback by ID
export const getFeedbackById = async (req: Request, res: Response) => {
  try {
    const feedbackId = req.params.feedbackId;
    const userId = req.user?._id;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const feedback = await Feedback.findById(feedbackId).populate(
      'user',
      'name email'
    );

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found',
      });
    }

    // Only the user who submitted or an admin can view the feedback
    if (feedback.user._id.toString() !== userId.toString() && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only view your own feedback.',
      });
    }

    res.status(200).json({
      success: true,
      data: feedback,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Update feedback status (admin only)
export const updateFeedbackStatus = async (req: Request, res: Response) => {
  try {
    const feedbackId = req.params.feedbackId;
    const userId = req.user?._id;
    const userRole = req.user?.role;
    const { status, priority, adminNotes, response } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Only admins can update feedback status
    if (userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only admins can update feedback status.',
      });
    }

    const feedback = await Feedback.findById(feedbackId);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found',
      });
    }

    // Update fields
    feedback.status = status || feedback.status;
    feedback.priority = priority || feedback.priority;
    
    if (adminNotes !== undefined) {
      feedback.adminNotes = adminNotes;
    }
    
    // If response is provided, update it and set to notify user
    if (response !== undefined) {
      feedback.response = response;
      feedback.isUserNotified = false; // Reset so we can notify again
    }

    await feedback.save();

    // Send notification to the user if there's a response and they haven't been notified
    if (response && !feedback.isUserNotified) {
      const user = await User.findById(feedback.user);
      
      if (user) {
        await sendNotification({
          userId: user._id,
          title: 'Feedback Update',
          message: `Your feedback "${feedback.title}" has been updated: ${status}`,
          type: 'feedback',
          data: {
            feedbackId: feedback._id,
          }
        });
        
        // Mark as notified
        feedback.isUserNotified = true;
        await feedback.save();
      }
    }

    res.status(200).json({
      success: true,
      data: feedback,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// Delete feedback (admin only or owner)
export const deleteFeedback = async (req: Request, res: Response) => {
  try {
    const feedbackId = req.params.feedbackId;
    const userId = req.user?._id;
    const userRole = req.user?.role;

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const feedback = await Feedback.findById(feedbackId);

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: 'Feedback not found',
      });
    }

    // Only the user who submitted or an admin can delete the feedback
    if (feedback.user.toString() !== userId.toString() && userRole !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only delete your own feedback.',
      });
    }

    await Feedback.findByIdAndDelete(feedbackId);

    res.status(200).json({
      success: true,
      message: 'Feedback deleted successfully',
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}; 