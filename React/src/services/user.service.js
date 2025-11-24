import apiClient from "../config/api.js";
import { apiRequest } from "./httpHelper";
import { sanitizeObject } from "../utils/helpers";

const userService = {
  getCurrentUser: async () => {
    return apiRequest(() => apiClient.get("/user/profile"));
  },

  updateProfile: async (userData) => {
    const response = await apiRequest(() =>
      apiClient.patch("/user/profile", userData)
    );

    if (response) {
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      const updatedUser = { ...currentUser, ...sanitizeObject(response) };
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }

    return response;
  },

  deleteAccount: async () => {
    return apiRequest(() => apiClient.delete("/user/profile"));
  },
};

export default userService;
