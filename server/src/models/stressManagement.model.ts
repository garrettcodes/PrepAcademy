import mongoose, { Document, Schema } from 'mongoose';

export interface IStressManagementContent extends Document {
  title: string;
  description: string;
  type: string;
  content: string;
  duration?: number;
  category: string;
  tags: string[];
  mediaUrl?: string;
  order: number;
}

const StressManagementContentSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['article', 'exercise', 'audio', 'video', 'interactive'],
    },
    content: {
      type: String,
      required: true,
    },
    duration: {
      type: Number, // in minutes
      default: 0,
    },
    category: {
      type: String,
      required: true,
      enum: ['anxiety', 'timeManagement', 'testStrategies', 'relaxation', 'focus'],
    },
    tags: {
      type: [String],
      default: [],
    },
    mediaUrl: {
      type: String,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IStressManagementContent>(
  'StressManagementContent',
  StressManagementContentSchema
); 