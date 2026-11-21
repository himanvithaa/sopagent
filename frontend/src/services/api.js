import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const getHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

export const getDashboardStats = async () => {
  const response = await api.get('/dashboard/stats');
  return response.data;
};

export const uploadDocuments = async (formData) => {
  const response = await api.post('/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

export const getDocuments = async (params = {}) => {
  const response = await api.get('/documents', { params });
  return response.data;
};

export const getDocument = async (id) => {
  const response = await api.get(`/documents/${id}`);
  return response.data;
};

export const deleteDocument = async (id) => {
  const response = await api.delete(`/documents/${id}`);
  return response.data;
};

export const sendChatMessage = async (data) => {
  const response = await api.post('/chat', data);
  return response.data;
};

export const getConversations = async () => {
  const response = await api.get('/chat/conversations');
  return response.data;
};

export const getConversationHistory = async (id) => {
  const response = await api.get(`/chat/history/${id}`);
  return response.data;
};

export const deleteConversation = async (id) => {
  const response = await api.delete(`/chat/conversations/${id}`);
  return response.data;
};

export const semanticSearch = async (params) => {
  const response = await api.get('/search', { params });
  return response.data;
};

export const getAnalytics = async () => {
  const response = await api.get('/analytics');
  return response.data;
};

export const getActivityHistory = async () => {
  const response = await api.get('/analytics/activity-history');
  return response.data;
};

export const getOllamaSettings = async () => {
  const response = await api.get('/settings/ollama');
  return response.data;
};

export const updateOllamaSettings = async (data) => {
  const response = await api.post('/settings/ollama', data);
  return response.data;
};

export const seedDemoData = async () => {
  const response = await api.post('/settings/seed');
  return response.data;
};

export const reindexDocuments = async () => {
  const response = await api.post('/settings/reindex');
  return response.data;
};

export default api;
