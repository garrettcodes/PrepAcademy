import { Request, Response } from 'express';
import User from '../models/user.model';
import Subscription from '../models/subscription.model';
import stripeService from '../services/stripe.service';
import Stripe from 'stripe';
import emailService from '../services/email.service';

// Initialize Stripe with the correct API version
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-24.acacia', // Updated to the latest API version
});

// Start a free trial for a user
export const startFreeTrial = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user already has an active subscription or trial
    if (user.subscriptionStatus === 'active' || user.subscriptionStatus === 'trial') {
      return res.status(400).json({ 
        message: 'User already has an active subscription or trial',
        currentStatus: user.subscriptionStatus
      });
    }

    // Check if user has had a trial before
    const hasHadTrialBefore = user.subscriptionHistory && user.subscriptionHistory.length > 0;
    if (hasHadTrialBefore) {
      const previousTrials = await Subscription.countDocuments({
        user: userId,
        status: { $in: ['trial', 'expired'] }
      });
      
      if (previousTrials > 0) {
        return res.status(400).json({
          message: 'User has already used their free trial',
          eligibleForPurchase: true
        });
      }
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
    
    // Initialize subscription history array if it doesn't exist
    if (!user.subscriptionHistory) {
      user.subscriptionHistory = [];
    }
    user.subscriptionHistory.push(subscription._id);
    
    await user.save();

    // Send trial started email
    try {
      await emailService.sendSubscriptionCreatedEmail(
        user.email,
        user.name,
        'trial',
        trialStartDate,
        trialEndDate
      );
    } catch (emailError) {
      console.error('Failed to send trial started email:', emailError);
      // Continue execution, don't fail for email errors
    }

    return res.status(200).json({
      message: 'Free trial started successfully',
      trialEndDate,
      subscription,
      daysRemaining: 7
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
    const { plan } = req.body;
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Validate plan type with proper typing
    const validPlans = ['monthly', 'quarterly', 'annual'] as const;
    type PlanType = typeof validPlans[number];
    
    if (!plan || !validPlans.includes(plan as PlanType)) {
      return res.status(400).json({ message: 'Invalid plan type' });
    }

    const typedPlan = plan as PlanType;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create or retrieve Stripe customer
    let stripeCustomerId = user.sensitiveData?.paymentInfo?.tokenized;
    if (!stripeCustomerId) {
      // Create a new Stripe customer
      const customer = await stripeService.createCustomer(user.email, user.name);
      
      if (!customer || !customer.id) {
        return res.status(500).json({ message: 'Failed to create customer in payment provider' });
      }
      
      // Store the customer ID
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
      try {
        stripeCustomerId = user.getDecryptedField('sensitiveData.paymentInfo.tokenized');
      } catch (error) {
        console.error('Error decrypting Stripe customer ID:', error);
        return res.status(500).json({ message: 'Error retrieving payment information' });
      }
    }

    // Create Stripe checkout session
    const successUrl = `${process.env.CLIENT_URL}/subscription/success?plan=${typedPlan}`;
    const cancelUrl = `${process.env.CLIENT_URL}/subscription/cancel`;

    const checkoutSession = await stripeService.createCheckoutSession(
      stripeCustomerId,
      typedPlan,
      successUrl,
      cancelUrl
    );
    
    if (!checkoutSession || !checkoutSession.url || !checkoutSession.id) {
      return res.status(500).json({ message: 'Failed to create checkout session' });
    }

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

    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Retrieve checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ['subscription'],
    }) as Stripe.Checkout.Session;

    if (!session || session.status !== 'complete') {
      return res.status(400).json({ message: 'Payment is not complete' });
    }

    // Check if subscription exists and handle its type
    if (!session.subscription) {
      return res.status(400).json({ message: 'No subscription found in the session' });
    }

    const subscriptionId = typeof session.subscription === 'string' 
      ? session.subscription 
      : session.subscription.id;

    if (!subscriptionId) {
      return res.status(400).json({ message: 'Invalid subscription ID' });
    }
    
    const stripeSubscription = await stripeService.getSubscription(subscriptionId);
    if (!stripeSubscription || !stripeSubscription.items.data.length) {
      return res.status(400).json({ message: 'Invalid subscription data' });
    }
    
    // Determine plan type from the price ID
    let planType: 'monthly' | 'quarterly' | 'annual' = 'monthly';
    const firstItem = stripeSubscription.items.data[0];
    
    if (!firstItem || !firstItem.price || !firstItem.price.id) {
      return res.status(400).json({ message: 'Invalid price data in subscription' });
    }
    
    const priceId = firstItem.price.id;
    
    if (priceId === process.env.STRIPE_QUARTERLY_PRICE_ID) {
      planType = 'quarterly';
    } else if (priceId === process.env.STRIPE_ANNUAL_PRICE_ID) {
      planType = 'annual';
    }

    // Calculate subscription end date
    const startDate = new Date(stripeSubscription.current_period_start * 1000);
    const endDate = new Date(stripeSubscription.current_period_end * 1000);

    // Ensure customer ID is a string
    const stripeCustomerId = typeof stripeSubscription.customer === 'string'
      ? stripeSubscription.customer
      : stripeSubscription.customer?.id;
      
    if (!stripeCustomerId) {
      return res.status(400).json({ message: 'Invalid customer ID in subscription' });
    }

    // Create a subscription record
    const subscription = await Subscription.create({
      user: userId,
      planType,
      status: 'active',
      startDate,
      endDate,
      trialEndDate: null,
      stripeCustomerId,
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
    try {
      await emailService.sendSubscriptionCreatedEmail(
        user.email,
        user.name,
        subscription.planType,
        subscription.startDate,
        subscription.endDate
      );
    } catch (emailError) {
      console.error('Failed to send subscription confirmation email:', emailError);
      // Continue execution, don't fail the whole request just for an email error
    }

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
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
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
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const user = await User.findById(userId).populate('currentSubscription');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.subscriptionStatus !== 'active' || !user.currentSubscription) {
      return res.status(400).json({ message: 'No active subscription to cancel' });
    }

    // Safely handle the populated subscription field
    const subscriptionId = typeof user.currentSubscription === 'object' && user.currentSubscription !== null
      ? user.currentSubscription._id 
      : user.currentSubscription;
    
    if (!subscriptionId) {
      return res.status(404).json({ message: 'Subscription ID not found' });
    }
    
    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found in database' });
    }
    
    // Cancel subscription with Stripe if there's a Stripe subscription ID
    if (subscription.stripeSubscriptionId) {
      try {
        await stripeService.cancelSubscription(subscription.stripeSubscriptionId);
      } catch (stripeError: any) {
        console.error('Error canceling Stripe subscription:', stripeError);
        // If the subscription doesn't exist in Stripe, continue with local cancellation
        if (stripeError.code !== 'resource_missing') {
          return res.status(500).json({ 
            message: 'Failed to cancel subscription with payment provider', 
            error: stripeError.message 
          });
        }
      }
    }

    // Update subscription status
    subscription.status = 'canceled';
    subscription.canceledAt = new Date();
    await subscription.save();

    // Update user status
    user.subscriptionStatus = 'canceled';
    await user.save();

    // Send cancellation email
    try {
      await emailService.sendSubscriptionCanceledEmail(
        user.email,
        user.name,
        subscription.planType,
        subscription.endDate
      );
    } catch (emailError) {
      console.error('Failed to send cancellation email:', emailError);
      // Continue execution, don't fail just for an email error
    }

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
    // Properly type the event
    const event: Stripe.Event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET || ''
    );

    const result = await stripeService.handleWebhookEvent(event);

    // Process different event types
    if (result.status === 'success') {
      const invoice = result.invoice as Stripe.Invoice | undefined;
      // Update subscription payment status
      if (invoice?.subscription) {
        const subscriptionId = typeof invoice.subscription === 'string' 
          ? invoice.subscription 
          : invoice.subscription.id;
          
        if (!subscriptionId) {
          console.error('No valid subscription ID found in invoice');
          return res.status(200).json({ received: true }); // Still return 200 to Stripe
        }

        const subscription = await Subscription.findOne({
          stripeSubscriptionId: subscriptionId
        });
        
        if (subscription) {
          subscription.lastPaymentDate = new Date();
          await subscription.save();
        }
      }
    } else if (result.status === 'failed') {
      // Handle failed payment
      const invoice = result.invoice as Stripe.Invoice | undefined;
      if (invoice?.subscription) {
        const subscriptionId = typeof invoice.subscription === 'string' 
          ? invoice.subscription 
          : invoice.subscription.id;
          
        if (!subscriptionId) {
          console.error('No valid subscription ID found in failed invoice');
          return res.status(200).json({ received: true }); // Still return 200 to Stripe
        }

        const subscription = await Subscription.findOne({
          stripeSubscriptionId: subscriptionId
        });
        
        if (subscription) {
          // Mark subscription for review
          (subscription as any).paymentStatus = 'failed';
          await subscription.save();
        }
      }
    } else if (result.status === 'canceled') {
      // Handle canceled subscription
      const subscription = result.subscription as Stripe.Subscription | undefined;
      if (subscription?.id) {
        await handleCanceledSubscription(subscription.id);
      }
    }

    // Send payment failed email
    if (event.type === 'invoice.payment_failed') {
      try {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = typeof invoice.customer === 'string' 
          ? invoice.customer 
          : invoice.customer?.id;
          
        if (!customerId) {
          console.error('No valid customer ID found in invoice');
          return res.status(200).json({ received: true }); // Still return 200 to Stripe
        }
        
        // Find the user with this customer ID
        const subscription = await Subscription.findOne({ stripeCustomerId: customerId });
        if (!subscription) {
          console.error('No subscription found for customer ID:', customerId);
          return res.status(200).json({ received: true }); // Still return 200 to Stripe
        }
        
        const user = await User.findById(subscription.user);
        if (!user) {
          console.error('No user found for subscription:', subscription._id);
          return res.status(200).json({ received: true }); // Still return 200 to Stripe
        }
        
        // Next attempt date (Stripe provides this or we can estimate)
        const nextAttemptDate = invoice.next_payment_attempt 
          ? new Date(invoice.next_payment_attempt * 1000) 
          : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days in the future
        
        await emailService.sendPaymentFailedEmail(
          user.email,
          user.name,
          subscription.planType,
          nextAttemptDate
        );
      } catch (error) {
        console.error('Error sending payment failed email:', error);
      }
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
export const getCustomerPortalSession = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
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

// Cancel user's subscription
export const cancelUserSubscription = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const user = await User.findById(userId).populate('currentSubscription');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.subscriptionStatus !== 'active' || !user.currentSubscription) {
      return res.status(400).json({ message: 'No active subscription to cancel' });
    }

    // Ensure subscription is populated and not just an ObjectId
    const subscriptionId = typeof user.currentSubscription === 'object' ? 
      user.currentSubscription._id : user.currentSubscription;
    
    const subscription = await Subscription.findById(subscriptionId);
    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }
    
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

// Check user's subscription status
export const checkSubscriptionStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }
    
    const user = await User.findById(userId).populate('currentSubscription');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const subscriptionInfo = {
      status: user.subscriptionStatus || 'none',
      subscription: user.currentSubscription || null,
      trialEndDate: user.trialEndDate || null,
      isActive: ['active', 'trial'].includes(user.subscriptionStatus || ''),
      daysRemaining: 0
    };

    // Calculate days remaining in subscription or trial
    if (user.subscriptionStatus === 'trial' && user.trialEndDate) {
      const today = new Date();
      const trialEnd = new Date(user.trialEndDate);
      const diffTime = trialEnd.getTime() - today.getTime();
      subscriptionInfo.daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    } else if (user.subscriptionStatus === 'active' && user.currentSubscription) {
      const subscription = typeof user.currentSubscription === 'object' ? 
        user.currentSubscription : await Subscription.findById(user.currentSubscription);
      
      if (subscription && typeof subscription === 'object' && 'endDate' in subscription) {
        const today = new Date();
        const subscriptionEnd = new Date(subscription.endDate);
        const diffTime = subscriptionEnd.getTime() - today.getTime();
        subscriptionInfo.daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      }
    }

    return res.status(200).json(subscriptionInfo);
  } catch (error: any) {
    console.error('Error checking subscription status:', error);
    return res.status(500).json({ 
      message: 'Failed to check subscription status', 
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
      if (!user || typeof user !== 'object') {
        console.error('No user found for subscription:', subscription._id);
        continue;
      }
      
      // Ensure user has required properties before accessing them
      const userEmail = typeof user === 'object' && 'email' in user ? user.email : '';
      const userName = typeof user === 'object' && 'name' in user ? user.name : '';
      
      if (!userEmail || !userName) {
        console.error('User missing required properties:', subscription._id);
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
        userEmail as string,
        userName as string,
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