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

  acceptReservation: (id) =>
    apiRequest(() => apiClient.patch(`/reservation/${id}/accepter`)),

  refuseReservation: (id) =>
    apiRequest(() => apiClient.patch(`/reservation/${id}/refuser`)),

  createCommande: (data) =>
    apiRequest(() => apiClient.post("/commande/new", data)),

  getMyCommandes: () => apiRequest(() => apiClient.get("/commande/historique")),

  getAllCommandes: () => apiRequest(() => apiClient.get("/commande/all")),

  getCommandeById: (id) => apiRequest(() => apiClient.get(`/commande/${id}`)),

  cancelCommande: (id) =>
    apiRequest(() => apiClient.delete(`/commande/delete/${id}`)),

  proposerVente: (data) =>
    apiRequest(() => apiClient.post("/proposition-vente", data)),

  getMesPropositions: () =>
    apiRequest(() => apiClient.get("/proposition-vente")),

  createPaymentSession: (commandeId) =>
    apiRequest(() => apiClient.post(`/api/payment/checkout/${commandeId}`)),

  getPanier: () => apiRequest(() => apiClient.get("/api/panier")),

  updateQuantiteLigne: (ligneId, quantite) =>
    apiRequest(() =>
      apiClient.patch(`/api/panier/ligne/${ligneId}/quantite`, { quantite })
    ),

  supprimerLignePanier: (ligneId) =>
    apiRequest(() => apiClient.delete(`/api/panier/ligne/${ligneId}`)),

  viderPanier: () =>
    apiRequest(() => apiClient.delete("/ligneCommande/panier/vider")),

  ajouterVoitureNeuveAuPanier: (modelPorscheId) =>
    apiRequest(() =>
      apiClient.post("/api/panier/voiture-neuve", {
        model_porsche_id: modelPorscheId,
      })
    ),

  ajouterAccessoireAuPanier: (accessoireId, quantite = 1) =>
    apiRequest(() =>
      apiClient.post("/api/panier/accessoire", {
        accesoire_id: accessoireId,
        quantite,
      })
    ),
};

export default commandeService;
