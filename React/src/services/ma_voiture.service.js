// voiture porsche actuel service
/**
 * Ajoute une nouvelle voiture Porsche cette opération nécessite un token d'authentification (utilisateur connecté).
 * Le `apiClient` ajoute automatiquement l'en-tête `Authorization` si un token est présent.
 */
import apiClient from "../config/api.js";
import { apiRequest } from "./httpHelper";

// Service pour gérer les voitures Porsche actuelles de l'utilisateur
const maVoitureService = {
  // Récupère les voitures de l'utilisateur connecté (tableau).
  getMesVoitures: () =>
    apiRequest(() => apiClient.get("/model_porsche_actuel/user/mesPorsches"), {
      returnArray: true,
      defaultValue: [],
    }),

  // Récupère une voiture actuelle par ID.
  getMaVoitureById: (id) =>
    apiRequest(() => apiClient.get(`/model_porsche_actuel/${id}`)),

  // Crée une nouvelle voiture pour l'utilisateur (requiert token).
  ajouterMaVoiture: (data) =>
    apiRequest(() => apiClient.post("/model_porsche_actuel/new", data)),

  // Met à jour une voiture par ID.
  updateMaVoiture: (id, data) =>
    apiRequest(() => apiClient.put(`/model_porsche_actuel/update/${id}`, data)),

  // Supprime une voiture de l'utilisateur par ID.
  supprimerMaVoiture: (id) =>
    apiRequest(() => apiClient.delete(`/model_porsche_actuel/delete/${id}`)),

  // Upload d'une photo pour une voiture actuelle (multipart/form-data).
  ajouterPhoto: (formData) =>
    apiRequest(() =>
      apiClient.post("/photo-voiture-actuel/new", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    ),

  // Supprime une photo par son ID.
  supprimerPhoto: (id) =>
    apiRequest(() => apiClient.delete(`/photo-voiture-actuel/delete/${id}`)),

  // Supprime plusieurs photos associées à une voiture.
  supprimerPhotos: (id, data) =>
    apiRequest(() =>
      apiClient.patch(`/model_porsche_actuel/removeImages/${id}`, data)
    ),
};

export default maVoitureService;
