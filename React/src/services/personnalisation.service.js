/**
 * — Service de personnalisation
 * - Gestion des préférences utilisateur pour les options de voiture.
 */

import apiClient from "../config/api.js";
import { apiRequest } from "./httpHelper";

// Personnalisation Service - Gestion des préférences utilisateur
const personnalisationService = {
  // Liste des couleurs extérieures.
  getCouleursExterieur: () =>
    apiRequest(() => apiClient.get("/couleur_exterieur/all"), {
      returnArray: true,
    }),

  // Détails d'une couleur extérieure par ID.
  getCouleurExterieurById: (id) =>
    apiRequest(() => apiClient.get(`/couleur_exterieur/${id}`)),

  // Liste des couleurs intérieures.
  getCouleursInterieur: () =>
    apiRequest(() => apiClient.get("/couleur_interieur/all"), {
      returnArray: true,
    }),

  // Détails d'une couleur intérieure par ID.
  getCouleurInterieurById: (id) =>
    apiRequest(() => apiClient.get(`/couleur_interieur/${id}`)),

  // Liste des tailles de jantes disponibles.
  getJantes: () =>
    apiRequest(() => apiClient.get("/taille_jante/all"), { returnArray: true }),

  // Détails d'une taille de jante par ID.
  getTailleJanteById: (id) =>
    apiRequest(() => apiClient.get(`/taille_jante/${id}`)),

  // Liste des sièges disponibles.
  getSieges: () =>
    apiRequest(() => apiClient.get("/siege/all"), { returnArray: true }),

  // Détails d'un siège par ID.
  getSiegeById: (id) => apiRequest(() => apiClient.get(`/siege/${id}`)),

  // Liste des packages.
  getPackages: () =>
    apiRequest(() => apiClient.get("/package/all"), { returnArray: true }),

  // Détails d'un package par ID.
  getPackageById: (id) => apiRequest(() => apiClient.get(`/package/${id}`)),
};

export default personnalisationService;
