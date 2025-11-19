import apiClient from '../config/api.jsx';

const personnalisationService = {
  getCouleursExterieur: async () => {
    try {
      const response = await apiClient.get('/couleur_exterieur/all');
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else if (Array.isArray(response.data?.data)) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getCouleurExterieurById: async (id) => {
    try {
      const response = await apiClient.get(`/couleur_exterieur/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getCouleursInterieur: async () => {
    try {
      const response = await apiClient.get('/couleur_interieur/all');
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else if (Array.isArray(response.data?.data)) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getCouleurInterieurById: async (id) => {
    try {
      const response = await apiClient.get(`/couleur_interieur/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getJantes: async () => {
    try {
      const response = await apiClient.get('/taille_jante/all');
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else if (Array.isArray(response.data?.data)) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getTaillesJante: async () => {
    try {
      const response = await apiClient.get('/taille_jante/all');
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else if (Array.isArray(response.data?.data)) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getTailleJanteById: async (id) => {
    try {
      const response = await apiClient.get(`/taille_jante/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getSieges: async () => {
    try {
      const response = await apiClient.get('/siege/all');
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else if (Array.isArray(response.data?.data)) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getSiegeById: async (id) => {
    try {
      const response = await apiClient.get(`/siege/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getPackages: async () => {
    try {
      const response = await apiClient.get('/package/all');
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        return response.data.data;
      } else if (Array.isArray(response.data)) {
        return response.data;
      } else if (Array.isArray(response.data?.data)) {
        return response.data.data;
      }
      return [];
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getPackageById: async (id) => {
    try {
      const response = await apiClient.get(`/package/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default personnalisationService;
