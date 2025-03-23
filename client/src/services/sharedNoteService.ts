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

export interface UpdateNoteData {
  title?: string;
  content?: string;
  subject?: string;
  topic?: string;
  tags?: string[];
  visibility?: 'public' | 'private' | 'group';
  studyGroupId?: string;
}

export interface CommentData {
  text: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  count?: number;
}

// Create a new shared note
export const createSharedNote = async (noteData: CreateNoteData): Promise<SharedNote> => {
  const response = await api.post<ApiResponse<SharedNote>>('/shared-notes', noteData);
  return response.data.data;
};

// Get all public shared notes
export const getPublicSharedNotes = async (page = 1, limit = 10, subject?: string, topic?: string): Promise<{
  notes: SharedNote[];
  total: number;
  page: number;
  pages: number;
}> => {
  const params: Record<string, any> = { page, limit };
  if (subject) params.subject = subject;
  if (topic) params.topic = topic;
  
  const response = await api.get<ApiResponse<SharedNote[]>>('/shared-notes/public', { params });
  
  return {
    notes: response.data.data,
    total: response.data.count || 0,
    page,
    pages: Math.ceil((response.data.count || 0) / limit)
  };
};

// Get all notes shared in a specific study group
export const getGroupSharedNotes = async (groupId: string): Promise<SharedNote[]> => {
  const response = await api.get<ApiResponse<SharedNote[]>>(`/shared-notes/group/${groupId}`);
  return response.data.data;
};

// Get user's own notes
export const getUserNotes = async (): Promise<SharedNote[]> => {
  const response = await api.get('/shared-notes/my-notes');
  return response.data.data;
};

// Get a specific shared note by ID
export const getSharedNoteById = async (noteId: string): Promise<SharedNote> => {
  const response = await api.get<ApiResponse<SharedNote>>(`/shared-notes/${noteId}`);
  return response.data.data;
};

// Update a shared note
export const updateSharedNote = async (noteId: string, updateData: UpdateNoteData): Promise<SharedNote> => {
  const response = await api.put<ApiResponse<SharedNote>>(`/shared-notes/${noteId}`, updateData);
  return response.data.data;
};

// Delete a shared note
export const deleteSharedNote = async (noteId: string): Promise<void> => {
  await api.delete(`/shared-notes/${noteId}`);
};

// Add a comment to a shared note
export const addComment = async (noteId: string, commentData: CommentData): Promise<SharedNote> => {
  const response = await api.post<ApiResponse<SharedNote>>(`/shared-notes/${noteId}/comments`, commentData);
  return response.data.data;
};

// Upvote a shared note
export const upvoteNote = async (noteId: string): Promise<SharedNote> => {
  const response = await api.post<ApiResponse<SharedNote>>(`/shared-notes/${noteId}/upvote`);
  return response.data.data;
};

// Downvote a shared note
export const downvoteNote = async (noteId: string): Promise<SharedNote> => {
  const response = await api.post<ApiResponse<SharedNote>>(`/shared-notes/${noteId}/downvote`);
  return response.data.data;
}; 