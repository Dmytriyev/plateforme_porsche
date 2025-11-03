/**
 * Tests CRUD pour les Voitures et Réservations
 * Séparation des responsabilités: Admin gère les voitures, User fait les réservations
 */

import { describe, test, expect, beforeAll, afterAll } from "@jest/globals";
import { apiClient } from "../../utils/api-client.js";
import { config } from "../../setup/config.js";
import {
  voituresNeufFixtures,
  voituresOccasionFixtures,
  createUserFixture,
  createReservationFixture,
} from "../../setup/fixtures.js";
import {
  extractData,
  assertions,
  formatDateForAPI,
} from "../../setup/helpers.js";

describe("Voitures and Reservations Management", () => {
  const createdIds = {
    voitures: [],
    reservations: [],
  };
  let testUser = null;

  beforeAll(async () => {
    // Connexion admin pour créer les voitures
    await apiClient.login(config.credentials.admin, true);

    // Créer un utilisateur pour les réservations
    const userData = createUserFixture();
    const userResponse = await apiClient.register(userData);
    testUser = { ...userData, _id: userResponse.data.user._id };
  });

  afterAll(async () => {
    // Nettoyage: supprimer les voitures créées
    for (const id of createdIds.voitures) {
      try {
        await apiClient.deleteVoiture(id);
      } catch (error) {
        // Ignorer les erreurs
      }
    }
  });

  // ============================================================================
  // Tests Voitures (Admin)
  // ============================================================================

  describe("Voitures Management (Admin)", () => {
    describe("POST /voiture/new - Create Voiture", () => {
      test("should create a voiture neuve", async () => {
        const voitureData = voituresNeufFixtures[0];

        const response = await apiClient.createVoiture(voitureData);

        expect(response.status).toBe(200);
        const voiture = extractData(response, "voiture", "data");
        assertions.isValidVoiture(voiture);
        expect(voiture.type_voiture).toBe(true); // neuf
        expect(voiture.nom_model).toBe(voitureData.nom_model);
        expect(voiture.prix).toBe(voitureData.prix);

        createdIds.voitures.push(voiture._id);
      });

      test("should create a voiture occasion", async () => {
        const voitureData = voituresOccasionFixtures[0];

        const response = await apiClient.createVoiture(voitureData);

        expect(response.status).toBe(200);
        const voiture = extractData(response, "voiture", "data");
        assertions.isValidVoiture(voiture);
        expect(voiture.type_voiture).toBe(false); // occasion
        expect(voiture.nom_model).toBe(voitureData.nom_model);

        createdIds.voitures.push(voiture._id);
      });

      test("should create multiple voitures", async () => {
        const allVoitures = [...voituresOccasionFixtures.slice(1)];

        for (const voitureData of allVoitures) {
          const response = await apiClient.createVoiture(voitureData);
          const voiture = extractData(response, "voiture", "data");
          createdIds.voitures.push(voiture._id);
        }

        expect(createdIds.voitures.length).toBeGreaterThanOrEqual(3);
      });

      test("should fail without required fields", async () => {
        await expect(
          apiClient.createVoiture({ nom_model: "Test" })
        ).rejects.toThrow();
      });

      test("should fail without admin token", async () => {
        const originalToken = apiClient.adminToken;
        apiClient.adminToken = null;

        await expect(
          apiClient.createVoiture(voituresNeufFixtures[0])
        ).rejects.toThrow();

        apiClient.adminToken = originalToken;
      });

      test("should fail with negative price", async () => {
        await expect(
          apiClient.createVoiture({
            ...voituresNeufFixtures[0],
            prix: -1000,
          })
        ).rejects.toThrow();
      });
    });

    describe("GET /voiture/all - Read All Voitures", () => {
      test("should retrieve all voitures", async () => {
        const response = await apiClient.getAllVoitures();

        expect(response.status).toBe(200);
        const voitures = Array.isArray(response.data)
          ? response.data
          : response.data.voitures || [];

        expect(voitures.length).toBeGreaterThan(0);
        voitures.forEach((voiture) => {
          assertions.isValidVoiture(voiture);
        });
      });

      test("should allow public access (no token required)", async () => {
        const originalToken = apiClient.adminToken;
        apiClient.adminToken = null;

        const response = await apiClient.getAllVoitures();
        expect(response.status).toBe(200);

        apiClient.adminToken = originalToken;
      });
    });

    describe("GET /voiture/:id - Read One Voiture", () => {
      test("should retrieve a specific voiture", async () => {
        const voitureId = createdIds.voitures[0];

        const response = await apiClient.getVoiture(voitureId);

        expect(response.status).toBe(200);
        const voiture = extractData(response, "voiture", "data");
        assertions.isValidVoiture(voiture);
        expect(voiture._id).toBe(voitureId);
      });

      test("should fail with invalid ID", async () => {
        await expect(apiClient.getVoiture("invalid-id")).rejects.toThrow();
      });
    });

    describe("PUT /voiture/:id - Update Voiture", () => {
      test("should update a voiture", async () => {
        const voitureId = createdIds.voitures[0];
        const updateData = {
          description: "Description mise à jour",
          prix: 260000,
        };

        const response = await apiClient.updateVoiture(voitureId, updateData);

        expect(response.status).toBe(200);
        const voiture = extractData(response, "voiture", "data");
        expect(voiture.description).toBe(updateData.description);
        expect(voiture.prix).toBe(updateData.prix);
      });

      test("should fail without admin token", async () => {
        const originalToken = apiClient.adminToken;
        apiClient.adminToken = null;

        await expect(
          apiClient.updateVoiture(createdIds.voitures[0], { prix: 100000 })
        ).rejects.toThrow();

        apiClient.adminToken = originalToken;
      });
    });

    describe("DELETE /voiture/:id - Delete Voiture", () => {
      test("should delete a voiture", async () => {
        // Créer une voiture spécifiquement pour la suppression
        const voitureData = {
          ...voituresOccasionFixtures[0],
          nom_model: "À Supprimer",
        };
        const createResponse = await apiClient.createVoiture(voitureData);
        const voiture = extractData(createResponse, "voiture", "data");

        const response = await apiClient.deleteVoiture(voiture._id);

        expect(response.status).toBe(200);

        // Vérifier que la voiture a été supprimée
        await expect(apiClient.getVoiture(voiture._id)).rejects.toThrow();
      });
    });
  });

  // ============================================================================
  // Tests Réservations (User)
  // ============================================================================

  describe("Reservations Management (User)", () => {
    let voitureOccasionId = null;
    let voitureNeufId = null;

    beforeAll(() => {
      // Identifier une voiture occasion (type_voiture = false)
      voitureOccasionId = createdIds.voitures.find((id, index) => {
        // Les voitures d'occasion sont créées en second
        return index >= 1; // Voiture occasion
      });

      // Identifier une voiture neuve (type_voiture = true)
      voitureNeufId = createdIds.voitures[0];
    });

    describe("GET /reservation/disponibilite/:id - Check Availability", () => {
      test("should check availability of a voiture occasion", async () => {
        const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const dateString = formatDateForAPI(futureDate);

        const response = await apiClient.checkDisponibilite(
          voitureOccasionId,
          dateString
        );

        expect(response.status).toBe(200);
        expect(response.data).toHaveProperty("disponible");
      });

      test("should allow public access to check availability", async () => {
        const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        const dateString = formatDateForAPI(futureDate);

        const originalToken = apiClient.userToken;
        apiClient.userToken = null;

        const response = await apiClient.checkDisponibilite(
          voitureOccasionId,
          dateString
        );
        expect(response.status).toBe(200);

        apiClient.userToken = originalToken;
      });
    });

    describe("POST /user/:userId/reservations - Create Reservation", () => {
      test("should create a reservation for voiture occasion", async () => {
        const reservationData = createReservationFixture(voitureOccasionId, 7);

        const response = await apiClient.createReservation(
          testUser._id,
          reservationData
        );

        expect(response.status).toBe(200);
        const reservation = extractData(response, "reservation", "data");
        assertions.isValidReservation(reservation);
        expect(reservation.voiture).toBe(voitureOccasionId);
        expect(reservation.status).toBe(true);

        createdIds.reservations.push(reservation._id);
      });

      test("should fail to reserve a voiture neuve", async () => {
        const reservationData = createReservationFixture(voitureNeufId, 10);

        await expect(
          apiClient.createReservation(testUser._id, reservationData)
        ).rejects.toThrow();
      });

      test("should fail without user token", async () => {
        const originalToken = apiClient.userToken;
        apiClient.userToken = null;

        const reservationData = createReservationFixture(voitureOccasionId, 14);

        await expect(
          apiClient.createReservation(testUser._id, reservationData)
        ).rejects.toThrow();

        apiClient.userToken = originalToken;
      });

      test("should fail with past date", async () => {
        const pastDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const reservationData = {
          voiture: voitureOccasionId,
          date_reservation: pastDate,
          status: true,
        };

        await expect(
          apiClient.createReservation(testUser._id, reservationData)
        ).rejects.toThrow();
      });
    });

    describe("GET /user/:userId/reservations - Read User Reservations", () => {
      test("should retrieve user reservations", async () => {
        const response = await apiClient.getUserReservations(testUser._id);

        expect(response.status).toBe(200);
        const reservations = Array.isArray(response.data) ? response.data : [];
        expect(reservations.length).toBeGreaterThan(0);

        reservations.forEach((reservation) => {
          assertions.isValidReservation(reservation);
        });
      });

      test("should fail without user token", async () => {
        const originalToken = apiClient.userToken;
        apiClient.userToken = null;

        await expect(
          apiClient.getUserReservations(testUser._id)
        ).rejects.toThrow();

        apiClient.userToken = originalToken;
      });
    });

    describe("PUT /user/:userId/reservations/:id/cancel - Cancel Reservation", () => {
      test("should cancel a reservation", async () => {
        const reservationId = createdIds.reservations[0];

        const response = await apiClient.cancelReservation(
          testUser._id,
          reservationId
        );

        expect(response.status).toBe(200);

        // Vérifier que la réservation est bien annulée (status = false)
        const reservations = await apiClient.getUserReservations(testUser._id);
        const cancelledReservation = reservations.data.find(
          (r) => r._id === reservationId
        );
        expect(cancelledReservation.status).toBe(false);
      });

      test("should fail without user token", async () => {
        const originalToken = apiClient.userToken;
        apiClient.userToken = null;

        await expect(
          apiClient.cancelReservation(testUser._id, createdIds.reservations[0])
        ).rejects.toThrow();

        apiClient.userToken = originalToken;
      });
    });
  });
});
