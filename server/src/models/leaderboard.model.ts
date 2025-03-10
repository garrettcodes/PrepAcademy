import mongoose, { Document, Schema } from 'mongoose';

export interface ILeaderboardEntry extends Document {
  user: mongoose.Types.ObjectId;
  score: number;
  rank: number;
  category: string;
  lastUpdated: Date;
}

const LeaderboardSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    score: {
      type: Number,
      required: true,
      default: 0,
    },
    rank: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ['points', 'questions', 'exams', 'weekly', 'monthly'],
      default: 'points',
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Create a compound index for category and rank for efficient retrieval
LeaderboardSchema.index({ category: 1, rank: 1 }, { unique: true });

export default mongoose.model<ILeaderboardEntry>('Leaderboard', LeaderboardSchema); 