import { Request, Response, NextFunction } from 'express';
import logger, { logRequest } from '../utils/logger';

/**
 * Middleware to log HTTP requests
 */
export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
  // Skip logging for specific endpoints (like health checks) to avoid log noise
  if (req.path === '/health' || req.path === '/favicon.ico') {
    return next();
  }

  // Log all requests
  logger.http(`Request: ${req.method} ${req.path}`, logRequest(req));

  // Track response time
  const start = Date.now();
  
  // Log response when finished
  res.on('finish', () => {
    const duration = Date.now() - start;
    const level = res.statusCode >= 400 ? 'warn' : 'http';
    
    logger[level](
      `Response: ${req.method} ${req.path} ${res.statusCode} - ${duration}ms`,
      {
        meta: {
          statusCode: res.statusCode,
          duration,
          ...logRequest(req).meta,
        },
      }
    );
  });

  next();
};

/**
 * Error handler middleware that logs errors
 */
export const errorLogger = (err: any, req: Request, res: Response, next: NextFunction) => {
  // Log error details
  logger.error(`Error: ${err.message}`, {
    meta: {
      error: {
        message: err.message,
        stack: err.stack,
        status: err.status || 500,
        code: err.code,
      },
      request: logRequest(req).meta,
    },
  });
  
  // Pass the error to the next error handler
  next(err);
};

export default {
  requestLogger,
  errorLogger,
}; 