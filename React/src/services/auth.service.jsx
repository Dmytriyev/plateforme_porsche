import apiClient from '../config/api.jsx';
import { extractData, handleServiceError } from './httpHelper';
import TokenService from './token.service.js';

const authService = {
  login: async (email, password) => {
    try {
      const response = await apiClient.post('/user/login', { email, password });
      const data = extractData(response) || {};
      if (data.token) {
        TokenService.setToken(data.token, { persist: false });
        try { localStorage.setItem('user', JSON.stringify(data.user)); } catch (e) { }
      }
      return data;
    } catch (error) {
      return handleServiceError(error);
    }
  },

  register: async (userData) => {
    try {
      const response = await apiClient.post('/user/register', userData);
      const data = extractData(response) || {};
      if (data.token) {
        TokenService.setToken(data.token, { persist: false });
        try { localStorage.setItem('user', JSON.stringify(data.user)); } catch (e) { }
      }
      return data;
    } catch (error) {
      return handleServiceError(error);
    }
  },

  logout: () => {
    TokenService.clear();
    try { localStorage.removeItem('user'); } catch (e) { }
    window.location.href = '/login';
  },

  getProfile: async (userId) => {
    try {
      const response = await apiClient.get(`/user/profile/${userId}`);
      const data = extractData(response) || {};
      if (data.user) localStorage.setItem('user', JSON.stringify(data.user));
      return data;
    } catch (error) {
      return handleServiceError(error);
    }
  },

  updateProfile: async (userId, userData) => {
    try {
      const response = await apiClient.put(`/user/update/${userId}`, userData);
      const data = extractData(response);
      if (data) localStorage.setItem('user', JSON.stringify(data));
      return data;
    } catch (error) {
      return handleServiceError(error);
    }
  },

  getCurrentUser: () => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch (e) {
      return null;
    }
  },

  isAuthenticated: () => !!TokenService.getToken(),

  getToken: () => TokenService.getToken(),

  hasRole: (role) => {
    const user = authService.getCurrentUser();
    return user?.role === role;
  },
};

export default authService;

