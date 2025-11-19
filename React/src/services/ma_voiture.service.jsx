import apiClient from '../config/api.jsx';
import { extractData, handleServiceError } from './httpHelper';

const maVoitureService = {
  getMesVoitures: async () => {
    try {
      const response = await apiClient.get('/model_porsche_actuel/user/mesPorsches');
      const data = extractData(response);
      return data?.porsches || data || [];
    } catch (error) {
      return handleServiceError(error);
    }
  },

  getMaVoitureById: async (id) => {
    try {
      const response = await apiClient.get(`/model_porsche_actuel/${id}`);
      return extractData(response);
    } catch (error) {
      return handleServiceError(error);
    }
  },

  ajouterMaVoiture: async (data) => {
    try {
      const response = await apiClient.post('/model-porsche-actuel/new', data);
      return extractData(response);
    } catch (error) {
      return handleServiceError(error);
    }
  },

  updateMaVoiture: async (id, data) => {
    try {
      const response = await apiClient.put(`/model_porsche_actuel/${id}`, data);
      return extractData(response);
    } catch (error) {
      return handleServiceError(error);
    }
  },

  supprimerMaVoiture: async (id) => {
    try {
      const response = await apiClient.delete(`/model_porsche_actuel/${id}`);
      return extractData(response);
    } catch (error) {
      return handleServiceError(error);
    }
  },

  ajouterPhoto: async (formData) => {
    try {
      const response = await apiClient.post('/photo-voiture-actuel/new', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return extractData(response);
    } catch (error) {
      return handleServiceError(error);
    }
  },

  supprimerPhoto: async (id) => {
    try {
      const response = await apiClient.delete(`/photo-voiture-actuel/delete/${id}`);
      return extractData(response);
    } catch (error) {
      return handleServiceError(error);
    }
  },
};

export default maVoitureService;
