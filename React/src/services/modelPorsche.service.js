/**
 * — Services pour modèles Porsche et variantes
 * - Fournit des fonctions spécifiques (configurations, variantes, prix).
 * - Clé = voitureId -> { ts: number, data: any }
 * _ au début d'un nom est une convention qui signifie "usage interne / ne pas utiliser depuis l'extérieur"
 */

import apiClient from "../config/api.js";
import { apiRequest } from "./httpHelper";

// Cache simple en mémoire pour les configurations par voiture
const _configByVoitureCache = new Map();

// Service pour les modèles Porsche et variantes associées
const modelPorscheService = {
  // Modèles Porsche CRUD et fonctions associées
  getAllModels: () =>
    apiRequest(() => apiClient.get("/model_porsche/all"), {
      returnArray: true,
    }),

  // Récupérer un modèle Porsche par son ID
  getModelById: (id) => apiRequest(() => apiClient.get(`/model_porsche/${id}`)),

  // Récupérer les modèles Porsche neufs
  getModelesNeufs: () =>
    apiRequest(() => apiClient.get("/model_porsche/neuves"), {
      returnArray: true,
    }),

  // Récupérer les modèles Porsche d'occasion
  getModelesOccasion: () =>
    apiRequest(() => apiClient.get("/model_porsche/occasions"), {
      returnArray: true,
    }),

  // Variantes des modèles Porsche
  getAllVariantes: () =>
    apiRequest(() => apiClient.get("/model_porsche/variantes")),

  // Récupérer les variantes par nom de modèle
  getVariantesByModel: (nomModel) =>
    apiRequest(() => apiClient.get(`/model_porsche/variantes/${nomModel}`)),

  // Récupérer toutes les carrosseries
  getAllCarrosseries: () =>
    apiRequest(() => apiClient.get("/model_porsche/carrosseries")),

  // Récupérer les configurations par voiture avec cache simple
  getConfigurationsByVoiture: async (
    voitureId,
    // Option pour forcer le rafraîchissement
    { forceRefresh = false } = {}
  ) => {
    // Cache TTL (Time To Live)
    const TTL = 5000; // 5s
    // Vérifier le cache avant de faire la requête
    if (!forceRefresh) {
      // Vérifier si dans le cache et pas expiré
      const cached = _configByVoitureCache.get(voitureId);
      // Si trouvé et pas expiré, retourner le cache
      if (cached && Date.now() - cached.ts < TTL) {
        return cached.data;
      }
    }

    // Faire la requête API si pas dans le cache ou forcé
    const result = await apiRequest(
      // Requête pour obtenir les configurations par voiture
      () => apiClient.get(`/model_porsche/voiture/${voitureId}`),
      {
        returnArray: true,
        defaultValue: [],
      }
    );

    // Mettre en cache le résultat
    try {
      // Mettre en cache avec timestamp actuel
      _configByVoitureCache.set(voitureId, { ts: Date.now(), data: result });
      // purge automatique au bout de twice TTL pour éviter mémoire trop grande
      setTimeout(() => _configByVoitureCache.delete(voitureId), TTL * 2);
    } catch (e) {}

    return result;
  },

  // Calculer le prix total d'un modèle Porsche par son ID
  calculatePrixTotal: (modelId) =>
    apiRequest(() => apiClient.get(`/model_porsche/prixTotal/${modelId}`)),

  // Récupérer la page d'une variante par son ID
  getVariantePage: (id) =>
    apiRequest(() => apiClient.get(`/model_porsche/page/${id}`), {
      defaultValue: null,
    }),

  // Récupérer la page d'une voiture d'occasion par son ID
  getOccasionPage: async (id) => {
    try {
      // Faire la requête API pour la page d'une voiture d'occasion
      return await apiRequest(() =>
        apiClient.get(`/model_porsche/occasion/page/${id}`)
      );
    } catch (error) {
      // Gestion des erreurs spécifiques pour la page d'une voiture d'occasion
      const status = error?.status;
      // Si 404 ou 400, lancer une erreur spécifique
      if (status === 404 || status === 400) {
        const notFoundError = new Error("Voiture d'occasion introuvable");
        // Marquer comme une erreur attendue
        notFoundError.isExpected = true;
        throw notFoundError;
      }
      throw error;
    }
  },

  // Créer un nouveau modèle Porsche
  createModelPorsche: (data) =>
    apiRequest(() => apiClient.post("/model_porsche/new", data)),

  // Mettre à jour un modèle Porsche existant
  updateModelPorsche: (id, data) =>
    apiRequest(() => apiClient.patch(`/model_porsche/update/${id}`, data)),

  // Supprimer un modèle Porsche par son ID
  deleteModelPorsche: (id) =>
    apiRequest(() => apiClient.delete(`/model_porsche/delete/${id}`)),

  // Ajouter des photos à un modèle Porsche
  ajouterPhotos: (id, formData) =>
    apiRequest(() =>
      apiClient.patch(`/model_porsche/addImages/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    ),

  // Supprimer des photos d'un modèle Porsche
  supprimerPhotos: (id, data) =>
    apiRequest(() =>
      apiClient.patch(`/model_porsche/removeImages/${id}`, data)
    ),

  // Ajouter une couleur extérieure à un modèle Porsche
  addCouleurExterieur: (id, data) =>
    apiRequest(() =>
      apiClient.patch(`/model_porsche/addCouleurExterieur/${id}`, data)
    ),

  // Supprimer une couleur extérieure d'un modèle Porsche
  removeCouleurExterieur: (id, data) =>
    apiRequest(() =>
      apiClient.patch(`/model_porsche/removeCouleurExterieur/${id}`, data)
    ),

  // Ajouter une couleur intérieure à un modèle Porsche
  addCouleurInterieur: (id, data) =>
    apiRequest(() =>
      apiClient.patch(`/model_porsche/addCouleursInterieur/${id}`, data)
    ),

  // Supprimer une couleur intérieure d'un modèle Porsche
  removeCouleurInterieur: (id, data) =>
    apiRequest(() =>
      apiClient.patch(`/model_porsche/removeCouleursInterieur/${id}`, data)
    ),

  // Ajouter une taille de jante à un modèle Porsche
  addTailleJante: (id, data) =>
    apiRequest(() =>
      apiClient.patch(`/model_porsche/addTailleJante/${id}`, data)
    ),

  // Supprimer une taille de jante d'un modèle Porsche
  removeTailleJante: (id, data) =>
    apiRequest(() =>
      apiClient.patch(`/model_porsche/removeTailleJante/${id}`, data)
    ),
};

export default modelPorscheService;
