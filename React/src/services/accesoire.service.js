/**
 * services/accesoire.service.js — Endpoints pour accessoire (CRUD, upload images).
 *
 * @file services/accesoire.service.js
 */

import apiClient from "../config/api.js";
import { apiRequest } from "./httpHelper";

const accesoireService = {
  getAllAccessoires: () =>
    apiRequest(() => apiClient.get("/accesoire/all"), {
      returnArray: true,
      ignoreErrors: [404, 500],
      defaultValue: [],
    }),

  getAccessoireById: (id) =>
    apiRequest(() => apiClient.get(`/accesoire/${id}`)),

  getAccessoiresByType: (type) =>
    apiRequest(
      () =>
        apiClient.get(
          `/accesoire/search?type_accesoire=${encodeURIComponent(type)}`,
        ),
      { returnArray: true },
    ),

  getAvailableTypes: () =>
    apiRequest(() => apiClient.get("/accesoire/types"), {
      returnArray: true,
      defaultValue: [],
    }),

  searchAccessoires: (params) => {
    const queryString = new URLSearchParams(params).toString();
    return apiRequest(() => apiClient.get(`/accesoire/search?${queryString}`));
  },

  getCouleurs: () =>
    apiRequest(() => apiClient.get("/couleur_accesoire/all"), {
      returnArray: true,
    }),

  createAccessoire: (data) =>
    apiRequest(() => apiClient.post("/accesoire/new", data)),

  updateAccessoire: (id, data) =>
    apiRequest(() => apiClient.put(`/accesoire/update/${id}`, data)),

  deleteAccessoire: (id) =>
    apiRequest(() => apiClient.delete(`/accesoire/delete/${id}`)),

  addImages: (id, photoIds) =>
    apiRequest(() =>
      apiClient.patch(`/accesoire/addImage/${id}`, {
        photo_accesoire: photoIds,
      }),
    ),

  removeImages: (id, photoIds) =>
    apiRequest(() =>
      apiClient.patch(`/accesoire/removeImages/${id}`, {
        photo_accesoire: photoIds,
      }),
    ),

  setCouleur: (id, couleurId) =>
    apiRequest(() =>
      apiClient.patch(`/accesoire/addCouleur/${id}`, {
        couleur_accesoire: couleurId,
      }),
    ),

  removeCouleur: (id) =>
    apiRequest(() => apiClient.patch(`/accesoire/removeCouleur/${id}`)),
};

export default accesoireService;
