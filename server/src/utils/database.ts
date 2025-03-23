import mongoose from 'mongoose';
import config from './config';
import logger from './logger';

// Connection options
const mongooseOptions: mongoose.ConnectOptions = {
  // These are mongoose 6+ recommended settings
  autoIndex: true, // Build indexes
  maxPoolSize: 10, // Maintain up to 10 socket connections
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
  family: 4 // Use IPv4, skip trying IPv6
};

// Short reference to environment type
const { isProduction } = config.server;

// Determine connection string based on environment
const getConnectionUrl = (): string => {
  // If MONGO_URI is provided, use it directly (production/staging)
  if (config.database.uri) {
    return config.database.uri;
  }
  
  // For development without explicit URI, construct connection from parts
  if (config.database.user && config.database.pass) {
    // With authentication
    return `mongodb://${config.database.user}:${config.database.pass}@${config.database.host}:${config.database.port}/${config.database.name}`;
  } else {
    // Without authentication
    return `mongodb://${config.database.host}:${config.database.port}/${config.database.name}`;
  }
};

// Number of connection retry attempts
const MAX_RETRY_ATTEMPTS = 5;
let retryCount = 0;

/**
 * Connect to MongoDB with retry mechanism
 */
const connectDB = async (): Promise<void> => {
  const connectionUrl = getConnectionUrl();
  
  if (!connectionUrl) {
    logger.error('MongoDB connection string is not provided.');
    if (isProduction) {
      process.exit(1); // Exit in production if no connection string
    }
    return;
  }
  
  try {
    // Log different messages based on environment
    if (config.server.isDevelopment) {
      const sanitizedUrl = connectionUrl.includes('@') 
        ? connectionUrl.replace(/\/\/(.+?)@/, '//[CREDENTIALS_HIDDEN]@') 
        : connectionUrl;
      logger.info(`Connecting to MongoDB at ${sanitizedUrl}`);
    } else {
      logger.info('Connecting to MongoDB...');
    }
    
    // Connect to MongoDB
    await mongoose.connect(connectionUrl, mongooseOptions);
    
    // Reset retry counter on successful connection
    retryCount = 0;
    
    logger.info(`MongoDB connected successfully in ${config.server.nodeEnv} mode`);
    
    // Setup mongoose debug mode for query logging in development
    if (config.server.isDevelopment) {
      mongoose.set('debug', (collectionName, method, query, doc) => {
        logger.debug(`Mongoose: ${collectionName}.${method}`, {
          meta: { collection: collectionName, method, query: JSON.stringify(query), doc: JSON.stringify(doc) }
        });
      });
    }
    
    // Add event listeners for connection issues
    mongoose.connection.on('error', (error) => {
      logger.error('MongoDB connection error:', { meta: { error: error.message, stack: error.stack } });
    });
    
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected. Attempting to reconnect...');
      // Only try to reconnect if server is still running
      if (retryCount < MAX_RETRY_ATTEMPTS) {
        setTimeout(() => connectDB(), 5000); // Wait 5 seconds before retrying
      }
    });
    
    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected successfully');
    });
    
    // Close the connection gracefully when the Node process terminates
    process.on('SIGINT', async () => {
      try {
        await mongoose.connection.close();
        logger.info('MongoDB connection closed through app termination');
        process.exit(0);
      } catch (error) {
        logger.error('Error during MongoDB connection closure:', { meta: { error } });
        process.exit(1);
      }
    });
    
  } catch (error) {
    retryCount++;
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const stack = error instanceof Error ? error.stack : 'No stack trace available';
    
    logger.error(`MongoDB connection error (attempt ${retryCount}/${MAX_RETRY_ATTEMPTS}):`, {
      meta: { error: errorMessage, stack, retryCount, maxRetries: MAX_RETRY_ATTEMPTS }
    });
    
    // Retry logic
    if (retryCount < MAX_RETRY_ATTEMPTS) {
      const delay = retryCount * 3000; // Exponential backoff
      logger.info(`Retrying connection in ${delay / 1000} seconds...`);
      setTimeout(() => connectDB(), delay);
    } else {
      logger.error(`Failed to connect to MongoDB after ${MAX_RETRY_ATTEMPTS} attempts.`);
      if (isProduction) {
        process.exit(1); // Exit in production after max retries
      }
    }
  }
};

export default connectDB; 