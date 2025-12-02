import axios from 'axios';

const API_BASE_URL =  'http://192.168.0.137:5112/api';

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
  createMissionary: (data) => 
    api.post('/missionaries', data),
  updateMissionary: (userId, data) => 
    api.put(`/missionaries/${userId}`, data),
  deleteMissionary: (userId) => 
    api.delete(`/missionaries/${userId}`),
  followMissionary: (userId) => 
    api.post(`/missionaries/${userId}/follow`),
  unfollowMissionary: (userId) => 
    api.delete(`/missionaries/${userId}/follow`),
  getPrayerRequests: (userId, params = {}) => 
    api.get(`/missionaries/${userId}/prayer-requests`, { params }),
  createPrayerRequest: (userId, data) => 
    api.post(`/missionaries/${userId}/prayer-requests`, data),
  prayForRequest: (requestId) => 
    api.post(`/missionaries/prayer-requests/${requestId}/pray`),
};

export const alumniAPI = {
  getAlumni: (params = {}) => 
    api.get('/alumni', { params }),
  getAlumnus: (userId) => 
    api.get(`/alumni/${userId}`),
  createAlumni: (data) => 
    api.post('/alumni', data),
  updateAlumni: (userId, data) => 
    api.put(`/alumni/${userId}`, data),
  deleteAlumni: (userId) => 
    api.delete(`/alumni/${userId}`),
  followAlumnus: (userId) => 
    api.post(`/alumni/${userId}/follow`),
  unfollowAlumnus: (userId) => 
    api.delete(`/alumni/${userId}/follow`),
  getGraduationYears: () => 
    api.get('/alumni/years'),
  getLocations: () => 
    api.get('/alumni/locations'),
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

export const donationsAPI = {
  getDonations: (params = {}) => 
    api.get('/donations', { params }),
  getPublicDonations: (params = {}) => 
    api.get('/donations/public', { params }),
  getDonation: (id) => 
    api.get(`/donations/${id}`),
  createDonation: (data) => 
    api.post('/donations', data),
  updateDonationStatus: (id, data) => 
    api.put(`/donations/${id}/status`, data),
  getDonationStats: () => 
    api.get('/donations/stats'),
  getCampaigns: (params = {}) => 
    api.get('/donations/campaigns', { params }),
  createCampaign: (data) => 
    api.post('/donations/campaigns', data),
};

export const outreachesAPI = {
  getOutreaches: (params = {}) => 
    api.get('/outreaches', { params }),
  
  getOutreach: (id) => 
    api.get(`/outreaches/${id}`),
  
  createOutreach: (data) => 
    api.post('/outreaches', data),
  
  updateOutreach: (id, data) => 
    api.put(`/outreaches/${id}`, data),
  
  deleteOutreach: (id) => 
    api.delete(`/outreaches/${id}`),
  
  createReport: (outreachId, data) => 
    api.post(`/outreaches/${outreachId}/reports`, data),
  
  getReports: (outreachId) => 
    api.get(`/outreaches/${outreachId}/reports`),
  
  deleteReport: (reportId) => 
    api.delete(`/outreaches/reports/${reportId}`),
};

export const prayerWallAPI = {
  getRequests: (params = {}) => 
    api.get('/prayerwall', { params }),
  
  getRequest: (id) => 
    api.get(`/prayerwall/${id}`),
  
  createRequest: (data) => 
    api.post('/prayerwall', data),
  
  updateRequest: (id, data) => 
    api.put(`/prayerwall/${id}`, data),
  
  deleteRequest: (id) => 
    api.delete(`/prayerwall/${id}`),
  
  prayForRequest: (id) => 
    api.post(`/prayerwall/${id}/pray`),
  
  markAsAnswered: (id) => 
    api.patch(`/prayerwall/${id}/mark-answered`),
  
  getStats: () => 
    api.get('/prayerwall/stats'),
  
  getMyRequests: (params = {}) => 
    api.get('/prayerwall/my-requests', { params }),
};


export const mentorshipAPI = {
  getMentors: (params = {}) => 
    api.get('/mentors', { params }),
  
  getMentor: (id) => 
    api.get(`/mentors/${id}`),
  
  createMentor: (data) => 
    api.post('/mentors', data),
  
  updateMentor: (id, data) => 
    api.put(`/mentors/${id}`, data),
  
  deleteMentor: (id) => 
    api.delete(`/mentors/${id}`),
  
  getMentees: (params = {}) => 
    api.get('/mentees', { params }),
  
  createMentee: (data) => 
    api.post('/mentees', data),
  
  updateMentee: (id, data) => 
    api.put(`/mentees/${id}`, data),
  
  deleteMentee: (id) => 
    api.delete(`/mentees/${id}`),
  
  assignMentee: (mentorId, menteeId) => 
    api.post(`/mentors/${mentorId}/mentees/${menteeId}`),
  
  removeMentee: (mentorId, menteeId) => 
    api.delete(`/mentors/${mentorId}/mentees/${menteeId}`),
  
  getAvailableUsers: () => 
    api.get('/mentors/available-users'),
};



export const uploadAPI = {
  uploadFile: (formData, onProgress = null) => {
    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: onProgress ? (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      } : undefined,
    };
    return api.post('/upload', formData, config);
  },
  cleanupExpiredMedia: () => 
    api.post('/upload/cleanup-expired'),
};

export const setupAPI = {
  createAdmin: (data) => 
    api.post('/setup/create-admin', data),
};

export default api;