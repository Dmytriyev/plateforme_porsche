/**
 * services/accesoire.service.js — Endpoints pour accessoire (CRUD, upload images).
 *
 * @file services/accesoire.service.js
 */

import apiClient from "../config/api.js";
import { apiRequest } from "./httpHelper";

const accesoireService = {
  // Récupère tous les accessoires (tableau). Retourne tableau ou valeur par défaut.
  getAllAccessoires: () =>
    apiRequest(() => apiClient.get("/accesoire/all"), {
      returnArray: true,
      ignoreErrors: [404, 500],
      defaultValue: [],
    }),

  // Récupère un accessoire par ID.
  getAccessoireById: (id) =>
    apiRequest(() => apiClient.get(`/accesoire/${id}`)),

  // Recherche les accessoires par type (renvoie un tableau).
  getAccessoiresByType: (type) =>
    apiRequest(
      () =>
        apiClient.get(
          `/accesoire/search?type_accesoire=${encodeURIComponent(type)}`
        ),
      { returnArray: true }
    ),

  // Récupère la liste des types d'accessoires disponibles.
  getAvailableTypes: () =>
    apiRequest(() => apiClient.get("/accesoire/types"), {
      returnArray: true,
      defaultValue: [],
    }),

  // Recherche avancée d'accessoires avec paramètres de requête.
  searchAccessoires: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(() => apiClient.get(`/accesoire/search?${queryString}`));
  },

  // Récupère toutes les couleurs d'accessoires.
  getCouleurs: () =>
    apiRequest(() => apiClient.get("/couleur_accesoire/all"), {
      returnArray: true,
    }),

  // Crée un nouvel accessoire.
  createAccessoire: (data) =>
    apiRequest(() => apiClient.post("/accesoire/new", data)),

  // Met à jour un accessoire existant par ID.
  updateAccessoire: (id, data) =>
    apiRequest(() => apiClient.put(`/accesoire/update/${id}`, data)),

  // Supprime un accessoire par ID.
  deleteAccessoire: (id) =>
    apiRequest(() => apiClient.delete(`/accesoire/delete/${id}`)),

  // Ajoute des images à un accessoire (liste d'IDs de photo).
  addImages: (id, photoIds) =>
    apiRequest(() =>
      apiClient.patch(`/accesoire/addImage/${id}`, {
        photo_accesoire: photoIds,
      })
    ),

  // Supprime des images d'un accessoire.
  removeImages: (id, photoIds) =>
    apiRequest(() =>
      apiClient.patch(`/accesoire/removeImages/${id}`, {
        photo_accesoire: photoIds,
      })
    ),

  // Associe une couleur à l'accessoire.
  setCouleur: (id, couleurId) =>
    apiRequest(() =>
      apiClient.patch(`/accesoire/addCouleur/${id}`, {
        couleur_accesoire: couleurId,
      })
    ),

  // Retire la couleur associée à un accessoire.
  removeCouleur: (id) =>
    apiRequest(() => apiClient.patch(`/accesoire/removeCouleur/${id}`)),
};

export default accesoireService;
