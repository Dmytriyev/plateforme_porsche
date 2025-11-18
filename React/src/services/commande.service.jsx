import apiClient from '../config/api.jsx';

/**
 * Service de gestion des commandes et réservations
 */
const commandeService = {
  // ==================== RÉSERVATIONS ====================

  /**
   * Créer une réservation pour une voiture d'occasion
   * @param {Object} data - Données de réservation
   * @returns {Promise} Réservation créée
   */
  createReservation: async (data) => {
    try {
      const response = await apiClient.post('/reservation', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Récupérer mes réservations
   * @returns {Promise} Liste des réservations
   */
  getMyReservations: async () => {
    try {
      const response = await apiClient.get('/reservation');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Annuler une réservation
   * @param {string} id - ID de la réservation
   * @returns {Promise} Confirmation
   */
  cancelReservation: async (id) => {
    try {
      const response = await apiClient.delete(`/reservation/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // ==================== COMMANDES ====================

  /**
   * Créer une commande
   * @param {Object} data - Données de commande
   * @returns {Promise} Commande créée
   */
  createCommande: async (data) => {
    try {
      const response = await apiClient.post('/commande', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Récupérer mes commandes
   * @returns {Promise} Liste des commandes
   */
  getMyCommandes: async () => {
    try {
      const response = await apiClient.get('/commande');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Récupérer une commande par ID
   * @param {string} id - ID de la commande
   * @returns {Promise} Détails de la commande
   */
  getCommandeById: async (id) => {
    try {
      const response = await apiClient.get(`/commande/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Annuler une commande (avant paiement uniquement)
   * @param {string} id - ID de la commande
   * @returns {Promise} Confirmation
   */
  cancelCommande: async (id) => {
    try {
      const response = await apiClient.delete(`/commande/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // ==================== PAIEMENT ====================

  /**
   * Créer une session de paiement Stripe
   * @param {string} commandeId - ID de la commande
   * @returns {Promise} URL de paiement Stripe
   */
  createPaymentSession: async (commandeId) => {
    try {
      const response = await apiClient.post('/api/payment/create-checkout-session', {
        commandeId,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Vérifier le statut d'un paiement
   * @param {string} sessionId - ID de session Stripe
   * @returns {Promise} Statut du paiement
   */
  verifyPayment: async (sessionId) => {
    try {
      const response = await apiClient.get(`/api/payment/verify/${sessionId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default commandeService;

