import apiClient from '../config/api.jsx';

/**
 * Service de gestion des voitures
 * Correspond aux endpoints /voiture et /model_porsche du backend
 */
const voitureService = {
  // ==================== VOITURES (Modèles de base) ====================

  /**
   * Récupérer toutes les voitures
   * @returns {Promise} Liste des voitures
   */
  getAllVoitures: async () => {
    try {
      const response = await apiClient.get('/voiture');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Récupérer une voiture par ID
   * @param {string} id - ID de la voiture
   * @returns {Promise} Détails de la voiture
   */
  getVoitureById: async (id) => {
    try {
      const response = await apiClient.get(`/voiture/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Créer une nouvelle voiture (ADMIN)
   * @param {Object} data - Données de la voiture
   * @returns {Promise} Voiture créée
   */
  createVoiture: async (data) => {
    try {
      const response = await apiClient.post('/voiture', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Mettre à jour une voiture (ADMIN)
   * @param {string} id - ID de la voiture
   * @param {Object} data - Nouvelles données
   * @returns {Promise} Voiture mise à jour
   */
  updateVoiture: async (id, data) => {
    try {
      const response = await apiClient.put(`/voiture/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Supprimer une voiture (ADMIN)
   * @param {string} id - ID de la voiture
   * @returns {Promise} Confirmation
   */
  deleteVoiture: async (id) => {
    try {
      const response = await apiClient.delete(`/voiture/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // ==================== MODÈLES PORSCHE (Variantes) ====================

  /**
   * Récupérer tous les modèles Porsche
   * @returns {Promise} Liste des modèles
   */
  getAllModels: async () => {
    try {
      const response = await apiClient.get('/model_porsche');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Récupérer un modèle par ID
   * @param {string} id - ID du modèle
   * @returns {Promise} Détails du modèle
   */
  getModelById: async (id) => {
    try {
      const response = await apiClient.get(`/model_porsche/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Filtrer les modèles par type (neuve/occasion)
   * @param {boolean} isNew - true pour neuve, false pour occasion
   * @returns {Promise} Liste filtrée
   */
  getModelsByType: async (isNew) => {
    try {
      const response = await apiClient.get(`/model_porsche?type_voiture=${isNew}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Créer un nouveau modèle (ADMIN)
   * @param {Object} data - Données du modèle
   * @returns {Promise} Modèle créé
   */
  createModel: async (data) => {
    try {
      const response = await apiClient.post('/model_porsche', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Mettre à jour un modèle (ADMIN)
   * @param {string} id - ID du modèle
   * @param {Object} data - Nouvelles données
   * @returns {Promise} Modèle mis à jour
   */
  updateModel: async (id, data) => {
    try {
      const response = await apiClient.put(`/model_porsche/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Supprimer un modèle (ADMIN)
   * @param {string} id - ID du modèle
   * @returns {Promise} Confirmation
   */
  deleteModel: async (id) => {
    try {
      const response = await apiClient.delete(`/model_porsche/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // ==================== PHOTOS ====================

  /**
   * Récupérer les photos d'une voiture
   * @param {string} voitureId - ID de la voiture
   * @returns {Promise} Liste des photos
   */
  getPhotosByVoiture: async (voitureId) => {
    try {
      const response = await apiClient.get(`/photo_voiture?voiture=${voitureId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Récupérer les photos d'un modèle Porsche
   * @param {string} modelId - ID du modèle
   * @returns {Promise} Liste des photos
   */
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

