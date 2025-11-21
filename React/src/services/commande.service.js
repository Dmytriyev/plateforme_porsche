import apiClient from "../config/api.js";
import { apiRequest } from "./httpHelper";

const commandeService = {
  createReservation: (data) =>
    apiRequest(() => apiClient.post("/reservation/new", data)),

  getMyReservations: (userId) => {
    if (!userId) throw new Error("ID utilisateur requis");
    return apiRequest(() => apiClient.get(`/reservation/user/${userId}`));
  },

  getAllReservations: () => apiRequest(() => apiClient.get("/reservation/all")),

  cancelReservation: (id) =>
    apiRequest(() => apiClient.delete(`/reservation/delete/${id}`)),

  createCommande: (data) =>
    apiRequest(() => apiClient.post("/commande/new", data)),

  getMyCommandes: () => apiRequest(() => apiClient.get("/commande/historique")),

  getCommandeById: (id) => apiRequest(() => apiClient.get(`/commande/${id}`)),

  cancelCommande: (id) =>
    apiRequest(() => apiClient.delete(`/commande/delete/${id}`)),

  proposerVente: (data) =>
    apiRequest(() => apiClient.post("/proposition-vente", data)),

  getMesPropositions: () =>
    apiRequest(() => apiClient.get("/proposition-vente")),

  createPaymentSession: (commandeId) =>
    apiRequest(() => apiClient.post(`/api/payment/checkout/${commandeId}`)),

  getPanier: () => apiRequest(() => apiClient.get("/commande/panier")),

  updateQuantiteLigne: (ligneId, quantite) =>
    apiRequest(() =>
      apiClient.patch(`/commande/updateQuantite/ligne/${ligneId}`, { quantite })
    ),

  supprimerLignePanier: (ligneId) =>
    apiRequest(() => apiClient.delete(`/commande/delete/ligne/${ligneId}`)),

  viderPanier: () =>
    apiRequest(() => apiClient.delete("/ligneCommande/panier/vider")),

  ajouterConfigurationAuPanier: (modelPorscheId, quantite = 1) =>
    apiRequest(() =>
      apiClient.post("/commande/ajouterConfiguration", {
        model_porsche_id: modelPorscheId,
        quantite,
      })
    ),
};

export default commandeService;
