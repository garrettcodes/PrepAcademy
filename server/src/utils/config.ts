import { getRequiredEnv, getOptionalEnv, isFeatureEnabled } from './envValidator';

/**
 * Application configuration derived from environment variables
 * This centralizes all configuration values and ensures they are properly validated
 */
const config = {
  // Server configuration
  server: {
    port: parseInt(getOptionalEnv('PORT', '5000')),
    nodeEnv: getOptionalEnv('NODE_ENV', 'development'),
    isProduction: getOptionalEnv('NODE_ENV', 'development') === 'production',
    isDevelopment: getOptionalEnv('NODE_ENV', 'development') === 'development',
    isTest: getOptionalEnv('NODE_ENV', 'development') === 'test',
  },
  
  // Logging configuration
  logging: {
    level: getOptionalEnv('LOG_LEVEL', config?.server?.isProduction ? 'info' : 'debug'),
    format: getOptionalEnv('LOG_FORMAT', 'pretty'),
    disableFileLogging: isFeatureEnabled('DISABLE_FILE_LOGGING', false),
    enableTestLogs: isFeatureEnabled('ENABLE_TEST_LOGS', false),
  },
  
  // Database configuration
  database: {
    uri: getOptionalEnv('MONGO_URI', ''),
    host: getOptionalEnv('MONGO_HOST', 'localhost'),
    port: parseInt(getOptionalEnv('MONGO_PORT', '27017')),
    name: getOptionalEnv('MONGO_DB', 'prepacademy'),
    user: getOptionalEnv('MONGO_USER', ''),
    pass: getOptionalEnv('MONGO_PASS', ''),
    
    // For tests
    testUri: getOptionalEnv('MONGO_URI_TEST', 'mongodb://localhost:27017/prepacademy_test'),
  },
  
  // JWT configuration
  jwt: {
    secret: getRequiredEnv('JWT_SECRET'),
    refreshSecret: getRequiredEnv('JWT_REFRESH_SECRET'),
    expiration: getOptionalEnv('JWT_EXPIRATION', '1h'),
    refreshExpiration: getOptionalEnv('JWT_REFRESH_EXPIRATION', '7d'),
  },
  
  // Mail configuration
  mail: {
    host: getOptionalEnv('MAIL_HOST', ''),
    port: parseInt(getOptionalEnv('MAIL_PORT', '587')),
    user: getOptionalEnv('MAIL_USER', ''),
    pass: getOptionalEnv('MAIL_PASS', ''),
    from: getOptionalEnv('MAIL_FROM', 'no-reply@prepacademy.com'),
    enabled: Boolean(getOptionalEnv('MAIL_HOST', '')),
  },
  
  // Security configuration
  security: {
    encryptionKey: getRequiredEnv('ENCRYPTION_KEY'),
  },
  
  // Stripe configuration
  stripe: {
    secretKey: getOptionalEnv('STRIPE_SECRET_KEY', ''),
    webhookSecret: getOptionalEnv('STRIPE_WEBHOOK_SECRET', ''),
    monthlyPriceId: getOptionalEnv('STRIPE_MONTHLY_PRICE_ID', ''),
    quarterlyPriceId: getOptionalEnv('STRIPE_QUARTERLY_PRICE_ID', ''),
    annualPriceId: getOptionalEnv('STRIPE_ANNUAL_PRICE_ID', ''),
    enabled: Boolean(getOptionalEnv('STRIPE_SECRET_KEY', '')),
  },
  
  // Frontend configuration
  frontend: {
    url: getRequiredEnv('FRONTEND_URL'),
  },
  
  // OpenAI configuration
  openai: {
    apiKey: getOptionalEnv('OPENAI_API_KEY', ''),
    enabled: Boolean(getOptionalEnv('OPENAI_API_KEY', '')),
  },
  
  // HTTPS configuration
  https: {
    enabled: isFeatureEnabled('ENABLE_HTTPS', false),
    keyPath: getOptionalEnv('SSL_KEY_PATH', 'ssl/server.key'),
    certPath: getOptionalEnv('SSL_CERT_PATH', 'ssl/server.cert'),
  }
};

export default config; 