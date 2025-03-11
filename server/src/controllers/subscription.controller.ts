import { Request, Response } from 'express';
import User from '../models/user.model';
import Subscription from '../models/subscription.model';
import stripeService from '../services/stripe.service';
import Stripe from 'stripe';
import emailService from '../services/email.service';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

// Start a free trial for a user
export const startFreeTrial = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user already has an active subscription or trial
    if (user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trial') {
      return res.status(400).json({ 
        message: 'User already has an active subscription or trial' 
      });
    }

    // Set up trial period (7 days)
    const trialStartDate = new Date();
    const trialEndDate = new Date(trialStartDate);
    trialEndDate.setDate(trialEndDate.getDate() + 7);

    // Create a subscription record for the trial
    const subscription = await Subscription.create({
      user: userId,
      planType: 'monthly', // Default plan for trial
      status: 'trial',
      startDate: trialStartDate,
      endDate: trialEndDate,
      trialEndDate: trialEndDate,
    });

    // Update user record
    user.subscriptionStatus = 'trial';
    user.trialStartDate = trialStartDate;
    user.trialEndDate = trialEndDate;
    user.currentSubscription = subscription._id;
    await user.save();

    return res.status(200).json({
      message: 'Free trial started successfully',
      trialEndDate,
      subscription
    });
  } catch (error: any) {
    console.error('Error starting free trial:', error);
    return res.status(500).json({ 
      message: 'Failed to start free trial', 
      error: error.message 
    });
  }
};

// Get subscription plans
export const getSubscriptionPlans = async (req: Request, res: Response) => {
  try {
    // Return the subscription plans with formatted prices
    const plans = {
      monthly: {
        id: 'monthly',
        name: 'Monthly Plan',
        price: '$20',
        amount: 2000,
        description: 'Full access to all features, billed monthly',
        features: [
          'Unlimited practice questions',
          'Full-length practice exams',
          'Performance analytics',
          'Personalized study plans',
          'Study groups',
          'Shared notes'
        ],
        billingPeriod: 'month',
        popular: false
      },
      quarterly: {
        id: 'quarterly',
        name: '3-Month Plan',
        price: '$50',
        amount: 5000,
        description: 'Save $10 with our quarterly plan',
        features: [
          'Unlimited practice questions',
          'Full-length practice exams',
          'Performance analytics',
          'Personalized study plans',
          'Study groups',
          'Shared notes',
          'Priority customer support'
        ],
        billingPeriod: '3 months',
        popular: true
      },
      annual: {
        id: 'annual',
        name: 'Annual Plan',
        price: '$150',
        amount: 15000,
        description: 'Save $90 with our annual plan',
        features: [
          'Unlimited practice questions',
          'Full-length practice exams',
          'Performance analytics',
          'Personalized study plans',
          'Study groups',
          'Shared notes',
          'Priority customer support',
          'One-on-one coaching session'
        ],
        billingPeriod: 'year',
        popular: false
      }
    };

    return res.status(200).json({ plans });
  } catch (error: any) {
    console.error('Error fetching subscription plans:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch subscription plans', 
      error: error.message 
    });
  }
};

// Create a subscription for a user
export const createSubscription = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { planType } = req.body;
    if (!planType || !['monthly', 'quarterly', 'annual'].includes(planType)) {
      return res.status(400).json({ message: 'Invalid plan type' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create or retrieve Stripe customer
    let stripeCustomerId = user.sensitiveData?.paymentInfo?.tokenized;
    if (!stripeCustomerId) {
      const customer = await stripeService.createCustomer(user.email, user.name);
      if (user.sensitiveData && user.sensitiveData.paymentInfo) {
        user.sensitiveData.paymentInfo.tokenized = customer.id;
      } else {
        if (!user.sensitiveData) user.sensitiveData = {};
        user.sensitiveData.paymentInfo = { tokenized: customer.id };
      }
      await user.save();
      stripeCustomerId = customer.id;
    } else {
      // If encrypted, decrypt it
      stripeCustomerId = user.getDecryptedField('sensitiveData.paymentInfo.tokenized');
    }

    // Create Stripe checkout session
    const successUrl = `${process.env.CLIENT_URL}/subscription/success?plan=${planType}`;
    const cancelUrl = `${process.env.CLIENT_URL}/subscription/cancel`;

    const checkoutSession = await stripeService.createCheckoutSession(
      stripeCustomerId,
      planType as 'monthly' | 'quarterly' | 'annual',
      successUrl,
      cancelUrl
    );

    return res.status(200).json({
      checkoutUrl: checkoutSession.url,
      sessionId: checkoutSession.id
    });
  } catch (error: any) {
    console.error('Error creating subscription:', error);
    return res.status(500).json({ 
      message: 'Failed to create subscription', 
      error: error.message 
    });
  }
};

// Handle successful subscription
export const handleSubscriptionSuccess = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.body;
    if (!sessionId) {
      return res.status(400).json({ message: 'Session ID is required' });
    }

    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Retrieve checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    });

    if (session.status !== 'complete') {
      return res.status(400).json({ message: 'Payment is not complete' });
    }

    const subscriptionId = session.subscription as string;
    const stripeSubscription = await stripeService.getSubscription(subscriptionId);
    
    // Determine plan type from the price ID
    let planType: 'monthly' | 'quarterly' | 'annual' = 'monthly';
    const priceId = stripeSubscription.items.data[0].price.id;
    
    if (priceId === process.env.STRIPE_QUARTERLY_PRICE_ID) {
      planType = 'quarterly';
    } else if (priceId === process.env.STRIPE_ANNUAL_PRICE_ID) {
      planType = 'annual';
    }

    // Calculate subscription end date
    const startDate = new Date(stripeSubscription.current_period_start * 1000);
    const endDate = new Date(stripeSubscription.current_period_end * 1000);

    // Create a subscription record
    const subscription = await Subscription.create({
      user: userId,
      planType,
      status: 'active',
      startDate,
      endDate,
      trialEndDate: null,
      stripeCustomerId: stripeSubscription.customer as string,
      stripeSubscriptionId: subscriptionId,
      lastPaymentDate: new Date(),
      nextPaymentDate: endDate,
    });

    // Update user record
    user.subscriptionStatus = 'active';
    user.currentSubscription = subscription._id;
    if (user.subscriptionHistory) {
      user.subscriptionHistory.push(subscription._id);
    } else {
      user.subscriptionHistory = [subscription._id];
    }
    await user.save();

    // Send confirmation email
    await emailService.sendSubscriptionCreatedEmail(
      user.email,
      user.name,
      subscription.planType,
      subscription.startDate,
      subscription.endDate
    );

    return res.status(200).json({
      message: 'Subscription created successfully',
      subscription
    });
  } catch (error: any) {
    console.error('Error handling subscription success:', error);
    return res.status(500).json({ 
      message: 'Failed to process subscription', 
      error: error.message 
    });
  }
};

// Get current user's subscription
export const getCurrentSubscription = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findById(userId).populate('currentSubscription');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({
      subscriptionStatus: user.subscriptionStatus,
      subscription: user.currentSubscription,
      trialEndDate: user.trialEndDate
    });
  } catch (error: any) {
    console.error('Error fetching current subscription:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch subscription details', 
      error: error.message 
    });
  }
};

// Cancel subscription
export const cancelSubscription = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findById(userId).populate('currentSubscription');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.subscriptionStatus !== 'active' || !user.currentSubscription) {
      return res.status(400).json({ message: 'No active subscription to cancel' });
    }

    const subscription = user.currentSubscription;
    
    // Cancel subscription with Stripe if there's a Stripe subscription ID
    if (subscription.stripeSubscriptionId) {
      await stripeService.cancelSubscription(subscription.stripeSubscriptionId);
    }

    // Update subscription status
    subscription.status = 'canceled';
    subscription.canceledAt = new Date();
    await subscription.save();

    // Update user status
    user.subscriptionStatus = 'canceled';
    await user.save();

    // Send cancellation email
    await emailService.sendSubscriptionCanceledEmail(
      user.email,
      user.name,
      subscription.planType,
      subscription.endDate
    );

    return res.status(200).json({
      message: 'Subscription canceled successfully',
      subscription
    });
  } catch (error: any) {
    console.error('Error canceling subscription:', error);
    return res.status(500).json({ 
      message: 'Failed to cancel subscription', 
      error: error.message 
    });
  }
};

// Webhook handler for Stripe events
export const handleStripeWebhook = async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  
  if (!sig) {
    return res.status(400).json({ message: 'Missing stripe-signature header' });
  }

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );

    const result = await stripeService.handleWebhookEvent(event);

    // Process different event types
    if (result.status === 'success') {
      const invoice = result.invoice;
      // Update subscription payment status
      if (invoice.subscription) {
        const subscription = await Subscription.findOne({
          stripeSubscriptionId: invoice.subscription as string
        });
        
        if (subscription) {
          subscription.lastPaymentDate = new Date();
          await subscription.save();
        }
      }
    } else if (result.status === 'failed') {
      // Handle failed payment
      const invoice = result.invoice;
      if (invoice.subscription) {
        const subscription = await Subscription.findOne({
          stripeSubscriptionId: invoice.subscription as string
        });
        
        if (subscription) {
          // Mark subscription for review
          // You could add a 'paymentFailed' status or track failed attempts
          await subscription.save();
        }
      }
    } else if (result.status === 'canceled') {
      // Handle canceled subscription
      const subscription = result.subscription;
      await handleCanceledSubscription(subscription.id);
    }

    // Send payment failed email
    try {
      const invoice = event.data.object;
      const customerId = invoice.customer as string;
      
      // Find the user with this customer ID
      const subscription = await Subscription.findOne({ stripeCustomerId: customerId });
      if (!subscription) {
        console.error('No subscription found for customer ID:', customerId);
        return;
      }
      
      const user = await User.findById(subscription.user);
      if (!user) {
        console.error('No user found for subscription:', subscription._id);
        return;
      }
      
      // Next attempt date (Stripe provides this or we can estimate)
      const nextAttemptDate = new Date();
      nextAttemptDate.setDate(nextAttemptDate.getDate() + 3); // typically retry in 3 days
      
      await emailService.sendPaymentFailedEmail(
        user.email,
        user.name,
        subscription.planType,
        nextAttemptDate
      );
    } catch (error) {
      console.error('Error sending payment failed email:', error);
    }

    return res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('Error handling Stripe webhook:', error);
    return res.status(400).json({ message: error.message });
  }
};

// Helper function to handle canceled subscriptions
const handleCanceledSubscription = async (stripeSubscriptionId: string) => {
  const subscription = await Subscription.findOne({ stripeSubscriptionId });
  if (!subscription) return;

  subscription.status = 'canceled';
  subscription.canceledAt = new Date();
  await subscription.save();

  // Update user subscription status
  const user = await User.findById(subscription.user);
  if (user) {
    user.subscriptionStatus = 'canceled';
    await user.save();
  }
};

// Check for expired trials and subscriptions
export const checkSubscriptionStatuses = async () => {
  try {
    const currentDate = new Date();
    
    // Find all trial users whose trial has expired
    const expiredTrialUsers = await User.find({
      subscriptionStatus: 'trial',
      trialEndDate: { $lt: currentDate }
    });

    for (const user of expiredTrialUsers) {
      user.subscriptionStatus = 'expired';
      await user.save();

      // If there's a subscription record, update it
      if (user.currentSubscription) {
        const subscription = await Subscription.findById(user.currentSubscription);
        if (subscription) {
          subscription.status = 'expired';
          await subscription.save();
        }
      }
    }

    // Find all active subscriptions that have ended
    const expiredSubscriptions = await Subscription.find({
      status: 'active',
      endDate: { $lt: currentDate }
    });

    for (const subscription of expiredSubscriptions) {
      subscription.status = 'expired';
      await subscription.save();

      // Update the user record
      const user = await User.findById(subscription.user);
      if (user) {
        user.subscriptionStatus = 'expired';
        await user.save();
      }
    }

    console.log(`Updated ${expiredTrialUsers.length} expired trials and ${expiredSubscriptions.length} expired subscriptions`);
  } catch (error) {
    console.error('Error checking subscription statuses:', error);
  }
};

// Create a customer portal session
export const createCustomerPortal = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const { returnUrl } = req.body;
    if (!returnUrl) {
      return res.status(400).json({ message: 'Return URL is required' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get Stripe customer ID from user
    let stripeCustomerId = user.sensitiveData?.paymentInfo?.tokenized;
    if (!stripeCustomerId) {
      return res.status(400).json({ message: 'No Stripe customer found for this user' });
    }

    // Create a Stripe customer portal session
    const portalSession = await stripeService.createCustomerPortalSession(
      stripeCustomerId,
      returnUrl
    );

    return res.status(200).json({
      url: portalSession.url
    });
  } catch (error: any) {
    console.error('Error creating customer portal:', error);
    return res.status(500).json({ 
      message: 'Failed to create customer portal', 
      error: error.message 
    });
  }
};

// Add a new cron job method for sending renewal reminders
// This would be called by a scheduled task, e.g., every day
export const sendRenewalReminders = async () => {
  try {
    // Find subscriptions that are due to renew in 7 days
    const renewalDate = new Date();
    renewalDate.setDate(renewalDate.getDate() + 7); // 7 days from now
    
    // Set the time to the start of the day for easier comparison
    renewalDate.setHours(0, 0, 0, 0);
    
    const startOfDay = new Date(renewalDate);
    const endOfDay = new Date(renewalDate);
    endOfDay.setHours(23, 59, 59, 999);
    
    const subscriptions = await Subscription.find({
      status: 'active',
      endDate: {
        $gte: startOfDay,
        $lte: endOfDay
      }
    }).populate('user');
    
    console.log(`Found ${subscriptions.length} subscriptions due for renewal reminders`);
    
    for (const subscription of subscriptions) {
      const user = subscription.user;
      if (!user) {
        console.error('No user found for subscription:', subscription._id);
        continue;
      }
      
      // Get the plan amount based on plan type
      let amount = 20.00; // default to monthly
      if (subscription.planType === 'quarterly') {
        amount = 50.00;
      } else if (subscription.planType === 'annual') {
        amount = 150.00;
      }
      
      await emailService.sendRenewalReminderEmail(
        user.email,
        user.name,
        subscription.planType,
        subscription.endDate,
        amount
      );
      
      console.log(`Sent renewal reminder for subscription ${subscription._id}`);
    }
  } catch (error) {
    console.error('Error sending renewal reminders:', error);
  }
}; 