import mongoose, { Schema, Document } from 'mongoose';

// Define notification interface
export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: string;
  title: string;
  message: string;
  read: boolean;
  actionLink?: string;
  priority: string;
  relatedIds?: mongoose.Types.ObjectId[] | Array<mongoose.Types.ObjectId>;
  createdAt: Date;
  expiresAt?: Date;
}

// Create notification schema
const NotificationSchema: Schema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Please provide a user ID'],
    },
    type: {
      type: String,
      enum: ['taskCompleted', 'milestone', 'reminder', 'achievement', 'system'],
      required: [true, 'Please provide a notification type'],
    },
    title: {
      type: String,
      required: [true, 'Please provide a notification title'],
      trim: true,
    },
    message: {
      type: String,
      required: [true, 'Please provide a notification message'],
      trim: true,
    },
    read: {
      type: Boolean,
      default: false,
    },
    actionLink: {
      type: String,
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      required: [true, 'Please provide a notification priority'],
    },
    relatedIds: {
      type: [Schema.Types.ObjectId],
      ref: 'User',
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    expiresAt: {
      type: Date,
    },
  }
);

// Create index on userId for efficient queries
NotificationSchema.index({ userId: 1 });

// Create and export the model
export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);

// For backward compatibility
export default Notification; 