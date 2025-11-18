import apiClient from '../config/api.jsx';

/**
 * Service de gestion des accessoires
 * Correspond à l'endpoint /accesoire du backend
 */
const accesoireService = {
  /**
   * Récupérer tous les accessoires avec photos et couleurs
   * @returns {Promise} Liste des accessoires
   */
  getAllAccessoires: async () => {
    try {
      const response = await apiClient.get('/accesoire/all');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Récupérer un accessoire par ID
   * @param {string} id - ID de l'accessoire
   * @returns {Promise} Détails de l'accessoire
   */
  getAccessoireById: async (id) => {
    try {
      const response = await apiClient.get(`/accesoire/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Filtrer les accessoires par type
   * @param {string} type - Type d'accessoire
   * @returns {Promise} Liste filtrée
   */
  getAccessoiresByType: async (type) => {
    try {
      const response = await apiClient.get(`/accesoire/search?type=${type}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Récupérer toutes les couleurs d'accessoires
   * @returns {Promise} Liste des couleurs
   */
  getCouleurs: async () => {
    try {
      const response = await apiClient.get('/couleur_accesoire');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default accesoireService;
