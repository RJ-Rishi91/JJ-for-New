import axios from 'axios';

const getBaseUrl = () => {
  if (process.env.REACT_APP_BACKEND_URL) {
    return `${process.env.REACT_APP_BACKEND_URL.replace(/\/+$/, '')}/api`;
  }
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
  }
  if (typeof window !== 'undefined' && window.location.hostname.includes('onerishi.in')) {
    return "https://junior-journalist-api.onrender.com/api";
  }
  return "http://127.0.0.1:8000/api";
};

const API = axios.create({
  baseURL: getBaseUrl()
});

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('jj_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('jj_token');
      localStorage.removeItem('jj_user');
    }
    return Promise.reject(err);
  }
);

export const auth = {
  register: (data) => API.post('/auth/register', data),
  login: (data) => API.post('/auth/login', data),
  me: () => API.get('/auth/me'),
  updateProfile: (data) => API.put('/auth/profile', data),
};

export const submissions = {
  create: (data) => API.post('/submissions', data),
  list: (params) => API.get('/submissions', { params }),
  get: (id) => API.get(`/submissions/${id}`),
  updateStatus: (id, status, notes) => API.put(`/submissions/${id}/status`, null, { params: { status, notes } }),
  react: (id, reaction) => API.post(`/submissions/${id}/react?reaction=${reaction}`),
  comments: (id) => API.get(`/submissions/${id}/comments`),
  addComment: (id, content) => API.post(`/submissions/${id}/comments`, { content }),
  deleteComment: (id, commentId) => API.delete(`/submissions/${id}/comments/${commentId}`),
};

export const events = {
  create: (data) => API.post('/events', data),
  list: (params) => API.get('/events', { params }),
  get: (id) => API.get(`/events/${id}`),
  join: (id, role) => API.post(`/events/${id}/join?role=${role}`),
  updateStatus: (id, status) => API.put(`/events/${id}/status?status=${status}`),
};

export const tasks = {
  create: (data) => API.post('/tasks', data),
  list: (params) => API.get('/tasks', { params }),
  update: (id, data) => API.put(`/tasks/${id}`, data),
  delete: (id) => API.delete(`/tasks/${id}`),
};

export const opportunities = {
  list: (params) => API.get('/opportunities', { params }),
  create: (data) => API.post('/opportunities', data),
  delete: (id) => API.delete(`/opportunities/${id}`),
};

export const rewards = {
  list: () => API.get('/rewards'),
  redeem: (id) => API.post(`/rewards/${id}/redeem`),
  myRedemptions: () => API.get('/rewards/my-redemptions'),
};

export const notifications = {
  list: () => API.get('/notifications'),
  markRead: (id) => API.put(`/notifications/${id}/read`),
  markAllRead: () => API.put('/notifications/read-all'),
};

export const chapters = {
  list: () => API.get('/chapters'),
};

export const admin = {
  broadcast: (data) => API.post('/admin/broadcast', data),
  announcements: {
    list: () => API.get('/admin/announcements'),
    create: (data) => API.post('/admin/announcements', data),
    delete: (id) => API.delete(`/admin/announcements/${id}`),
  },
  inquiries: () => API.get('/admin/contact-inquiries'),
  subscribers: () => API.get('/admin/subscribers'),
};

export const resources = {
  list: (params) => API.get('/resources', { params }),
  create: (data) => API.post('/resources', data),
  delete: (id) => API.delete(`/resources/${id}`),
  askMentor: (data) => API.post('/resources/ask-mentor', data),
};

export const media = {
  upload: (dataUrl, filename) => API.post('/upload', { data_url: dataUrl, filename }),
};

export const users = {
  profile: (id) => API.get(`/users/${id}`),
  leaderboard: (limit) => API.get('/leaderboard', { params: { limit } }),
  listAll: () => API.get('/admin/users'),
  updateRole: (id, role) => API.put(`/admin/users/${id}/role?role=${role}`),
};

export const dashboard = {
  stats: () => API.get('/dashboard/stats'),
};

export const homepage = {
  get: () => API.get('/homepage'),
};

export const projects = {
  list: (params) => API.get('/projects', { params }),
  create: (data) => API.post('/projects', data),
  get: (id) => API.get(`/projects/${id}`),
  join: (id, role) => API.post(`/projects/${id}/join?role=${encodeURIComponent(role)}`),
  updateProgress: (id, data) => API.put(`/projects/${id}/progress`, data),
};

export const messages = {
  channels: () => API.get('/messages/channels'),
  getChannel: (channelId) => API.get(`/messages/channel/${channelId}`),
  send: (data) => API.post('/messages', data),
  getDm: (userId) => API.get(`/messages/dm/${userId}`),
};

export const newsletter = {
  subscribe: (data) => API.post('/newsletter/subscribe', data),
};

export const archives = {
  list: () => API.get('/archives'),
  create: (data) => API.post('/archives', data),
  delete: (id) => API.delete(`/archives/${id}`),
};

export const contact = {
  send: (data) => API.post('/contact', data),
};

export const badges = {
  list: () => API.get('/badges'),
};

export const seed = () => API.post('/seed');

export default API;
