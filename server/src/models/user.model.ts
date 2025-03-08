import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  learningStyle: string;
  targetScore: number;
  testDate: Date;
  points: number;
  badges: mongoose.Types.ObjectId[];
  studyPlan: mongoose.Types.ObjectId;
  performanceData: mongoose.Types.ObjectId[];
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      match: [
        /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
        'Please provide a valid email',
      ],
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    learningStyle: {
      type: String,
      enum: ['visual', 'auditory', 'kinesthetic', 'reading/writing'],
      default: 'visual',
    },
    targetScore: {
      type: Number,
      default: 0,
    },
    testDate: {
      type: Date,
      default: Date.now,
    },
    points: {
      type: Number,
      default: 0,
    },
    badges: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Badge',
      },
    ],
    studyPlan: {
      type: Schema.Types.ObjectId,
      ref: 'StudyPlan',
    },
    performanceData: [
      {
        type: Schema.Types.ObjectId,
        ref: 'PerformanceData',
      },
    ],
  },
  { timestamps: true }
);

// Hash password before saving
UserSchema.pre<IUser>('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Compare password method
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', UserSchema); 