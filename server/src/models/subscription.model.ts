import mongoose, { Document, Schema } from 'mongoose';

export interface ISubscription extends Document {
  user: mongoose.Types.ObjectId;
  planType: string; // 'monthly', 'quarterly', 'annual'
  status: string; // 'active', 'canceled', 'expired', 'trial'
  startDate: Date;
  endDate: Date;
  trialEndDate: Date | null;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  lastPaymentDate: Date | null;
  nextPaymentDate: Date | null;
  paymentMethod: {
    brand: string;
    last4: string;
    expiryMonth: number;
    expiryYear: number;
  } | null;
  canceledAt: Date | null;
  cancelReason: string | null;
}

const SubscriptionSchema: Schema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    planType: {
      type: String,
      enum: ['monthly', 'quarterly', 'annual'],
      required: true,
    },
    status: {
      type: String,
      enum: ['active', 'canceled', 'expired', 'trial'],
      default: 'trial',
    },
    startDate: {
      type: Date,
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: true,
    },
    trialEndDate: {
      type: Date,
      default: function() {
        const date = new Date();
        date.setDate(date.getDate() + 7); // 7-day trial period
        return date;
      },
    },
    stripeCustomerId: {
      type: String,
      default: null,
    },
    stripeSubscriptionId: {
      type: String,
      default: null,
    },
    lastPaymentDate: {
      type: Date,
      default: null,
    },
    nextPaymentDate: {
      type: Date,
      default: null,
    },
    paymentMethod: {
      brand: {
        type: String,
        default: null,
      },
      last4: {
        type: String,
        default: null,
      },
      expiryMonth: {
        type: Number,
        default: null,
      },
      expiryYear: {
        type: Number,
        default: null,
      },
    },
    canceledAt: {
      type: Date,
      default: null,
    },
    cancelReason: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model<ISubscription>('Subscription', SubscriptionSchema); 