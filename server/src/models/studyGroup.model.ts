import mongoose, { Document, Schema } from 'mongoose';

export interface IStudyGroup extends Document {
  name: string;
  description: string;
  owner: mongoose.Types.ObjectId;
  members: mongoose.Types.ObjectId[];
  topics: string[];
  isPrivate: boolean;
  joinCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StudyGroupSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a group name'],
      trim: true,
      maxlength: [50, 'Group name cannot be more than 50 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a group description'],
      trim: true,
      maxlength: [500, 'Description cannot be more than 500 characters'],
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    topics: [
      {
        type: String,
        trim: true,
      },
    ],
    isPrivate: {
      type: Boolean,
      default: false,
    },
    joinCode: {
      type: String,
      default: null,
    },
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

export default mongoose.model<IStudyGroup>('StudyGroup', StudyGroupSchema); 