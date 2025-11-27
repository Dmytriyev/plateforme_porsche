/**
 *  — Gestion du profil utilisateur côté client
 *  - Centralise la lecture/mise à jour du profil.
 */

import apiClient from "../config/api.js";
import { sanitizeObject } from "../utils/helpers";
import { apiRequest } from "./httpHelper";

// Service pour les opérations liées aux utilisateurs
const userService = {
  // Récupère le profil de l'utilisateur connecté.
  getCurrentUser: async () => {
    return apiRequest(() => apiClient.get("/user/profile"));
  },

  // Met à jour le profil courant et renvoie l'objet nettoyé.
  updateProfile: async (userData) => {
    const response = await apiRequest(() =>
      apiClient.patch("/user/profile", userData)
    );

    return response ? sanitizeObject(response) : null;
  },

  // Supprime le compte de l'utilisateur connecté.
  deleteAccount: async () => {
    return apiRequest(() => apiClient.delete("/user/profile"));
  },
};

export default userService;
