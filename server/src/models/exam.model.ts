import mongoose, { Document, Schema } from 'mongoose';

export interface IExam extends Document {
  title: string;
  description: string;
  type: string;
  duration: number;
  questions: mongoose.Types.ObjectId[] | Array<mongoose.Types.ObjectId>;
  difficulty: string;
}

const ExamSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an exam title'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide an exam description'],
      trim: true,
    },
    type: {
      type: String,
      required: [true, 'Please provide an exam type'],
      enum: ['SAT', 'ACT', 'Diagnostic', 'Practice'],
      default: 'Practice',
    },
    duration: {
      type: Number,
      required: [true, 'Please provide exam duration in minutes'],
      min: 0,
    },
    questions: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Question',
      },
    ],
    difficulty: {
      type: String,
      required: [true, 'Please provide difficulty level'],
      enum: ['easy', 'medium', 'hard', 'adaptive'],
      default: 'adaptive',
    },
  },
  { timestamps: true }
);

export default mongoose.model<IExam>('Exam', ExamSchema); 