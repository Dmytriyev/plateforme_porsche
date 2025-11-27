/**
 * — Client HTTP pour les commandes & panier
 * - Ce service centralise tous les appels liés aux commandes, réservations et panier.
 * - Utiliser un service dédié facilite le test unitaire et la réutilisation dans les composants.
 * - `apiRequest` gère les erreurs et normalise les réponses (voir `httpHelper`).
 */

import apiClient from "../config/api.js";
import { apiRequest } from "./httpHelper";

// Service pour les opérations liées aux commandes et réservations
const commandeService = {
  // Crée une réservation.
  createReservation: (data) =>
    apiRequest(() => apiClient.post("/reservation/new", data)),

  // Récupère les réservations d'un utilisateur.
  getMyReservations: (userId) => {
    if (!userId) throw new Error("ID utilisateur requis");
    return apiRequest(() => apiClient.get(`/reservation/user/${userId}`));
  },

  // Récupère toutes les réservations (admin).
  getAllReservations: () => apiRequest(() => apiClient.get("/reservation/all")),

  // Annule une réservation par ID.
  cancelReservation: (id) =>
    apiRequest(() => apiClient.delete(`/reservation/delete/${id}`)),

  // Accepte une réservation.
  acceptReservation: (id) =>
    apiRequest(() => apiClient.patch(`/reservation/${id}/accepter`)),

  // Refuse une réservation.
  refuseReservation: (id) =>
    apiRequest(() => apiClient.patch(`/reservation/${id}/refuser`)),

  // Crée une commande.
  createCommande: (data) =>
    apiRequest(() => apiClient.post("/commande/new", data)),

  // Récupère l'historique des commandes de l'utilisateur.
  getMyCommandes: () => apiRequest(() => apiClient.get("/commande/historique")),

  // Récupère toutes les commandes (admin).
  getAllCommandes: () => apiRequest(() => apiClient.get("/commande/all")),

  // Récupère une commande par ID.
  getCommandeById: (id) => apiRequest(() => apiClient.get(`/commande/${id}`)),

  // Annule une commande par ID.
  cancelCommande: (id) =>
    apiRequest(() => apiClient.delete(`/commande/delete/${id}`)),

  // Propose une vente (proposition utilisateur).
  proposerVente: (data) =>
    apiRequest(() => apiClient.post("/proposition-vente", data)),

  // Récupère les propositions de vente de l'utilisateur.
  getMesPropositions: () =>
    apiRequest(() => apiClient.get("/proposition-vente")),

  // Démarre une session de paiement pour une commande.
  createPaymentSession: (commandeId) =>
    apiRequest(() => apiClient.post(`/api/payment/checkout/${commandeId}`)),

  // Récupère le panier actuel.
  getPanier: () => apiRequest(() => apiClient.get("/api/panier")),

  // Met à jour la quantité d'une ligne du panier.
  updateQuantiteLigne: (ligneId, quantite) =>
    apiRequest(() =>
      apiClient.patch(`/api/panier/ligne/${ligneId}/quantite`, { quantite })
    ),

  // Supprime une ligne du panier.
  supprimerLignePanier: (ligneId) =>
    apiRequest(() => apiClient.delete(`/api/panier/ligne/${ligneId}`)),

  // Vide le panier actuel.
  viderPanier: () =>
    apiRequest(() => apiClient.delete("/ligneCommande/panier/vider")),

  // Ajoute une voiture neuve au panier.
  ajouterVoitureNeuveAuPanier: (modelPorscheId) =>
    apiRequest(() =>
      apiClient.post("/api/panier/voiture-neuve", {
        model_porsche_id: modelPorscheId,
      })
    ),

  // Ajoute un accessoire au panier avec une quantité.
  ajouterAccessoireAuPanier: (accessoireId, quantite = 1) =>
    apiRequest(() =>
      apiClient.post("/api/panier/accessoire", {
        accesoire_id: accessoireId,
        quantite,
      })
    ),
};

export default commandeService;
