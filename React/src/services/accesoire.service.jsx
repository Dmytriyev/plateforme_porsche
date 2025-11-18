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
   * Récupérer les types d'accessoires disponibles
   * @returns {Promise} Liste des types
   */
  getAvailableTypes: async () => {
    try {
      const response = await apiClient.get('/accesoire/types');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Recherche d'accessoires avec critères multiples
   * @param {Object} params - Paramètres de recherche (type, prix_min, prix_max, etc.)
   * @returns {Promise} Liste filtrée
   */
  searchAccessoires: async (params) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const response = await apiClient.get(`/accesoire/search?${queryString}`);
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

  // ==================== ROUTES PROTÉGÉES ====================

  /**
   * Créer un nouvel accessoire (ADMIN)
   * @param {Object} data - Données de l'accessoire
   * @returns {Promise} Accessoire créé
   */
  createAccessoire: async (data) => {
    try {
      const response = await apiClient.post('/accesoire/new', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Mettre à jour un accessoire (ADMIN)
   * @param {string} id - ID de l'accessoire
   * @param {Object} data - Nouvelles données
   * @returns {Promise} Accessoire mis à jour
   */
  updateAccessoire: async (id, data) => {
    try {
      const response = await apiClient.put(`/accesoire/update/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Supprimer un accessoire (ADMIN)
   * @param {string} id - ID de l'accessoire
   * @returns {Promise} Confirmation
   */
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
