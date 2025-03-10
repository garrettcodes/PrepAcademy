import mongoose, { Document, Schema } from 'mongoose';

export interface IFeedback extends Document {
  user: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: 'bug' | 'feature' | 'question' | 'content' | 'other';
  status: 'pending' | 'under-review' | 'implemented' | 'rejected' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  relatedTo?: {
    type: string;
    id: mongoose.Types.ObjectId;
  };
  adminNotes?: string;
  response?: string;
  isUserNotified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FeedbackSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a description'],
      trim: true,
      maxlength: [2000, 'Description cannot be more than 2000 characters'],
    },
    category: {
      type: String,
      enum: ['bug', 'feature', 'question', 'content', 'other'],
      required: [true, 'Please specify a category'],
      default: 'other',
    },
    status: {
      type: String,
      enum: ['pending', 'under-review', 'implemented', 'rejected', 'closed'],
      default: 'pending',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    relatedTo: {
      type: {
        type: String,
        enum: ['question', 'exam', 'studyPlan', 'feature', 'other'],
      },
      id: {
        type: Schema.Types.ObjectId,
        refPath: 'relatedTo.type',
      },
    },
    adminNotes: {
      type: String,
      default: '',
    },
    response: {
      type: String,
      default: '',
    },
    isUserNotified: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<IFeedback>('Feedback', FeedbackSchema); 