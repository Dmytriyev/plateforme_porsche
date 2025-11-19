import apiClient from '../config/api.jsx';

const modelPorscheService = {
  getAllModels: async () => {
    try {
      const response = await apiClient.get('/model_porsche/all');
      if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getModelById: async (id) => {
    try {
      const response = await apiClient.get(`/model_porsche/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getModelesNeufs: async () => {
    try {
      const response = await apiClient.get('/model_porsche/neuves');
      if (response.data && response.data.success && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getModelesOccasion: async () => {
    try {
      const response = await apiClient.get('/model_porsche/occasions');
      if (response.data && response.data.success && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getAllVariantes: async () => {
    try {
      const response = await apiClient.get('/model_porsche/variantes');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getVariantesByModel: async (nomModel) => {
    try {
      const response = await apiClient.get(`/model_porsche/variantes/${nomModel}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getAllCarrosseries: async () => {
    try {
      const response = await apiClient.get('/model_porsche/carrosseries');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getConfigurationsByVoiture: async (voitureId) => {
    try {
      const response = await apiClient.get(`/model_porsche/voiture/${voitureId}`);
      if (response.data && response.data.configurations && Array.isArray(response.data.configurations)) {
        return response.data.configurations;
      } else if (response.data && Array.isArray(response.data)) {
        return response.data;
      } else if (Array.isArray(response.data?.data)) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  calculatePrixTotal: async (modelId) => {
    try {
      const response = await apiClient.get(`/model_porsche/prixTotal/${modelId}`);
      if (response.data && response.data.details_prix) {
        return response.data;
      }
      return response.data || response;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getVariantePage: async (id) => {
    try {
      const response = await apiClient.get(`/model_porsche/page/${id}`);
      return response.data?.data || response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getOccasionPage: async (id) => {
    try {
      const response = await apiClient.get(`/model_porsche/occasion/page/${id}`, {
        validateStatus: (status) => status < 500
      });
      
      if (response.status === 404 || response.status === 400) {
        const silentError = new Error("Voiture d'occasion introuvable");
        silentError.status = response.status;
        silentError.response = { status: response.status };
        silentError.isExpected = true;
        silentError.silent = true;
        silentError.config = { url: `/model_porsche/occasion/page/${id}` };
        throw silentError;
      }
      
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      }
      return response.data || response;
    } catch (error) {
      const status = error.response?.status || error.status;
      
      if (error.silent || error.isExpected || status === 404 || status === 400) {
        const silentError = new Error("Voiture d'occasion introuvable");
        silentError.status = status || 404;
        silentError.response = { status: status || 404 };
        silentError.isExpected = true;
        silentError.silent = true;
        silentError.config = error.config || { url: `/model_porsche/occasion/page/${id}` };
        Object.defineProperty(silentError, 'message', {
          value: "Voiture d'occasion introuvable",
          writable: false,
          enumerable: false,
          configurable: false
        });
        throw silentError;
      }
      
      console.error('Erreur getOccasionPage:', {
        id,
        status,
        message: error.response?.data?.message || error.message
      });
      
      throw error.response?.data || error;
    }
  },

  createModel: async (data) => {
    try {
      const response = await apiClient.post('/model_porsche/new', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  updateModel: async (id, data) => {
    try {
      const response = await apiClient.patch(`/model_porsche/update/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  deleteModel: async (id) => {
    try {
      const response = await apiClient.delete(`/model_porsche/delete/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  addImages: async (id, formData) => {
    try {
      const response = await apiClient.patch(`/model_porsche/addImages/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  removeImages: async (id, data) => {
    try {
      const response = await apiClient.patch(`/model_porsche/removeImages/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  addCouleurExterieur: async (id, data) => {
    try {
      const response = await apiClient.patch(`/model_porsche/addCouleurExterieur/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  removeCouleurExterieur: async (id, data) => {
    try {
      const response = await apiClient.patch(`/model_porsche/removeCouleurExterieur/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  addCouleurInterieur: async (id, data) => {
    try {
      const response = await apiClient.patch(`/model_porsche/addCouleursInterieur/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  removeCouleurInterieur: async (id, data) => {
    try {
      const response = await apiClient.patch(`/model_porsche/removeCouleursInterieur/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  addTailleJante: async (id, data) => {
    try {
      const response = await apiClient.patch(`/model_porsche/addTailleJante/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  removeTailleJante: async (id, data) => {
    try {
      const response = await apiClient.patch(`/model_porsche/removeTailleJante/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default modelPorscheService;

