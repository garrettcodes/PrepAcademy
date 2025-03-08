import mongoose, { Document, Schema } from 'mongoose';

interface Task {
  task: string;
  status: string;
  dueDate?: Date;
}

export interface IStudyPlan extends Document {
  userId: mongoose.Types.ObjectId;
  dailyGoals: Task[];
  weeklyGoals: Task[];
  progress: number;
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
  },
  { timestamps: true }
);

export default mongoose.model<IStudyPlan>('StudyPlan', StudyPlanSchema); 