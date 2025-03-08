import Badge from '../models/badge.model';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('MongoDB connected successfully.');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  }
};

const seedBadges = async () => {
  try {
    // Clear existing badges
    await Badge.deleteMany({});
    console.log('Cleared existing badges');

    // Define initial badges
    const badges = [
      // Subject mastery badges
      {
        name: 'Math Master',
        description: 'Achieved 100% in Mathematics',
        icon: 'calculator',
        category: 'subject',
        criteria: {
          type: 'subject-mastery',
          subject: 'Mathematics',
          score: 100
        }
      },
      {
        name: 'Science Wizard',
        description: 'Achieved 100% in Science',
        icon: 'flask',
        category: 'subject',
        criteria: {
          type: 'subject-mastery',
          subject: 'Science',
          score: 100
        }
      },
      {
        name: 'History Buff',
        description: 'Achieved 100% in History',
        icon: 'book',
        category: 'subject',
        criteria: {
          type: 'subject-mastery',
          subject: 'History',
          score: 100
        }
      },
      
      // Question count badges
      {
        name: 'Getting Started',
        description: 'Answered 10 questions',
        icon: 'start',
        category: 'achievement',
        criteria: {
          type: 'question-count',
          questionCount: 10
        }
      },
      {
        name: 'Dedicated Learner',
        description: 'Answered 50 questions',
        icon: 'pencil',
        category: 'achievement',
        criteria: {
          type: 'question-count',
          questionCount: 50
        }
      },
      {
        name: 'Study Champion',
        description: 'Answered 100 questions',
        icon: 'medal',
        category: 'achievement',
        criteria: {
          type: 'question-count',
          questionCount: 100
        }
      },
      
      // Perfect score badges
      {
        name: 'Perfect Streak',
        description: 'Got 5 perfect scores in a row',
        icon: 'fire',
        category: 'achievement',
        criteria: {
          type: 'perfect-score',
          questionCount: 5
        }
      },
      
      // Point milestone badges
      {
        name: 'Point Collector',
        description: 'Earned 100 points',
        icon: 'coin',
        category: 'achievement',
        criteria: {
          type: 'point-milestone',
          score: 100
        }
      },
      {
        name: 'Point Master',
        description: 'Earned 500 points',
        icon: 'star',
        category: 'achievement',
        criteria: {
          type: 'point-milestone',
          score: 500
        }
      }
    ];

    // Insert badges
    await Badge.insertMany(badges);
    console.log(`Inserted ${badges.length} badges`);

    console.log('Badge seeding completed successfully');
  } catch (error) {
    console.error('Error seeding badges:', error);
  } finally {
    // Disconnect from MongoDB
    mongoose.disconnect();
    console.log('MongoDB disconnected.');
  }
};

// Run the seed function
connectDB().then(() => {
  seedBadges();
}); 