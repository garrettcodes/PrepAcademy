import mongoose, { Document, Schema } from 'mongoose';

export interface IChallengeParticipation extends Document {
  user: mongoose.Types.ObjectId;
  challenge: mongoose.Types.ObjectId;
  progress: number;
  isCompleted: boolean;
  completedDate?: Date;
  isRewarded: boolean;
}

const ChallengeParticipationSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    challenge: {
      type: Schema.Types.ObjectId,
      ref: 'Challenge',
      required: true,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedDate: {
      type: Date,
    },
    isRewarded: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Create compound index to ensure a user can only participate once in each challenge
ChallengeParticipationSchema.index({ user: 1, challenge: 1 }, { unique: true });

export default mongoose.model<IChallengeParticipation>(
  'ChallengeParticipation',
  ChallengeParticipationSchema
); 