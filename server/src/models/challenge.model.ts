import mongoose, { Document, Schema } from 'mongoose';

export interface IChallenge extends Document {
  title: string;
  description: string;
  type: string;
  target: number;
  reward: {
    points: number;
    badgeId?: mongoose.Types.ObjectId;
  };
  startDate: Date;
  endDate: Date;
  isActive: boolean;
}

const ChallengeSchema: Schema = new Schema(
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
      enum: ['questions', 'exams', 'studyTime', 'performance'],
    },
    target: {
      type: Number,
      required: true,
      min: 1,
    },
    reward: {
      points: {
        type: Number,
        required: true,
        min: 0,
      },
      badgeId: {
        type: Schema.Types.ObjectId,
        ref: 'Badge',
      },
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IChallenge>('Challenge', ChallengeSchema); 