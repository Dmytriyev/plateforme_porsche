import apiClient from '../config/api.jsx';
import { extractData, extractArray, handleServiceError } from './httpHelper';
import logger from '../utils/logger';

const voitureService = {
  getAllVoitures: async () => {
    try {
      const response = await apiClient.get('/voiture/all');
      return extractArray(response);
    } catch (error) {
      return handleServiceError(error);
    }
  },

  getVoitureById: async (id) => {
    try {
      const response = await apiClient.get(`/voiture/${id}`);
      return extractData(response);
    } catch (error) {
      return handleServiceError(error);
    }
  },

  // helper with simple retry for transient 5xx errors
  _getWithRetry: async (url, { retries = 1, delayMs = 400 } = {}) => {
    try {
      const response = await apiClient.get(url);
      return response;
    } catch (error) {
      const status = error?.response?.status;
      // retry on server errors (5xx)
      if (status && status >= 500 && retries > 0) {
        // Use debug-level logging for transient retry info to avoid red "error" output in console
        if (import.meta.env.DEV) {
          logger.debug(`voitureService: retrying ${url} after ${delayMs}ms due to ${status}`);
        }
        await new Promise((r) => setTimeout(r, delayMs));
        return voitureService._getWithRetry(url, { retries: retries - 1, delayMs: Math.min(2000, delayMs * 2) });
      }
      throw error;
    }
  },

  getVoituresNeuves: async () => {
    try {
      const response = await voitureService._getWithRetry('/voiture/neuve', { retries: 1, delayMs: 400 });
      return extractArray(response);
    } catch (error) {
      const status = error?.response?.status;
      if (status && status >= 500) {
        // Avoid throwing or logging a red error in the console for a 500 from the backend.
        // Log an informational message in dev, and return an empty array so UI can render gracefully.
        if (import.meta.env.DEV) {
          logger.info('voitureService.getVoituresNeuves: serveur a retourné', status, error?.response?.data || error.message || error);
        }
        return [];
      }
      return handleServiceError(error);
    }
  },

  getVoituresOccasion: async (modele = null) => {
    try {
      let url = '/voiture/occasion';
      if (modele) url += `?modele=${encodeURIComponent(modele)}`;
      const response = await voitureService._getWithRetry(url, { retries: 1, delayMs: 400 });
      return extractArray(response);
    } catch (error) {
      const status = error?.response?.status;
      if (status && status >= 500) {
        // Avoid noisy red errors in client console for server-side 5xx failures.
        // In dev we still log an informational message for debugging.
        if (import.meta.env.DEV) {
          logger.info('voitureService.getVoituresOccasion: serveur a retourné', status, error?.response?.data || error.message || error);
        }
        return [];
      }
      // for other errors, return empty array (keep existing behaviour)
      return [];
    }
  },

  getModelsPorscheByVoiture: async (voitureId) => {
    try {
      const response = await apiClient.get(`/voiture/modelsPorsche/${voitureId}`);
      return extractData(response);
    } catch (error) {
      return handleServiceError(error);
    }
  },

  getVoiturePage: async (id) => {
    try {
      const response = await apiClient.get(`/voiture/page/${id}`);
      return extractData(response) || extractData(response)?.data || null;
    } catch (error) {
      return handleServiceError(error);
    }
  },

  createVoiture: async (data) => {
    try {
      const response = await apiClient.post('/voiture/new', data);
      return extractData(response);
    } catch (error) {
      return handleServiceError(error);
    }
  },

  updateVoiture: async (id, data) => {
    try {
      const response = await apiClient.put(`/voiture/update/${id}`, data);
      return extractData(response);
    } catch (error) {
      return handleServiceError(error);
    }
  },

  deleteVoiture: async (id) => {
    try {
      const response = await apiClient.delete(`/voiture/delete/${id}`);
      return extractData(response);
    } catch (error) {
      return handleServiceError(error);
    }
  },

  getPhotosByVoiture: async (voitureId) => {
    try {
      const response = await apiClient.get(`/photo_voiture?voiture=${voitureId}`);
      return extractData(response);
    } catch (error) {
      return handleServiceError(error);
    }
  },

  getPhotosByModel: async (modelId) => {
    try {
      const response = await apiClient.get(`/photo_porsche?model_porsche=${modelId}`);
      return extractData(response);
    } catch (error) {
      return handleServiceError(error);
    }
  },
};

export default voitureService;

