import mongoose, { Schema, Document } from 'mongoose';

// Define notification interface
export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: string;
  message: string;
  details: any;
  read: boolean;
  createdAt: Date;
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
    message: {
      type: String,
      required: [true, 'Please provide a notification message'],
      trim: true,
    },
    details: {
      type: Schema.Types.Mixed,
      default: {},
    },
    read: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  }
);

// Create index on userId for efficient queries
NotificationSchema.index({ userId: 1 });

// Create and export the model
const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
module.exports = Notification; 