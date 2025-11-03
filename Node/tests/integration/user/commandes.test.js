/**
 * Tests pour les Commandes, Panier et Lignes de Commande
 * Tests complets du workflow de commande
 */

import { describe, test, expect, beforeAll, afterAll } from "@jest/globals";
import { apiClient } from "../../utils/api-client.js";
import { config } from "../../setup/config.js";
import {
  createUserFixture,
  voituresNeufFixtures,
  accessoiresFixtures,
  couleursAccessoireFixtures,
} from "../../setup/fixtures.js";
import { extractData, assertions } from "../../setup/helpers.js";

describe("Commandes and Panier Management", () => {
  let testUser = null;
  let panierId = null;
  const createdIds = {
    voitures: [],
    accessoires: [],
    couleurs: [],
    lignesCommande: [],
  };

  beforeAll(async () => {
    // Créer et connecter l'admin pour créer les produits
    await apiClient.login(config.credentials.admin, true);

    // Créer des couleurs accessoires
    for (const couleur of couleursAccessoireFixtures) {
      const response = await apiClient.createCouleurAccessoire(couleur);
      const created = extractData(response, "couleur", "data");
      createdIds.couleurs.push(created._id);
    }

    // Créer une voiture neuve
    const voitureResponse = await apiClient.createVoiture(
      voituresNeufFixtures[0]
    );
    const voiture = extractData(voitureResponse, "voiture", "data");
    createdIds.voitures.push(voiture._id);

    // Créer des accessoires
    const accessoiresData = accessoiresFixtures(createdIds.couleurs);
    for (const accessoire of accessoiresData) {
      const response = await apiClient.createAccessoire(accessoire);
      const created = extractData(response, "accessoire", "data");
      createdIds.accessoires.push(created._id);
    }

    // Créer et connecter un utilisateur
    const userData = createUserFixture();
    const userResponse = await apiClient.register(userData);
    testUser = {
      ...userData,
      _id: userResponse.data.user._id,
      panier: userResponse.data.user.panier,
    };
  });

  afterAll(async () => {
    // Nettoyer les produits créés
    await apiClient.login(config.credentials.admin, true);

    for (const id of createdIds.voitures) {
      try {
        await apiClient.deleteVoiture(id);
      } catch (error) {
        // Ignorer
      }
    }

    for (const id of createdIds.accessoires) {
      try {
        await apiClient.deleteAccessoire(id);
      } catch (error) {
        // Ignorer
      }
    }

    for (const id of createdIds.couleurs) {
      try {
        await apiClient.deleteCouleurAccessoire(id);
      } catch (error) {
        // Ignorer
      }
    }
  });

  // ============================================================================
  // Tests Panier
  // ============================================================================

  describe("Panier Management", () => {
    describe("GET /commande/panier/get-or-create - Get or Create Panier", () => {
      test("should get or create panier for user", async () => {
        const response = await apiClient.getOrCreatePanier();

        expect(response.status).toBe(200);
        const panier = extractData(response, "data", "commande");

        assertions.isValidCommande(panier);
        expect(panier.user).toBe(testUser._id);
        expect(panier.status).toBe(true); // Panier actif

        panierId = panier._id;
      });

      test("should return existing panier on second call", async () => {
        const response1 = await apiClient.getOrCreatePanier();
        const panier1 = extractData(response1, "data", "commande");

        const response2 = await apiClient.getOrCreatePanier();
        const panier2 = extractData(response2, "data", "commande");

        expect(panier1._id).toBe(panier2._id);
      });

      test("should fail without user token", async () => {
        const originalToken = apiClient.userToken;
        apiClient.userToken = null;

        await expect(apiClient.getOrCreatePanier()).rejects.toThrow();

        apiClient.userToken = originalToken;
      });
    });

    describe("GET /commande/panier - Get Panier Details", () => {
      test("should retrieve panier details", async () => {
        const response = await apiClient.getPanier();

        expect(response.status).toBe(200);
        const panier = extractData(response, "data", "commande");
        assertions.isValidCommande(panier);
      });
    });
  });

  // ============================================================================
  // Tests Lignes de Commande
  // ============================================================================

  describe("Lignes de Commande Management", () => {
    describe("POST /ligneCommande/new - Add Product to Panier", () => {
      test("should add voiture neuve with acompte to panier", async () => {
        const voitureId = createdIds.voitures[0];
        const ligneData = {
          type_produit: true, // voiture
          quantite: 1,
          prix: voituresNeufFixtures[0].prix,
          acompte: 25000,
          voiture: voitureId,
          commande: panierId,
        };

        const response = await apiClient.addLigneCommande(ligneData);

        expect(response.status).toBe(200);
        const ligne = extractData(response, "ligneCommande", "data");

        expect(ligne._id).toBeDefined();
        expect(ligne.type_produit).toBe(true);
        expect(ligne.quantite).toBe(1);
        expect(ligne.acompte).toBe(25000);
        expect(ligne.voiture).toBe(voitureId);

        createdIds.lignesCommande.push(ligne._id);
      });

      test("should add accessoire with prix complet to panier", async () => {
        const accessoireId = createdIds.accessoires[0];
        const ligneData = {
          type_produit: false, // accessoire
          quantite: 2,
          prix: 350 * 2, // Prix unitaire * quantité
          acompte: 0, // Pas d'acompte pour accessoires
          accesoire: accessoireId,
          commande: panierId,
        };

        const response = await apiClient.addLigneCommande(ligneData);

        expect(response.status).toBe(200);
        const ligne = extractData(response, "ligneCommande", "data");

        expect(ligne.type_produit).toBe(false);
        expect(ligne.quantite).toBe(2);
        expect(ligne.acompte).toBe(0);
        expect(ligne.accesoire).toBe(accessoireId);

        createdIds.lignesCommande.push(ligne._id);
      });

      test("should add multiple accessoires to panier", async () => {
        for (let i = 1; i < Math.min(2, createdIds.accessoires.length); i++) {
          const ligneData = {
            type_produit: false,
            quantite: 1,
            prix: 2500,
            acompte: 0,
            accesoire: createdIds.accessoires[i],
            commande: panierId,
          };

          const response = await apiClient.addLigneCommande(ligneData);
          const ligne = extractData(response, "ligneCommande", "data");
          createdIds.lignesCommande.push(ligne._id);
        }

        expect(createdIds.lignesCommande.length).toBeGreaterThanOrEqual(3);
      });

      test("should fail without required fields", async () => {
        await expect(
          apiClient.addLigneCommande({ quantite: 1 })
        ).rejects.toThrow();
      });

      test("should fail with negative quantity", async () => {
        await expect(
          apiClient.addLigneCommande({
            type_produit: false,
            quantite: -1,
            prix: 100,
            accesoire: createdIds.accessoires[0],
            commande: panierId,
          })
        ).rejects.toThrow();
      });

      test("should fail without user token", async () => {
        const originalToken = apiClient.userToken;
        apiClient.userToken = null;

        await expect(
          apiClient.addLigneCommande({
            type_produit: false,
            quantite: 1,
            prix: 100,
            accesoire: createdIds.accessoires[0],
            commande: panierId,
          })
        ).rejects.toThrow();

        apiClient.userToken = originalToken;
      });
    });

    describe("GET /ligneCommande/panier - Get Panier Lines", () => {
      test("should retrieve all lignes in panier", async () => {
        const response = await apiClient.getPanierLignes();

        expect(response.status).toBe(200);
        const lignes = Array.isArray(response.data) ? response.data : [];

        expect(lignes.length).toBeGreaterThan(0);
        expect(lignes.length).toBe(createdIds.lignesCommande.length);

        lignes.forEach((ligne) => {
          expect(ligne._id).toBeDefined();
          expect(typeof ligne.quantite).toBe("number");
          expect(typeof ligne.prix).toBe("number");
        });
      });

      test("should calculate correct total price", async () => {
        const panierResponse = await apiClient.getPanier();
        const panier = extractData(panierResponse, "data", "commande");

        expect(panier.prix).toBeGreaterThan(0);
        expect(panier.acompte).toBeGreaterThan(0); // Car on a ajouté une voiture avec acompte
      });
    });

    describe("PUT /ligneCommande/:id - Update Ligne Quantity", () => {
      test("should update quantity of accessoire", async () => {
        // Trouver une ligne d'accessoire
        const lignesResponse = await apiClient.getPanierLignes();
        const lignes = Array.isArray(lignesResponse.data)
          ? lignesResponse.data
          : [];
        const accessoireLigne = lignes.find((l) => l.type_produit === false);

        if (accessoireLigne) {
          const updateData = { quantite: 5 };
          const response = await apiClient.updateLigneCommande(
            accessoireLigne._id,
            updateData
          );

          expect(response.status).toBe(200);
          const updated = extractData(response, "ligneCommande", "data");
          expect(updated.quantite).toBe(5);
        }
      });

      test("should fail to update quantity of voiture", async () => {
        const lignesResponse = await apiClient.getPanierLignes();
        const lignes = Array.isArray(lignesResponse.data)
          ? lignesResponse.data
          : [];
        const voitureLigne = lignes.find((l) => l.type_produit === true);

        if (voitureLigne) {
          await expect(
            apiClient.updateLigneCommande(voitureLigne._id, { quantite: 2 })
          ).rejects.toThrow();
        }
      });

      test("should fail without user token", async () => {
        const originalToken = apiClient.userToken;
        apiClient.userToken = null;

        await expect(
          apiClient.updateLigneCommande(createdIds.lignesCommande[0], {
            quantite: 3,
          })
        ).rejects.toThrow();

        apiClient.userToken = originalToken;
      });
    });

    describe("DELETE /ligneCommande/:id - Remove Product from Panier", () => {
      test("should remove a ligne from panier", async () => {
        // Récupérer le nombre actuel de lignes
        const beforeResponse = await apiClient.getPanierLignes();
        const beforeCount = Array.isArray(beforeResponse.data)
          ? beforeResponse.data.length
          : 0;

        // Supprimer une ligne
        const ligneId =
          createdIds.lignesCommande[createdIds.lignesCommande.length - 1];
        const response = await apiClient.deleteLigneCommande(ligneId);

        expect(response.status).toBe(200);

        // Vérifier que la ligne a été supprimée
        const afterResponse = await apiClient.getPanierLignes();
        const afterCount = Array.isArray(afterResponse.data)
          ? afterResponse.data.length
          : 0;

        expect(afterCount).toBe(beforeCount - 1);
      });

      test("should fail without user token", async () => {
        const originalToken = apiClient.userToken;
        apiClient.userToken = null;

        await expect(
          apiClient.deleteLigneCommande(createdIds.lignesCommande[0])
        ).rejects.toThrow();

        apiClient.userToken = originalToken;
      });
    });

    describe("DELETE /ligneCommande/panier/vider - Empty Panier", () => {
      test("should empty entire panier", async () => {
        const response = await apiClient.viderPanier();

        expect(response.status).toBe(200);

        // Vérifier que le panier est vide
        const panierResponse = await apiClient.getPanierLignes();
        const lignes = Array.isArray(panierResponse.data)
          ? panierResponse.data
          : [];

        expect(lignes.length).toBe(0);

        // Vérifier que le prix total est à 0
        const panierDetails = await apiClient.getPanier();
        const panier = extractData(panierDetails, "data", "commande");
        expect(panier.prix).toBe(0);
        expect(panier.acompte).toBe(0);
      });

      test("should fail without user token", async () => {
        const originalToken = apiClient.userToken;
        apiClient.userToken = null;

        await expect(apiClient.viderPanier()).rejects.toThrow();

        apiClient.userToken = originalToken;
      });
    });
  });

  // ============================================================================
  // Tests Historique Commandes
  // ============================================================================

  describe("Historique Commandes", () => {
    describe("GET /commande/historique - Get User Orders History", () => {
      test("should retrieve user order history", async () => {
        const response = await apiClient.getHistoriqueCommandes();

        expect(response.status).toBe(200);
        const historique = Array.isArray(response.data) ? response.data : [];

        // L'historique peut être vide ou contenir des commandes validées
        expect(Array.isArray(historique)).toBe(true);

        historique.forEach((commande) => {
          assertions.isValidCommande(commande);
          expect(commande.user).toBe(testUser._id);
        });
      });

      test("should fail without user token", async () => {
        const originalToken = apiClient.userToken;
        apiClient.userToken = null;

        await expect(apiClient.getHistoriqueCommandes()).rejects.toThrow();

        apiClient.userToken = originalToken;
      });
    });
  });

  // ============================================================================
  // Tests Workflow Complet
  // ============================================================================

  describe("Complete Order Workflow", () => {
    test("should complete full order workflow", async () => {
      // 1. Créer un nouveau panier
      const panierResponse = await apiClient.getOrCreatePanier();
      const panier = extractData(panierResponse, "data", "commande");

      // 2. Ajouter un accessoire
      await apiClient.addLigneCommande({
        type_produit: false,
        quantite: 1,
        prix: 350,
        acompte: 0,
        accesoire: createdIds.accessoires[0],
        commande: panier._id,
      });

      // 3. Vérifier le contenu
      const lignesResponse = await apiClient.getPanierLignes();
      const lignes = Array.isArray(lignesResponse.data)
        ? lignesResponse.data
        : [];
      expect(lignes.length).toBe(1);

      // 4. Modifier la quantité
      await apiClient.updateLigneCommande(lignes[0]._id, { quantite: 3 });

      // 5. Vérifier le prix total mis à jour
      const updatedPanierResponse = await apiClient.getPanier();
      const updatedPanier = extractData(
        updatedPanierResponse,
        "data",
        "commande"
      );
      expect(updatedPanier.prix).toBe(350 * 3);

      // 6. Vider le panier
      await apiClient.viderPanier();

      // 7. Vérifier que le panier est vide
      const emptyLignesResponse = await apiClient.getPanierLignes();
      const emptyLignes = Array.isArray(emptyLignesResponse.data)
        ? emptyLignesResponse.data
        : [];
      expect(emptyLignes.length).toBe(0);
    });
  });
});
