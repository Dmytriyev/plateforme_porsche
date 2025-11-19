import apiClient from '../config/api.jsx';

const maVoitureService = {
  getMesVoitures: async () => {
    try {
      const response = await apiClient.get('/model_porsche_actuel/user/mesPorsches');
      return response.data?.porsches || response.data || [];
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getMaVoitureById: async (id) => {
    try {
      const response = await apiClient.get(`/model_porsche_actuel/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  ajouterMaVoiture: async (data) => {
    try {
      const response = await apiClient.post('/model_porsche_actuel', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  updateMaVoiture: async (id, data) => {
    try {
      const response = await apiClient.put(`/model_porsche_actuel/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  supprimerMaVoiture: async (id) => {
    try {
      const response = await apiClient.delete(`/model_porsche_actuel/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  ajouterPhoto: async (formData) => {
    try {
      const response = await apiClient.post('/photo_voiture_actuel', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  supprimerPhoto: async (id) => {
    try {
      const response = await apiClient.delete(`/photo_voiture_actuel/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default maVoitureService;
