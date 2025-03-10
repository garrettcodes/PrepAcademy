import { Request, Response } from 'express';
import ContentReview from '../models/contentReview.model';
import Question from '../models/question.model';
import Exam from '../models/exam.model';
import mongoose from 'mongoose';

// Flag content for review
export const flagContent = async (req: Request, res: Response) => {
  try {
    const { contentType, contentId, reason, satActChangeReference } = req.body;
    const userId = req.user.userId;

    // Validate content exists
    let content;
    if (contentType === 'question') {
      content = await Question.findById(contentId);
    } else if (contentType === 'exam') {
      content = await Exam.findById(contentId);
    }

    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    // Check if content has already been flagged and is pending
    const existingFlag = await ContentReview.findOne({
      contentType,
      contentId,
      status: 'pending'
    });

    if (existingFlag) {
      return res.status(400).json({ 
        message: 'This content has already been flagged and is awaiting review' 
      });
    }

    // Create new content review
    const contentReview = await ContentReview.create({
      contentType,
      contentId,
      flaggedBy: userId,
      reason,
      satActChangeReference: satActChangeReference || ''
    });

    res.status(201).json({
      message: 'Content flagged for review',
      contentReview
    });
  } catch (error: any) {
    console.error('Flag content error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get pending content reviews
export const getPendingReviews = async (req: Request, res: Response) => {
  try {
    const { contentType, expertise } = req.query;
    const filter: any = { status: 'pending' };
    
    if (contentType) {
      filter.contentType = contentType;
    }

    // Get all pending reviews
    let reviews = await ContentReview.find(filter)
      .populate('flaggedBy', 'name email')
      .sort({ flaggedAt: 1 });

    // Filter by expertise if specified
    if (expertise && reviews.length > 0) {
      // For questions, filter by subject
      if (contentType === 'question') {
        const expertiseArray = Array.isArray(expertise) ? expertise : [expertise];
        const questionIds = reviews.map(r => r.contentId);
        
        const questions = await Question.find({
          _id: { $in: questionIds },
          subject: { $in: expertiseArray }
        });
        
        const questionIdSet = new Set(questions.map(q => q._id.toString()));
        reviews = reviews.filter(r => questionIdSet.has(r.contentId.toString()));
      }
    }

    res.status(200).json(reviews);
  } catch (error: any) {
    console.error('Get pending reviews error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get review by ID
export const getReviewById = async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;

    const review = await ContentReview.findById(reviewId)
      .populate('flaggedBy', 'name email')
      .populate('reviewedBy', 'name email expertise');

    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Get the content details
    let content;
    if (review.contentType === 'question') {
      content = await Question.findById(review.contentId);
    } else if (review.contentType === 'exam') {
      content = await Exam.findById(review.contentId);
    }

    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    res.status(200).json({
      review,
      content
    });
  } catch (error: any) {
    console.error('Get review by ID error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Update content review status
export const updateReviewStatus = async (req: Request, res: Response) => {
  try {
    const { reviewId } = req.params;
    const { status, comments, resolution, updatedContent } = req.body;
    const userId = req.user.userId;

    // Find the review
    const review = await ContentReview.findById(reviewId);
    
    if (!review) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Update review
    review.status = status;
    review.comments = comments;
    review.resolution = resolution;
    review.reviewedBy = new mongoose.Types.ObjectId(userId);
    review.reviewedAt = new Date();

    // If content is being updated, store the updated version
    if (status === 'updated' && updatedContent) {
      review.updatedContentVersion = updatedContent;
      
      // Update the actual content
      if (review.contentType === 'question') {
        await Question.findByIdAndUpdate(review.contentId, updatedContent);
      } else if (review.contentType === 'exam') {
        await Exam.findByIdAndUpdate(review.contentId, updatedContent);
      }
    }

    await review.save();

    res.status(200).json({
      message: 'Review updated successfully',
      review
    });
  } catch (error: any) {
    console.error('Update review status error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get review statistics
export const getReviewStats = async (req: Request, res: Response) => {
  try {
    const totalPending = await ContentReview.countDocuments({ status: 'pending' });
    const totalReviewed = await ContentReview.countDocuments({ status: 'reviewed' });
    const totalUpdated = await ContentReview.countDocuments({ status: 'updated' });
    const totalRejected = await ContentReview.countDocuments({ status: 'rejected' });
    
    const byContentType = await ContentReview.aggregate([
      { $group: { _id: '$contentType', count: { $sum: 1 } } }
    ]);
    
    const byStatus = await ContentReview.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Recent activity
    const recentActivity = await ContentReview.find()
      .sort({ updatedAt: -1 })
      .limit(10)
      .populate('flaggedBy', 'name email')
      .populate('reviewedBy', 'name email');

    res.status(200).json({
      total: totalPending + totalReviewed + totalUpdated + totalRejected,
      pending: totalPending,
      reviewed: totalReviewed,
      updated: totalUpdated,
      rejected: totalRejected,
      byContentType,
      byStatus,
      recentActivity
    });
  } catch (error: any) {
    console.error('Get review stats error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create a new SAT/ACT update entry
export const createContentUpdate = async (req: Request, res: Response) => {
  try {
    const { contentType, contentId, reason, updatedContent, satActChangeReference } = req.body;
    const userId = req.user.userId;

    // Validate content exists
    let content;
    if (contentType === 'question') {
      content = await Question.findById(contentId);
    } else if (contentType === 'exam') {
      content = await Exam.findById(contentId);
    }

    if (!content) {
      return res.status(404).json({ message: 'Content not found' });
    }

    // Create review record
    const contentReview = await ContentReview.create({
      contentType,
      contentId,
      flaggedBy: userId,
      reviewedBy: userId,
      reviewedAt: new Date(),
      status: 'updated',
      reason,
      comments: 'Updated due to SAT/ACT changes',
      resolution: 'Content updated to reflect new SAT/ACT standards',
      updatedContentVersion: updatedContent,
      satActChangeReference
    });

    // Update the actual content
    if (contentType === 'question') {
      await Question.findByIdAndUpdate(contentId, updatedContent);
    } else if (contentType === 'exam') {
      await Exam.findByIdAndUpdate(contentId, updatedContent);
    }

    res.status(201).json({
      message: 'Content updated successfully',
      contentReview
    });
  } catch (error: any) {
    console.error('Create content update error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get SAT/ACT updates
export const getSatActUpdates = async (req: Request, res: Response) => {
  try {
    // Get all updates with SAT/ACT references
    const updates = await ContentReview.find({ 
      satActChangeReference: { $exists: true, $ne: '' },
      status: 'updated'
    })
      .populate('flaggedBy', 'name email')
      .populate('reviewedBy', 'name email')
      .sort({ updatedAt: -1 });

    res.status(200).json(updates);
  } catch (error: any) {
    console.error('Get SAT/ACT updates error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}; 