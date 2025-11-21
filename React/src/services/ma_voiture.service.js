import apiClient from "../config/api.js";
import { apiRequest } from "./httpHelper";

const maVoitureService = {
  getMesVoitures: () =>
    apiRequest(() => apiClient.get("/model_porsche_actuel/user/mesPorsches"), {
      returnArray: true,
      defaultValue: [],
    }),

  getMaVoitureById: (id) =>
    apiRequest(() => apiClient.get(`/model_porsche_actuel/${id}`)),

  ajouterMaVoiture: (data) =>
    apiRequest(() => apiClient.post("/model-porsche-actuel/new", data)),

  updateMaVoiture: (id, data) =>
    apiRequest(() => apiClient.put(`/model_porsche_actuel/${id}`, data)),

  supprimerMaVoiture: (id) =>
    apiRequest(() => apiClient.delete(`/model_porsche_actuel/${id}`)),

  ajouterPhoto: (formData) =>
    apiRequest(() =>
      apiClient.post("/photo-voiture-actuel/new", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      })
    ),

  supprimerPhoto: (id) =>
    apiRequest(() => apiClient.delete(`/photo-voiture-actuel/delete/${id}`)),
};

export default maVoitureService;
