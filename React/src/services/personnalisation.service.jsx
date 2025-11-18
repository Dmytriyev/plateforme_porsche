import apiClient from '../config/api.jsx';

/**
 * Service de personnalisation
 * Gère les couleurs, jantes, sièges et packages
 */
const personnalisationService = {
  // ==================== COULEURS EXTÉRIEURES ====================

  /**
   * Récupérer toutes les couleurs extérieures
   * @returns {Promise} Liste des couleurs
   */
  getCouleursExterieur: async () => {
    try {
      const response = await apiClient.get('/couleur_exterieur');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Récupérer une couleur extérieure par ID
   * @param {string} id - ID de la couleur
   * @returns {Promise} Détails de la couleur
   */
  getCouleurExterieurById: async (id) => {
    try {
      const response = await apiClient.get(`/couleur_exterieur/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // ==================== COULEURS INTÉRIEURES ====================

  /**
   * Récupérer toutes les couleurs intérieures
   * @returns {Promise} Liste des couleurs
   */
  getCouleursInterieur: async () => {
    try {
      const response = await apiClient.get('/couleur_interieur');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Récupérer une couleur intérieure par ID
   * @param {string} id - ID de la couleur
   * @returns {Promise} Détails de la couleur
   */
  getCouleurInterieurById: async (id) => {
    try {
      const response = await apiClient.get(`/couleur_interieur/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // ==================== JANTES ====================

  /**
   * Récupérer toutes les tailles de jantes
   * @returns {Promise} Liste des jantes
   */
  getJantes: async () => {
    try {
      const response = await apiClient.get('/taille_jante');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Alias pour getTaillesJante (pour compatibilité)
   */
  getTaillesJante: async () => {
    try {
      const response = await apiClient.get('/taille_jante');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Récupérer une taille de jante par ID
   * @param {string} id - ID de la jante
   * @returns {Promise} Détails de la jante
   */
  getTailleJanteById: async (id) => {
    try {
      const response = await apiClient.get(`/taille_jante/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // ==================== SIÈGES ====================

  /**
   * Récupérer tous les types de sièges
   * @returns {Promise} Liste des sièges
   */
  getSieges: async () => {
    try {
      const response = await apiClient.get('/siege');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Récupérer un siège par ID
   * @param {string} id - ID du siège
   * @returns {Promise} Détails du siège
   */
  getSiegeById: async (id) => {
    try {
      const response = await apiClient.get(`/siege/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // ==================== PACKAGES ====================

  /**
   * Récupérer tous les packages
   * @returns {Promise} Liste des packages
   */
  getPackages: async () => {
    try {
      const response = await apiClient.get('/package');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Récupérer un package par ID
   * @param {string} id - ID du package
   * @returns {Promise} Détails du package
   */
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

