import express, { Express, Request, Response } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';
import cron from 'node-cron';

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

// Import mini-assessment notification function
import { checkAndNotifyDueMiniAssessments } from './controllers/miniAssessment.controller';

// Load environment variables
dotenv.config();

// Initialize Express app
const app: Express = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

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

// Default route
app.get('/', (req: Request, res: Response) => {
  res.send('PrepAcademy API is running');
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI as string)
  .then(() => {
    console.log('Connected to MongoDB');
    
    // Start the server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      
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
      
      // Also run an initial check when the server starts
      checkAndNotifyDueMiniAssessments()
        .then(count => console.log(`Initial check: Notified ${count} users about due mini-assessments`))
        .catch(error => console.error('Error during initial mini-assessment check:', error));
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  }); 