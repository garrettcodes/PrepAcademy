import { describe, it, expect, beforeAll, afterAll, jest } from '@jest/globals';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Request, Response } from 'express';
import User from '../models/user.model';
import Subscription from '../models/subscription.model';
import * as stripeService from '../services/stripe.service';
import { createSubscription, handleSubscriptionSuccess, cancelSubscription } from '../controllers/subscription.controller';

// Mock Request and Response
interface MockRequest extends Partial<Request> {
  user?: { userId?: string; id?: string };
  body: Record<string, any>;
}

interface MockResponse extends Partial<Response> {
  status: jest.Mock;
  json: jest.Mock;
}

const mockRequest = (userId = null, body = {}): MockRequest => ({
  user: userId ? { userId: userId.toString() } : undefined,
  body
});

const mockResponse = (): MockResponse => {
  const res: Partial<MockResponse> = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res as MockResponse;
};

// We don't need to mock Stripe here since we're mocking the stripe service
// and the tests don't directly use the Stripe client

describe('Payment Flow Tests', () => {
  beforeAll(async () => {
    dotenv.config();
    
    // Connect to test database
    if (!process.env.MONGO_URI_TEST) {
      console.warn('No test database URI provided. Using memory server...');
      process.env.MONGO_URI_TEST = 'mongodb://localhost:27017/test';
    }
    
    await mongoose.connect(process.env.MONGO_URI_TEST);
    
    // Clear test collections
    await User.deleteMany({});
    await Subscription.deleteMany({});
  });
  
  afterAll(async () => {
    await mongoose.connection.close();
  });
  
  describe('Creating Subscriptions', () => {
    let testUser;
    
    beforeAll(async () => {
      // Create a test user
      testUser = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });
    });
    
    it('should fail to create subscription for unauthenticated user', async () => {
      const req = mockRequest(null, { planType: 'monthly' });
      const res = mockResponse();
      
      await createSubscription(req as unknown as Request, res as unknown as Response);
      
      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Unauthorized'
      }));
    });
    
    it('should fail with invalid plan type', async () => {
      const req = mockRequest(testUser._id, { planType: 'invalid' });
      const res = mockResponse();
      
      await createSubscription(req as unknown as Request, res as unknown as Response);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Invalid plan type'
      }));
    });
    
    it('should successfully create a monthly subscription', async () => {
      const req = mockRequest(testUser._id, { planType: 'monthly' });
      const res = mockResponse();
      
      await createSubscription(req as unknown as Request, res as unknown as Response);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        checkoutUrl: 'https://checkout.stripe.com/test',
        sessionId: 'cs_test123'
      }));
      expect(stripeService.createCheckoutSession).toHaveBeenCalled();
    });
  });
  
  describe('Subscription Success Handling', () => {
    let testUser, testSubscription;
    
    beforeAll(async () => {
      // Create a test user
      testUser = await User.create({
        name: 'Success Test User',
        email: 'success@example.com',
        password: 'password123',
      });
    });
    
    it('should fail without a session ID', async () => {
      const req = mockRequest(testUser._id, {});
      const res = mockResponse();
      
      await handleSubscriptionSuccess(req as unknown as Request, res as unknown as Response);
      
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Session ID is required'
      }));
    });
    
    it('should successfully handle a completed subscription', async () => {
      const req = mockRequest(testUser._id, { sessionId: 'cs_test123' });
      const res = mockResponse();
      
      await handleSubscriptionSuccess(req as unknown as Request, res as unknown as Response);
      
      const user = await User.findById(testUser._id);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Subscription created successfully'
      }));
      expect(user?.subscriptionStatus).toBe('active');
      
      // Save the created subscription for later tests
      testSubscription = await Subscription.findOne({ user: testUser._id });
      expect(testSubscription).toBeTruthy();
      expect(testSubscription.status).toBe('active');
    });
  });
  
  describe('Subscription Cancellation', () => {
    let testUser, testSubscription;
    
    beforeAll(async () => {
      // Create a test user with subscription
      testUser = await User.create({
        name: 'Cancel Test User',
        email: 'cancel@example.com',
        password: 'password123',
        subscriptionStatus: 'active'
      });
      
      testSubscription = await Subscription.create({
        user: testUser._id,
        planType: 'monthly',
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        stripeCustomerId: 'cus_test123',
        stripeSubscriptionId: 'sub_test123'
      });
      
      // Update user with subscription reference
      testUser.currentSubscription = testSubscription._id;
      await testUser.save();
    });
    
    it('should successfully cancel a subscription', async () => {
      const req = mockRequest(testUser._id, {});
      const res = mockResponse();
      
      await cancelSubscription(req as unknown as Request, res as unknown as Response);
      
      const user = await User.findById(testUser._id);
      const subscription = await Subscription.findById(testSubscription._id);
      
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Subscription canceled successfully'
      }));
      expect(user?.subscriptionStatus).toBe('canceled');
      expect(subscription?.status).toBe('canceled');
      expect(subscription?.canceledAt).toBeTruthy();
      expect(stripeService.cancelSubscription).toHaveBeenCalledWith('sub_test123');
    });
  });
  
  describe('Edge Cases', () => {
    it('should handle user not found', async () => {
      const nonExistentId = new mongoose.Types.ObjectId();
      const req = mockRequest(nonExistentId, { planType: 'monthly' });
      const res = mockResponse();
      
      await createSubscription(req as unknown as Request, res as unknown as Response);
      
      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'User not found'
      }));
    });
    
    it('should handle server errors gracefully', async () => {
      // Mock a service failure
      jest.spyOn(stripeService, 'createCheckoutSession').mockRejectedValueOnce(new Error('Stripe API error'));
      
      const testUser = await User.create({
        name: 'Error Test User',
        email: 'error@example.com',
        password: 'password123',
      });
      
      const req = mockRequest(testUser._id, { planType: 'monthly' });
      const res = mockResponse();
      
      await createSubscription(req as unknown as Request, res as unknown as Response);
      
      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
        message: 'Failed to create subscription'
      }));
      
      // Reset the mock for future tests
      jest.spyOn(stripeService, 'createCheckoutSession').mockResolvedValue({
        id: 'cs_test123',
        url: 'https://checkout.stripe.com/test'
      });
    });
  });
}); 