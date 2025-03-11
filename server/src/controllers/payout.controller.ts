import { Request, Response } from 'express';
import stripeService from '../services/stripe.service';

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
      status as Stripe.Payout.Status
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

export default {
  initializePayoutSchedule,
  createManualPayout,
  getPayouts,
  getPayoutDetails,
  cancelPendingPayout,
  getPayoutScheduleStatus
}; 