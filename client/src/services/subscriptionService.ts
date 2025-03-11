import { API_URL } from './api';

// Define types
export interface PlanFeature {
  id: string;
  name: string;
}

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

export interface SubscriptionStatus {
  subscriptionStatus: 'none' | 'trial' | 'active' | 'canceled' | 'expired';
  subscription: any;
  trialEndDate?: string;
}

// Start a free trial
export const startFreeTrial = async (): Promise<any> => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/subscriptions/trial`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to start free trial');
  }

  return response.json();
};

// Get subscription plans
export const getSubscriptionPlans = async (): Promise<{ plans: Record<string, SubscriptionPlan> }> => {
  const response = await fetch(`${API_URL}/subscriptions/plans`);

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to get subscription plans');
  }

  return response.json();
};

// Create a subscription checkout session
export const createSubscription = async (planType: string): Promise<{ checkoutUrl: string; sessionId: string }> => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/subscriptions/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ planType }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create subscription');
  }

  return response.json();
};

// Confirm subscription success
export const confirmSubscription = async (sessionId: string): Promise<any> => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/subscriptions/success`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ sessionId }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to confirm subscription');
  }

  return response.json();
};

// Get current subscription status
export const getCurrentSubscription = async (): Promise<SubscriptionStatus> => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/subscriptions/current`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to get current subscription');
  }

  return response.json();
};

// Cancel subscription
export const cancelSubscription = async (): Promise<any> => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/subscriptions/cancel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to cancel subscription');
  }

  return response.json();
};

// Get a customer portal session
export const createCustomerPortal = async (returnUrl: string): Promise<{ url: string }> => {
  const token = localStorage.getItem('token');
  const response = await fetch(`${API_URL}/subscriptions/customer-portal`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ returnUrl }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Failed to create customer portal');
  }

  return response.json();
}; 