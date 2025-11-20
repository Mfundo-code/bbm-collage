// src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5112/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (email, password) => 
    api.post('/auth/login', { email, password }),
  autoLogin: (token) => 
    api.post('/auth/auto-login', { token }),
  getCurrentUser: () => 
    api.get('/auth/me'),
};

export const postsAPI = {
  getPosts: (params) => 
    api.get('/posts', { params }),
  getPost: (id) => 
    api.get(`/posts/${id}`),
  createPost: (data) => 
    api.post('/posts', data),
  updatePost: (id, data) => 
    api.put(`/posts/${id}`, data),
  deletePost: (id) => 
    api.delete(`/posts/${id}`),
};

export const interactionsAPI = {
  toggleLike: (parentType, parentId) => 
    api.post('/interactions/like', { parentType, parentId }),
  getLikes: (parentType, parentId) => 
    api.get(`/interactions/likes/${parentType}/${parentId}`),
  getComments: (parentType, parentId) => 
    api.get(`/interactions/comments/${parentType}/${parentId}`),
  addComment: (data) => 
    api.post('/interactions/comment', data),
  updateComment: (id, data) => 
    api.put(`/interactions/comment/${id}`, data),
  deleteComment: (id) => 
    api.delete(`/interactions/comment/${id}`),
};

export const usersAPI = {
  createUser: (data) => 
    api.post('/users', data),
};

export const suggestionsAPI = {
  getSuggestions: (params = {}) => 
    api.get('/suggestions', { params }),
  createSuggestion: (data) => 
    api.post('/suggestions', data),
  updateSuggestionStatus: (id, data) => 
    api.put(`/suggestions/${id}/status`, data),
  deleteSuggestion: (id) => 
    api.delete(`/suggestions/${id}`),
};

export const announcementsAPI = {
  getAnnouncements: (params = {}) => 
    api.get('/announcements', { params }),
  createAnnouncement: (data) => 
    api.post('/announcements', data),
  updateAnnouncement: (id, data) => 
    api.put(`/announcements/${id}`, data),
  deleteAnnouncement: (id) => 
    api.delete(`/announcements/${id}`),
};

export const testimoniesAPI = {
  getTestimonies: (params = {}) => 
    api.get('/testimonies', { params }),
  createTestimony: (data) => 
    api.post('/testimonies', data),
  updateTestimony: (id, data) => 
    api.put(`/testimonies/${id}`, data),
  deleteTestimony: (id) => 
    api.delete(`/testimonies/${id}`),
};

export const sundayServicesAPI = {
  getSundayServices: (params = {}) => 
    api.get('/sundayservices', { params }),
  createSundayService: (data) => 
    api.post('/sundayservices', data),
  updateSundayService: (id, data) => 
    api.put(`/sundayservices/${id}`, data),
  deleteSundayService: (id) => 
    api.delete(`/sundayservices/${id}`),
};

export const missionariesAPI = {
  getMissionaries: (params = {}) => 
    api.get('/missionaries', { params }),
  getMissionary: (userId) => 
    api.get(`/missionaries/${userId}`),
  followMissionary: (userId) => 
    api.post(`/missionaries/${userId}/follow`),
  unfollowMissionary: (userId) => 
    api.delete(`/missionaries/${userId}/follow`),
};

export const alumniAPI = {
  getAlumni: (params = {}) => 
    api.get('/alumni', { params }),
  getAlumnus: (userId) => 
    api.get(`/alumni/${userId}`),
  followAlumnus: (userId) => 
    api.post(`/alumni/${userId}/follow`),
  unfollowAlumnus: (userId) => 
    api.delete(`/alumni/${userId}/follow`),
};

export const homileticsAPI = {
  getHomiletics: (params = {}) => 
    api.get('/homiletics', { params }),
  createHomiletics: (data) => 
    api.post('/homiletics', data),
  updateHomiletics: (id, data) => 
    api.put(`/homiletics/${id}`, data),
  deleteHomiletics: (id) => 
    api.delete(`/homiletics/${id}`),
};

export default api;