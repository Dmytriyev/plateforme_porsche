import apiClient from '../config/api.jsx';

const commandeService = {
  createReservation: async (data) => {
    try {
      const response = await apiClient.post('/reservation', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getMyReservations: async (userId) => {
    try {
      const response = await apiClient.get(`/reservation/user/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  cancelReservation: async (id) => {
    try {
      const response = await apiClient.delete(`/reservation/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  createCommande: async (data) => {
    try {
      const response = await apiClient.post('/commande', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getMyCommandes: async () => {
    try {
      const response = await apiClient.get('/commande/historique');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getCommandeById: async (id) => {
    try {
      const response = await apiClient.get(`/commande/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  cancelCommande: async (id) => {
    try {
      const response = await apiClient.delete(`/commande/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  proposerVente: async (data) => {
    try {
      const response = await apiClient.post('/proposition-vente', data);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getMesPropositions: async () => {
    try {
      const response = await apiClient.get('/proposition-vente');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

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

  verifyPayment: async (sessionId) => {
    try {
      const response = await apiClient.get(`/api/payment/verify/${sessionId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  getPanier: async () => {
    try {
      const response = await apiClient.get('/commande/panier');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  updateQuantiteLigne: async (ligneId, quantite) => {
    try {
      const response = await apiClient.patch(`/commande/updateQuantite/ligne/${ligneId}`, {
        quantite,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  supprimerLignePanier: async (ligneId) => {
    try {
      const response = await apiClient.delete(`/commande/delete/ligne/${ligneId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  viderPanier: async () => {
    try {
      const response = await apiClient.delete('/ligneCommande/panier/vider');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};

export default commandeService;
