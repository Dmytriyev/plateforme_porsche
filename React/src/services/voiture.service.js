/**
 * - Centralise les appels API (CRUD) pour les voitures.
 * - Les services rendent les composants plus simples et faciles à tester.
 * - Utiliser `apiRequest` permet de normaliser les erreurs et les formats de réponse.
 */

import apiClient from "../config/api.js";
import { apiRequest } from "./httpHelper";

// Service pour les opérations liées aux voitures
const voitureService = {
  // Récupère toutes les voitures (tableau).
  getAllVoitures: () =>
    apiRequest(() => apiClient.get("/voiture/all"), { returnArray: true }),

  // Récupère les détails d'une voiture par son ID.
  getVoitureById: (id) =>
    apiRequest(() => apiClient.get(`/voiture/${id}`), {
      ignoreErrors: [404],
      defaultValue: null,
    }),
  // Récupère la liste des voitures neuves.
  getVoituresNeuves: () =>
    apiRequest(() => apiClient.get("/voiture/neuve"), {
      returnArray: true,
      ignoreErrors: [500, 502, 503],
      defaultValue: [],
    }),
  // Récupère la liste des voitures d'occasion, optionnellement filtrée par modèle.
  getVoituresOccasion: (modele = null) => {
    const url = modele
      ? `/voiture/occasion?modele=${encodeURIComponent(modele)}`
      : "/voiture/occasion";
    return apiRequest(() => apiClient.get(url), {
      returnArray: true,
      ignoreErrors: [404, 500],
      defaultValue: [],
    });
  },
  // Récupère la page dédiée d'une voiture (détails enrichis).
  getVoiturePage: (id) =>
    apiRequest(() => apiClient.get(`/voiture/page/${id}`)),

  // Crée une nouvelle voiture.
  createVoiture: (data) =>
    apiRequest(() => apiClient.post("/voiture/new", data)),

  // Met à jour une voiture existante.
  updateVoiture: (id, data) =>
    apiRequest(() => apiClient.put(`/voiture/update/${id}`, data)),

  // Supprime une voiture par ID.
  deleteVoiture: (id) =>
    apiRequest(() => apiClient.delete(`/voiture/delete/${id}`)),
};

export default voitureService;
