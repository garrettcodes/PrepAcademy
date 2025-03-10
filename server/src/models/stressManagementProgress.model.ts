import mongoose, { Document, Schema } from 'mongoose';

export interface IStressManagementProgress extends Document {
  user: mongoose.Types.ObjectId;
  content: mongoose.Types.ObjectId;
  completed: boolean;
  completedDate?: Date;
  progress: number; // 0-100%
  notes?: string;
  rating?: number; // 1-5 stars
  favorite: boolean;
}

const StressManagementProgressSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: Schema.Types.ObjectId,
      ref: 'StressManagementContent',
      required: true,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedDate: {
      type: Date,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    notes: {
      type: String,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
    },
    favorite: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Create compound index to ensure a user can only have one progress record per content
StressManagementProgressSchema.index({ user: 1, content: 1 }, { unique: true });

export default mongoose.model<IStressManagementProgress>(
  'StressManagementProgress',
  StressManagementProgressSchema
); 