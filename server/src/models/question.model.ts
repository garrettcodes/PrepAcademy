import mongoose, { Document, Schema } from 'mongoose';

export interface IQuestion extends Document {
  text: string;
  options: string[];
  correctAnswer: string;
  subject: string;
  difficulty: string;
  format: string;
  hints: string[];
  explanations: {
    visual?: string;
    auditory?: string;
    kinesthetic?: string;
    text?: string;
  };
}

const QuestionSchema: Schema = new Schema(
  {
    text: {
      type: String,
      required: [true, 'Please provide question text'],
      trim: true,
    },
    options: {
      type: [String],
      required: [true, 'Please provide answer options'],
      validate: {
        validator: function (v: string[]) {
          return v.length >= 2; // At least 2 options
        },
        message: 'Question must have at least 2 options',
      },
    },
    correctAnswer: {
      type: String,
      required: [true, 'Please provide the correct answer'],
      trim: true,
    },
    subject: {
      type: String,
      required: [true, 'Please provide a subject'],
      enum: ['Math', 'Reading', 'Writing', 'English', 'Science'],
      trim: true,
    },
    difficulty: {
      type: String,
      required: [true, 'Please provide difficulty level'],
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    format: {
      type: String,
      required: [true, 'Please provide question format'],
      enum: ['text', 'diagram', 'audio', 'video'],
      default: 'text',
    },
    hints: {
      type: [String],
      default: [],
    },
    explanations: {
      visual: {
        type: String,
        trim: true,
      },
      auditory: {
        type: String,
        trim: true,
      },
      kinesthetic: {
        type: String,
        trim: true,
      },
      text: {
        type: String,
        trim: true,
      },
    },
  },
  { timestamps: true }
);

export default mongoose.model<IQuestion>('Question', QuestionSchema); 