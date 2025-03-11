import cron from 'node-cron';
import { sendRenewalReminders } from '../controllers/subscription.controller';

// Schedule jobs
export const scheduleSubscriptionJobs = () => {
  // Run every day at 8:00 AM
  cron.schedule('0 8 * * *', async () => {
    console.log('Running subscription renewal reminder job...');
    try {
      await sendRenewalReminders();
      console.log('Subscription renewal reminder job completed successfully');
    } catch (error) {
      console.error('Error running subscription renewal reminder job:', error);
    }
  });
  
  console.log('Subscription jobs scheduled');
};

export default {
  scheduleSubscriptionJobs
}; 