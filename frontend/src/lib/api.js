import axios from 'axios';

const getBaseUrl = () => {
  if (process.env.REACT_APP_BACKEND_URL) {
    return `${process.env.REACT_APP_BACKEND_URL.replace(/\/+$/, '')}/api`;
  }
  if (process.env.REACT_APP_API_URL) {
    return process.env.REACT_APP_API_URL;
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
  updateStatus: (id, status) => API.put(`/submissions/${id}/status?status=${status}`),
  react: (id, reaction) => API.post(`/submissions/${id}/react?reaction=${reaction}`),
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
};

export const resources = {
  list: (params) => API.get('/resources', { params }),
  create: (data) => API.post('/resources', data),
};

export const rewards = {
  list: () => API.get('/rewards'),
  redeem: (id) => API.post(`/rewards/${id}/redeem`),
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

export const badges = {
  list: () => API.get('/badges'),
};

export const seed = () => API.post('/seed');

export default API;
