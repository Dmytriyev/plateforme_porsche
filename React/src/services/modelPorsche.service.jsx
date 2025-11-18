import apiClient from '../config/api.jsx';

/**
 * Service de gestion des modèles Porsche (variantes)
 * Correspond à l'endpoint /model_porsche du backend
 */
const modelPorscheService = {
  // ==================== MODÈLES PORSCHE (Variantes) ====================

  /**
   * Récupérer tous les modèles Porsche
   * @returns {Promise} Liste des modèles
   */
  getAllModels: async () => {
    try {
      const response = await apiClient.get('/model_porsche/all');
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
   * Récupérer les modèles NEUFS uniquement
   * @returns {Promise} Liste des modèles neufs
   */
  getModelesNeufs: async () => {
    try {
      const response = await apiClient.get('/model_porsche/neuves');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Récupérer les modèles OCCASION uniquement
   * @returns {Promise} Liste des modèles occasion
   */
  getModelesOccasion: async () => {
    try {
      const response = await apiClient.get('/model_porsche/occasions');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Récupérer toutes les variantes disponibles
   * @returns {Promise} Liste des variantes
   */
  getAllVariantes: async () => {
    try {
      const response = await apiClient.get('/model_porsche/variantes');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Récupérer les variantes d'un modèle spécifique (ex: '911')
   * @param {string} nomModel - Nom du modèle (911, Cayenne, Cayman)
   * @returns {Promise} Liste des variantes du modèle
   */
  getVariantesByModel: async (nomModel) => {
    try {
      const response = await apiClient.get(`/model_porsche/variantes/${nomModel}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Récupérer toutes les carrosseries disponibles
   * @returns {Promise} Liste des types de carrosserie
   */
  getAllCarrosseries: async () => {
    try {
      const response = await apiClient.get('/model_porsche/carrosseries');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Récupérer les configurations d'une voiture spécifique
   * @param {string} voitureId - ID de la voiture
   * @returns {Promise} Configurations de la voiture
   */
  getConfigurationsByVoiture: async (voitureId) => {
    try {
      const response = await apiClient.get(`/model_porsche/voiture/${voitureId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Calculer le prix total d'un modèle avec options
   * @param {string} modelId - ID du modèle
   * @returns {Promise} Prix total calculé
   */
  calculatePrixTotal: async (modelId) => {
    try {
      const response = await apiClient.get(`/model_porsche/prixTotal/${modelId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // ==================== ROUTES PROTÉGÉES ====================

  /**
   * Créer un nouveau modèle (STAFF)
   * @param {Object} data - Données du modèle
   * @returns {Promise} Modèle créé
   */
  createModel: async (data) => {
    try {
      const response = await apiClient.post('/model_porsche/new', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Mettre à jour un modèle (STAFF)
   * @param {string} id - ID du modèle
   * @param {Object} data - Nouvelles données
   * @returns {Promise} Modèle mis à jour
   */
  updateModel: async (id, data) => {
    try {
      const response = await apiClient.patch(`/model_porsche/update/${id}`, data);
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
      const response = await apiClient.delete(`/model_porsche/delete/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Ajouter des images à un modèle (STAFF)
   * @param {string} id - ID du modèle
   * @param {FormData} formData - Images à ajouter
   * @returns {Promise} Modèle mis à jour
   */
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

  /**
   * Supprimer des images d'un modèle (STAFF)
   * @param {string} id - ID du modèle
   * @param {Object} data - IDs des images à supprimer
   * @returns {Promise} Modèle mis à jour
   */
  removeImages: async (id, data) => {
    try {
      const response = await apiClient.patch(`/model_porsche/removeImages/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Ajouter une couleur extérieure (STAFF)
   * @param {string} id - ID du modèle
   * @param {Object} data - Données de la couleur
   * @returns {Promise} Modèle mis à jour
   */
  addCouleurExterieur: async (id, data) => {
    try {
      const response = await apiClient.patch(`/model_porsche/addCouleurExterieur/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Supprimer une couleur extérieure (STAFF)
   * @param {string} id - ID du modèle
   * @param {Object} data - ID de la couleur à supprimer
   * @returns {Promise} Modèle mis à jour
   */
  removeCouleurExterieur: async (id, data) => {
    try {
      const response = await apiClient.patch(`/model_porsche/removeCouleurExterieur/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Ajouter une couleur intérieure (STAFF)
   * @param {string} id - ID du modèle
   * @param {Object} data - Données de la couleur
   * @returns {Promise} Modèle mis à jour
   */
  addCouleurInterieur: async (id, data) => {
    try {
      const response = await apiClient.patch(`/model_porsche/addCouleursInterieur/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Supprimer une couleur intérieure (STAFF)
   * @param {string} id - ID du modèle
   * @param {Object} data - ID de la couleur à supprimer
   * @returns {Promise} Modèle mis à jour
   */
  removeCouleurInterieur: async (id, data) => {
    try {
      const response = await apiClient.patch(`/model_porsche/removeCouleursInterieur/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Ajouter une taille de jante (STAFF)
   * @param {string} id - ID du modèle
   * @param {Object} data - Données de la jante
   * @returns {Promise} Modèle mis à jour
   */
  addTailleJante: async (id, data) => {
    try {
      const response = await apiClient.patch(`/model_porsche/addTailleJante/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Supprimer une taille de jante (STAFF)
   * @param {string} id - ID du modèle
   * @param {Object} data - ID de la jante à supprimer
   * @returns {Promise} Modèle mis à jour
   */
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

