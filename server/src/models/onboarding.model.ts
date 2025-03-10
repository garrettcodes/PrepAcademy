import mongoose, { Document, Schema } from 'mongoose';

export interface IOnboarding extends Document {
  user: mongoose.Types.ObjectId;
  steps: {
    welcomeIntro: boolean;
    diagnosticTest: boolean;
    studyPlan: boolean;
    practiceExams: boolean;
    appNavigation: boolean;
    progressTracking: boolean;
  };
  completedAt?: Date;
  lastStepCompletedAt: Date;
  isCompleted: boolean;
}

const OnboardingSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    steps: {
      welcomeIntro: {
        type: Boolean,
        default: false,
      },
      diagnosticTest: {
        type: Boolean,
        default: false,
      },
      studyPlan: {
        type: Boolean,
        default: false,
      },
      practiceExams: {
        type: Boolean,
        default: false,
      },
      appNavigation: {
        type: Boolean,
        default: false,
      },
      progressTracking: {
        type: Boolean,
        default: false,
      },
    },
    completedAt: {
      type: Date,
    },
    lastStepCompletedAt: {
      type: Date,
      default: Date.now,
    },
    isCompleted: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IOnboarding>('Onboarding', OnboardingSchema); 