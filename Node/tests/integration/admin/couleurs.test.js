/**
 * Tests CRUD pour les Couleurs
 * Tests modulaires et réutilisables suivant le principe DRY
 */

import { describe, test, expect, beforeAll, afterAll } from "@jest/globals";
import { apiClient } from "../../utils/api-client.js";
import { config } from "../../setup/config.js";
import {
  couleursExterieurFixtures,
  couleursInterieurFixtures,
  couleursAccessoireFixtures,
} from "../../setup/fixtures.js";
import { extractData, assertions } from "../../setup/helpers.js";

describe("Couleurs Management (Admin)", () => {
  const createdIds = {
    exterieur: [],
    interieur: [],
    accessoire: [],
  };

  beforeAll(async () => {
    // Connexion admin
    await apiClient.login(config.credentials.admin, true);
  });

  afterAll(async () => {
    // Nettoyage: supprimer toutes les couleurs créées pendant les tests
    for (const id of createdIds.exterieur) {
      try {
        await apiClient.deleteCouleurExterieur(id);
      } catch (error) {
        // Ignorer les erreurs de suppression
      }
    }

    for (const id of createdIds.interieur) {
      try {
        await apiClient.deleteCouleurInterieur(id);
      } catch (error) {
        // Ignorer
      }
    }

    for (const id of createdIds.accessoire) {
      try {
        await apiClient.deleteCouleurAccessoire(id);
      } catch (error) {
        // Ignorer
      }
    }
  });

  // ============================================================================
  // Tests Couleurs Extérieures
  // ============================================================================

  describe("Couleurs Extérieures", () => {
    describe("POST /couleur_exterieur/new - Create", () => {
      test("should create a new couleur exterieur", async () => {
        const couleurData = couleursExterieurFixtures[0];

        const response = await apiClient.createCouleurExterieur(couleurData);

        expect(response.status).toBe(200);

        const couleur = extractData(response, "couleur", "data");
        assertions.isValidCouleur(couleur);
        expect(couleur.nom_couleur).toBe(couleurData.nom_couleur);
        expect(couleur.photo_couleur).toBe(couleurData.photo_couleur);
        expect(couleur.description).toBe(couleurData.description);

        // Sauvegarder l'ID pour le nettoyage
        createdIds.exterieur.push(couleur._id);
      });

      test("should create multiple couleurs exterieur", async () => {
        for (const couleurData of couleursExterieurFixtures.slice(1)) {
          const response = await apiClient.createCouleurExterieur(couleurData);

          const couleur = extractData(response, "couleur", "data");
          assertions.isValidCouleur(couleur);
          createdIds.exterieur.push(couleur._id);
        }

        expect(createdIds.exterieur.length).toBeGreaterThanOrEqual(3);
      });

      test("should fail without required fields", async () => {
        await expect(
          apiClient.createCouleurExterieur({ nom_couleur: "Test" })
        ).rejects.toThrow();
      });

      test("should fail without admin token", async () => {
        const originalToken = apiClient.adminToken;
        apiClient.adminToken = null;

        await expect(
          apiClient.createCouleurExterieur(couleursExterieurFixtures[0])
        ).rejects.toThrow();

        apiClient.adminToken = originalToken;
      });
    });

    describe("GET /couleur_exterieur/all - Read All", () => {
      test("should retrieve all couleurs exterieur", async () => {
        const response = await apiClient.getAllCouleursExterieur();

        expect(response.status).toBe(200);
        expect(Array.isArray(response.data)).toBe(true);
        expect(response.data.length).toBeGreaterThan(0);

        // Vérifier la structure de chaque couleur
        response.data.forEach((couleur) => {
          assertions.isValidCouleur(couleur);
        });
      });
    });

    describe("GET /couleur_exterieur/:id - Read One", () => {
      test("should retrieve a specific couleur exterieur", async () => {
        const couleurId = createdIds.exterieur[0];

        const response = await apiClient.getCouleurExterieur(couleurId);

        expect(response.status).toBe(200);
        const couleur = extractData(response, "couleur", "data");
        assertions.isValidCouleur(couleur);
        expect(couleur._id).toBe(couleurId);
      });

      test("should fail with invalid ID", async () => {
        await expect(
          apiClient.getCouleurExterieur("invalid-id")
        ).rejects.toThrow();
      });

      test("should fail with non-existent ID", async () => {
        await expect(
          apiClient.getCouleurExterieur("507f1f77bcf86cd799439011")
        ).rejects.toThrow();
      });
    });

    describe("PUT /couleur_exterieur/:id - Update", () => {
      test("should update a couleur exterieur", async () => {
        const couleurId = createdIds.exterieur[0];
        const updateData = { description: "Description mise à jour" };

        const response = await apiClient.updateCouleurExterieur(
          couleurId,
          updateData
        );

        expect(response.status).toBe(200);
        const couleur = extractData(response, "couleur", "data");
        expect(couleur.description).toBe(updateData.description);
      });

      test("should fail without admin token", async () => {
        const originalToken = apiClient.adminToken;
        apiClient.adminToken = null;

        await expect(
          apiClient.updateCouleurExterieur(createdIds.exterieur[0], {
            description: "Test",
          })
        ).rejects.toThrow();

        apiClient.adminToken = originalToken;
      });

      test("should fail with invalid ID", async () => {
        await expect(
          apiClient.updateCouleurExterieur("invalid-id", {
            description: "Test",
          })
        ).rejects.toThrow();
      });
    });

    describe("DELETE /couleur_exterieur/:id - Delete", () => {
      test("should delete a couleur exterieur", async () => {
        // Créer une couleur spécifiquement pour la suppression
        const couleurData = {
          ...couleursExterieurFixtures[0],
          nom_couleur: "À Supprimer",
        };
        const createResponse = await apiClient.createCouleurExterieur(
          couleurData
        );
        const couleur = extractData(createResponse, "couleur", "data");

        const response = await apiClient.deleteCouleurExterieur(couleur._id);

        expect(response.status).toBe(200);

        // Vérifier que la couleur a bien été supprimée
        await expect(
          apiClient.getCouleurExterieur(couleur._id)
        ).rejects.toThrow();
      });

      test("should fail without admin token", async () => {
        const originalToken = apiClient.adminToken;
        apiClient.adminToken = null;

        await expect(
          apiClient.deleteCouleurExterieur(createdIds.exterieur[0])
        ).rejects.toThrow();

        apiClient.adminToken = originalToken;
      });
    });
  });

  // ============================================================================
  // Tests Couleurs Intérieures
  // ============================================================================

  describe("Couleurs Intérieures", () => {
    describe("POST /couleur_interieur/new - Create", () => {
      test("should create couleurs interieur", async () => {
        for (const couleurData of couleursInterieurFixtures) {
          const response = await apiClient.createCouleurInterieur(couleurData);

          expect(response.status).toBe(200);
          const couleur = extractData(response, "couleur", "data");
          assertions.isValidCouleur(couleur);
          createdIds.interieur.push(couleur._id);
        }

        expect(createdIds.interieur.length).toBeGreaterThanOrEqual(3);
      });

      test("should fail without admin token", async () => {
        const originalToken = apiClient.adminToken;
        apiClient.adminToken = null;

        await expect(
          apiClient.createCouleurInterieur(couleursInterieurFixtures[0])
        ).rejects.toThrow();

        apiClient.adminToken = originalToken;
      });
    });

    describe("GET /couleur_interieur/all - Read All", () => {
      test("should retrieve all couleurs interieur", async () => {
        const response = await apiClient.getAllCouleursInterieur();

        expect(response.status).toBe(200);
        expect(Array.isArray(response.data)).toBe(true);
        expect(response.data.length).toBeGreaterThan(0);
      });
    });

    describe("PUT /couleur_interieur/:id - Update", () => {
      test("should update a couleur interieur", async () => {
        const couleurId = createdIds.interieur[0];
        const updateData = { description: "Mise à jour intérieur" };

        const response = await apiClient.updateCouleurInterieur(
          couleurId,
          updateData
        );

        expect(response.status).toBe(200);
        const couleur = extractData(response, "couleur", "data");
        expect(couleur.description).toBe(updateData.description);
      });
    });
  });

  // ============================================================================
  // Tests Couleurs Accessoires
  // ============================================================================

  describe("Couleurs Accessoires", () => {
    describe("POST /couleur_accesoire/new - Create", () => {
      test("should create couleurs accessoire", async () => {
        for (const couleurData of couleursAccessoireFixtures) {
          const response = await apiClient.createCouleurAccessoire(couleurData);

          expect(response.status).toBe(200);
          const couleur = extractData(response, "couleur", "data");
          assertions.isValidCouleur(couleur);
          createdIds.accessoire.push(couleur._id);
        }

        expect(createdIds.accessoire.length).toBeGreaterThanOrEqual(3);
      });

      test("should fail without admin token", async () => {
        const originalToken = apiClient.adminToken;
        apiClient.adminToken = null;

        await expect(
          apiClient.createCouleurAccessoire(couleursAccessoireFixtures[0])
        ).rejects.toThrow();

        apiClient.adminToken = originalToken;
      });
    });

    describe("GET /couleur_accesoire/all - Read All", () => {
      test("should retrieve all couleurs accessoire", async () => {
        const response = await apiClient.getAllCouleursAccessoire();

        expect(response.status).toBe(200);
        expect(Array.isArray(response.data)).toBe(true);
        expect(response.data.length).toBeGreaterThan(0);
      });
    });
  });
});
