import Stripe from 'stripe';
import dotenv from 'dotenv';
import cron from 'node-cron';
import { encrypt, decrypt } from '../utils/encryption';

dotenv.config();

// Initialize Stripe with API key from environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-24.acacia',
});

// Define subscription plans' price IDs
export const SUBSCRIPTION_PLANS = {
  monthly: {
    priceId: process.env.STRIPE_MONTHLY_PRICE_ID || 'price_monthly',
    amount: 2000, // $20.00
    interval: 'month',
    intervalCount: 1,
  },
  quarterly: {
    priceId: process.env.STRIPE_QUARTERLY_PRICE_ID || 'price_quarterly',
    amount: 5000, // $50.00
    interval: 'month',
    intervalCount: 3,
  },
  annual: {
    priceId: process.env.STRIPE_ANNUAL_PRICE_ID || 'price_annual',
    amount: 15000, // $150.00
    interval: 'year',
    intervalCount: 1,
  },
};

// Create a Stripe customer
export const createCustomer = async (email: string, name: string) => {
  try {
    const customer = await stripe.customers.create({
      email,
      name,
      metadata: {
        source: 'PrepAcademy',
      },
    });
    return customer;
  } catch (error) {
    console.error('Error creating Stripe customer:', error);
    throw error;
  }
};

// Create a subscription for a customer
export const createSubscription = async (
  customerId: string,
  planType: 'monthly' | 'quarterly' | 'annual'
) => {
  try {
    const plan = SUBSCRIPTION_PLANS[planType];
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: plan.priceId }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });
    return subscription;
  } catch (error) {
    console.error('Error creating Stripe subscription:', error);
    throw error;
  }
};

// Update a subscription
export const updateSubscription = async (
  subscriptionId: string,
  planType: 'monthly' | 'quarterly' | 'annual'
) => {
  try {
    const plan = SUBSCRIPTION_PLANS[planType];
    
    // First, retrieve the subscription to get the current items
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    
    // Get the first subscription item ID
    const itemId = subscription.items.data[0].id;
    
    // Update the subscription with the new price
    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      items: [
        {
          id: itemId,
          price: plan.priceId,
        },
      ],
    });
    
    return updatedSubscription;
  } catch (error) {
    console.error('Error updating Stripe subscription:', error);
    throw error;
  }
};

// Cancel a subscription
export const cancelSubscription = async (subscriptionId: string) => {
  try {
    // Use `cancel` instead of `del` which is causing TypeScript errors
    const subscription = await stripe.subscriptions.cancel(subscriptionId);
    return subscription;
  } catch (error) {
    console.error(`Failed to cancel subscription ${subscriptionId}:`, error);
    throw error;
  }
};

// Immediately cancel subscription 
export const deleteSubscription = async (subscriptionId: string) => {
  try {
    // Use 'cancel' instead of 'del'
    const subscription = await stripe.subscriptions.cancel(subscriptionId);
    return subscription;
  } catch (error) {
    console.error('Error deleting Stripe subscription:', error);
    throw error;
  }
};

// Get subscription details
export const getSubscription = async (subscriptionId: string) => {
  try {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    return subscription;
  } catch (error) {
    console.error('Error retrieving Stripe subscription:', error);
    throw error;
  }
};

// Create a checkout session for payment
export const createCheckoutSession = async (
  customerId: string,
  planType: 'monthly' | 'quarterly' | 'annual',
  successUrl: string,
  cancelUrl: string
) => {
  try {
    const plan = SUBSCRIPTION_PLANS[planType];
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
    return session;
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw error;
  }
};

// Create payment intent for direct payment processing
export const createPaymentIntent = async (
  amount: number,
  currency: string = 'usd',
  customerId: string
) => {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      customer: customerId,
      payment_method_types: ['card'],
    });
    return paymentIntent;
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw error;
  }
};

// Handle webhook events from Stripe
export const handleWebhookEvent = async (event: Stripe.Event) => {
  switch (event.type) {
    case 'invoice.payment_succeeded':
      const invoice = event.data.object as Stripe.Invoice;
      // Handle successful payment
      return {
        status: 'success',
        invoice,
      };
      
    case 'invoice.payment_failed':
      const failedInvoice = event.data.object as Stripe.Invoice;
      // Handle failed payment
      return {
        status: 'failed',
        invoice: failedInvoice,
      };
      
    case 'customer.subscription.deleted':
      const subscription = event.data.object as Stripe.Subscription;
      // Handle subscription cancellation
      return {
        status: 'canceled',
        subscription,
      };
      
    case 'customer.subscription.updated':
      const updatedSubscription = event.data.object as Stripe.Subscription;
      // Handle subscription update
      return {
        status: 'updated',
        subscription: updatedSubscription,
      };
      
    case 'payout.created':
      const payout = event.data.object as Stripe.Payout;
      return {
        status: 'payout_created',
        payout,
      };
      
    case 'payout.paid':
      const paidPayout = event.data.object as Stripe.Payout;
      return {
        status: 'payout_paid',
        payout: paidPayout,
      };
      
    case 'payout.failed':
      const failedPayout = event.data.object as Stripe.Payout;
      return {
        status: 'payout_failed',
        payout: failedPayout,
      };
      
    default:
      // Unexpected event type
      return {
        status: 'unhandled',
        type: event.type,
      };
  }
};

// Create a customer portal session
export const createCustomerPortalSession = async (customerId: string, returnUrl: string): Promise<Stripe.BillingPortal.Session> => {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });
    
    return session;
  } catch (error) {
    console.error('Error creating Stripe portal session:', error);
    throw error;
  }
};

// -------------- PAYOUT SYSTEM FUNCTIONS --------------

/**
 * Create a manual payout to your bank account
 * @param amount Amount in cents to payout
 * @param description Description of the payout
 * @returns The created payout object
 */
export const createPayout = async (
  amount: number,
  description: string = 'PrepAcademy payout'
): Promise<Stripe.Payout> => {
  try {
    const payout = await stripe.payouts.create({
      amount, // amount in cents
      currency: 'usd',
      description,
      statement_descriptor: 'PREPACADEMY PAYOUT', // Will appear on bank statement (max 22 chars)
    });
    
    console.log(`Payout created successfully: ${payout.id}`);
    return payout;
  } catch (error) {
    console.error('Error creating payout:', error);
    throw error;
  }
};

/**
 * Get details about a specific payout
 * @param payoutId The ID of the payout to retrieve
 * @returns The payout object
 */
export const getPayout = async (payoutId: string): Promise<Stripe.Payout> => {
  try {
    const payout = await stripe.payouts.retrieve(payoutId);
    return payout;
  } catch (error) {
    console.error(`Error retrieving payout ${payoutId}:`, error);
    throw error;
  }
};

/**
 * List all payouts with optional filters
 * @param limit Maximum number of payouts to return
 * @param status Optional status filter
 * @returns List of payouts
 */
export const listPayouts = async (
  limit: number = 10,
  status?: 'pending' | 'paid' | 'failed' | 'canceled'
): Promise<Stripe.ApiList<Stripe.Payout>> => {
  try {
    return await stripe.payouts.list({
      limit,
      status
    });
  } catch (error) {
    console.error('Error listing payouts:', error);
    throw error;
  }
};

/**
 * Cancel a pending payout
 * @param payoutId The ID of the payout to cancel
 * @returns The canceled payout object
 */
export const cancelPayout = async (payoutId: string): Promise<Stripe.Payout> => {
  try {
    const payout = await stripe.payouts.cancel(payoutId);
    console.log(`Payout ${payoutId} canceled successfully`);
    return payout;
  } catch (error) {
    console.error(`Error canceling payout ${payoutId}:`, error);
    throw error;
  }
};

/**
 * Setup a schedule for automatic weekly payouts
 * @param amount Default amount to payout (can be overridden in individual payouts)
 * @returns A function to stop the scheduled payouts
 */
export const setupWeeklyPayouts = (amount: number = 0): () => void => {
  // Schedule payouts every Monday at 1:00 AM
  const schedule = cron.schedule('0 1 * * 1', async () => {
    try {
      // Check if automatic payouts are enabled in Stripe
      const payoutSettings = await getPayoutSettings();
      
      if (!payoutSettings.enabled) {
        console.log('Automatic payouts are not enabled in Stripe. Skipping scheduled payout.');
        return;
      }
      
      // Calculate payout amount if not specified
      const payoutAmount = amount > 0 ? amount : await calculatePayoutAmount();
      
      // Only create payout if there's a positive amount
      if (payoutAmount > 0) {
        const date = new Date();
        const description = `Weekly payout - ${date.toISOString().split('T')[0]}`;
        await createPayout(payoutAmount, description);
        console.log(`Weekly payout scheduled successfully for $${(payoutAmount / 100).toFixed(2)}`);
      } else {
        console.log('No payout created - insufficient balance');
      }
    } catch (error) {
      console.error('Error in automatic weekly payout:', error);
    }
  });
  
  // Return function to stop scheduled task if needed
  return () => schedule.stop();
};

/**
 * Calculate the available amount for payout based on current Stripe balance
 * @returns Amount in cents available for payout
 */
export const calculatePayoutAmount = async (): Promise<number> => {
  try {
    // Get available balance from Stripe
    const balance = await stripe.balance.retrieve();
    
    // Sum up available amounts in USD
    const availableBalance = balance.available
      .filter(bal => bal.currency === 'usd')
      .reduce((sum, bal) => sum + bal.amount, 0);
    
    // Keep a small buffer for fees and refunds (e.g., 10%)
    // Adjust this based on your business needs
    const bufferPercentage = 0.1;
    const payoutAmount = Math.floor(availableBalance * (1 - bufferPercentage));
    
    return Math.max(0, payoutAmount);
  } catch (error) {
    console.error('Error calculating payout amount:', error);
    throw error;
  }
};

/**
 * Verify that payouts are enabled and properly configured
 * @returns Information about payout settings
 */
export const getPayoutSettings = async (): Promise<{
  enabled: boolean;
  bankAccountLast4?: string;
  schedule?: { interval: string; weeklyAnchor?: string; monthlyAnchor?: number };
  failureMessage?: string;
}> => {
  try {
    // Get Stripe account information
    const account = await stripe.accounts.retrieve();
    
    // Check if payouts are enabled
    const payoutsEnabled = account.payouts_enabled;
    
    if (!payoutsEnabled) {
      return {
        enabled: false,
        failureMessage: 'Payouts are not enabled for this Stripe account. Please complete account verification.'
      };
    }
    
    // Get bank account information (if available)
    const bankAccounts = await stripe.accounts.listExternalAccounts(
      account.id,
      { object: 'bank_account', limit: 1 }
    );
    
    if (bankAccounts.data.length === 0) {
      return {
        enabled: false,
        failureMessage: 'No bank account is connected to this Stripe account.'
      };
    }
    
    const bankAccount = bankAccounts.data[0] as Stripe.BankAccount;
    
    // Get payout schedule
    const settings = account.settings as any;
    const payoutSchedule = settings?.payouts?.schedule || { interval: 'manual' };
    
    return {
      enabled: true,
      bankAccountLast4: bankAccount.last4,
      schedule: payoutSchedule
    };
    
  } catch (error) {
    console.error('Error retrieving payout settings:', error);
    return {
      enabled: false,
      failureMessage: 'Failed to retrieve payout settings. Please check your Stripe configuration.'
    };
  }
};

// Securely store card details (encrypted)
export const securelyStoreCardDetails = async (
  customerId: string,
  cardDetails: {
    last4: string;
    brand: string;
    expMonth: number;
    expYear: number;
  }
) => {
  try {
    // Convert card details to JSON string
    const cardDetailsString = JSON.stringify(cardDetails);
    
    // Encrypt the card details string
    const encryptedCardDetails = encrypt(cardDetailsString);
    
    return encryptedCardDetails;
  } catch (error) {
    console.error('Error encrypting card details:', error);
    throw error;
  }
};

// Decrypt and retrieve card details
export const retrieveCardDetails = (encryptedCardDetails: string) => {
  try {
    // Decrypt the card details
    const cardDetailsString = decrypt(encryptedCardDetails);
    
    // Parse the JSON string back to an object
    const cardDetails = JSON.parse(cardDetailsString);
    
    return cardDetails;
  } catch (error) {
    console.error('Error decrypting card details:', error);
    throw error;
  }
};

export default {
  createCustomer,
  createSubscription,
  updateSubscription,
  cancelSubscription,
  deleteSubscription,
  getSubscription,
  createCheckoutSession,
  createPaymentIntent,
  handleWebhookEvent,
  createCustomerPortalSession,
  SUBSCRIPTION_PLANS,
  // Payout methods
  createPayout,
  getPayout,
  listPayouts,
  cancelPayout,
  setupWeeklyPayouts,
  calculatePayoutAmount,
  getPayoutSettings,
  securelyStoreCardDetails,
  retrieveCardDetails,
}; 