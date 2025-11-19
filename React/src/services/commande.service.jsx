import apiClient from '../config/api.jsx';
import { extractData, handleServiceError } from './httpHelper';

const commandeService = {
  createReservation: async (data) => {
    try {
      const response = await apiClient.post('/reservation/new', data);
      return extractData(response);
    } catch (error) {
      return handleServiceError(error);
    }
  },

  getMyReservations: async (userId) => {
    try {
      if (!userId) {
        throw new Error('ID utilisateur requis');
      }
      const response = await apiClient.get(`/reservation/user/${userId}`);
      return extractData(response);
    } catch (error) {
      return handleServiceError(error);
    }
  },

  getAllReservations: async () => {
    try {
      const response = await apiClient.get('/reservation/all');
      return extractData(response);
    } catch (error) {
      return handleServiceError(error);
    }
  },

  cancelReservation: async (id) => {
    try {
      const response = await apiClient.delete(`/reservation/delete/${id}`);
      return extractData(response);
    } catch (error) {
      return handleServiceError(error);
    }
  },

  createCommande: async (data) => {
    try {
      const response = await apiClient.post('/commande/new', data);
      return extractData(response);
    } catch (error) {
      return handleServiceError(error);
    }
  },

  getMyCommandes: async () => {
    try {
      const response = await apiClient.get('/commande/historique');
      return extractData(response);
    } catch (error) {
      return handleServiceError(error);
    }
  },

  getCommandeById: async (id) => {
    try {
      const response = await apiClient.get(`/commande/${id}`);
      return extractData(response);
    } catch (error) {
      return handleServiceError(error);
    }
  },

  cancelCommande: async (id) => {
    try {
      const response = await apiClient.delete(`/commande/delete/${id}`);
      return extractData(response);
    } catch (error) {
      return handleServiceError(error);
    }
  },

  proposerVente: async (data) => {
    try {
      const response = await apiClient.post('/proposition-vente', data);
      return extractData(response);
    } catch (error) {
      return handleServiceError(error);
    }
  },

  getMesPropositions: async () => {
    try {
      const response = await apiClient.get('/proposition-vente');
      return extractData(response);
    } catch (error) {
      return handleServiceError(error);
    }
  },

  createPaymentSession: async (commandeId) => {
    try {
      const response = await apiClient.post(`/api/payment/checkout/${commandeId}`);
      return extractData(response);
    } catch (error) {
      return handleServiceError(error);
    }
  },

  getPanier: async () => {
    try {
      const response = await apiClient.get('/commande/panier');
      return extractData(response);
    } catch (error) {
      return handleServiceError(error);
    }
  },

  updateQuantiteLigne: async (ligneId, quantite) => {
    try {
      const response = await apiClient.patch(`/commande/updateQuantite/ligne/${ligneId}`, { quantite });
      return extractData(response);
    } catch (error) {
      return handleServiceError(error);
    }
  },

  supprimerLignePanier: async (ligneId) => {
    try {
      const response = await apiClient.delete(`/commande/delete/ligne/${ligneId}`);
      return extractData(response);
    } catch (error) {
      return handleServiceError(error);
    }
  },

  viderPanier: async () => {
    try {
      const response = await apiClient.delete('/ligneCommande/panier/vider');
      return extractData(response);
    } catch (error) {
      return handleServiceError(error);
    }
  },
};

export default commandeService;
