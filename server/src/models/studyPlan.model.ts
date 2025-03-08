import mongoose, { Document, Schema } from 'mongoose';

interface Task {
  task: string;
  status: string;
  dueDate?: Date;
}

interface Recommendation {
  subject: string;
  subtopics: string[];
  resources: string[];
  priority: string;
}

export interface IStudyPlan extends Document {
  userId: mongoose.Types.ObjectId;
  dailyGoals: Task[];
  weeklyGoals: Task[];
  progress: number;
  weakAreas: string[];
  recommendations: Recommendation[];
  completedTopics: string[];
  overallProgress: number;
  learningStyleRecommendations: string[];
}

const StudyPlanSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide a user ID'],
    },
    dailyGoals: [
      {
        task: {
          type: String,
          required: [true, 'Please provide a task description'],
          trim: true,
        },
        status: {
          type: String,
          enum: ['pending', 'in-progress', 'completed'],
          default: 'pending',
        },
        dueDate: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    weeklyGoals: [
      {
        task: {
          type: String,
          required: [true, 'Please provide a task description'],
          trim: true,
        },
        status: {
          type: String,
          enum: ['pending', 'in-progress', 'completed'],
          default: 'pending',
        },
        dueDate: {
          type: Date,
          default: () => {
            const date = new Date();
            date.setDate(date.getDate() + 7);
            return date;
          },
        },
      },
    ],
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    // New fields for enhanced study plan
    weakAreas: {
      type: [String],
      default: [],
    },
    recommendations: [
      {
        subject: {
          type: String,
          required: true,
          trim: true,
        },
        subtopics: {
          type: [String],
          default: [],
        },
        resources: {
          type: [String],
          default: [],
        },
        priority: {
          type: String,
          enum: ['low', 'medium', 'high'],
          default: 'medium',
        },
      },
    ],
    completedTopics: {
      type: [String],
      default: [],
    },
    overallProgress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    learningStyleRecommendations: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.model<IStudyPlan>('StudyPlan', StudyPlanSchema); 