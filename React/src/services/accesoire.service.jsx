import apiClient from '../config/api.jsx';

const accesoireService = {
  getAllAccessoires: async () => {
    try {
      const response = await apiClient.get('/accesoire/all');
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        return response.data.data;
      }
      return response.data || [];
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getAccessoireById: async (id) => {
    try {
      const response = await apiClient.get(`/accesoire/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getAccessoiresByType: async (type) => {
    try {
      const response = await apiClient.get(`/accesoire/search?type_accesoire=${encodeURIComponent(type)}`);
      if (response.data && Array.isArray(response.data.accesoires)) {
        return response.data.accesoires;
      } else if (response.data && response.data.success && Array.isArray(response.data.data)) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      }
      return [];
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getAvailableTypes: async () => {
    try {
      const response = await apiClient.get('/accesoire/types');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  searchAccessoires: async (params) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await apiClient.get(`/accesoire/search?${queryString}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getCouleurs: async () => {
    try {
      const response = await apiClient.get('/couleur_accesoire');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  createAccessoire: async (data) => {
    try {
      const response = await apiClient.post('/accesoire/new', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  updateAccessoire: async (id, data) => {
    try {
      const response = await apiClient.put(`/accesoire/update/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  deleteAccessoire: async (id) => {
    try {
      const response = await apiClient.delete(`/accesoire/delete/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default accesoireService;
