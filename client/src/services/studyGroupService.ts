import api from './api';

// Type definitions
export interface StudyGroup {
  _id: string;
  name: string;
  description: string;
  owner: {
    _id: string;
    name: string;
    email: string;
  };
  members: {
    _id: string;
    name: string;
    email: string;
  }[];
  topics: string[];
  isPrivate: boolean;
  joinCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStudyGroupData {
  name: string;
  description: string;
  topics: string[];
  isPrivate: boolean;
}

export interface JoinStudyGroupData {
  groupId: string;
  joinCode?: string;
}

// Create a new study group
export const createStudyGroup = async (groupData: CreateStudyGroupData): Promise<StudyGroup> => {
  const response = await api.post('/study-groups', groupData);
  return response.data.data;
};

// Get all public study groups
export const getPublicStudyGroups = async (page = 1, limit = 10, topic?: string): Promise<{ 
  groups: StudyGroup[]; 
  total: number; 
  page: number;
  pages: number;
}> => {
  const params: any = { page, limit };
  if (topic) params.topic = topic;
  
  const response = await api.get('/study-groups/public', { params });
  return {
    groups: response.data.data,
    total: response.data.total,
    page: response.data.page,
    pages: response.data.pages
  };
};

// Get user's study groups
export const getUserStudyGroups = async (): Promise<StudyGroup[]> => {
  const response = await api.get('/study-groups/my-groups');
  return response.data.data;
};

// Get a single study group
export const getStudyGroupById = async (groupId: string): Promise<StudyGroup> => {
  const response = await api.get(`/study-groups/${groupId}`);
  return response.data.data;
};

// Join a study group
export const joinStudyGroup = async (joinData: JoinStudyGroupData): Promise<StudyGroup> => {
  const response = await api.post('/study-groups/join', joinData);
  return response.data.data;
};

// Leave a study group
export const leaveStudyGroup = async (groupId: string): Promise<void> => {
  await api.delete(`/study-groups/${groupId}/leave`);
};

// Update a study group
export const updateStudyGroup = async (groupId: string, updateData: Partial<CreateStudyGroupData>): Promise<StudyGroup> => {
  const response = await api.put(`/study-groups/${groupId}`, updateData);
  return response.data.data;
};

// Delete a study group
export const deleteStudyGroup = async (groupId: string): Promise<void> => {
  await api.delete(`/study-groups/${groupId}`);
}; 