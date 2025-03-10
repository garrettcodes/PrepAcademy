import axios from 'axios';
import dotenv from 'dotenv';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import User from '../models/user.model';
import Question from '../models/question.model';
import Exam from '../models/exam.model';
import StudyPlan from '../models/studyPlan.model';
import ContentReview from '../models/contentReview.model';

// Load environment variables
dotenv.config();

const API_URL = process.env.TEST_API_URL || 'http://localhost:5000';

// Test configuration
const TEST_TIMEOUT = 30000; // 30 seconds
jest.setTimeout(TEST_TIMEOUT);

// Test data
const testUser = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123',
};

const testExpert = {
  name: 'Test Expert',
  email: 'expert@example.com',
  password: 'password123',
  role: 'expert',
  expertise: ['Math', 'Science']
};

const testAdmin = {
  name: 'Test Admin',
  email: 'admin@example.com',
  password: 'password123',
  role: 'admin'
};

let mongoServer: MongoMemoryServer;
let token: string;
let expertToken: string;
let adminToken: string;
let questionId: string;
let examId: string;
let reviewId: string;

/**
 * Helper function to authenticate a user and get a token
 */
async function authenticateUser(email: string, password: string): Promise<string> {
  const response = await axios.post(`${API_URL}/api/auth/login`, { email, password });
  return response.data.token;
}

/**
 * Helper to create a mock question
 */
async function createTestQuestion(): Promise<string> {
  const response = await axios.post(
    `${API_URL}/api/questions`,
    {
      text: 'What is 2+2?',
      options: ['3', '4', '5', '6'],
      correctAnswer: '4',
      subject: 'Math',
      difficulty: 'easy',
      format: 'text',
      hints: ['Think about adding two numbers'],
      explanations: {
        text: 'The sum of 2 and 2 is 4'
      }
    },
    {
      headers: { Authorization: `Bearer ${adminToken}` }
    }
  );
  
  return response.data._id;
}

/**
 * Helper to create a mock exam
 */
async function createTestExam(): Promise<string> {
  const response = await axios.post(
    `${API_URL}/api/exams`,
    {
      title: 'Test Exam',
      description: 'A test exam for e2e testing',
      subject: 'Math',
      questions: [questionId],
      duration: 60,
      passingScore: 60
    },
    {
      headers: { Authorization: `Bearer ${adminToken}` }
    }
  );
  
  return response.data._id;
}

/**
 * Set up test environment before all tests
 */
beforeAll(async () => {
  // Start an in-memory MongoDB server
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  
  // Connect to the in-memory database
  await mongoose.connect(uri);
  
  // Create test users
  await User.create(testUser);
  await User.create(testExpert);
  await User.create(testAdmin);
  
  // Get authentication tokens
  token = await authenticateUser(testUser.email, testUser.password);
  expertToken = await authenticateUser(testExpert.email, testExpert.password);
  adminToken = await authenticateUser(testAdmin.email, testAdmin.password);
  
  // Create test content
  questionId = await createTestQuestion();
  examId = await createTestExam();
});

/**
 * Clean up after all tests
 */
afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

/**
 * Utility to test a specific API endpoint
 */
async function testEndpoint(
  method: 'get' | 'post' | 'put' | 'delete',
  endpoint: string,
  token?: string,
  data?: any
): Promise<any> {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    
    const response = await axios({
      method,
      url: `${API_URL}${endpoint}`,
      headers,
      data,
    });
    
    return response.data;
  } catch (error: any) {
    console.error(`Error testing endpoint ${method.toUpperCase()} ${endpoint}:`, error.message);
    throw error;
  }
}

/**
 * Test Suite: Authentication Flow
 */
describe('Authentication Flow', () => {
  test('User can register and login', async () => {
    // Register a new user
    const newUser = {
      name: 'New Test User',
      email: 'newtest@example.com',
      password: 'password123',
    };
    
    const registerResponse = await testEndpoint('post', '/api/auth/register', undefined, newUser);
    expect(registerResponse).toHaveProperty('token');
    
    // Login with the new user
    const loginResponse = await testEndpoint('post', '/api/auth/login', undefined, {
      email: newUser.email,
      password: newUser.password,
    });
    expect(loginResponse).toHaveProperty('token');
  });
});

/**
 * Test Suite: Content Review System
 */
describe('Content Review System', () => {
  test('User can flag content for review', async () => {
    // Flag question for review
    const flagResponse = await testEndpoint(
      'post',
      '/api/content-review/flag',
      token,
      {
        contentType: 'question',
        contentId: questionId,
        reason: 'This question needs review',
      }
    );
    
    expect(flagResponse).toHaveProperty('contentReview');
    reviewId = flagResponse.contentReview._id;
  });
  
  test('Expert can review flagged content', async () => {
    // Get pending reviews
    const pendingReviews = await testEndpoint('get', '/api/content-review/pending', expertToken);
    expect(pendingReviews).toBeInstanceOf(Array);
    expect(pendingReviews.length).toBeGreaterThan(0);
    
    // Get review details
    const reviewDetail = await testEndpoint('get', `/api/content-review/${reviewId}`, expertToken);
    expect(reviewDetail).toHaveProperty('review');
    expect(reviewDetail).toHaveProperty('content');
    
    // Update review status
    const updateResponse = await testEndpoint(
      'put',
      `/api/content-review/${reviewId}`,
      expertToken,
      {
        status: 'reviewed',
        comments: 'Content is accurate',
        resolution: 'No changes needed'
      }
    );
    
    expect(updateResponse).toHaveProperty('review');
    expect(updateResponse.review.status).toBe('reviewed');
  });
  
  test('Admin can create SAT/ACT content update', async () => {
    // Create content update
    const updateResponse = await testEndpoint(
      'post',
      '/api/content-review/sat-act-update',
      adminToken,
      {
        contentType: 'question',
        contentId: questionId,
        reason: 'Updating for new SAT standards',
        satActChangeReference: 'SAT 2023 Update',
        updatedContent: {
          text: 'Updated question text',
          options: ['3', '4', '5', '6'],
          correctAnswer: '4',
          subject: 'Math',
          difficulty: 'easy'
        }
      }
    );
    
    expect(updateResponse).toHaveProperty('contentReview');
    expect(updateResponse.contentReview.status).toBe('updated');
    
    // Get SAT/ACT updates
    const updatesResponse = await testEndpoint('get', '/api/content-review/sat-act-updates', adminToken);
    expect(updatesResponse).toBeInstanceOf(Array);
    expect(updatesResponse.length).toBeGreaterThan(0);
  });
});

/**
 * Test Suite: Exam Experience
 */
describe('Exam Experience', () => {
  test('User can take and submit an exam', async () => {
    // Get available exam
    const examsResponse = await testEndpoint('get', '/api/exams', token);
    expect(examsResponse).toBeInstanceOf(Array);
    
    // Start exam attempt
    const startResponse = await testEndpoint(
      'post',
      `/api/exams/${examId}/start`,
      token
    );
    expect(startResponse).toHaveProperty('examAttempt');
    const attemptId = startResponse.examAttempt._id;
    
    // Submit exam answers
    const submitResponse = await testEndpoint(
      'post',
      `/api/exams/${examId}/submit`,
      token,
      {
        attemptId,
        answers: [
          {
            questionId,
            selectedAnswer: '4',
            timeSpent: 30
          }
        ]
      }
    );
    
    expect(submitResponse).toHaveProperty('score');
    expect(submitResponse).toHaveProperty('feedback');
  });
});

/**
 * Test Suite: Study Plan
 */
describe('Study Plan', () => {
  test('User can create and update study plan', async () => {
    // Create study plan
    const createResponse = await testEndpoint(
      'post',
      '/api/studyplan',
      token,
      {
        goalScore: 1500,
        testDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        subjects: ['Math', 'English'],
        studyHoursPerWeek: 10
      }
    );
    
    expect(createResponse).toHaveProperty('studyPlan');
    const studyPlanId = createResponse.studyPlan._id;
    
    // Get study plan
    const getResponse = await testEndpoint('get', `/api/studyplan/${studyPlanId}`, token);
    expect(getResponse).toHaveProperty('studyPlan');
    
    // Update progress
    const updateResponse = await testEndpoint(
      'put',
      `/api/studyplan/${studyPlanId}/progress`,
      token,
      {
        taskId: getResponse.studyPlan.tasks[0]._id,
        progress: 100,
        notes: 'Completed successfully'
      }
    );
    
    expect(updateResponse).toHaveProperty('studyPlan');
    expect(updateResponse.studyPlan.tasks[0].progress).toBe(100);
  });
});

/**
 * Test offline syncing
 */
describe('Offline Syncing', () => {
  test('Offline data can be synced', async () => {
    const syncData = {
      activities: [
        {
          type: 'question_answer',
          data: {
            questionId,
            selectedAnswer: '4',
            isCorrect: true,
            timeSpent: 45
          },
          timestamp: new Date().toISOString()
        }
      ]
    };
    
    const syncResponse = await testEndpoint('post', '/api/sync', token, syncData);
    expect(syncResponse).toHaveProperty('success');
    expect(syncResponse.success).toBe(true);
  });
});

/**
 * Test Suite: Comprehensive Edge Cases
 */
describe('Edge Cases', () => {
  test('System handles invalid auth token gracefully', async () => {
    try {
      await testEndpoint('get', '/api/users/profile', 'invalid-token');
    } catch (error: any) {
      expect(error.response.status).toBe(401);
    }
  });
  
  test('System handles invalid content IDs gracefully', async () => {
    try {
      await testEndpoint(
        'post',
        '/api/content-review/flag',
        token,
        {
          contentType: 'question',
          contentId: 'invalid-id',
          reason: 'Test reason',
        }
      );
    } catch (error: any) {
      expect(error.response.status).toBe(404);
    }
  });
}); 