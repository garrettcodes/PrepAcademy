import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { encrypt, decrypt } from '../utils/encryption';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: string;
  expertise?: string[];
  learningStyle: string;
  targetScore: number;
  testDate: Date;
  points: number;
  badges: mongoose.Types.ObjectId[];
  studyPlan: mongoose.Types.ObjectId;
  performanceData: mongoose.Types.ObjectId[];
  nextMiniAssessmentDate: Date;
  notificationSettings: {
    email: boolean;
    inApp: boolean;
  };
  parents: mongoose.Types.ObjectId[];
  sensitiveData?: {
    phoneNumber?: string;
    address?: string;
    paymentInfo?: {
      lastFour?: string;
      expiryDate?: string;
      tokenized?: string;
    };
  };
  onboardingCompleted: boolean;
  comparePassword(candidatePassword: string): Promise<boolean>;
  getDecryptedField(field: string): string;
  setEncryptedField(field: string, value: string): void;
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
    role: {
      type: String,
      enum: ['student', 'parent', 'expert', 'admin'],
      default: 'student',
    },
    expertise: {
      type: [String],
      enum: ['Math', 'Reading', 'Writing', 'English', 'Science', 'SAT', 'ACT', 'All'],
      default: [],
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
    nextMiniAssessmentDate: {
      type: Date,
      default: () => {
        const date = new Date();
        date.setDate(date.getDate() + 14); // 2 weeks from now
        return date;
      },
    },
    notificationSettings: {
      email: {
        type: Boolean,
        default: true,
      },
      inApp: {
        type: Boolean,
        default: true,
      },
    },
    parents: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Parent',
      },
    ],
    sensitiveData: {
      phoneNumber: {
        type: String,
        select: false,
      },
      address: {
        type: String,
        select: false,
      },
      paymentInfo: {
        lastFour: {
          type: String,
          select: false,
        },
        expiryDate: {
          type: String,
          select: false,
        },
        tokenized: {
          type: String,
          select: false,
        },
      },
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
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

// Encrypt sensitive data before saving
UserSchema.pre<IUser>('save', function (next) {
  if (this.isModified('sensitiveData.phoneNumber') && this.sensitiveData?.phoneNumber) {
    this.sensitiveData.phoneNumber = encrypt(this.sensitiveData.phoneNumber);
  }
  
  if (this.isModified('sensitiveData.address') && this.sensitiveData?.address) {
    this.sensitiveData.address = encrypt(this.sensitiveData.address);
  }
  
  if (this.isModified('sensitiveData.paymentInfo.tokenized') && this.sensitiveData?.paymentInfo?.tokenized) {
    this.sensitiveData.paymentInfo.tokenized = encrypt(this.sensitiveData.paymentInfo.tokenized);
  }
  
  next();
});

// Method to decrypt sensitive field
UserSchema.methods.getDecryptedField = function (field: string): string {
  const pathSegments = field.split('.');
  let value: any = this;
  
  // Navigate to the field
  for (const segment of pathSegments) {
    if (!value || !value[segment]) return '';
    value = value[segment];
  }
  
  if (!value) return '';
  
  try {
    return decrypt(value);
  } catch (error) {
    console.error(`Error decrypting ${field}:`, error);
    return '';
  }
};

// Method to set encrypted field
UserSchema.methods.setEncryptedField = function (field: string, value: string): void {
  const encryptedValue = encrypt(value);
  const pathSegments = field.split('.');
  
  // If there's only one segment, it's a direct property
  if (pathSegments.length === 1) {
    this[field] = encryptedValue;
    return;
  }
  
  // Otherwise, navigate to the object containing the field
  let current = this;
  for (let i = 0; i < pathSegments.length - 1; i++) {
    const segment = pathSegments[i];
    
    if (!current[segment]) {
      current[segment] = {};
    }
    
    current = current[segment];
  }
  
  // Set the value on the final object
  const lastSegment = pathSegments[pathSegments.length - 1];
  current[lastSegment] = encryptedValue;
};

// Compare password method
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

export default mongoose.model<IUser>('User', UserSchema); 