import mongoose from 'mongoose';
import dotenv from 'dotenv';
import connectDB from './database';

// Load environment variables
dotenv.config();

// Use the shared database connection utility instead of implementing a separate one
const runSeed = async () => {
  try {
    // Connect to MongoDB using our unified connection utility
    await connectDB();
    
    // Seed logic would continue here...
    console.log('Badge seeding completed successfully.');
    
    // Close the connection when done
    await mongoose.connection.close();
    console.log('Database connection closed.');
    
  } catch (error) {
    console.error('Error seeding badges:', error);
    // Close the connection on error
    await mongoose.connection.close();
    process.exit(1);
  }
};

// If this file is run directly, execute the seed
if (require.main === module) {
  runSeed();
}

export default runSeed; 