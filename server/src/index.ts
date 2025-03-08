import express, { Express, Request, Response } from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import cors from 'cors';
import morgan from 'morgan';

// Import routes
import authRoutes from './routes/auth.routes';
import diagnosticRoutes from './routes/diagnostic.routes';
import studyPlanRoutes from './routes/studyPlan.routes';
import examRoutes from './routes/exam.routes';
import aiRoutes from './routes/ai.routes';
import questionRoutes from './routes/question.routes';
import performanceRoutes from './routes/performance.routes';

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
app.use('/api/diagnostic', diagnosticRoutes);
app.use('/api/studyplan', studyPlanRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/performance', performanceRoutes);

// Default route
app.get('/', (req: Request, res: Response) => {
  res.send('PrepAcademy API is running');
});

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/prep-academy')
  .then(() => {
    console.log('Connected to MongoDB');
    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('MongoDB connection error:', error);
  }); 