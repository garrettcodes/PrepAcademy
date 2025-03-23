import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

// Environment type
const NODE_ENV = process.env.NODE_ENV || 'development';
const isProd = NODE_ENV === 'production';

// Define variable requirements
interface EnvVariable {
  name: string;
  required: boolean | 'prod-only'; // true for all environments, 'prod-only' for production only
  validate?: (value: string) => boolean; // Optional validation function
  message?: string; // Custom error message
  secret?: boolean; // If true, value will be hidden in logs
}

// Define all environment variables and their requirements
const envVariables: EnvVariable[] = [
  // Server configuration
  { name: 'PORT', required: false },
  { name: 'NODE_ENV', required: false },
  
  // Database configuration
  { 
    name: 'MONGO_URI', 
    required: 'prod-only',
    validate: (value) => value.startsWith('mongodb://') || value.startsWith('mongodb+srv://'),
    message: 'MONGO_URI must be a valid MongoDB connection string starting with mongodb:// or mongodb+srv://'
  },
  { name: 'MONGO_HOST', required: false },
  { name: 'MONGO_PORT', required: false },
  { name: 'MONGO_DB', required: false },
  { name: 'MONGO_USER', required: false },
  { name: 'MONGO_PASS', required: false, secret: true },
  
  // JWT and authentication
  { 
    name: 'JWT_SECRET', 
    required: true, 
    validate: (value) => value.length >= 32,
    message: 'JWT_SECRET should be at least 32 characters long for security',
    secret: true
  },
  { 
    name: 'JWT_REFRESH_SECRET', 
    required: true, 
    validate: (value) => value.length >= 32,
    message: 'JWT_REFRESH_SECRET should be at least 32 characters long for security',
    secret: true
  },
  { name: 'JWT_EXPIRATION', required: false },
  { name: 'JWT_REFRESH_EXPIRATION', required: false },
  
  // Mail configuration
  { name: 'MAIL_HOST', required: isProd },
  { name: 'MAIL_PORT', required: isProd },
  { name: 'MAIL_USER', required: isProd },
  { name: 'MAIL_PASS', required: isProd, secret: true },
  { name: 'MAIL_FROM', required: isProd },
  
  // Encryption
  { 
    name: 'ENCRYPTION_KEY', 
    required: true, 
    validate: (value) => value.length === 32,
    message: 'ENCRYPTION_KEY must be exactly 32 characters long',
    secret: true 
  },
  
  // Stripe configuration
  { 
    name: 'STRIPE_SECRET_KEY', 
    required: isProd, 
    validate: (value) => value.startsWith('sk_'),
    message: 'STRIPE_SECRET_KEY must start with sk_',
    secret: true
  },
  { 
    name: 'STRIPE_WEBHOOK_SECRET', 
    required: isProd,
    validate: (value) => value.startsWith('whsec_'),
    message: 'STRIPE_WEBHOOK_SECRET must start with whsec_',
    secret: true
  },
  { name: 'STRIPE_MONTHLY_PRICE_ID', required: isProd },
  { name: 'STRIPE_QUARTERLY_PRICE_ID', required: isProd },
  { name: 'STRIPE_ANNUAL_PRICE_ID', required: isProd },
  
  // Frontend URL
  { 
    name: 'FRONTEND_URL', 
    required: true,
    validate: (value) => value.startsWith('http://') || value.startsWith('https://'),
    message: 'FRONTEND_URL must be a valid URL starting with http:// or https://'
  },
  
  // OpenAI API (if using AI features)
  { 
    name: 'OPENAI_API_KEY', 
    required: false, 
    validate: (value) => value.startsWith('sk-'),
    message: 'OPENAI_API_KEY must start with sk-',
    secret: true
  },
  
  // HTTPS Configuration
  { name: 'ENABLE_HTTPS', required: false },
  { 
    name: 'SSL_KEY_PATH', 
    required: false,
    validate: (value) => fs.existsSync(path.resolve(value)),
    message: 'SSL_KEY_PATH file does not exist'
  },
  { 
    name: 'SSL_CERT_PATH', 
    required: false,
    validate: (value) => fs.existsSync(path.resolve(value)),
    message: 'SSL_CERT_PATH file does not exist'
  }
];

/**
 * Validates environment variables against requirements
 * @returns Object containing validation status and error messages
 */
export const validateEnv = () => {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Check each environment variable
  envVariables.forEach(variable => {
    const { name, required, validate, message, secret } = variable;
    const value = process.env[name];
    
    // Display value for logging (hide secrets)
    const displayValue = secret && value ? '[HIDDEN]' : value;
    
    // Check if required
    if (required === true || (required === 'prod-only' && isProd)) {
      if (!value) {
        errors.push(`Missing required environment variable: ${name}`);
      } else if (validate && !validate(value)) {
        errors.push(message || `Invalid value for ${name}: ${displayValue}`);
      }
    } else if (value && validate && !validate(value)) {
      // Optional variable with value that doesn't pass validation
      warnings.push(message || `Invalid value for ${name}: ${displayValue}`);
    }
  });
  
  // Log results
  if (warnings.length > 0) {
    console.warn('⚠️ Environment variable warnings:');
    warnings.forEach(warning => console.warn(`  - ${warning}`));
  }
  
  if (errors.length > 0) {
    console.error('❌ Environment variable errors:');
    errors.forEach(error => console.error(`  - ${error}`));
    
    if (isProd) {
      // In production, throw error to prevent startup with invalid configuration
      throw new Error('Invalid environment configuration. Server startup aborted.');
    }
  } else {
    console.log('✅ Environment variables validated successfully');
    
    // Log detected environment
    const dbConnection = process.env.MONGO_URI 
      ? '[Connected via MONGO_URI]' 
      : `[Connected to ${process.env.MONGO_HOST || 'localhost'}:${process.env.MONGO_PORT || '27017'}/${process.env.MONGO_DB || 'prepacademy'}]`;
    
    console.log(`🔧 Environment: ${NODE_ENV.toUpperCase()}`);
    console.log(`💾 Database: ${dbConnection}`);
    
    if (process.env.ENABLE_HTTPS === 'true') {
      console.log('🔒 HTTPS: Enabled');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
};

/**
 * Gets required environment variable or throws if not defined
 * @param key Environment variable name
 * @param defaultValue Optional default value for non-production environments
 * @returns The environment variable value
 */
export const getRequiredEnv = (key: string, defaultValue?: string): string => {
  const value = process.env[key];
  
  if (!value) {
    if (isProd) {
      throw new Error(`Required environment variable ${key} is not defined`);
    } else if (defaultValue !== undefined) {
      return defaultValue;
    } else {
      throw new Error(`Required environment variable ${key} is not defined`);
    }
  }
  
  return value;
};

/**
 * Gets optional environment variable with default fallback
 * @param key Environment variable name
 * @param defaultValue Default value if not defined
 * @returns The environment variable value or default
 */
export const getOptionalEnv = (key: string, defaultValue: string): string => {
  return process.env[key] || defaultValue;
};

/**
 * Checks if a feature is enabled via environment variable
 * @param key Environment variable name
 * @param defaultEnabled Default enabled state
 * @returns Boolean indicating if feature is enabled
 */
export const isFeatureEnabled = (key: string, defaultEnabled: boolean = false): boolean => {
  const value = process.env[key]?.toLowerCase();
  if (value === undefined) return defaultEnabled;
  return value === 'true' || value === '1' || value === 'yes';
};

export default {
  validateEnv,
  getRequiredEnv,
  getOptionalEnv,
  isFeatureEnabled
}; 