#!/usr/bin/env node

/**
 * Script de nettoyage de la base de données pour les tests
 */

import mongoose from "mongoose";

const DB_URL = process.env.MONGODB_URI || "mongodb://localhost:27017/porsche";

const cleanDatabase = async () => {
  try {
    await mongoose.connect(DB_URL);
    console.log("Connexion à MongoDB...");

    const collections = [
      "users",
      "model_porsches",
      "model_porsche_actuels",
      "voitures",
      "accesoires",
      "couleur_exterieurs",
      "couleur_interieurs",
      "couleur_accesoires",
      "taille_jantes",
      "reservations",
      "commandes",
      "lignecommandes",
      "factures",
      "photo_voitures",
      "photo_voiture_actuels",
      "photo_accesoires",
    ];

    for (const collection of collections) {
      try {
        await mongoose.connection.db.collection(collection).deleteMany({});
        console.log(`Collection ${collection} nettoyée`);
      } catch (error) {
        console.log(
          `Collection ${collection} n'existe pas ou erreur:`,
          error.message
        );
      }
    }

    console.log("Nettoyage terminé");
    await mongoose.disconnect();
  } catch (error) {
    console.error("Erreur de nettoyage:", error);
    process.exit(1);
  }
};

cleanDatabase();
