/**
 * services/voiture.service.js — Client HTTP pour le catalogue de voitures
 *
 * - Centralise les appels API pour les voitures (liste, détails, CRUD).
 * - Les services rendent les composants plus simples et faciles à tester.
 * - Utiliser `apiRequest` permet de normaliser les erreurs et les formats de réponse.
 */

import apiClient from "../config/api.js";
import { apiRequest } from "./httpHelper";

const voitureService = {
  getAllVoitures: () =>
    apiRequest(() => apiClient.get("/voiture/all"), { returnArray: true }),

  getVoitureById: (id) =>
    apiRequest(() => apiClient.get(`/voiture/${id}`), {
      ignoreErrors: [404],
      defaultValue: null,
    }),

  getVoituresNeuves: () =>
    apiRequest(() => apiClient.get("/voiture/neuve"), {
      returnArray: true,
      ignoreErrors: [500, 502, 503],
      defaultValue: [],
    }),

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

  getVoiturePage: (id) =>
    apiRequest(() => apiClient.get(`/voiture/page/${id}`)),

  createVoiture: (data) =>
    apiRequest(() => apiClient.post("/voiture/new", data)),

  updateVoiture: (id, data) =>
    apiRequest(() => apiClient.put(`/voiture/update/${id}`, data)),

  deleteVoiture: (id) =>
    apiRequest(() => apiClient.delete(`/voiture/delete/${id}`)),
};

export default voitureService;
