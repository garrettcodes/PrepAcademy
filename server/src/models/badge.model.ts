import mongoose, { Document, Schema } from 'mongoose';

export interface IBadge extends Document {
  name: string;
  description: string;
  icon: string;
  category: string;
  criteria: {
    type: string;
    subject?: string;
    score?: number;
    questionCount?: number;
  };
  rarity: string;
  requiredScore?: number;
  requiredTasks?: string[] | Array<string>;
  subject?: string;
}

const BadgeSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    icon: {
      type: String,
      default: 'trophy', // Default icon name
    },
    category: {
      type: String,
      enum: ['achievement', 'subject', 'streak', 'misc'],
      default: 'achievement',
    },
    criteria: {
      type: {
        type: String,
        enum: ['subject-mastery', 'question-count', 'perfect-score', 'point-milestone'],
        required: true,
      },
      subject: String,
      score: Number,
      questionCount: Number,
    },
    rarity: {
      type: String,
      enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
      default: 'common',
    },
    requiredScore: {
      type: Number,
    },
    requiredTasks: {
      type: [String],
      default: [],
    },
    subject: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IBadge>('Badge', BadgeSchema); 