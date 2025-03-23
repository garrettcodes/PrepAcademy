import mongoose, { Document, Schema } from 'mongoose';

interface Answer {
  questionId: mongoose.Types.ObjectId;
  selectedAnswer: string;
  isCorrect: boolean;
  timeSpent: number;
}

export interface IExamAttempt extends Document {
  userId: mongoose.Types.ObjectId;
  examId: mongoose.Types.ObjectId;
  startTime: Date;
  endTime: Date;
  score: number;
  answers: Answer[] | Array<Answer>;
  completed: boolean;
}

const ExamAttemptSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide a user ID'],
    },
    examId: {
      type: Schema.Types.ObjectId,
      ref: 'Exam',
      required: [true, 'Please provide an exam ID'],
    },
    startTime: {
      type: Date,
      default: Date.now,
    },
    endTime: {
      type: Date,
    },
    score: {
      type: Number,
      min: 0,
      max: 100,
    },
    answers: [
      {
        questionId: {
          type: Schema.Types.ObjectId,
          ref: 'Question',
          required: true,
        },
        selectedAnswer: {
          type: String,
        },
        isCorrect: {
          type: Boolean,
        },
        timeSpent: {
          type: Number,
          min: 0,
        },
      },
    ],
    completed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model<IExamAttempt>('ExamAttempt', ExamAttemptSchema); 