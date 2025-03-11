import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Load environment variables
dotenv.config({ path: '.env.test' });

// Set test environment
process.env.NODE_ENV = 'test';

// Set default test environment variables if not already set
if (!process.env.JWT_SECRET) process.env.JWT_SECRET = 'test_jwt_secret';
if (!process.env.JWT_REFRESH_SECRET) process.env.JWT_REFRESH_SECRET = 'test_jwt_refresh_secret';
if (!process.env.ENCRYPTION_KEY) process.env.ENCRYPTION_KEY = 'test_encryption_key_32_bytes_long!';
if (!process.env.STRIPE_SECRET_KEY) process.env.STRIPE_SECRET_KEY = 'sk_test_example';
if (!process.env.STRIPE_WEBHOOK_SECRET) process.env.STRIPE_WEBHOOK_SECRET = 'whsec_example';
if (!process.env.STRIPE_MONTHLY_PRICE_ID) process.env.STRIPE_MONTHLY_PRICE_ID = 'price_monthly';
if (!process.env.STRIPE_QUARTERLY_PRICE_ID) process.env.STRIPE_QUARTERLY_PRICE_ID = 'price_quarterly';
if (!process.env.STRIPE_ANNUAL_PRICE_ID) process.env.STRIPE_ANNUAL_PRICE_ID = 'price_annual';

// Global setup
beforeAll(async () => {
  // Connect to test database if not already connected
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGO_URI_TEST || 'mongodb://localhost:27017/test');
  }
});

// Global teardown
afterAll(async () => {
  // Disconnect from test database
  await mongoose.connection.close();
});

// Mock console methods to reduce noise in test output
global.console = {
  ...console,
  // Uncomment to silence specific console methods during tests
  // log: jest.fn(),
  // error: jest.fn(),
  // warn: jest.fn(),
};

// Add any global mocks here
jest.mock('../services/stripe.service', () => ({
  createCustomer: jest.fn().mockResolvedValue({ id: 'cus_test123' }),
  createCheckoutSession: jest.fn().mockResolvedValue({
    id: 'cs_test123',
    url: 'https://checkout.stripe.com/test'
  }),
  getSubscription: jest.fn().mockResolvedValue({
    id: 'sub_test123',
    status: 'active',
    current_period_start: Math.floor(Date.now() / 1000),
    current_period_end: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
    customer: 'cus_test123',
    items: {
      data: [
        {
          price: {
            id: process.env.STRIPE_MONTHLY_PRICE_ID || 'price_test123'
          }
        }
      ]
    }
  }),
  cancelSubscription: jest.fn().mockResolvedValue({
    id: 'sub_test123',
    status: 'canceled'
  }),
  handleWebhookEvent: jest.fn().mockResolvedValue({
    status: 'success',
    invoice: {
      subscription: 'sub_test123'
    }
  }),
}));

// Mock email service
jest.mock('../services/email.service', () => ({
  sendSubscriptionCreatedEmail: jest.fn().mockResolvedValue(true),
  sendSubscriptionCanceledEmail: jest.fn().mockResolvedValue(true),
  sendPaymentFailedEmail: jest.fn().mockResolvedValue(true),
})); 