/**
 * services/auth.service.js — Authentification client (login / register / profile)
 *
 * Notes pédagogiques :
 * - Gère stockage local du token (via `TokenService`) et mise à jour du profil en `localStorage`.
 * - Côté étudiant : garder la logique réseau dans un service rend le code des composants plus simple.
 * - Attention : stocker des informations sensibles côté client doit rester limité ; le serveur
 *   est l'autorité pour l'authentification.
 */

import apiClient from "../config/api.js";
import { extractData } from "./httpHelper";
import TokenService from "./token.service.js";
import { sanitizeObject } from "../utils/helpers";

const authService = {
  login: async (email, password) => {
    try {
      const response = await apiClient.post("/user/login", { email, password });
      const data = extractData(response) || {};
      if (data.token) {
        TokenService.setToken(data.token);
        if (data.user) {
          localStorage.setItem(
            "user",
            JSON.stringify(sanitizeObject(data.user))
          );
        }
      }
      return data;
    } catch (error) {
      throw error?.response?.data || error;
    }
  },

  register: async (userData) => {
    try {
      const response = await apiClient.post("/user/register", userData);
      const data = extractData(response) || {};
      if (data.token) {
        TokenService.setToken(data.token);
        if (data.user) {
          localStorage.setItem(
            "user",
            JSON.stringify(sanitizeObject(data.user))
          );
        }
      }
      return data;
    } catch (error) {
      throw error?.response?.data || error;
    }
  },

  logout: () => {
    TokenService.clear();
    localStorage.removeItem("user");
    window.location.href = "/login";
  },

  getProfile: async (userId) => {
    try {
      const response = await apiClient.get(`/user/profile/${userId}`);
      const data = extractData(response) || {};
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(sanitizeObject(data.user)));
      }
      return data;
    } catch (error) {
      throw error?.response?.data || error;
    }
  },

  updateProfile: async (userId, userData) => {
    try {
      const response = await apiClient.put(`/user/update/${userId}`, userData);
      const data = extractData(response);
      if (data) {
        localStorage.setItem("user", JSON.stringify(sanitizeObject(data)));
      }
      return data;
    } catch (error) {
      throw error?.response?.data || error;
    }
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },

  isAuthenticated: () => !!TokenService.getToken(),

  getToken: () => TokenService.getToken(),

  hasRole: (role) => {
    const user = authService.getCurrentUser();
    return user?.role === role;
  },
};

export default authService;
