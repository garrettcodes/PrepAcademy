import mongoose, { Document, Schema } from 'mongoose';

export interface ISharedNote extends Document {
  title: string;
  content: string;
  author: mongoose.Types.ObjectId;
  studyGroup?: mongoose.Types.ObjectId;
  subject: string;
  topic: string;
  tags: string[];
  visibility: 'public' | 'private' | 'group';
  upvotes: mongoose.Types.ObjectId[];
  downvotes: mongoose.Types.ObjectId[];
  comments: {
    user: mongoose.Types.ObjectId;
    text: string;
    createdAt: Date;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

const SharedNoteSchema: Schema = new Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a title'],
      trim: true,
      maxlength: [100, 'Title cannot be more than 100 characters'],
    },
    content: {
      type: String,
      required: [true, 'Please provide note content'],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    studyGroup: {
      type: Schema.Types.ObjectId,
      ref: 'StudyGroup',
      default: null,
    },
    subject: {
      type: String,
      required: [true, 'Please specify a subject'],
      enum: ['Math', 'Reading', 'Writing', 'English', 'Science', 'SAT', 'ACT', 'General'],
    },
    topic: {
      type: String,
      required: [true, 'Please specify a topic'],
      trim: true,
    },
    tags: [
      {
        type: String,
        trim: true,
      },
    ],
    visibility: {
      type: String,
      enum: ['public', 'private', 'group'],
      default: 'private',
    },
    upvotes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    downvotes: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    comments: [
      {
        user: {
          type: Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        text: {
          type: String,
          required: true,
          trim: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model<ISharedNote>('SharedNote', SharedNoteSchema); 