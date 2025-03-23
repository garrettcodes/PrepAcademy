import mongoose, { Document, Schema } from 'mongoose';

export interface IContentReview extends Document {
  contentType: string;
  contentId: mongoose.Types.ObjectId;
  flaggedBy: mongoose.Types.ObjectId;
  flaggedAt: Date;
  status: 'pending' | 'reviewed' | 'updated' | 'rejected';
  reason: string;
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  comments: string[] | Array<string>;
  resolution?: string;
  updatedContentVersion?: any;
  satActChangeReference?: string;
}

const ContentReviewSchema: Schema = new Schema(
  {
    contentType: {
      type: String,
      required: [true, 'Please provide content type'],
      enum: ['question', 'hint', 'explanation', 'exam'],
      trim: true,
    },
    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: [true, 'Please provide content ID'],
      refPath: 'contentType',
    },
    flaggedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide user ID who flagged the content'],
    },
    flaggedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      required: [true, 'Please provide review status'],
      enum: ['pending', 'reviewed', 'updated', 'rejected'],
      default: 'pending',
    },
    reason: {
      type: String,
      required: [true, 'Please provide reason for flagging'],
      trim: true,
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
    comments: {
      type: [String],
      trim: true,
    },
    resolution: {
      type: String,
      trim: true,
    },
    updatedContentVersion: {
      type: Schema.Types.Mixed,
    },
    satActChangeReference: {
      type: String,
      trim: true,
    },
    reviewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    rating: {
      type: Number,
    },
    updatedAt: {
      type: Date,
    },
    createdAt: {
      type: Date,
    }
  },
  { timestamps: true }
);

// Index for faster queries
ContentReviewSchema.index({ contentType: 1, contentId: 1 });
ContentReviewSchema.index({ status: 1 });
ContentReviewSchema.index({ flaggedBy: 1 });
ContentReviewSchema.index({ reviewedBy: 1 });

export default mongoose.model<IContentReview>('ContentReview', ContentReviewSchema); 