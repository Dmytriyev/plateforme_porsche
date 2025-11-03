/**
 * Tests d'authentification User
 * Tests isolés et indépendants suivant les principes SOLID
 */

import { describe, test, expect, beforeAll, afterAll } from "@jest/globals";
import { apiClient } from "../../utils/api-client.js";
import { createUserFixture } from "../../setup/fixtures.js";
import { assertions, isValidEmail } from "../../setup/helpers.js";

describe("User Authentication", () => {
  let testUser = null;

  describe("POST /user/register - User Registration", () => {
    test("should register a new user successfully", async () => {
      const userData = createUserFixture();

      const response = await apiClient.register(userData);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("token");
      expect(response.data).toHaveProperty("user");

      // Vérifier le token
      expect(typeof response.data.token).toBe("string");
      expect(response.data.token.length).toBeGreaterThan(0);

      // Vérifier l'utilisateur créé
      const user = response.data.user;
      assertions.isValidUser(user);
      expect(user.email).toBe(userData.email);
      expect(user.nom).toBe(userData.nom);
      expect(user.prenom).toBe(userData.prenom);
      expect(user.isAdmin).toBe(false);

      // Vérifier que le panier a été créé
      expect(user.panier).toBeDefined();

      // Sauvegarder pour les tests suivants
      testUser = { ...userData, _id: user._id, panier: user.panier };
    });

    test("should fail to register with duplicate email", async () => {
      const userData = createUserFixture();

      // Créer le premier utilisateur
      await apiClient.register(userData);

      // Tenter de créer un second utilisateur avec le même email
      await expect(
        apiClient.post("/user/register", userData)
      ).rejects.toThrow();
    });

    test("should fail with invalid email format", async () => {
      const userData = createUserFixture({ email: "invalid-email" });

      await expect(
        apiClient.post("/user/register", userData)
      ).rejects.toThrow();
    });

    test("should fail with missing required fields", async () => {
      await expect(
        apiClient.post("/user/register", {
          email: "test@test.com",
          // Manque password, nom, prenom, etc.
        })
      ).rejects.toThrow();
    });

    test("should fail with weak password", async () => {
      const userData = createUserFixture({ password: "123" });

      await expect(
        apiClient.post("/user/register", userData)
      ).rejects.toThrow();
    });

    test("should fail with invalid phone format", async () => {
      const userData = createUserFixture({ telephone: "123" });

      await expect(
        apiClient.post("/user/register", userData)
      ).rejects.toThrow();
    });
  });

  describe("POST /user/login - User Login", () => {
    beforeAll(async () => {
      // Créer un utilisateur pour les tests de login
      if (!testUser) {
        const userData = createUserFixture();
        const response = await apiClient.register(userData);
        testUser = { ...userData, _id: response.data.user._id };
      }
    });

    test("should login successfully with valid credentials", async () => {
      const credentials = {
        email: testUser.email,
        password: testUser.password,
      };

      const response = await apiClient.post("/user/login", credentials);

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty("token");
      expect(response.data).toHaveProperty("user");

      const user = response.data.user;
      expect(user.email).toBe(credentials.email);
      expect(user.isAdmin).toBe(false);
    });

    test("should fail with invalid email", async () => {
      await expect(
        apiClient.post("/user/login", {
          email: "nonexistent@example.com",
          password: testUser.password,
        })
      ).rejects.toThrow();
    });

    test("should fail with invalid password", async () => {
      await expect(
        apiClient.post("/user/login", {
          email: testUser.email,
          password: "wrongpassword",
        })
      ).rejects.toThrow();
    });

    test("should fail with missing credentials", async () => {
      await expect(apiClient.post("/user/login", {})).rejects.toThrow();
    });
  });

  describe("User Authorization", () => {
    beforeAll(async () => {
      // S'assurer qu'un utilisateur est connecté
      if (!apiClient.userToken) {
        const userData = createUserFixture();
        const response = await apiClient.register(userData);
        testUser = { ...userData, _id: response.data.user._id };
      }
    });

    test("should access user-only endpoints with valid token", async () => {
      const response = await apiClient.getUserProfile(testUser._id);
      expect(response.status).toBe(200);
    });

    test("should fail to access admin endpoints with user token", async () => {
      // Essayer de créer une couleur (admin only)
      const originalAdminToken = apiClient.adminToken;
      apiClient.adminToken = apiClient.userToken; // Utiliser le token user à la place

      await expect(
        apiClient.createCouleurExterieur({
          nom_couleur: "Test",
          photo_couleur: "test.jpg",
        })
      ).rejects.toThrow();

      apiClient.adminToken = originalAdminToken;
    });

    test("should fail to access protected endpoints without token", async () => {
      const originalToken = apiClient.userToken;
      apiClient.userToken = null;

      await expect(apiClient.getUserProfile(testUser._id)).rejects.toThrow();

      apiClient.userToken = originalToken;
    });

    test("should fail with invalid token", async () => {
      const originalToken = apiClient.userToken;
      apiClient.userToken = "invalid-token-xyz";

      await expect(apiClient.getUserProfile(testUser._id)).rejects.toThrow();

      apiClient.userToken = originalToken;
    });
  });

  describe("Token Management", () => {
    test("should handle multiple user sessions independently", async () => {
      // Créer deux utilisateurs
      const user1Data = createUserFixture();
      const user2Data = createUserFixture();

      const response1 = await apiClient.post("/user/register", user1Data);
      const response2 = await apiClient.post("/user/register", user2Data);

      const token1 = response1.data.token;
      const token2 = response2.data.token;

      // Vérifier que les tokens sont différents
      expect(token1).not.toBe(token2);

      // Vérifier que chaque token donne accès au bon utilisateur
      apiClient.setUserToken(token1);
      const profile1 = await apiClient.getUserProfile(response1.data.user._id);
      expect(profile1.data.user.email).toBe(user1Data.email);

      apiClient.setUserToken(token2);
      const profile2 = await apiClient.getUserProfile(response2.data.user._id);
      expect(profile2.data.user.email).toBe(user2Data.email);
    });
  });
});
