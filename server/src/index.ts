import express, { Express, Request, Response } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import cron from 'node-cron';
import https from 'https';
import fs from 'fs';
import path from 'path';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { secureCookieSettings, csrfProtection } from './middleware/auth.middleware';

// Import routes
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import diagnosticRoutes from './routes/diagnostic.routes';
import questionRoutes from './routes/question.routes';
import studyPlanRoutes from './routes/studyPlan.routes';
import performanceRoutes from './routes/performance.routes';
import examRoutes from './routes/exam.routes';
import miniAssessmentRoutes from './routes/miniAssessment.routes';
import notificationRoutes from './routes/notification.routes';
import badgeRoutes from './routes/badge.routes';
import aiRoutes from './routes/ai.routes';
import leaderboardRoutes from './routes/leaderboard.routes';
import challengeRoutes from './routes/challenge.routes';
import syncRoutes from './routes/sync.routes';
import stressManagementRoutes from './routes/stressManagement.routes';
import parentRoutes from './routes/parent.routes';
import reportRoutes from './routes/report.routes';
import contentReviewRoutes from './routes/contentReview.routes';
import onboardingRoutes from './routes/onboarding.routes';
import studyGroupRoutes from './routes/studyGroup.routes';
import sharedNoteRoutes from './routes/sharedNote.routes';
import feedbackRoutes from './routes/feedback.routes';
import subscriptionRoutes from './routes/subscription.routes';
import payoutRoutes from './routes/payout.routes';

// Import mini-assessment notification function
import { checkAndNotifyDueMiniAssessments } from './controllers/miniAssessment.controller';
import { updateAllLeaderboards } from './controllers/leaderboard.controller';
import { checkSubscriptionStatuses } from './controllers/subscription.controller';
import { initializePayoutSchedule } from './controllers/payout.controller';

// Import subscription jobs
import { scheduleSubscriptionJobs } from './jobs/subscriptionJobs';

// Load environment variables
dotenv.config();

// Initialize Express app
const app: Express = express();
const PORT = process.env.PORT || 5000;

// Security middleware
// Apply helmet to secure HTTP headers
app.use(helmet());

// Secure cookie settings
app.use(secureCookieSettings);

// CSRF protection
app.use(csrfProtection);

// Apply rate limiting - basic configuration
const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500, // Limit each IP to 500 requests per window
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: 'Too many requests from this IP, please try again after 15 minutes'
});

// Apply to all requests
app.use(globalRateLimiter);

// More strict rate limiter for authentication endpoints
const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many login attempts from this IP, please try again after 15 minutes'
});

// General middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Apply auth rate limiter to login and register routes
app.use('/api/auth/login', authRateLimiter);
app.use('/api/auth/register', authRateLimiter);
app.use('/api/parents/login', authRateLimiter);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/diagnostic', diagnosticRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/studyplan', studyPlanRoutes);
app.use('/api/performance', performanceRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/miniassessment', miniAssessmentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/badges', badgeRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/sync', syncRoutes);
app.use('/api/stress-management', stressManagementRoutes);
app.use('/api/parents', parentRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/content-review', contentReviewRoutes);
app.use('/api/onboarding', onboardingRoutes);
app.use('/api/study-groups', studyGroupRoutes);
app.use('/api/shared-notes', sharedNoteRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/payouts', payoutRoutes);

// Special route for Stripe webhook - needs raw body
app.use('/api/subscriptions/webhook', express.raw({ type: 'application/json' }));

// Default route
app.get('/', (req: Request, res: Response) => {
  res.send('PrepAcademy API is running');
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => {
    console.log('Connected to MongoDB');
    
    // Check if HTTPS is enabled
    const isHttpsEnabled = process.env.ENABLE_HTTPS === 'true';
    
    if (isHttpsEnabled) {
      // HTTPS Configuration
      try {
        const options = {
          key: fs.readFileSync(path.resolve(process.env.SSL_KEY_PATH || 'ssl/server.key')),
          cert: fs.readFileSync(path.resolve(process.env.SSL_CERT_PATH || 'ssl/server.cert')),
        };
        
        // Create HTTPS server
        const httpsServer = https.createServer(options, app);
        httpsServer.listen(PORT, () => {
          console.log(`HTTPS Server running on port ${PORT}`);
          runScheduledTasks();
          // Schedule subscription jobs
          scheduleSubscriptionJobs();
        });
      } catch (error) {
        console.error('Error starting HTTPS server:', error);
        console.log('Falling back to HTTP server...');
        startHttpServer();
      }
    } else {
      // Start HTTP server if HTTPS is not enabled
      startHttpServer();
    }
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  });

// Function to start HTTP server
function startHttpServer() {
  app.listen(PORT, () => {
    console.log(`HTTP Server running on port ${PORT}`);
    runScheduledTasks();
  });
}

// Function to run scheduled tasks
function runScheduledTasks() {
  // Schedule cron job to check for due mini-assessments daily at 8am
  cron.schedule('0 8 * * *', async () => {
    console.log('Running scheduled check for due mini-assessments...');
    try {
      const count = await checkAndNotifyDueMiniAssessments();
      console.log(`Notified ${count} users about due mini-assessments`);
    } catch (error) {
      console.error('Error running scheduled mini-assessment check:', error);
    }
  });
  
  // Schedule cron job to update leaderboards every hour
  cron.schedule('0 * * * *', async () => {
    console.log('Running scheduled leaderboard update...');
    try {
      const success = await updateAllLeaderboards();
      console.log(`Leaderboards update ${success ? 'successful' : 'failed'}`);
    } catch (error) {
      console.error('Error running scheduled leaderboard update:', error);
    }
  });
  
  // Check subscription statuses every hour
  cron.schedule('0 * * * *', async () => {
    console.log('Checking subscription statuses...');
    try {
      await checkSubscriptionStatuses();
    } catch (error) {
      console.error('Error checking subscription statuses:', error);
    }
  });
  
  // Initialize the payout schedule on server start
  initializePayoutSchedule()
    .then(() => console.log('Payout schedule initialized'))
    .catch(error => console.error('Error initializing payout schedule:', error));
  
  // Also run an initial check when the server starts
  checkAndNotifyDueMiniAssessments()
    .then(count => console.log(`Initial check: Notified ${count} users about due mini-assessments`))
    .catch(error => console.error('Error during initial mini-assessment check:', error));
  
  // Also run an initial leaderboard update
  updateAllLeaderboards()
    .then(success => console.log(`Initial leaderboard update ${success ? 'successful' : 'failed'}`))
    .catch(error => console.error('Error during initial leaderboard update:', error));
} 