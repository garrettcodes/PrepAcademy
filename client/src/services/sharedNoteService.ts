import api from './api';

// Type definitions
export interface SharedNote {
  _id: string;
  title: string;
  content: string;
  author: {
    _id: string;
    name: string;
    email: string;
  };
  studyGroup?: string;
  subject: string;
  topic: string;
  tags: string[];
  visibility: 'public' | 'private' | 'group';
  upvotes: string[];
  downvotes: string[];
  comments: {
    _id: string;
    user: {
      _id: string;
      name: string;
      email: string;
    };
    text: string;
    createdAt: string;
  }[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteData {
  title: string;
  content: string;
  subject: string;
  topic: string;
  tags?: string[];
  visibility: 'public' | 'private' | 'group';
  studyGroupId?: string;
}

// Create a new shared note
export const createSharedNote = async (noteData: CreateNoteData): Promise<SharedNote> => {
  const response = await api.post('/shared-notes', noteData);
  return response.data.data;
};

// Get all public shared notes
export const getPublicSharedNotes = async (
  page = 1, 
  limit = 10, 
  filters?: { subject?: string; topic?: string; tag?: string }
): Promise<{ 
  notes: SharedNote[]; 
  total: number; 
  page: number;
  pages: number;
}> => {
  const params: any = { page, limit, ...filters };
  
  const response = await api.get('/shared-notes/public', { params });
  return {
    notes: response.data.data,
    total: response.data.total,
    page: response.data.page,
    pages: response.data.pages
  };
};

// Get all notes shared in a specific study group
export const getGroupSharedNotes = async (groupId: string): Promise<SharedNote[]> => {
  const response = await api.get(`/shared-notes/group/${groupId}`);
  return response.data.data;
};

// Get user's own notes
export const getUserNotes = async (): Promise<SharedNote[]> => {
  const response = await api.get('/shared-notes/my-notes');
  return response.data.data;
};

// Get a single note by ID
export const getSharedNoteById = async (noteId: string): Promise<SharedNote> => {
  const response = await api.get(`/shared-notes/${noteId}`);
  return response.data.data;
};

// Update a note
export const updateSharedNote = async (
  noteId: string, 
  updateData: Partial<CreateNoteData>
): Promise<SharedNote> => {
  const response = await api.put(`/shared-notes/${noteId}`, updateData);
  return response.data.data;
};

// Delete a note
export const deleteSharedNote = async (noteId: string): Promise<void> => {
  await api.delete(`/shared-notes/${noteId}`);
};

// Add a comment to a note
export const addComment = async (noteId: string, text: string): Promise<SharedNote> => {
  const response = await api.post(`/shared-notes/${noteId}/comments`, { text });
  return response.data.data;
};

// Vote on a note (upvote or downvote)
export const voteOnNote = async (
  noteId: string, 
  voteType: 'upvote' | 'downvote'
): Promise<{ upvotes: number; downvotes: number }> => {
  const response = await api.post(`/shared-notes/${noteId}/vote`, { voteType });
  return response.data.data;
}; 