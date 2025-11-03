/**
 * Tests d'authentification Admin
 * Tests isolés et indépendants suivant les principes SOLID
 */

import { describe, test, expect, beforeAll } from "@jest/globals";
import { apiClient } from "../../utils/api-client.js";
import { config } from "../../setup/config.js";
import { assertions } from "../../setup/helpers.js";

describe("Admin Authentication", () => {
  describe("POST /user/login - Admin Login", () => {
    test("should login successfully with valid admin credentials", async () => {
      const credentials = config.credentials.admin;

      const response = await apiClient.login(credentials, true);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("token");
      expect(response.data).toHaveProperty("user");
      expect(typeof response.data.token).toBe("string");
      expect(response.data.token.length).toBeGreaterThan(0);

      // Vérifier les données utilisateur
      const user = response.data.user;
      expect(user.email).toBe(credentials.email);
      expect(user.isAdmin).toBe(true);

      // Vérifier que le token est bien enregistré
      expect(apiClient.adminToken).toBe(response.data.token);
    });

    test("should fail with invalid email", async () => {
      await expect(
        apiClient.post("/user/login", {
          email: "invalid@example.com",
          password: config.credentials.admin.password,
        })
      ).rejects.toThrow();
    });

    test("should fail with invalid password", async () => {
      await expect(
        apiClient.post("/user/login", {
          email: config.credentials.admin.email,
          password: "wrongpassword",
        })
      ).rejects.toThrow();
    });

    test("should fail with missing credentials", async () => {
      await expect(apiClient.post("/user/login", {})).rejects.toThrow();
    });

    test("should fail with malformed email", async () => {
      await expect(
        apiClient.post("/user/login", {
          email: "not-an-email",
          password: config.credentials.admin.password,
        })
      ).rejects.toThrow();
    });
  });

  describe("Admin Authorization", () => {
    beforeAll(async () => {
      // S'assurer que l'admin est connecté
      await apiClient.login(config.credentials.admin, true);
    });

    test("should access admin-only endpoints with valid token", async () => {
      const response = await apiClient.getAllCouleursExterieur();
      expect(response.status).toBe(200);
    });

    test("should fail to create resource without admin token", async () => {
      // Retirer temporairement le token admin
      const originalToken = apiClient.adminToken;
      apiClient.adminToken = null;

      await expect(
        apiClient.createCouleurExterieur({
          nom_couleur: "Test",
          photo_couleur: "test.jpg",
        })
      ).rejects.toThrow();

      // Restaurer le token
      apiClient.adminToken = originalToken;
    });

    test("should fail with invalid token", async () => {
      const originalToken = apiClient.adminToken;
      apiClient.adminToken = "invalid-token-123";

      await expect(
        apiClient.createCouleurExterieur({
          nom_couleur: "Test",
          photo_couleur: "test.jpg",
        })
      ).rejects.toThrow();

      apiClient.adminToken = originalToken;
    });
  });
});
