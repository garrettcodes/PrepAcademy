import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { rest } from 'msw';
import { setupServer } from 'msw/node';
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

// Mock the API endpoints
const server = setupServer(
  // GetSubscriptionPlans
  rest.get('/api/subscriptions/plans', (req, res, ctx) => {
    return res(
      ctx.json({
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
      })
    );
  }),
  
  // CreateSubscription
  rest.post('/api/subscriptions/create', (req, res, ctx) => {
    const { planType } = req.body as any;
    
    if (!planType) {
      return res(
        ctx.status(400),
        ctx.json({ message: 'Plan type is required' })
      );
    }
    
    return res(
      ctx.json({
        checkoutUrl: 'https://checkout.stripe.com/test',
        sessionId: 'cs_test123'
      })
    );
  }),
  
  // ConfirmSubscription
  rest.post('/api/subscriptions/success', (req, res, ctx) => {
    const { sessionId } = req.body as any;
    
    if (!sessionId) {
      return res(
        ctx.status(400),
        ctx.json({ message: 'Session ID is required' })
      );
    }
    
    return res(
      ctx.json({
        message: 'Subscription created successfully',
        subscription: {
          id: 'sub_test123',
          planType: 'monthly',
          status: 'active',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      })
    );
  }),
  
  // Get Current Subscription
  rest.get('/api/subscriptions/current', (req, res, ctx) => {
    return res(
      ctx.json({
        subscriptionStatus: 'active',
        subscription: {
          planType: 'monthly',
          status: 'active',
          startDate: new Date().toISOString(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        trialEndDate: null
      })
    );
  })
);

// Enable API mocking before tests
beforeAll(() => server.listen());

// Reset any runtime request handlers we may add during the tests
afterEach(() => server.resetHandlers());

// Disable API mocking after the tests are done
afterAll(() => server.close());

// Mock window.location
Object.defineProperty(window, 'location', {
  writable: true,
  value: { href: window.location.href }
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
      token: 'test-token'
    }));
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
        expect(screen.getByText('Monthly')).toBeInTheDocument();
        expect(screen.getByText('Quarterly')).toBeInTheDocument();
        expect(screen.getByText('Annual')).toBeInTheDocument();
      });
      
      // Check prices are displayed
      expect(screen.getByText('$29.99')).toBeInTheDocument();
      expect(screen.getByText('$79.99')).toBeInTheDocument();
      expect(screen.getByText('$249.99')).toBeInTheDocument();
      
      // Check features are displayed
      expect(screen.getByText('Access to all practice questions')).toBeInTheDocument();
      expect(screen.getByText('Study group access')).toBeInTheDocument();
      expect(screen.getByText('One-on-one tutoring sessions')).toBeInTheDocument();
    });
    
    it('handles subscribe button click', async () => {
      renderWithProviders(<PricingPage />);
      
      // Wait for plans to load
      await waitFor(() => {
        expect(screen.getByText('Monthly')).toBeInTheDocument();
      });
      
      // Find and click the subscribe button for monthly plan
      const monthlySubscribeBtn = screen.getByText('Subscribe to Monthly');
      fireEvent.click(monthlySubscribeBtn);
      
      // Wait for API call and redirect
      await waitFor(() => {
        expect(window.location.href).toBe('https://checkout.stripe.com/test');
      });
    });
    
    it('handles error state', async () => {
      // Mock an API error
      server.use(
        rest.get('/api/subscriptions/plans', (req, res, ctx) => {
          return res(
            ctx.status(500),
            ctx.json({ message: 'Server error' })
          );
        })
      );
      
      renderWithProviders(<PricingPage />);
      
      // Wait for error message
      await waitFor(() => {
        expect(screen.getByText('Error Loading Plans')).toBeInTheDocument();
      });
      
      // Reset handler for other tests
      server.resetHandlers();
    });
  });
  
  describe('SubscriptionSuccessPage', () => {
    it('processes subscription and shows success message', async () => {
      // Setup mock location
      const mockLocation = {
        search: '?session_id=cs_test123&plan=monthly',
        pathname: '/subscription/success'
      };
      
      (useLocation as jest.Mock).mockReturnValue(mockLocation);
      
      renderWithProviders(<SubscriptionSuccessPage />);
      
      // Initially shows loading state
      expect(screen.getByText(/Processing Your Subscription/i)).toBeInTheDocument();
      
      // After successful processing, shows success message
      await waitFor(() => {
        expect(screen.getByText(/Thank You For Subscribing!/i)).toBeInTheDocument();
      }, { timeout: 5000 });
    });
    
    it('handles error during subscription processing', async () => {
      // Mock an API error
      server.use(
        rest.post('/api/subscriptions/success', (req, res, ctx) => {
          return res(
            ctx.status(500),
            ctx.json({ message: 'Failed to process subscription' })
          );
        })
      );
      
      const mockLocation = {
        search: '?session_id=cs_test123&plan=monthly',
        pathname: '/subscription/success'
      };
      
      (useLocation as jest.Mock).mockReturnValue(mockLocation);
      
      renderWithProviders(<SubscriptionSuccessPage />);
      
      // After error, shows error message
      await waitFor(() => {
        expect(screen.getByText(/Payment Processing Error/i)).toBeInTheDocument();
      }, { timeout: 5000 });
      
      // Reset handler for other tests
      server.resetHandlers();
    });
  });
}); 