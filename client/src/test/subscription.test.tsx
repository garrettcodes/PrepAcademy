import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { SubscriptionProvider } from '../context/SubscriptionContext';
import PricingPage from '../pages/subscription/PricingPage';
import SubscriptionSuccessPage from '../pages/subscription/SubscriptionSuccessPage';

// Define necessary types
export interface SubscriptionPlan {
  id: string;
  name: string;
  price: string;
  amount: number;
  description: string;
  features: string[];
  billingPeriod: string;
  popular: boolean;
}

// Mock components instead of relying on API calls
jest.mock('../services/subscriptionService', () => ({
  getSubscriptionPlans: jest.fn().mockResolvedValue({
    plans: {
      monthly: {
        id: 'monthly',
        name: 'Monthly',
        price: '$29.99',
        amount: 2999,
        description: 'Billed monthly',
        features: [
          'Access to all practice questions',
          'Full-length practice exams',
          'Personalized study plans',
          'Performance analytics'
        ],
        billingPeriod: 'month',
        popular: false
      },
      quarterly: {
        id: 'quarterly',
        name: 'Quarterly',
        price: '$79.99',
        amount: 7999,
        description: 'Billed every 3 months',
        features: [
          'All features in Monthly plan',
          'Advanced analytics',
          'Study group access'
        ],
        billingPeriod: 'quarter',
        popular: true
      },
      annual: {
        id: 'annual',
        name: 'Annual',
        price: '$249.99',
        amount: 24999,
        description: 'Billed yearly',
        features: [
          'All features in Quarterly plan',
          'One-on-one tutoring sessions',
          'Access to premium study materials'
        ],
        billingPeriod: 'year',
        popular: false
      }
    }
  }),
  createSubscription: jest.fn().mockResolvedValue({
    checkoutUrl: 'https://checkout.stripe.com/test',
    sessionId: 'cs_test123'
  }),
  confirmSubscription: jest.fn().mockResolvedValue({
    message: 'Subscription created successfully',
    subscription: {
      id: 'sub_test123',
      planType: 'monthly',
      status: 'active',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    }
  }),
  getSubscriptionStatus: jest.fn().mockResolvedValue({
    subscriptionStatus: 'active',
    subscription: {
      planType: 'monthly',
      status: 'active',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    trialEndDate: null
  })
}));

// Mock the authContext functions
jest.mock('../context/AuthContext', () => {
  const originalModule = jest.requireActual('../context/AuthContext');
  return {
    ...originalModule,
    useAuth: () => ({
      isAuthenticated: true,
      user: {
        _id: 'user123',
        name: 'Test User',
        email: 'test@example.com',
        role: 'student'
      },
      token: 'mock-token',
      checkMiniAssessmentStatus: jest.fn().mockResolvedValue({
        hasCompletedMiniAssessment: true,
        nextAssessmentDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      })
    })
  };
});

// Mock window.location
Object.defineProperty(window, 'location', {
  writable: true,
  value: { 
    href: window.location.href,
    assign: jest.fn()
  }
});

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = String(value);
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Mock react-router-dom's useLocation hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: jest.fn()
}));

// Set up the mocked useLocation hook for tests
const mockUseLocation = useLocation as jest.Mock;

// Wrap components with providers for testing
const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <SubscriptionProvider>
          {ui}
        </SubscriptionProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

describe('Subscription Flow', () => {
  beforeEach(() => {
    // Setup mock authenticated user
    localStorage.setItem('user', JSON.stringify({
      _id: 'user123',
      name: 'Test User',
      email: 'test@example.com',
      role: 'student'
    }));
    localStorage.setItem('token', 'mock-token');
  });
  
  afterEach(() => {
    localStorage.clear();
    jest.clearAllMocks();
  });
  
  describe('PricingPage', () => {
    it('renders subscription plans', async () => {
      renderWithProviders(<PricingPage />);
      
      // Wait for plans to load
      await waitFor(() => {
        expect(screen.getAllByText('Monthly')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Quarterly')[0]).toBeInTheDocument();
        expect(screen.getAllByText('Annual')[0]).toBeInTheDocument();
      }, { timeout: 5000 });
      
      // Check if plan details are rendered
      expect(screen.getByText('$29.99')).toBeInTheDocument();
      expect(screen.getByText('$79.99')).toBeInTheDocument();
      expect(screen.getByText('$249.99')).toBeInTheDocument();
      expect(screen.getByText('Performance analytics')).toBeInTheDocument();
      expect(screen.getByText('Study group access')).toBeInTheDocument();
      expect(screen.getByText('One-on-one tutoring sessions')).toBeInTheDocument();
    });
    
    it('handles subscribe button click', async () => {
      const { createSubscription } = require('../services/subscriptionService');
      renderWithProviders(<PricingPage />);
      
      // Wait for plans to load
      await waitFor(() => {
        expect(screen.getAllByText('Monthly')[0]).toBeInTheDocument();
      }, { timeout: 5000 });
      
      // Get all buttons and click the one in the monthly plan card
      const buttons = screen.getAllByRole('button');
      // Find the first button that belongs to a subscription card (not the tab buttons)
      const subscribeButton = buttons.find(button => 
        button.closest('.p-8') !== null
      );

      // Click the subscribe button if found
      if (subscribeButton) {
        fireEvent.click(subscribeButton);
      }
      
      await waitFor(() => {
        expect(createSubscription).toHaveBeenCalled();
      }, { timeout: 5000 });
    });
  });
  
  describe('SubscriptionSuccessPage', () => {
    it('calls confirmSubscription with the session ID', async () => {
      // Mock the useLocation hook for the subscription success route
      mockUseLocation.mockReturnValue({
        search: '?session_id=cs_test123&plan=monthly'
      });
      
      const { confirmSubscription } = require('../services/subscriptionService');
      
      renderWithProviders(<SubscriptionSuccessPage />);
      
      // Verify the API call was made with the correct session ID
      await waitFor(() => {
        expect(confirmSubscription).toHaveBeenCalledWith('cs_test123');
      }, { timeout: 5000 });
    });
  });
}); 