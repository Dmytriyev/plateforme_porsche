import apiClient from '../config/api.jsx';

const voitureService = {
  getAllVoitures: async () => {
    try {
      const response = await apiClient.get('/voiture/all');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getVoitureById: async (id) => {
    try {
      const response = await apiClient.get(`/voiture/${id}`);
      if (response.data && response.data.success && response.data.data) {
        return response.data.data;
      } else if (response.data && response.data.data) {
        return response.data.data;
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getVoituresNeuves: async () => {
    try {
      const response = await apiClient.get('/voiture/neuve');
      if (response.data && response.data.success && response.data.data && Array.isArray(response.data.data.voitures)) {
        return response.data.data.voitures;
      } else if (response.data && response.data.data && Array.isArray(response.data.data.voitures)) {
        return response.data.data.voitures;
      } else if (response.data && Array.isArray(response.data.voitures)) {
        return response.data.voitures;
      } else if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getVoituresOccasion: async (modele = null) => {
    try {
      let url = '/voiture/occasion';
      if (modele) {
        url += `?modele=${encodeURIComponent(modele)}`;
      }
      
      const response = await apiClient.get(url);
      if (response.data && response.data.success && response.data.data && Array.isArray(response.data.data.voitures)) {
        return response.data.data.voitures;
      } else if (response.data && response.data.data && Array.isArray(response.data.data.voitures)) {
        return response.data.data.voitures;
      } else if (response.data && Array.isArray(response.data.voitures)) {
        return response.data.voitures;
      } else if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getModelsPorscheByVoiture: async (voitureId) => {
    try {
      const response = await apiClient.get(`/voiture/modelsPorsche/${voitureId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getVoiturePage: async (id) => {
    try {
      const response = await apiClient.get(`/voiture/page/${id}`);
      return response.data?.data || response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  createVoiture: async (data) => {
    try {
      const response = await apiClient.post('/voiture/new', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  updateVoiture: async (id, data) => {
    try {
      const response = await apiClient.put(`/voiture/update/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  deleteVoiture: async (id) => {
    try {
      const response = await apiClient.delete(`/voiture/delete/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getPhotosByVoiture: async (voitureId) => {
    try {
      const response = await apiClient.get(`/photo_voiture?voiture=${voitureId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getPhotosByModel: async (modelId) => {
    try {
      const response = await apiClient.get(`/photo_porsche?model_porsche=${modelId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default voitureService;

