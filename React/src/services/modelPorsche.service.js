import apiClient from "../config/api.js";
import { apiRequest } from "./httpHelper";

const modelPorscheService = {
  getAllModels: () =>
    apiRequest(() => apiClient.get("/model_porsche/all"), {
      returnArray: true,
    }),

  getModelById: (id) => apiRequest(() => apiClient.get(`/model_porsche/${id}`)),

  getModelesNeufs: () =>
    apiRequest(() => apiClient.get("/model_porsche/neuves"), {
      returnArray: true,
    }),

  getModelesOccasion: () =>
    apiRequest(() => apiClient.get("/model_porsche/occasions"), {
      returnArray: true,
    }),

  getAllVariantes: () =>
    apiRequest(() => apiClient.get("/model_porsche/variantes")),

  getVariantesByModel: (nomModel) =>
    apiRequest(() => apiClient.get(`/model_porsche/variantes/${nomModel}`)),

  getAllCarrosseries: () =>
    apiRequest(() => apiClient.get("/model_porsche/carrosseries")),

  getConfigurationsByVoiture: (voitureId) =>
    apiRequest(() => apiClient.get(`/model_porsche/voiture/${voitureId}`), {
      returnArray: true,
      defaultValue: [],
    }),

  calculatePrixTotal: (modelId) =>
    apiRequest(() => apiClient.get(`/model_porsche/prixTotal/${modelId}`)),

  getVariantePage: (id) =>
    apiRequest(() => apiClient.get(`/model_porsche/page/${id}`), {
      defaultValue: null,
    }),

  getOccasionPage: async (id) => {
    try {
      return await apiRequest(() =>
        apiClient.get(`/model_porsche/occasion/page/${id}`)
      );
    } catch (error) {
      const status = error?.status;
      if (status === 404 || status === 400) {
        const notFoundError = new Error("Voiture d'occasion introuvable");
        notFoundError.isExpected = true;
        throw notFoundError;
      }
      throw error;
    }
  },

  createModel: (data) =>
    apiRequest(() => apiClient.post("/model-porsche/new", data)),

  updateModel: (id, data) =>
    apiRequest(() => apiClient.patch(`/model_porsche/update/${id}`, data)),

  deleteModel: (id) =>
    apiRequest(() => apiClient.delete(`/model_porsche/delete/${id}`)),

  addImages: (id, formData) =>
    apiRequest(() =>
      apiClient.patch(`/model_porsche/addImages/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    ),

  removeImages: (id, data) =>
    apiRequest(() =>
      apiClient.patch(`/model_porsche/removeImages/${id}`, data)
    ),

  addCouleurExterieur: (id, data) =>
    apiRequest(() =>
      apiClient.patch(`/model_porsche/addCouleurExterieur/${id}`, data)
    ),

  removeCouleurExterieur: (id, data) =>
    apiRequest(() =>
      apiClient.patch(`/model_porsche/removeCouleurExterieur/${id}`, data)
    ),

  addCouleurInterieur: (id, data) =>
    apiRequest(() =>
      apiClient.patch(`/model_porsche/addCouleursInterieur/${id}`, data)
    ),

  removeCouleurInterieur: (id, data) =>
    apiRequest(() =>
      apiClient.patch(`/model_porsche/removeCouleursInterieur/${id}`, data)
    ),

  addTailleJante: (id, data) =>
    apiRequest(() =>
      apiClient.patch(`/model_porsche/addTailleJante/${id}`, data)
    ),

  removeTailleJante: (id, data) =>
    apiRequest(() =>
      apiClient.patch(`/model_porsche/removeTailleJante/${id}`, data)
    ),
};

export default modelPorscheService;
