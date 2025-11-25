/**
 * config/api.js — Client HTTP centralisé (axios)
 *
 * - `API_URL` est lu depuis les variables d'environnement Vite (ex: VITE_BACKEND_URL).
 * - Utiliser `baseURL` permet d'appeler l'API avec des chemins relatifs (ex: `/voiture/all`).
 * - `withCredentials: true` permet d'envoyer les cookies si l'API utilise des sessions.
 * - Les interceptors ajoutent automatiquement le token Authorization et gèrent 401.
 */

import axios from "axios";
import TokenService from "../services/token.service.js";
import { navigate } from "../utils/navigate.js";
import notify from "../utils/notify.js";

export const API_URL =
  import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_URL || "";

const apiClient = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
  withCredentials: true,
});

// client sans interceptors pour rafraîchir le token
const refreshClient = axios.create({ baseURL: API_URL, withCredentials: true });

apiClient.interceptors.request.use(
  (config) => {
    const token = TokenService.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);
// Refresh token mechanism
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh/redirect for requests that included an Authorization header
    const sentAuthHeader = !!(
      originalRequest?.headers &&
      (originalRequest.headers.Authorization ||
        originalRequest.headers.authorization)
    );

    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      sentAuthHeader
    ) {
      originalRequest._retry = true;

      const refreshToken = TokenService.getRefreshToken();

      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        // If we have a refresh token stored (JS), send it in the body.
        // Otherwise attempt cookie-based refresh (http-only cookie) by calling without body.
        const resp = refreshToken
          ? await refreshClient.post("/auth/refresh", { refreshToken })
          : await refreshClient.post("/auth/refresh");
        const newToken = resp?.data?.accessToken || resp?.data?.token;
        const newRefresh = resp?.data?.refreshToken;

        if (!newToken)
          throw new Error("No new access token from refresh endpoint");

        TokenService.setToken(newToken);
        if (newRefresh) TokenService.setRefreshToken(newRefresh);

        processQueue(null, newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (err) {
        processQueue(err, null);
        TokenService.clear();
        notify.show("La session a expiré, vous avez été déconnecté.");
        navigate("/login", { replace: true });
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
