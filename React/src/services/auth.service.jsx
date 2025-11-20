import apiClient from '../config/api.jsx';
import { extractData, handleServiceError } from './httpHelper';
import TokenService from './token.service.js';
import { sanitizeObject } from '../utils/sanitize';
import logger from '../utils/logger';

const authService = {
  login: async (email, password) => {
    try {
      const response = await apiClient.post('/user/login', { email, password });
      const data = extractData(response) || {};
      if (data.token) {
        TokenService.setToken(data.token, { persist: false });
        try {
          const safeUser = data.user ? sanitizeObject(data.user) : data.user;
          localStorage.setItem('user', JSON.stringify(safeUser));
        } catch (e) {
          logger.warn('authService: failed to save user to localStorage', e);
        }
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
        try {
          const safeUser = data.user ? sanitizeObject(data.user) : data.user;
          localStorage.setItem('user', JSON.stringify(safeUser));
        } catch (e) {
          logger.warn('authService: failed to save user to localStorage', e);
        }
      }
      return data;
    } catch (error) {
      return handleServiceError(error);
    }
  },

  logout: () => {
    TokenService.clear();
    try { localStorage.removeItem('user'); } catch (e) {
      logger.warn('authService: failed to remove user from localStorage', e);
    }
    window.location.href = '/login';
  },

  getProfile: async (userId) => {
    try {
      const response = await apiClient.get(`/user/profile/${userId}`);
      const data = extractData(response) || {};
      if (data.user) {
        try {
          const safeUser = sanitizeObject(data.user);
          localStorage.setItem('user', JSON.stringify(safeUser));
        } catch (e) {
          logger.warn('authService: failed to save user to localStorage', e);
        }
      }
      return data;
    } catch (error) {
      return handleServiceError(error);
    }
  },

  updateProfile: async (userId, userData) => {
    try {
      const response = await apiClient.put(`/user/update/${userId}`, userData);
      const data = extractData(response);
      if (data) {
        try {
          const safeData = sanitizeObject(data);
          localStorage.setItem('user', JSON.stringify(safeData));
        } catch (e) {
          logger.warn('authService: failed to save user to localStorage', e);
        }
      }
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

