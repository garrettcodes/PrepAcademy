import mongoose, { Document, Schema } from 'mongoose';

export interface IOnboarding extends Document {
  userId: mongoose.Types.ObjectId;
  steps: {
    personalInfo: boolean;
    learningStyleAssessment: boolean;
    goalSetting: boolean;
    subjectPreferences: boolean;
    diagnosticTest: boolean;
  };
  preferences: {
    subjects: string[] | Array<string>;
    studyHours: number;
    reminderFrequency: string;
  };
  learningStyle: string;
  completed: boolean;
  completedAt?: Date;
  lastStepCompletedAt: Date;
  isCompleted: boolean;
}

const OnboardingSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    steps: {
      personalInfo: {
        type: Boolean,
        default: false,
      },
      learningStyleAssessment: {
        type: Boolean,
        default: false,
      },
      goalSetting: {
        type: Boolean,
        default: false,
      },
      subjectPreferences: {
        type: Boolean,
        default: false,
      },
      diagnosticTest: {
        type: Boolean,
        default: false,
      },
    },
    preferences: {
      subjects: {
        type: [String],
      },
      studyHours: {
        type: Number,
      },
      reminderFrequency: {
        type: String,
      },
    },
    learningStyle: {
      type: String,
    },
    completed: {
      type: Boolean,
      default: false,
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