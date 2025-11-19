
// ============================================
// FILE: src/services/api.js
// ============================================
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

export default api;