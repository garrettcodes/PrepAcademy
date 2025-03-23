import winston from 'winston';
import 'winston-daily-rotate-file';
import path from 'path';
import fs from 'fs';
import config from './config';

// Create logs directory if it doesn't exist
const logsDir = path.join(process.cwd(), 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Get log level from environment or use default based on environment
const getLogLevel = (): string => {
  const envLevel = process.env.LOG_LEVEL?.toLowerCase();
  
  // Check if the provided level is valid
  if (envLevel && Object.keys(levels).includes(envLevel)) {
    return envLevel;
  }
  
  // Default based on environment
  return config.server.isProduction ? 'info' : 'debug';
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Add colors to winston
winston.addColors(colors);

// Determine log format based on environment variables
const getLogFormat = (): string => {
  return (process.env.LOG_FORMAT?.toLowerCase() === 'json') ? 'json' : 'pretty';
};

// Custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}${info.meta ? ` | ${JSON.stringify(info.meta)}` : ''}`
  )
);

// Custom format for file output (JSON for easier parsing)
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.json()
);

// Create transports array
const createTransports = () => {
  const transports = [
    // Console transport
    new winston.transports.Console({
      format: consoleFormat,
    }),
  ];
  
  // Skip file logging if disabled
  if (process.env.DISABLE_FILE_LOGGING !== 'true') {
    // Rotate file for all logs
    transports.push(
      new winston.transports.DailyRotateFile({
        filename: path.join(logsDir, 'application-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        format: fileFormat,
      })
    );
    
    // Separate file for error logs only
    transports.push(
      new winston.transports.DailyRotateFile({
        filename: path.join(logsDir, 'error-%DATE%.log'),
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '30d',
        level: 'error',
        format: fileFormat,
      })
    );
  }
  
  return transports;
};

// Create the logger
const logger = winston.createLogger({
  level: getLogLevel(),
  levels,
  transports: createTransports(),
  exitOnError: false,
});

/**
 * Shorthand function for adding request information to logs
 * @param req Express request object
 * @returns Object with request details
 */
export const logRequest = (req: any) => {
  return {
    meta: {
      ip: req.ip,
      method: req.method,
      path: req.path,
      params: req.params || {},
      query: req.query || {},
      user: req.user ? (req.user._id || req.user.id || 'unknown') : 'unauthenticated',
    },
  };
};

/**
 * Add error details to logs
 * @param error Error object
 * @returns Object with error details
 */
export const logError = (error: any) => {
  const errorObj = {
    message: error.message || 'Unknown error',
    stack: error.stack || 'No stack trace',
  };

  // Add additional error properties if they exist
  if (error.code) errorObj['code'] = error.code;
  if (error.name) errorObj['name'] = error.name;
  if (error.status) errorObj['status'] = error.status;
  
  return {
    meta: { error: errorObj },
  };
};

/**
 * Log database operations
 * @param operation Database operation name
 * @param collection Collection name
 * @param query Query details
 * @returns Object with database operation details
 */
export const logDatabase = (operation: string, collection: string, query: any = {}) => {
  return {
    meta: {
      db: {
        operation,
        collection,
        query: JSON.stringify(query).substring(0, 200), // Limit query size in logs
      },
    },
  };
};

// Don't log during tests unless explicitly enabled
if (config.server.isTest && process.env.ENABLE_TEST_LOGS !== 'true') {
  logger.transports.forEach((transport) => {
    transport.silent = true;
  });
}

// Log logger initialization
logger.info('Logger initialized', {
  meta: {
    level: getLogLevel(),
    format: getLogFormat(),
    environment: config.server.nodeEnv,
    fileLogging: process.env.DISABLE_FILE_LOGGING !== 'true',
  },
});

export default logger; 