import mongoose, { Document, Schema } from 'mongoose';

export interface IPerformanceData extends Document {
  userId: mongoose.Types.ObjectId;
  subject: string;
  subtopic: string;
  score: number;
  studyTime: number;
  date: Date;
}

const PerformanceDataSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide a user ID'],
    },
    subject: {
      type: String,
      required: [true, 'Please provide a subject'],
      enum: ['Math', 'Reading', 'Writing', 'English', 'Science'],
      trim: true,
    },
    subtopic: {
      type: String,
      required: [true, 'Please provide a subtopic'],
      trim: true,
    },
    score: {
      type: Number,
      required: [true, 'Please provide a score'],
      min: 0,
      max: 100,
    },
    studyTime: {
      type: Number,
      required: [true, 'Please provide study time in minutes'],
      min: 0,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IPerformanceData>('PerformanceData', PerformanceDataSchema); 