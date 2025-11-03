/**
 * Client API réutilisable
 * Principe: Single Responsibility - Gestion des appels HTTP uniquement
 * Principe: Open/Closed - Extensible sans modification
 */

import fetch from "node-fetch";
import { config } from "../setup/config.js";
import { extractData, retryWithBackoff } from "../setup/helpers.js";

/**
 * Classe APIClient - Client HTTP centralisé pour les tests
 */
class APIClient {
  constructor(baseUrl = config.api.baseUrl) {
    this.baseUrl = baseUrl;
    this.adminToken = null;
    this.userToken = null;
    this.timeout = config.api.timeout;
  }

  /**
   * Définit le token admin
   */
  setAdminToken(token) {
    this.adminToken = token;
  }

  /**
   * Définit le token user
   */
  setUserToken(token) {
    this.userToken = token;
  }

  /**
   * Réinitialise tous les tokens
   */
  clearTokens() {
    this.adminToken = null;
    this.userToken = null;
  }

  /**
   * Construit les headers de la requête
   */
  _buildHeaders(options = {}) {
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    // Ajouter le token approprié
    if (options.useAdminToken && this.adminToken) {
      headers.Authorization = `Bearer ${this.adminToken}`;
    } else if (options.useUserToken && this.userToken) {
      headers.Authorization = `Bearer ${this.userToken}`;
    } else if (options.token) {
      headers.Authorization = `Bearer ${options.token}`;
    }

    return headers;
  }

  /**
   * Effectue une requête HTTP avec gestion des erreurs
   *
   * @param {string} endpoint - Endpoint de l'API
   * @param {Object} options - Options de la requête
   * @returns {Promise<Object>} Réponse de l'API
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = this._buildHeaders(options);

    const requestOptions = {
      method: options.method || "GET",
      headers,
      ...options.fetchOptions,
    };

    // Ajouter le body si présent
    if (options.body) {
      requestOptions.body =
        typeof options.body === "string"
          ? options.body
          : JSON.stringify(options.body);
    }

    try {
      const response = await fetch(url, requestOptions);

      // Gérer le contenu de la réponse
      let data;
      const contentType = response.headers.get("content-type");

      if (contentType && contentType.includes("application/json")) {
        data = await response.json();
      } else {
        data = await response.text();
      }

      // Si la réponse n'est pas OK, lancer une erreur
      if (!response.ok) {
        const error = new Error(
          `HTTP ${response.status}: ${JSON.stringify(data)}`
        );
        error.status = response.status;
        error.response = data;
        throw error;
      }

      return {
        status: response.status,
        data,
        headers: response.headers,
      };
    } catch (error) {
      // Enrichir l'erreur avec des informations contextuelles
      error.endpoint = endpoint;
      error.method = requestOptions.method;
      throw error;
    }
  }

  /**
   * Effectue une requête avec retry automatique
   */
  async requestWithRetry(endpoint, options = {}) {
    return retryWithBackoff(
      () => this.request(endpoint, options),
      config.test.retryAttempts,
      config.test.retryDelay
    );
  }

  // ============================================================================
  // Méthodes HTTP de base
  // ============================================================================

  /**
   * GET request
   */
  async get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: "GET" });
  }

  /**
   * POST request
   */
  async post(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: "POST", body });
  }

  /**
   * PUT request
   */
  async put(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: "PUT", body });
  }

  /**
   * PATCH request
   */
  async patch(endpoint, body, options = {}) {
    return this.request(endpoint, { ...options, method: "PATCH", body });
  }

  /**
   * DELETE request
   */
  async delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: "DELETE" });
  }

  // ============================================================================
  // Méthodes spécifiques à l'API Porsche
  // ============================================================================

  /**
   * Authentification - Login
   */
  async login(credentials, isAdmin = false) {
    const response = await this.post("/user/login", credentials);
    const token = response.data.token;

    if (isAdmin) {
      this.setAdminToken(token);
    } else {
      this.setUserToken(token);
    }

    return response;
  }

  /**
   * Authentification - Register
   */
  async register(userData) {
    const response = await this.post("/user/register", userData);
    const token = response.data.token;
    this.setUserToken(token);
    return response;
  }

  /**
   * Couleurs Extérieur
   */
  async createCouleurExterieur(data) {
    return this.post("/couleur_exterieur/new", data, { useAdminToken: true });
  }

  async getCouleurExterieur(id) {
    return this.get(`/couleur_exterieur/${id}`);
  }

  async getAllCouleursExterieur() {
    return this.get("/couleur_exterieur/all");
  }

  async updateCouleurExterieur(id, data) {
    return this.put(`/couleur_exterieur/${id}`, data, { useAdminToken: true });
  }

  async deleteCouleurExterieur(id) {
    return this.delete(`/couleur_exterieur/${id}`, { useAdminToken: true });
  }

  /**
   * Couleurs Intérieur
   */
  async createCouleurInterieur(data) {
    return this.post("/couleur_interieur/new", data, { useAdminToken: true });
  }

  async getAllCouleursInterieur() {
    return this.get("/couleur_interieur/all");
  }

  async updateCouleurInterieur(id, data) {
    return this.put(`/couleur_interieur/${id}`, data, { useAdminToken: true });
  }

  async deleteCouleurInterieur(id) {
    return this.delete(`/couleur_interieur/${id}`, { useAdminToken: true });
  }

  /**
   * Couleurs Accessoire
   */
  async createCouleurAccessoire(data) {
    return this.post("/couleur_accesoire/new", data, { useAdminToken: true });
  }

  async getAllCouleursAccessoire() {
    return this.get("/couleur_accesoire/all");
  }

  async deleteCouleurAccessoire(id) {
    return this.delete(`/couleur_accesoire/${id}`, { useAdminToken: true });
  }

  /**
   * Tailles de Jantes
   */
  async createTailleJante(data) {
    return this.post("/taille_jante/new", data, { useAdminToken: true });
  }

  async getAllTaillesJantes() {
    return this.get("/taille_jante/all");
  }

  async updateTailleJante(id, data) {
    return this.put(`/taille_jante/${id}`, data, { useAdminToken: true });
  }

  async deleteTailleJante(id) {
    return this.delete(`/taille_jante/${id}`, { useAdminToken: true });
  }

  /**
   * Voitures
   */
  async createVoiture(data) {
    return this.post("/voiture/new", data, { useAdminToken: true });
  }

  async getVoiture(id) {
    return this.get(`/voiture/${id}`);
  }

  async getAllVoitures() {
    return this.get("/voiture/all");
  }

  async updateVoiture(id, data) {
    return this.put(`/voiture/${id}`, data, { useAdminToken: true });
  }

  async deleteVoiture(id) {
    return this.delete(`/voiture/${id}`, { useAdminToken: true });
  }

  /**
   * Model Porsche (Admin)
   */
  async createModelPorsche(data) {
    return this.post("/model_porsche/new", data, { useAdminToken: true });
  }

  async getModelPorsche(id) {
    return this.get(`/model_porsche/${id}`);
  }

  async updateModelPorsche(id, data) {
    return this.put(`/model_porsche/${id}`, data, { useAdminToken: true });
  }

  async deleteModelPorsche(id) {
    return this.delete(`/model_porsche/${id}`, { useAdminToken: true });
  }

  /**
   * Model Porsche Actuel (User - voiture personnelle)
   */
  async createModelPorscheActuel(data) {
    return this.post("/model_porsche_actuel/new", data, { useUserToken: true });
  }

  async getMesPorsches() {
    return this.get("/model_porsche_actuel/user/mes-porsches", {
      useUserToken: true,
    });
  }

  async updateModelPorscheActuel(id, data) {
    return this.put(`/model_porsche_actuel/${id}`, data, {
      useUserToken: true,
    });
  }

  async deleteModelPorscheActuel(id) {
    return this.delete(`/model_porsche_actuel/${id}`, { useUserToken: true });
  }

  /**
   * Accessoires
   */
  async createAccessoire(data) {
    return this.post("/accesoire/new", data, { useAdminToken: true });
  }

  async getAllAccessoires() {
    return this.get("/accesoire/all");
  }

  async updateAccessoire(id, data) {
    return this.put(`/accesoire/${id}`, data, { useAdminToken: true });
  }

  async deleteAccessoire(id) {
    return this.delete(`/accesoire/${id}`, { useAdminToken: true });
  }

  /**
   * Réservations
   */
  async createReservation(userId, data) {
    return this.post(`/user/${userId}/reservations`, data, {
      useUserToken: true,
    });
  }

  async getUserReservations(userId) {
    return this.get(`/user/${userId}/reservations`, { useUserToken: true });
  }

  async cancelReservation(userId, reservationId) {
    return this.put(
      `/user/${userId}/reservations/${reservationId}/cancel`,
      {},
      { useUserToken: true }
    );
  }

  async checkDisponibilite(voitureId, date) {
    return this.get(`/reservation/disponibilite/${voitureId}?date=${date}`);
  }

  /**
   * Commandes et Panier
   */
  async getOrCreatePanier() {
    return this.get("/commande/panier/get-or-create", { useUserToken: true });
  }

  async getPanier() {
    return this.get("/commande/panier", { useUserToken: true });
  }

  async getHistoriqueCommandes() {
    return this.get("/commande/historique", { useUserToken: true });
  }

  /**
   * Lignes de Commande
   */
  async addLigneCommande(data) {
    return this.post("/ligneCommande/new", data, { useUserToken: true });
  }

  async getPanierLignes() {
    return this.get("/ligneCommande/panier", { useUserToken: true });
  }

  async updateLigneCommande(id, data) {
    return this.put(`/ligneCommande/${id}`, data, { useUserToken: true });
  }

  async deleteLigneCommande(id) {
    return this.delete(`/ligneCommande/${id}`, { useUserToken: true });
  }

  async viderPanier() {
    return this.delete("/ligneCommande/panier/vider", { useUserToken: true });
  }

  /**
   * Profil Utilisateur
   */
  async getUserProfile(userId) {
    return this.get(`/user/${userId}/profile`, { useUserToken: true });
  }

  async updateUserProfile(userId, data) {
    return this.put(`/user/${userId}/profile`, data, { useUserToken: true });
  }

  async getUserDashboard(userId) {
    return this.get(`/user/${userId}/dashboard`, { useUserToken: true });
  }
}

// Export singleton instance
export const apiClient = new APIClient();

// Export class pour créer des instances personnalisées si nécessaire
export default APIClient;
