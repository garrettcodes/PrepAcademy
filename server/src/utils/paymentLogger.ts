import logger from './logger';

/**
 * Logs payment and subscription-related operations
 */
const paymentLogger = {
  /**
   * Log subscription creation
   * @param userId User ID
   * @param subscriptionId Stripe subscription ID
   * @param priceId Stripe price ID
   * @param amount Amount charged
   * @param currency Currency code
   */
  subscriptionCreated: (userId: string, subscriptionId: string, priceId: string, amount: number, currency: string) => {
    logger.info('Subscription created', {
      meta: {
        payment: {
          event: 'subscription_created',
          userId,
          subscriptionId,
          priceId,
          amount,
          currency,
          timestamp: new Date().toISOString(),
        },
      },
    });
  },

  /**
   * Log subscription cancellation
   * @param userId User ID
   * @param subscriptionId Stripe subscription ID
   * @param reason Reason for cancellation
   */
  subscriptionCancelled: (userId: string, subscriptionId: string, reason?: string) => {
    logger.info('Subscription cancelled', {
      meta: {
        payment: {
          event: 'subscription_cancelled',
          userId,
          subscriptionId,
          reason,
          timestamp: new Date().toISOString(),
        },
      },
    });
  },

  /**
   * Log subscription update
   * @param userId User ID
   * @param subscriptionId Stripe subscription ID
   * @param oldPriceId Previous Stripe price ID
   * @param newPriceId New Stripe price ID
   */
  subscriptionUpdated: (userId: string, subscriptionId: string, oldPriceId: string, newPriceId: string) => {
    logger.info('Subscription updated', {
      meta: {
        payment: {
          event: 'subscription_updated',
          userId,
          subscriptionId,
          oldPriceId,
          newPriceId,
          timestamp: new Date().toISOString(),
        },
      },
    });
  },

  /**
   * Log successful payment
   * @param userId User ID
   * @param paymentId Stripe payment ID
   * @param amount Amount charged
   * @param currency Currency code
   * @param subscriptionId Associated subscription ID, if any
   */
  paymentSucceeded: (userId: string, paymentId: string, amount: number, currency: string, subscriptionId?: string) => {
    logger.info('Payment succeeded', {
      meta: {
        payment: {
          event: 'payment_succeeded',
          userId,
          paymentId,
          amount,
          currency,
          subscriptionId,
          timestamp: new Date().toISOString(),
        },
      },
    });
  },

  /**
   * Log failed payment
   * @param userId User ID
   * @param paymentId Stripe payment ID, if available
   * @param error Error information
   * @param subscriptionId Associated subscription ID, if any
   */
  paymentFailed: (userId: string, paymentId: string | null, error: any, subscriptionId?: string) => {
    logger.error('Payment failed', {
      meta: {
        payment: {
          event: 'payment_failed',
          userId,
          paymentId,
          error: {
            message: error.message || 'Unknown error',
            code: error.code,
            type: error.type,
          },
          subscriptionId,
          timestamp: new Date().toISOString(),
        },
      },
    });
  },

  /**
   * Log Stripe webhook event processing
   * @param event Stripe event type
   * @param status Status of processing (success/failure)
   * @param data Relevant data from the event
   * @param error Error information, if processing failed
   */
  webhookProcessed: (event: string, status: 'success' | 'failure', data: any, error?: any) => {
    const logLevel = status === 'success' ? 'info' : 'error';
    
    logger[logLevel](`Stripe webhook ${event} ${status}`, {
      meta: {
        payment: {
          event: 'webhook_processed',
          stripeEvent: event,
          status,
          data: JSON.stringify(data).substring(0, 500), // Limit size for logging
          error: error ? {
            message: error.message || 'Unknown error',
            stack: error.stack,
          } : undefined,
          timestamp: new Date().toISOString(),
        },
      },
    });
  },

  /**
   * Log subscription status check
   * @param userId User ID
   * @param subscriptionId Stripe subscription ID
   * @param status Current subscription status
   * @param expiresAt Expiration date of subscription
   */
  subscriptionStatusChecked: (userId: string, subscriptionId: string, status: string, expiresAt: Date) => {
    logger.debug('Subscription status checked', {
      meta: {
        payment: {
          event: 'subscription_status_checked',
          userId,
          subscriptionId,
          status,
          expiresAt: expiresAt.toISOString(),
          timestamp: new Date().toISOString(),
        },
      },
    });
  },
};

export default paymentLogger; 