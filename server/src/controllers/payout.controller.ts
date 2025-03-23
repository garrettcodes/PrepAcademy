import { Request, Response } from 'express';
import stripeService from '../services/stripe.service';
import Stripe from 'stripe';

// Add PayoutStatus type
type PayoutStatus = 'paid' | 'pending' | 'in_transit' | 'canceled' | 'failed';

// Add Payout Status type
/**
 * Initialize the weekly payout schedule
 * This should be called when the server starts
 */
export const initializePayoutSchedule = async () => {
  try {
    // Verify that payouts are properly configured
    const payoutSettings = await stripeService.getPayoutSettings();
    
    if (!payoutSettings.enabled) {
      console.error(`Payout configuration issue: ${payoutSettings.failureMessage}`);
      console.error('Weekly payouts will not be scheduled.');
      return;
    }
    
    // Setup weekly payouts
    const stopSchedule = stripeService.setupWeeklyPayouts();
    
    // Store this function somewhere if you want to be able to stop the schedule later
    console.log('Weekly payout schedule initialized successfully');
    
    return stopSchedule;
  } catch (error) {
    console.error('Failed to initialize payout schedule:', error);
  }
};

/**
 * Create a manual payout
 */
export const createManualPayout = async (req: Request, res: Response) => {
  try {
    const { amount, description } = req.body;
    
    if (!amount || amount <= 0) {
      return res.status(400).json({ 
        message: 'Invalid amount. Amount must be greater than 0.' 
      });
    }
    
    // Verify payouts are enabled
    const payoutSettings = await stripeService.getPayoutSettings();
    
    if (!payoutSettings.enabled) {
      return res.status(400).json({ 
        message: `Payout configuration issue: ${payoutSettings.failureMessage}` 
      });
    }
    
    // Create the payout
    const payout = await stripeService.createPayout(
      amount, 
      description || 'Manual payout'
    );
    
    return res.status(200).json({
      message: 'Payout created successfully',
      payout: {
        id: payout.id,
        amount: payout.amount,
        currency: payout.currency,
        arrival_date: payout.arrival_date,
        status: payout.status
      }
    });
  } catch (error) {
    console.error('Error creating manual payout:', error);
    return res.status(500).json({ 
      message: 'Failed to create payout',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get all payouts
 */
export const getPayouts = async (req: Request, res: Response) => {
  try {
    const { limit = 10, status } = req.query;
    
    const payouts = await stripeService.listPayouts(
      Number(limit), 
      status ? (status as 'canceled' | 'pending' | 'failed' | 'paid') : undefined
    );
    
    return res.status(200).json({
      message: 'Payouts retrieved successfully',
      count: payouts.data.length,
      payouts: payouts.data.map(p => ({
        id: p.id,
        amount: p.amount,
        currency: p.currency,
        arrival_date: p.arrival_date,
        status: p.status,
        created: p.created
      }))
    });
  } catch (error) {
    console.error('Error fetching payouts:', error);
    return res.status(500).json({ 
      message: 'Failed to fetch payouts',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get details of a specific payout
 */
export const getPayoutDetails = async (req: Request, res: Response) => {
  try {
    const { payoutId } = req.params;
    
    if (!payoutId) {
      return res.status(400).json({ message: 'Payout ID is required' });
    }
    
    const payout = await stripeService.getPayout(payoutId);
    
    return res.status(200).json({
      message: 'Payout details retrieved successfully',
      payout: {
        id: payout.id,
        amount: payout.amount,
        currency: payout.currency,
        arrival_date: payout.arrival_date,
        status: payout.status,
        method: payout.method,
        type: payout.type,
        statement_descriptor: payout.statement_descriptor,
        created: payout.created
      }
    });
  } catch (error) {
    console.error(`Error fetching payout details for ${req.params.payoutId}:`, error);
    return res.status(500).json({ 
      message: 'Failed to fetch payout details',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Cancel a pending payout
 */
export const cancelPendingPayout = async (req: Request, res: Response) => {
  try {
    const { payoutId } = req.params;
    
    if (!payoutId) {
      return res.status(400).json({ message: 'Payout ID is required' });
    }
    
    const payout = await stripeService.cancelPayout(payoutId);
    
    return res.status(200).json({
      message: 'Payout canceled successfully',
      payout: {
        id: payout.id,
        status: payout.status
      }
    });
  } catch (error) {
    console.error(`Error canceling payout ${req.params.payoutId}:`, error);
    
    // Handle specific error for payouts that can't be canceled
    if (error instanceof Error && error.message.includes('cannot be canceled')) {
      return res.status(400).json({ 
        message: 'This payout cannot be canceled. Only pending payouts can be canceled.'
      });
    }
    
    return res.status(500).json({ 
      message: 'Failed to cancel payout',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

/**
 * Get the current payout schedule status
 */
export const getPayoutScheduleStatus = async (req: Request, res: Response) => {
  try {
    // Get payout settings
    const payoutSettings = await stripeService.getPayoutSettings();
    
    // Calculate next payout date (next Monday 1AM)
    const now = new Date();
    const daysUntilNextMonday = (1 + 7 - now.getDay()) % 7;
    const nextPayoutDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + daysUntilNextMonday,
      1, 0, 0
    );
    
    // Calculate estimated payout amount
    let estimatedAmount;
    try {
      estimatedAmount = await stripeService.calculatePayoutAmount();
    } catch (error) {
      estimatedAmount = 0;
    }
    
    return res.status(200).json({
      message: 'Payout schedule status retrieved',
      schedule: {
        enabled: payoutSettings.enabled,
        frequency: 'weekly',
        nextPayoutDate,
        estimatedAmount,
        bankAccountLast4: payoutSettings.bankAccountLast4,
        stripeSchedule: payoutSettings.schedule,
        failureMessage: payoutSettings.failureMessage
      }
    });
  } catch (error) {
    console.error('Error getting payout schedule status:', error);
    return res.status(500).json({ 
      message: 'Failed to retrieve payout schedule status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

// Get Stripe account status
export const getStripeAccountStatus = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId || req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const accountStatus = await stripeService.getPayoutSettings();
    return res.status(200).json(accountStatus);
  } catch (error: any) {
    console.error('Error getting Stripe account status:', error);
    return res.status(500).json({ 
      message: 'Failed to get Stripe account status',
      error: error.message
    });
  }
};

// Create a Stripe account for connected accounts
export const createStripeAccount = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId || req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // This would need to be implemented in your stripe service
    // Example placeholder for now
    return res.status(200).json({
      success: true,
      message: 'Stripe account creation initiated',
      accountId: 'placeholder_account_id'
    });
  } catch (error: any) {
    console.error('Error creating Stripe account:', error);
    return res.status(500).json({ 
      message: 'Failed to create Stripe account',
      error: error.message
    });
  }
};

// Onboard a Stripe connected account
export const onboardStripeAccount = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId || req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // This would need to be implemented in your stripe service
    // Example placeholder for now
    return res.status(200).json({
      success: true,
      message: 'Stripe account onboarding initiated',
      onboardingUrl: 'https://connect.stripe.com/onboarding/placeholder'
    });
  } catch (error: any) {
    console.error('Error onboarding Stripe account:', error);
    return res.status(500).json({ 
      message: 'Failed to initiate onboarding',
      error: error.message
    });
  }
};

// Get balance for the account
export const getBalance = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId || req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    // Example placeholder implementation
    return res.status(200).json({
      success: true,
      available: [{ amount: 0, currency: 'usd' }],
      pending: [{ amount: 0, currency: 'usd' }]
    });
  } catch (error: any) {
    console.error('Error getting balance:', error);
    return res.status(500).json({ 
      message: 'Failed to get balance',
      error: error.message
    });
  }
};

// Get payout history
export const getPayoutHistory = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId || req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const limit = parseInt(req.query.limit as string) || 10;
    const status = req.query.status as PayoutStatus | undefined;

    const payouts = await stripeService.listPayouts(limit, status as any);
    return res.status(200).json({
      success: true,
      data: payouts.data
    });
  } catch (error: any) {
    console.error('Error getting payout history:', error);
    return res.status(500).json({ 
      message: 'Failed to get payout history',
      error: error.message
    });
  }
};

// Get all connected accounts (admin only)
export const getAllConnectedAccounts = async (req: Request, res: Response) => {
  try {
    // Only admins can access this endpoint (already checked by middleware)
    // Example placeholder implementation
    return res.status(200).json({
      success: true,
      accounts: []
    });
  } catch (error: any) {
    console.error('Error getting connected accounts:', error);
    return res.status(500).json({ 
      message: 'Failed to get connected accounts',
      error: error.message
    });
  }
};

// Create a transfer to a connected account (admin only)
export const createTransfer = async (req: Request, res: Response) => {
  try {
    // Only admins can access this endpoint (already checked by middleware)
    const { accountId, amount, description } = req.body;
    
    if (!accountId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Account ID and amount are required'
      });
    }

    // Example placeholder implementation
    return res.status(200).json({
      success: true,
      message: 'Transfer initiated',
      transfer: {
        id: 'placeholder_transfer_id',
        amount,
        description,
        destination: accountId
      }
    });
  } catch (error: any) {
    console.error('Error creating transfer:', error);
    return res.status(500).json({ 
      message: 'Failed to create transfer',
      error: error.message
    });
  }
};

export default {
  initializePayoutSchedule,
  createManualPayout,
  getPayouts,
  getPayoutDetails,
  cancelPendingPayout,
  getPayoutScheduleStatus,
  getStripeAccountStatus,
  createStripeAccount,
  onboardStripeAccount,
  getBalance,
  getPayoutHistory,
  getAllConnectedAccounts,
  createTransfer
}; 