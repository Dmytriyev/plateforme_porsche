import apiClient from "../config/api.js";
import { apiRequest } from "./httpHelper";

const personnalisationService = {
  getCouleursExterieur: () =>
    apiRequest(() => apiClient.get("/couleur_exterieur/all"), {
      returnArray: true,
    }),

  getCouleurExterieurById: (id) =>
    apiRequest(() => apiClient.get(`/couleur_exterieur/${id}`)),

  getCouleursInterieur: () =>
    apiRequest(() => apiClient.get("/couleur_interieur/all"), {
      returnArray: true,
    }),

  getCouleurInterieurById: (id) =>
    apiRequest(() => apiClient.get(`/couleur_interieur/${id}`)),

  getJantes: () =>
    apiRequest(() => apiClient.get("/taille_jante/all"), { returnArray: true }),

  getTailleJanteById: (id) =>
    apiRequest(() => apiClient.get(`/taille_jante/${id}`)),

  getSieges: () =>
    apiRequest(() => apiClient.get("/siege/all"), { returnArray: true }),

  getSiegeById: (id) => apiRequest(() => apiClient.get(`/siege/${id}`)),

  getPackages: () =>
    apiRequest(() => apiClient.get("/package/all"), { returnArray: true }),

  getPackageById: (id) => apiRequest(() => apiClient.get(`/package/${id}`)),
};

export default personnalisationService;
