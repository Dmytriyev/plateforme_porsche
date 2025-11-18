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
      const response = await apiClient.get('/voiture/all');
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
   * Récupérer les voitures NEUVES uniquement
   * @returns {Promise} Liste des voitures neuves
   */
  getVoituresNeuves: async () => {
    try {
      const response = await apiClient.get('/voiture/neuve');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Récupérer les voitures OCCASION uniquement
   * @returns {Promise} Liste des voitures occasion
   */
  getVoituresOccasion: async () => {
    try {
      const response = await apiClient.get('/voiture/occasion');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Récupérer les modèles Porsche d'une voiture
   * @param {string} voitureId - ID de la voiture
   * @returns {Promise} Liste des modèles Porsche
   */
  getModelsPorscheByVoiture: async (voitureId) => {
    try {
      const response = await apiClient.get(`/voiture/modelsPorsche/${voitureId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Créer une nouvelle voiture (STAFF)
   * @param {Object} data - Données de la voiture
   * @returns {Promise} Voiture créée
   */
  createVoiture: async (data) => {
    try {
      const response = await apiClient.post('/voiture/new', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Mettre à jour une voiture (STAFF)
   * @param {string} id - ID de la voiture
   * @param {Object} data - Nouvelles données
   * @returns {Promise} Voiture mise à jour
   */
  updateVoiture: async (id, data) => {
    try {
      const response = await apiClient.put(`/voiture/update/${id}`, data);
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
      const response = await apiClient.delete(`/voiture/delete/${id}`);
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

