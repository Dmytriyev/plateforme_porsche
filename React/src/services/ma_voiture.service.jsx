import apiClient from '../config/api.jsx';

/**
 * Service de gestion de ma voiture actuelle
 * Correspond à l'endpoint /model_porsche_actuel du backend
 */
const maVoitureService = {
  /**
   * Récupérer mes voitures
   * @returns {Promise} Liste de mes voitures
   */
  getMesVoitures: async () => {
    try {
      const response = await apiClient.get('/model_porsche_actuel');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Récupérer une de mes voitures par ID
   * @param {string} id - ID de la voiture
   * @returns {Promise} Détails de la voiture
   */
  getMaVoitureById: async (id) => {
    try {
      const response = await apiClient.get(`/model_porsche_actuel/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Ajouter ma Porsche
   * @param {Object} data - Données de la voiture
   * @returns {Promise} Voiture créée
   */
  ajouterMaVoiture: async (data) => {
    try {
      const response = await apiClient.post('/model_porsche_actuel', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Mettre à jour ma voiture
   * @param {string} id - ID de la voiture
   * @param {Object} data - Nouvelles données
   * @returns {Promise} Voiture mise à jour
   */
  updateMaVoiture: async (id, data) => {
    try {
      const response = await apiClient.put(`/model_porsche_actuel/${id}`, data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Supprimer ma voiture
   * @param {string} id - ID de la voiture
   * @returns {Promise} Confirmation
   */
  supprimerMaVoiture: async (id) => {
    try {
      const response = await apiClient.delete(`/model_porsche_actuel/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Ajouter une photo à ma voiture
   * @param {FormData} formData - Données du formulaire avec l'image
   * @returns {Promise} Photo créée
   */
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

  /**
   * Supprimer une photo
   * @param {string} id - ID de la photo
   * @returns {Promise} Confirmation
   */
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

