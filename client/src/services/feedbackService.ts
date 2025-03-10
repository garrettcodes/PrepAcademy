import api from './api';

// Type definitions
export interface Feedback {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  title: string;
  description: string;
  category: 'bug' | 'feature' | 'question' | 'content' | 'other';
  status: 'pending' | 'under-review' | 'implemented' | 'rejected' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  relatedTo?: {
    type: string;
    id: string;
  };
  adminNotes?: string;
  response?: string;
  isUserNotified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface SubmitFeedbackData {
  title: string;
  description: string;
  category: 'bug' | 'feature' | 'question' | 'content' | 'other';
  relatedTo?: {
    type: string;
    id: string;
  };
}

export interface UpdateFeedbackStatusData {
  status?: 'pending' | 'under-review' | 'implemented' | 'rejected' | 'closed';
  priority?: 'low' | 'medium' | 'high' | 'critical';
  adminNotes?: string;
  response?: string;
}

// Submit new feedback
export const submitFeedback = async (feedbackData: SubmitFeedbackData): Promise<Feedback> => {
  const response = await api.post('/feedback', feedbackData);
  return response.data.data;
};

// Get user's feedback submissions
export const getUserFeedback = async (): Promise<Feedback[]> => {
  const response = await api.get('/feedback/my-feedback');
  return response.data.data;
};

// Get all feedback (admin only)
export const getAllFeedback = async (
  page = 1, 
  limit = 20, 
  filters?: { 
    status?: string; 
    category?: string; 
    priority?: string 
  }
): Promise<{ 
  feedback: Feedback[]; 
  total: number; 
  page: number;
  pages: number;
}> => {
  const params: any = { page, limit, ...filters };
  
  const response = await api.get('/feedback', { params });
  return {
    feedback: response.data.data,
    total: response.data.total,
    page: response.data.page,
    pages: response.data.pages
  };
};

// Get single feedback by ID
export const getFeedbackById = async (feedbackId: string): Promise<Feedback> => {
  const response = await api.get(`/feedback/${feedbackId}`);
  return response.data.data;
};

// Update feedback status (admin only)
export const updateFeedbackStatus = async (
  feedbackId: string, 
  updateData: UpdateFeedbackStatusData
): Promise<Feedback> => {
  const response = await api.put(`/feedback/${feedbackId}`, updateData);
  return response.data.data;
};

// Delete feedback (admin only or owner)
export const deleteFeedback = async (feedbackId: string): Promise<void> => {
  await api.delete(`/feedback/${feedbackId}`);
}; 