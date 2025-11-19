import apiClient from '../config/api.jsx';
import { extractData, extractArray, handleServiceError } from './httpHelper';

const modelPorscheService = {
  getAllModels: async () => {
    try {
      const response = await apiClient.get('/model_porsche/all');
      return extractArray(response);
    } catch (error) {
      return handleServiceError(error);
    }
  },

  getModelById: async (id) => {
    try {
      const response = await apiClient.get(`/model_porsche/${id}`);
      return extractData(response);
    } catch (error) {
      return handleServiceError(error);
    }
  },

  getModelesNeufs: async () => {
    try {
      const response = await apiClient.get('/model_porsche/neuves');
      return extractArray(response);
    } catch (error) {
      return handleServiceError(error);
    }
  },

  getModelesOccasion: async () => {
    try {
      const response = await apiClient.get('/model_porsche/occasions');
      return extractArray(response);
    } catch (error) {
      return handleServiceError(error);
    }
  },

  getAllVariantes: async () => {
    try {
      const response = await apiClient.get('/model_porsche/variantes');
      return extractData(response);
    } catch (error) {
      return handleServiceError(error);
    }
  },

  getVariantesByModel: async (nomModel) => {
    try {
      const response = await apiClient.get(`/model_porsche/variantes/${nomModel}`);
      return extractData(response);
    } catch (error) {
      return handleServiceError(error);
    }
  },

  getAllCarrosseries: async () => {
    try {
      const response = await apiClient.get('/model_porsche/carrosseries');
      return extractData(response);
    } catch (error) {
      return handleServiceError(error);
    }
  },

  getConfigurationsByVoiture: async (voitureId) => {
    try {
      const response = await apiClient.get(`/model_porsche/voiture/${voitureId}`);
      // prefer configurations property if present
      const data = extractData(response);
      if (data?.configurations && Array.isArray(data.configurations)) return data.configurations;
      if (Array.isArray(data)) return data;
      return [];
    } catch (error) {
      return handleServiceError(error);
    }
  },

  calculatePrixTotal: async (modelId) => {
    try {
      const response = await apiClient.get(`/model_porsche/prixTotal/${modelId}`);
      return extractData(response) || response.data || response;
    } catch (error) {
      return handleServiceError(error);
    }
  },

  getVariantePage: async (id) => {
    try {
      const response = await apiClient.get(`/model_porsche/page/${id}`);
      return extractData(response) || null;
    } catch (error) {
      return handleServiceError(error);
    }
  },

  getOccasionPage: async (id) => {
    try {
      const response = await apiClient.get(`/model_porsche/occasion/page/${id}`, { validateStatus: (status) => status < 500 });

      if (response.status === 404 || response.status === 400) {
        const silentError = new Error("Voiture d'occasion introuvable");
        silentError.status = response.status;
        silentError.response = { status: response.status };
        silentError.isExpected = true;
        silentError.silent = true;
        silentError.config = { url: `/model_porsche/occasion/page/${id}` };
        throw silentError;
      }

      if (response.data && response.data.success && response.data.data) return response.data.data;
      return extractData(response) || response.data || response;
    } catch (error) {
      const status = error.response?.status || error.status;

      if (error.silent || error.isExpected || status === 404 || status === 400) {
        const silentError = new Error("Voiture d'occasion introuvable");
        silentError.status = status || 404;
        silentError.response = { status: status || 404 };
        silentError.isExpected = true;
        silentError.silent = true;
        silentError.config = error.config || { url: `/model_porsche/occasion/page/${id}` };
        Object.defineProperty(silentError, 'message', { value: "Voiture d'occasion introuvable", writable: false, enumerable: false, configurable: false });
        throw silentError;
      }

      return handleServiceError(error);
    }
  },

  createModel: async (data) => {
    try {
      const response = await apiClient.post('/model-porsche/new', data);
      return extractData(response);
    } catch (error) {
      return handleServiceError(error);
    }
  },

  updateModel: async (id, data) => {
    try {
      const response = await apiClient.patch(`/model_porsche/update/${id}`, data);
      return extractData(response);
    } catch (error) {
      return handleServiceError(error);
    }
  },

  deleteModel: async (id) => {
    try {
      const response = await apiClient.delete(`/model_porsche/delete/${id}`);
      return extractData(response);
    } catch (error) {
      return handleServiceError(error);
    }
  },

  addImages: async (id, formData) => {
    try {
      const response = await apiClient.patch(`/model_porsche/addImages/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      return extractData(response);
    } catch (error) {
      return handleServiceError(error);
    }
  },

  removeImages: async (id, data) => {
    try {
      const response = await apiClient.patch(`/model_porsche/removeImages/${id}`, data);
      return extractData(response);
    } catch (error) {
      return handleServiceError(error);
    }
  },

  addCouleurExterieur: async (id, data) => {
    try {
      const response = await apiClient.patch(`/model_porsche/addCouleurExterieur/${id}`, data);
      return extractData(response);
    } catch (error) {
      return handleServiceError(error);
    }
  },

  removeCouleurExterieur: async (id, data) => {
    try {
      const response = await apiClient.patch(`/model_porsche/removeCouleurExterieur/${id}`, data);
      return extractData(response);
    } catch (error) {
      return handleServiceError(error);
    }
  },

  addCouleurInterieur: async (id, data) => {
    try {
      const response = await apiClient.patch(`/model_porsche/addCouleursInterieur/${id}`, data);
      return extractData(response);
    } catch (error) {
      return handleServiceError(error);
    }
  },

  removeCouleurInterieur: async (id, data) => {
    try {
      const response = await apiClient.patch(`/model_porsche/removeCouleursInterieur/${id}`, data);
      return extractData(response);
    } catch (error) {
      return handleServiceError(error);
    }
  },

  addTailleJante: async (id, data) => {
    try {
      const response = await apiClient.patch(`/model_porsche/addTailleJante/${id}`, data);
      return extractData(response);
    } catch (error) {
      return handleServiceError(error);
    }
  },

  removeTailleJante: async (id, data) => {
    try {
      const response = await apiClient.patch(`/model_porsche/removeTailleJante/${id}`, data);
      return extractData(response);
    } catch (error) {
      return handleServiceError(error);
    }
  },
};

export default modelPorscheService;

