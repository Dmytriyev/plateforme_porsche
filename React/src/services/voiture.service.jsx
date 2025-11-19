import apiClient from '../config/api.jsx';
import { extractData, extractArray, handleServiceError } from './httpHelper';

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

  getVoituresNeuves: async () => {
    try {
      const response = await apiClient.get('/voiture/neuve');
      return extractArray(response);
    } catch (error) {
      return handleServiceError(error);
    }
  },

  getVoituresOccasion: async (modele = null) => {
    try {
      let url = '/voiture/occasion';
      if (modele) url += `?modele=${encodeURIComponent(modele)}`;
      const response = await apiClient.get(url);
      return extractArray(response);
    } catch (error) {
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

