/**
 * — Service d'authentification
 * - Gestion des tokens et login.
 * - Le token est stocké dans un cookie HTTP-Only par le backend
 */

import apiClient from "../config/api.js";
import { sanitizeObject } from "../utils/helpers";
import { navigate } from "../utils/navigate.js";
import storage from "../utils/storage.js";
import { extractData } from "./httpHelper";
import TokenService from "./token.service.js";

// Service d'authentification et gestion des utilisateurs
const authService = {
  // Authentifie l'utilisateur et stocke le token si présent.
  login: async (email, password) => {
    try {
      // Appel API de login avec email et mot de passe
      const response = await apiClient.post("/user/login", { email, password });
      const data = extractData(response) || {};
      if (data.token) {
        // Stocke le token dans le service de gestion des tokens
        TokenService.setToken(data.token);
        // si le backend retourne également un refresh token
        if (data.refreshToken) TokenService.setRefreshToken(data.refreshToken);
        // Cache temporaire pour la session (optionnel)
        if (data.user) {
          storage.set("user", sanitizeObject(data.user));
        }
      }
      return data;
    } catch (error) {
      throw error?.response?.data || error;
    }
  },

  // Enregistre un nouvel utilisateur et stocke le token retourné.
  register: async (userData) => {
    try {
      // Appel API d'enregistrement avec les données utilisateur
      const response = await apiClient.post("/user/register", userData);
      // Extraction des données de la réponse
      const data = extractData(response) || {};
      if (data.token) {
        // Stocke le token dans le service de gestion des tokens
        TokenService.setToken(data.token);
        if (data.refreshToken) TokenService.setRefreshToken(data.refreshToken);
        // Cache temporaire pour la session (optionnel)
        if (data.user) {
          storage.set("user", sanitizeObject(data.user));
        }
      }
      return data;
    } catch (error) {
      throw error?.response?.data || error;
    }
  },

  // Déconnecte l'utilisateur : supprime le token et redirige.
  logout: () => {
    TokenService.clear();
    storage.remove("user");
    navigate("/login", { replace: true });
  },

  // Récupère le profil d'un utilisateur par ID et le met en cache local.
  getProfile: async (userId) => {
    try {
      // Appel API pour récupérer le profil utilisateur par ID
      const response = await apiClient.get(`/user/profile/${userId}`);
      const data = extractData(response) || {};
      if (data.user) {
        storage.set("user", sanitizeObject(data.user));
      }
      return data;
    } catch (error) {
      throw error?.response?.data || error;
    }
  },

  // Met à jour le profil de l'utilisateur et met à jour le cache local.
  updateProfile: async (userId, userData) => {
    try {
      // Appel API pour mettre à jour le profil utilisateur par ID
      const response = await apiClient.put(`/user/update/${userId}`, userData);
      const data = extractData(response);
      if (data) {
        storage.set("user", sanitizeObject(data));
      }
      return data;
    } catch (error) {
      throw error?.response?.data || error;
    }
  },

  // Retourne l'utilisateur courant depuis le stockage local (s'il existe).
  getCurrentUser: () => {
    return storage.get("user");
  },

  // Indique si un token est présent (utilisateur connecté).
  isAuthenticated: () => !!TokenService.getToken(),

  // Retourne le token en mémoire/session.
  getToken: () => TokenService.getToken(),

  // Vérifie si l'utilisateur courant a un rôle précis.
  hasRole: (role) => {
    const user = authService.getCurrentUser();
    return user?.role === role;
  },
};

export default authService;
