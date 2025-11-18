/**
 * Script d'initialisation automatique de la base de données
 * Utilise l'API pour créer toutes les données de test
 *
 * Usage: node seed-database.js
 */

import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import mongoose from "mongoose";
import "dotenv/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_URL = "http://localhost:3000";
const DELAY = 1000; // Délai entre les requêtes (ms)

// Stocker les IDs créés pour les relations
const createdIds = {
  users: {},
  couleurs_exterieur: {},
  couleurs_interieur: {},
  tailles_jante: {},
  voitures: {},
  model_porsche: {},
  couleurs_accesoire: {},
  accesoires: {},
  packages: {},
  sieges: {},
};

let adminToken = "";
let userToken = "";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Nettoyer les données existantes (optionnel)
 */
async function cleanDatabase() {
  console.log("\nNettoyage de la base de données...");

  try {
    if (!mongoose.connection.readyState) {
      await mongoose.connect(
        process.env.DB_URI || "mongodb://localhost:27017/porsche"
      );
    }

    // Supprimer uniquement les données non-utilisateur pour préserver les comptes
    const collections = [
      "model_porsches",
      "model_porsche_actuels",
      "couleur_exterieurs",
      "couleur_interieurs",
      "taille_jantes",
      "voitures",
      "couleur_accesoires",
      "accesoires",
      "packages",
      "sieges",
    ];

    for (const collectionName of collections) {
      try {
        const collection = mongoose.connection.db.collection(collectionName);
        const result = await collection.deleteMany({});
        console.log(
          `  ${collectionName}: ${result.deletedCount} documents supprimés`
        );
      } catch (error) {
        // Collection n'existe peut-être pas encore
        console.log(`  ${collectionName}: collection non trouvée ou vide`);
      }
    }

    console.log("Nettoyage terminé\n");
  } catch (error) {
    console.error("Erreur lors du nettoyage:", error.message);
  }
}

/**
 * Connexion et récupération du token
 */
async function login(email, password) {
  try {
    const response = await axios.post(`${API_URL}/user/login`, {
      email,
      password,
    });
    console.log(`Connecté: ${email}`);
    return response.data.token;
  } catch (error) {
    console.error(
      `Erreur de connexion pour ${email}:`,
      error.response?.data || error.message
    );
    if (error.code) console.error(`Code d'erreur: ${error.code}`);
    throw error;
  }
}

/**
 * Créer les utilisateurs
 */
async function createUsers() {
  console.log("\nCréation des utilisateurs...");

  const users = [
    {
      email: "admin@porsche.com",
      password: "Admin123!",
      nom: "Dupont",
      prenom: "Jean",
      telephone: "0612345678",
      adresse: "15 Avenue des Champs-Élysées",
      code_postal: "75008",
      targetRole: "admin",
    },
    {
      email: "responsable@porsche.com",
      password: "Responsable123!",
      nom: "Durand",
      prenom: "Claire",
      telephone: "0612345679",
      adresse: "20 Rue de la Paix",
      code_postal: "75002",
      targetRole: "responsable",
    },
    {
      email: "conseiller@porsche.com",
      password: "Conseiller123!",
      nom: "Martin",
      prenom: "Sophie",
      telephone: "0612345689",
      adresse: "22 Rue de Rivoli",
      code_postal: "75001",
      targetRole: "conseillere",
    },
    {
      email: "user@gmail.com",
      password: "User123!",
      nom: "Bernard",
      prenom: "Pierre",
      telephone: "0612345680",
      adresse: "10 Boulevard Saint-Germain",
      code_postal: "75005",
      targetRole: "user",
    },
  ];

  for (const user of users) {
    try {
      const { targetRole, ...userData } = user;
      const response = await axios.post(`${API_URL}/user/register`, userData);
      createdIds.users[targetRole] = response.data._id;
      console.log(`User créé: ${user.email} (${targetRole})`);
      await delay(DELAY);
    } catch (error) {
      if (
        error.response?.status === 409 ||
        (typeof error.response?.data?.message === "string" &&
          error.response?.data?.message.includes("existe"))
      ) {
        console.log(`User existe déjà: ${user.email}`);
        // Essayer de récupérer l'ID de l'utilisateur existant via login
        try {
          const loginResponse = await axios.post(`${API_URL}/user/login`, {
            email: user.email,
            password: user.password,
          });
          if (loginResponse.data.user?.id) {
            createdIds.users[user.targetRole] = loginResponse.data.user.id;
            console.log(
              `  ID récupéré pour ${user.email}: ${loginResponse.data.user.id}`
            );
          }
        } catch (loginError) {
          console.log(`  Impossible de récupérer l'ID pour ${user.email}`);
        }
      } else {
        console.error(
          `Erreur création ${user.email}:`,
          error.response?.data || error.message
        );
        if (error.code) console.error(`Code d'erreur: ${error.code}`);
      }
    }
  }
}

/**
 * Mettre à jour les rôles des utilisateurs
 */
async function updateUserRoles() {
  console.log("\nMise à jour des rôles utilisateurs...");

  const roleUpdates = [
    { role: "admin", targetRole: "admin" },
    { role: "responsable", targetRole: "responsable" },
    { role: "conseillere", targetRole: "conseillere" },
  ];

  for (const update of roleUpdates) {
    try {
      const userId = createdIds.users[update.targetRole];
      if (!userId) {
        console.log(`User ID non trouvé pour ${update.targetRole}`);
        continue;
      }
      await axios.put(
        `${API_URL}/user/${userId}/role`,
        { role: update.role },
        {
          headers: { Authorization: `Bearer ${adminToken}` },
        }
      );
      console.log(`Rôle mis à jour: ${update.targetRole}`);
      await delay(DELAY);
    } catch (error) {
      console.error(
        `Erreur mise à jour rôle ${update.targetRole}:`,
        error.response?.data?.message || error.message
      );
    }
  }
}

/**
 * Créer les couleurs extérieures
 */
async function createCouleursExterieur() {
  console.log("\nCréation des couleurs extérieures...");

  const couleurs = [
    {
      nom_couleur: "bleu",
      description: "Bleu racing métallisé",
      prix: 2000,
    },
    {
      nom_couleur: "black",
      description: "Noir métallisé",
      prix: 1200,
    },
    {
      nom_couleur: "gray",
      description: "Gris GT métallisé",
      prix: 1200,
    },
    {
      nom_couleur: "green",
      description: "Vert racing",
      prix: 3600,
    },
    {
      nom_couleur: "red",
      description: "Rouge Carmin",
      prix: 2000,
    },
    {
      nom_couleur: "white",
      description: "Blanc Carrara",
      prix: 0,
    },
    {
      nom_couleur: "yellow",
      description: "Jaune Racing",
      prix: 2000,
    },
  ];

  for (const couleur of couleurs) {
    try {
      const response = await axios.post(
        `${API_URL}/couleur_exterieur/new`,
        couleur,
        {
          headers: { Authorization: `Bearer ${adminToken}` },
        }
      );
      createdIds.couleurs_exterieur[couleur.nom_couleur] = response.data._id;
      console.log(`Couleur extérieure créée: ${couleur.nom_couleur}`);
      await delay(DELAY);
    } catch (error) {
      if (
        error.response?.status === 409 ||
        (typeof error.response?.data?.message === "string" &&
          error.response?.data?.message.includes("existe"))
      ) {
        console.log(`Couleur extérieure existe déjà: ${couleur.nom_couleur}`);
      } else {
        console.error(
          `Erreur création couleur ${couleur.nom_couleur}:`,
          error.response?.data?.message || error.message
        );
      }
    }
  }
}

/**
 * Créer les couleurs intérieures
 */
async function createCouleursInterieur() {
  console.log("\nCréation des couleurs intérieures...");

  const couleurs = [
    {
      nom_couleur: "black",
      description: "Cuir noir classique",
      prix: 0,
    },
    {
      nom_couleur: "caramel",
      description: "Cuir caramel premium",
      prix: 3300,
    },
    {
      nom_couleur: "red",
      description: "Cuir rouge sportif",
      prix: 2800,
    },
    {
      nom_couleur: "red/white",
      description: "Cuir bicolore rouge et blanc",
      prix: 4000,
    },
  ];

  for (const couleur of couleurs) {
    try {
      const response = await axios.post(
        `${API_URL}/couleur_interieur/new`,
        couleur,
        {
          headers: { Authorization: `Bearer ${adminToken}` },
        }
      );
      createdIds.couleurs_interieur[couleur.nom_couleur] = response.data._id;
      console.log(`Couleur intérieure créée: ${couleur.nom_couleur}`);
      await delay(DELAY);
    } catch (error) {
      console.error(
        `Erreur création couleur ${couleur.nom_couleur}:`,
        error.response?.data?.message || error.message
      );
    }
  }
}

/**
 * Créer les tailles de jantes
 */
async function createTaillesJante() {
  console.log("\nCréation des tailles de jantes...");

  const jantes = [
    {
      taille_jante: "16",
      couleur_jante: "black",
      description: "Jantes 16 pouces 911 classic noires",
      prix: 0,
    },
    {
      taille_jante: "19",
      couleur_jante: "gray",
      description: "Jantes 19 pouces Sport gris anthracite",
      prix: 1100,
    },
    {
      taille_jante: "21",
      couleur_jante: "black",
      description: "Jantes 21 pouces 911 Turbo noires",
      prix: 1800,
    },
    {
      taille_jante: "22",
      couleur_jante: "gray",
      description: "Jantes 22 pouces Cayenne grises",
      prix: 2000,
    },
  ];

  for (const jante of jantes) {
    try {
      const response = await axios.post(`${API_URL}/taille_jante/new`, jante, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      createdIds.tailles_jante[jante.taille_jante] = response.data._id;
      console.log(`Jante créée: ${jante.taille_jante}"`);
      await delay(DELAY);
    } catch (error) {
      console.error(
        `Erreur création jante ${jante.taille_jante}:`,
        error.response?.data?.message || error.message
      );
    }
  }
}

/**
 * Créer les voitures (modèles de base)
 */
async function createVoitures() {
  console.log("\nCréation des voitures (modèles de base)...");

  const voitures = [
    {
      type_voiture: true,
      nom_model: "911",
      description:
        "Quand on imagine une Porsche, c'est généralement elle que l'on a en tête : la 911 est depuis 60 ans l'incarnation même d'une voiture de sport passionnante et puissante, adaptée à un usage au quotidien.",
    },
    {
      type_voiture: true,
      nom_model: "Cayenne",
      description:
        "Performance sur tous les terrains. Il y a plus de 20 ans, nous nous demandions si une voiture de sport pouvait célébrer plus que l'individualité. Le Cayenne a fourni la réponse.",
    },
    {
      type_voiture: true,
      nom_model: "Cayman",
      description:
        "Parfaitement irrationnel. Véhicule affûté pour le circuit. Concept très souple de moteur central. Moteur atmosphérique de 6 cylindres pour une cylindrée de 4 l et une puissance de 500 ch.",
    },
  ];

  // Voitures d'occasion - 3 catégories de base
  const voituresOccasion = [
    {
      type_voiture: false,
      nom_model: "911",
      description:
        "Porsche 911 d'occasion certifiée. Véhicules inspectés et garantis par nos experts, offrant le meilleur du légendaire modèle 911 à un prix avantageux.",
    },
    {
      type_voiture: false,
      nom_model: "Cayenne",
      description:
        "Cayenne d'occasion certifié. SUV de luxe Porsche avec performance exceptionnelle, inspecté et garanti.",
    },
    {
      type_voiture: false,
      nom_model: "Cayman",
      description:
        "Cayman d'occasion certifié. Sportivité pure avec moteur central, véhicules sélectionnés et garantis.",
    },
  ];

  for (const voiture of voitures) {
    try {
      const response = await axios.post(`${API_URL}/voiture/new`, voiture, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      // Déterminer le bon chemin pour l'ID
      const voitureId =
        response.data?.voiture?._id ||
        response.data?._id ||
        response.data?.data?.voiture?._id;

      if (!voitureId) {
        console.error(
          `Structure de réponse inattendue pour ${voiture.nom_model}:`,
          JSON.stringify(response.data, null, 2)
        );
        throw new Error("ID de la voiture non trouvé dans la réponse");
      }

      createdIds.voitures[voiture.nom_model] = voitureId;
      console.log(`Voiture créée: ${voiture.nom_model} (ID: ${voitureId})`);
      await delay(DELAY);
    } catch (error) {
      if (
        error.response?.status === 409 ||
        (typeof error.response?.data?.message === "string" &&
          error.response?.data?.message.includes("existe"))
      ) {
        console.log(`Voiture existe déjà: ${voiture.nom_model}`);
        // Récupérer l'ID de la voiture existante
        try {
          const getAllResponse = await axios.get(`${API_URL}/voiture`, {
            headers: { Authorization: `Bearer ${adminToken}` },
          });
          const existingVoiture = getAllResponse.data.find(
            (v) => v.nom_model === voiture.nom_model
          );
          if (existingVoiture) {
            createdIds.voitures[voiture.nom_model] = existingVoiture._id;
            console.log(
              `  ID récupéré pour ${voiture.nom_model}: ${existingVoiture._id}`
            );
          }
        } catch (getError) {
          console.error(
            `  Impossible de récupérer l'ID pour ${voiture.nom_model}`
          );
        }
      } else {
        console.error(
          `Erreur création voiture ${voiture.nom_model}:`,
          error.response?.data?.message || error.message
        );
      }
    }
  }

  // Créer les voitures d'occasion
  for (const voiture of voituresOccasion) {
    try {
      const response = await axios.post(`${API_URL}/voiture/new`, voiture, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const voitureId =
        response.data?.voiture?._id ||
        response.data?._id ||
        response.data?.data?.voiture?._id;

      if (!voitureId) {
        console.error(
          `Structure de réponse inattendue pour ${voiture.nom_model} (occasion):`,
          JSON.stringify(response.data, null, 2)
        );
        throw new Error("ID de la voiture d'occasion non trouvé");
      }

      // Stocker avec un suffixe pour différencier
      createdIds.voitures[`${voiture.nom_model}_occasion`] = voitureId;
      console.log(
        `Voiture d'occasion créée: ${voiture.nom_model} (ID: ${voitureId})`
      );
      await delay(DELAY);
    } catch (error) {
      if (
        error.response?.status === 409 ||
        (typeof error.response?.data?.message === "string" &&
          error.response?.data?.message.includes("existe"))
      ) {
        console.log(`Voiture d'occasion existe déjà: ${voiture.nom_model}`);
        try {
          const getAllResponse = await axios.get(`${API_URL}/voiture`, {
            headers: { Authorization: `Bearer ${adminToken}` },
          });
          const existingVoiture = getAllResponse.data.find(
            (v) => v.nom_model === voiture.nom_model && v.type_voiture === false
          );
          if (existingVoiture) {
            createdIds.voitures[`${voiture.nom_model}_occasion`] =
              existingVoiture._id;
            console.log(
              `  ID récupéré pour ${voiture.nom_model} (occasion): ${existingVoiture._id}`
            );
          }
        } catch (getError) {
          console.error(
            `  Impossible de récupérer l'ID pour ${voiture.nom_model} (occasion)`
          );
        }
      } else {
        console.error(
          `Erreur création voiture d'occasion ${voiture.nom_model}:`,
          error.response?.data?.message || error.message
        );
      }
    }
  }

  // Vérifier que toutes les voitures ont un ID
  console.log("\nVérification des IDs des voitures...");
  console.log("IDs disponibles:", Object.keys(createdIds.voitures));
  if (Object.keys(createdIds.voitures).length < 3) {
    throw new Error(
      "Certaines voitures n'ont pas d'ID. Impossible de continuer."
    );
  }
}

/**
 * Créer les model porsche (variantes)
 */
async function createModelPorsche() {
  console.log("\nCréation des model porsche (variantes)...");

  // Vérifier que les IDs des voitures sont disponibles
  console.log("IDs des voitures disponibles:");
  console.log("  911:", createdIds.voitures["911"]);
  console.log("  Cayenne:", createdIds.voitures["Cayenne"]);
  console.log("  Cayman:", createdIds.voitures["Cayman"]);

  if (
    !createdIds.voitures["911"] ||
    !createdIds.voitures["Cayenne"] ||
    !createdIds.voitures["Cayman"]
  ) {
    throw new Error(
      "Les IDs des voitures ne sont pas disponibles. Impossible de créer les variantes."
    );
  }

  const models = [
    // Variantes 911
    {
      nom_model: "Carrera S",
      type_carrosserie: "Coupe",
      voiture: createdIds.voitures["911"],
      specifications: {
        moteur: "Flat 6 3.0l Turbo",
        puissance: 480,
        couple: 530,
        transmission: "PDK 8",
        acceleration_0_100: 3.5,
        vitesse_max: 308,
        consommation: 11,
      },
      description:
        "911 Carrera S Des lignes emblématiques épurées et un bouclier arrière puissant décrivant clairement le caractère.",
      prix_base: 158500,
    },
    {
      nom_model: "Turbo",
      type_carrosserie: "Coupe",
      voiture: createdIds.voitures["911"],
      specifications: {
        moteur: "Flat 6 3.8l Bi-Turbo",
        puissance: 650,
        couple: 800,
        transmission: "PDK 8",
        acceleration_0_100: 2.7,
        vitesse_max: 330,
        consommation: 12,
      },
      description:
        "911 Turbo Allie un design expressif à des performances exceptionnelles, incarnant l'essence même de la sportivité.",
      prix_base: 278000,
    },
    {
      nom_model: "GTS",
      type_carrosserie: "Coupe",
      voiture: createdIds.voitures["911"],
      specifications: {
        moteur: "Flat 6 3.5l Turbo",
        puissance: 541,
        couple: 610,
        transmission: "PDK 8",
        acceleration_0_100: 3.0,
        vitesse_max: 312,
        consommation: 11.5,
      },
      description:
        "911 GTS Un design expressif et des performances dynamiques pour une expérience de conduite exaltante.",
      prix_base: 181000,
    },
    {
      nom_model: "GT3",
      type_carrosserie: "Coupe",
      voiture: createdIds.voitures["911"],
      specifications: {
        moteur: "Flat 6 4.0l Atmosphérique",
        puissance: 510,
        couple: 450,
        transmission: "PDK 7",
        acceleration_0_100: 3.4,
        vitesse_max: 311,
        consommation: 13,
      },
      description:
        "911 GT3 Conçue pour la piste, offrant une expérience de conduite pure et dynamique.",
      prix_base: 214000,
    },
    {
      nom_model: "GT3 RS",
      type_carrosserie: "Coupe",
      voiture: createdIds.voitures["911"],
      specifications: {
        moteur: "Flat 6 4.0l Atmosphérique",
        puissance: 525,
        couple: 465,
        transmission: "PDK 7",
        acceleration_0_100: 3.2,
        vitesse_max: 296,
        consommation: 13.5,
      },
      description:
        "Version extrême de la 911 GT3 RS, optimisée pour la performance sur circuit.",
      prix_base: 254000,
    },
    {
      nom_model: "Carrera S",
      type_carrosserie: "Cabriolet",
      voiture: createdIds.voitures["911"],
      specifications: {
        moteur: "Flat 6 3.0l Turbo",
        puissance: 480,
        couple: 530,
        transmission: "PDK 8",
        acceleration_0_100: 3.7,
        vitesse_max: 306,
        consommation: 11.2,
      },
      description:
        "911 Carrera S Cabriolet Profitez de la puissance de la 911 Carrera S avec le plaisir du cabriolet.",
      prix_base: 172000,
    },
    {
      nom_model: "GTS",
      type_carrosserie: "Cabriolet",
      voiture: createdIds.voitures["911"],
      specifications: {
        moteur: "Flat 6 3.5l Turbo",
        puissance: 541,
        couple: 610,
        transmission: "PDK 8",
        acceleration_0_100: 3.1,
        vitesse_max: 312,
        consommation: 11.7,
      },
      description:
        "911 GTS Cabriolet Allie design expressif et performances dynamiques en version cabriolet.",
      prix_base: 195000,
    },
    {
      nom_model: "Turbo",
      type_carrosserie: "Cabriolet",
      voiture: createdIds.voitures["911"],
      specifications: {
        moteur: "Flat 6 3.6l Bi-Turbo",
        puissance: 711,
        couple: 800,
        transmission: "PDK 8",
        acceleration_0_100: 2.6,
        vitesse_max: 322,
        consommation: 12,
      },
      description:
        "911 Turbo Cabriolet Allie un design expressif à des performances exceptionnelles, incarnant l'essence même de la sportivité.",
      prix_base: 290000,
    },
    {
      nom_model: "Targa 4S",
      type_carrosserie: "Targa",
      voiture: createdIds.voitures["911"],
      specifications: {
        moteur: "Flat 6 3.0l Turbo",
        puissance: 480,
        couple: 530,
        transmission: "PDK 8",
        acceleration_0_100: 3.7,
        vitesse_max: 304,
        consommation: 11.3,
      },
      description:
        "911 Targa 4S Combine le plaisir d'un cabriolet avec la sécurité d'un toit rigide amovible.",
      prix_base: 185000,
    },
    {
      nom_model: "Targa GTS",
      type_carrosserie: "Targa",
      voiture: createdIds.voitures["911"],
      specifications: {
        moteur: "Flat 6 3.5l Turbo",
        puissance: 541,
        couple: 610,
        transmission: "PDK 8",
        acceleration_0_100: 3.1,
        vitesse_max: 312,
        consommation: 11.4,
      },
      description:
        "911 Targa GTS Version sportive de la Targa avec des performances accrues.",
      prix_base: 204000,
    },
    // Variantes Cayenne
    {
      nom_model: "E-Hybrid",
      type_carrosserie: "SUV",
      voiture: createdIds.voitures["Cayenne"],
      specifications: {
        moteur: "V6 3.0l Turbo + Moteur électrique",
        puissance: 470,
        couple: 650,
        transmission: "Tiptronic 8",
        acceleration_0_100: 4.9,
        vitesse_max: 254,
        consommation: 3.2,
      },
      description: "Cayenne E-Hybrid Performance hybride rechargeable avancée.",
      prix_base: 119000,
    },
    {
      nom_model: "S",
      type_carrosserie: "SUV",
      voiture: createdIds.voitures["Cayenne"],
      specifications: {
        moteur: "V8 4.0l Bi-Turbo",
        puissance: 474,
        couple: 550,
        transmission: "Tiptronic 8",
        acceleration_0_100: 5.0,
        vitesse_max: 273,
        consommation: 11.1,
      },
      description: "Cayenne S SUV performant avec un moteur V8 bi-turbo.",
      prix_base: 124000,
    },
    {
      nom_model: "GTS",
      type_carrosserie: "SUV",
      voiture: createdIds.voitures["Cayenne"],
      specifications: {
        moteur: "V8 4.0l Bi-Turbo",
        puissance: 500,
        couple: 660,
        transmission: "Tiptronic 8",
        acceleration_0_100: 4.7,
        vitesse_max: 275,
        consommation: 11.1,
      },
      description: "Cayenne GTS SUV sportif avec des performances accrues.",
      prix_base: 147000,
    },
    // Variantes Cayman
    {
      nom_model: "GTS",
      type_carrosserie: "Coupe",
      voiture: createdIds.voitures["Cayman"],
      specifications: {
        moteur: "Flat 6 4.0l Atmosphérique",
        puissance: 500,
        couple: 450,
        transmission: "PDK 7",
        acceleration_0_100: 3.9,
        vitesse_max: 304,
        consommation: 11.5,
      },
      description:
        "Cayman GTS L'essence du sport automobile avec un moteur atmosphérique qui monte jusqu'à 9000 tr/min.",
      prix_base: 125000,
    },
    {
      nom_model: "GT4 RS",
      type_carrosserie: "Coupe",
      voiture: createdIds.voitures["Cayman"],
      specifications: {
        moteur: "Flat 6 4.0l Atmosphérique",
        puissance: 500,
        couple: 450,
        transmission: "PDK 7",
        acceleration_0_100: 3.4,
        vitesse_max: 315,
        consommation: 13.5,
      },
      description:
        "Cayman GT4 RS Version extrême du Cayman, optimisée pour la piste.",
      prix_base: 163000,
    },
  ];

  // Voitures d'occasion - 12 véhicules
  const modelsOccasion = [
    // 2 Carrera (Coupe)
    {
      nom_model: "Carrera S",
      type_carrosserie: "Coupe",
      voiture: createdIds.voitures["911_occasion"],
      annee_production: new Date("2020-03-15"),
      specifications: {
        moteur: "Flat 6 3.0l Turbo",
        puissance: 450,
        couple: 530,
        transmission: "PDK 8",
        acceleration_0_100: 3.7,
        vitesse_max: 308,
        consommation: 11.2,
      },
      description:
        "911 Carrera S d'occasion 2020. Excellent état, révisions complètes effectuées. Kilométrage: 35 000 km. Garantie Porsche Approved.",
      prix_base: 98000,
      numero_vin: "WP0ZZZ99ZLS123456",
      couleur_exterieur: createdIds.couleurs_exterieur["black"],
      couleur_interieur: createdIds.couleurs_interieur["black"],
      taille_jante: createdIds.tailles_jante["19"],
      concessionnaire: "Porsche Centre Paris",
    },
    {
      nom_model: "Carrera S",
      type_carrosserie: "Coupe",
      voiture: createdIds.voitures["911_occasion"],
      annee_production: new Date("2019-06-20"),
      specifications: {
        moteur: "Flat 6 3.0l Turbo",
        puissance: 450,
        couple: 530,
        transmission: "PDK 8",
        acceleration_0_100: 3.7,
        vitesse_max: 308,
        consommation: 11.2,
      },
      description:
        "911 Carrera S d'occasion 2019. État impeccable, historique complet. Kilométrage: 42 000 km. Équipements premium.",
      prix_base: 92000,
      numero_vin: "WP0ZZZ99ZKS789012",
      couleur_exterieur: createdIds.couleurs_exterieur["white"],
      couleur_interieur: createdIds.couleurs_interieur["caramel"],
      taille_jante: createdIds.tailles_jante["19"],
      siege: createdIds.sieges["Sièges sport"],
      concessionnaire: "Porsche Centre Lyon",
    },
    // 2 Targa
    {
      nom_model: "Targa 4S",
      type_carrosserie: "Targa",
      voiture: createdIds.voitures["911_occasion"],
      annee_production: new Date("2021-04-10"),
      specifications: {
        moteur: "Flat 6 3.0l Turbo",
        puissance: 480,
        couple: 530,
        transmission: "PDK 8",
        acceleration_0_100: 3.7,
        vitesse_max: 304,
        consommation: 11.3,
      },
      description:
        "911 Targa 4S d'occasion 2021. Comme neuve, premier propriétaire. Kilométrage: 18 000 km. Pack Sport Chrono.",
      prix_base: 125000,
      numero_vin: "WP0ZZZ99ZMS345678",
      couleur_exterieur: createdIds.couleurs_exterieur["yellow"],
      couleur_interieur: createdIds.couleurs_interieur["black"],
      taille_jante: createdIds.tailles_jante["21"],
      package: createdIds.packages["Sport Chrono"],
      concessionnaire: "Porsche Centre Bordeaux",
    },
    {
      nom_model: "Targa GTS",
      type_carrosserie: "Targa",
      voiture: createdIds.voitures["911_occasion"],
      annee_production: new Date("2020-09-25"),
      specifications: {
        moteur: "Flat 6 3.5l Turbo",
        puissance: 541,
        couple: 610,
        transmission: "PDK 8",
        acceleration_0_100: 3.1,
        vitesse_max: 312,
        consommation: 11.4,
      },
      description:
        "911 Targa GTS d'occasion 2020. Configuration sportive, état exceptionnel. Kilométrage: 28 000 km.",
      prix_base: 138000,
      numero_vin: "WP0ZZZ99ZLS901234",
      couleur_exterieur: createdIds.couleurs_exterieur["blue"],
      couleur_interieur: createdIds.couleurs_interieur["black"],
      taille_jante: createdIds.tailles_jante["21"],
      siege: createdIds.sieges["Sièges sport adaptatifs Plus"],
      concessionnaire: "Porsche Centre Marseille",
    },
    // 2 GT3 (Coupe)
    {
      nom_model: "GT3",
      type_carrosserie: "Coupe",
      voiture: createdIds.voitures["911_occasion"],
      annee_production: new Date("2019-11-05"),
      specifications: {
        moteur: "Flat 6 4.0l Atmosphérique",
        puissance: 500,
        couple: 450,
        transmission: "PDK 7",
        acceleration_0_100: 3.4,
        vitesse_max: 311,
        consommation: 13,
      },
      description:
        "911 GT3 d'occasion 2019. Voiture de collection, conduite circuit occasionnelle. Kilométrage: 12 000 km.",
      prix_base: 165000,
      numero_vin: "WP0ZZZ99ZKS567890",
      couleur_exterieur: createdIds.couleurs_exterieur["red"],
      couleur_interieur: createdIds.couleurs_interieur["black"],
      taille_jante: createdIds.tailles_jante["21"],
      package: createdIds.packages["Sport Chrono"],
      concessionnaire: "Porsche Centre Monaco",
    },
    {
      nom_model: "GT3 RS",
      type_carrosserie: "Coupe",
      voiture: createdIds.voitures["911_occasion"],
      annee_production: new Date("2020-02-14"),
      specifications: {
        moteur: "Flat 6 4.0l Atmosphérique",
        puissance: 520,
        couple: 465,
        transmission: "PDK 7",
        acceleration_0_100: 3.2,
        vitesse_max: 296,
        consommation: 13.5,
      },
      description:
        "911 GT3 RS d'occasion 2020. Rare, configuration Weissach. État musée. Kilométrage: 8 500 km.",
      prix_base: 210000,
      numero_vin: "WP0ZZZ99ZLS234567",
      couleur_exterieur: createdIds.couleurs_exterieur["gray"],
      couleur_interieur: createdIds.couleurs_interieur["black"],
      taille_jante: createdIds.tailles_jante["21"],
      package: createdIds.packages["Weissach"],
      concessionnaire: "Porsche Centre Geneva",
    },
    // 2 Cabriolet
    {
      nom_model: "Carrera S",
      type_carrosserie: "Cabriolet",
      voiture: createdIds.voitures["911_occasion"],
      annee_production: new Date("2021-07-08"),
      specifications: {
        moteur: "Flat 6 3.0l Turbo",
        puissance: 480,
        couple: 530,
        transmission: "PDK 8",
        acceleration_0_100: 3.7,
        vitesse_max: 306,
        consommation: 11.2,
      },
      description:
        "911 Carrera S Cabriolet d'occasion 2021. Plaisir de conduite à ciel ouvert. Kilométrage: 22 000 km.",
      prix_base: 115000,
      numero_vin: "WP0ZZZ99ZMS678901",
      couleur_exterieur: createdIds.couleurs_exterieur["red"],
      couleur_interieur: createdIds.couleurs_interieur["caramel"],
      taille_jante: createdIds.tailles_jante["19"],
      siege: createdIds.sieges["Sièges sport adaptatifs Plus"],
      concessionnaire: "Porsche Centre Nice",
    },
    {
      nom_model: "Turbo",
      type_carrosserie: "Cabriolet",
      voiture: createdIds.voitures["911_occasion"],
      annee_production: new Date("2020-05-20"),
      specifications: {
        moteur: "Flat 6 3.6l Bi-Turbo",
        puissance: 700,
        couple: 800,
        transmission: "PDK 8",
        acceleration_0_100: 2.7,
        vitesse_max: 322,
        consommation: 12,
      },
      description:
        "911 Turbo Cabriolet d'occasion 2020. Performance ultime en version décapotable. Kilométrage: 15 000 km.",
      prix_base: 195000,
      numero_vin: "WP0ZZZ99ZLS890123",
      couleur_exterieur: createdIds.couleurs_exterieur["black"],
      couleur_interieur: createdIds.couleurs_interieur["black"],
      taille_jante: createdIds.tailles_jante["21"],
      package: createdIds.packages["Sport Chrono"],
      concessionnaire: "Porsche Centre Cannes",
    },
    // 2 Cayman (Coupe)
    {
      nom_model: "GTS",
      type_carrosserie: "Coupe",
      voiture: createdIds.voitures["Cayman_occasion"],
      annee_production: new Date("2019-08-12"),
      specifications: {
        moteur: "Flat 6 4.0l Atmosphérique",
        puissance: 500,
        couple: 450,
        transmission: "PDK 7",
        acceleration_0_100: 3.9,
        vitesse_max: 304,
        consommation: 11.5,
      },
      description:
        "Cayman GTS d'occasion 2019. Moteur atmosphérique exceptionnel, plaisir de conduite pur. Kilométrage: 30 000 km.",
      prix_base: 78000,
      numero_vin: "WP0ZZZ98ZKS456789",
      couleur_exterieur: createdIds.couleurs_exterieur["yellow"],
      couleur_interieur: createdIds.couleurs_interieur["black"],
      taille_jante: createdIds.tailles_jante["19"],
      concessionnaire: "Porsche Centre Toulouse",
    },
    {
      nom_model: "GT4 RS",
      type_carrosserie: "Coupe",
      voiture: createdIds.voitures["Cayman_occasion"],
      annee_production: new Date("2021-10-30"),
      specifications: {
        moteur: "Flat 6 4.0l Atmosphérique",
        puissance: 500,
        couple: 450,
        transmission: "PDK 7",
        acceleration_0_100: 3.4,
        vitesse_max: 315,
        consommation: 13.5,
      },
      description:
        "Cayman GT4 RS d'occasion 2021. Modèle rare et recherché, parfait état. Kilométrage: 9 000 km.",
      prix_base: 142000,
      numero_vin: "WP0ZZZ98ZMS012345",
      couleur_exterieur: createdIds.couleurs_exterieur["white"],
      couleur_interieur: createdIds.couleurs_interieur["black"],
      taille_jante: createdIds.tailles_jante["21"],
      package: createdIds.packages["Weissach"],
      concessionnaire: "Porsche Centre Stuttgart",
    },
    // 2 Cayenne (SUV)
    {
      nom_model: "S",
      type_carrosserie: "SUV",
      voiture: createdIds.voitures["Cayenne_occasion"],
      annee_production: new Date("2020-01-18"),
      specifications: {
        moteur: "V8 4.0l Bi-Turbo",
        puissance: 474,
        couple: 550,
        transmission: "Tiptronic 8",
        acceleration_0_100: 5.0,
        vitesse_max: 273,
        consommation: 11.1,
      },
      description:
        "Cayenne S d'occasion 2020. SUV de luxe polyvalent, parfait pour la famille. Kilométrage: 45 000 km.",
      prix_base: 82000,
      numero_vin: "WP1ZZZ9PZLS678901",
      couleur_exterieur: createdIds.couleurs_exterieur["black"],
      couleur_interieur: createdIds.couleurs_interieur["red"],
      taille_jante: createdIds.tailles_jante["22"],
      siege: createdIds.sieges["Sièges sport adaptatifs Plus"],
      concessionnaire: "Porsche Centre Strasbourg",
    },
    {
      nom_model: "GTS",
      type_carrosserie: "SUV",
      voiture: createdIds.voitures["Cayenne_occasion"],
      annee_production: new Date("2021-03-22"),
      specifications: {
        moteur: "V8 4.0l Bi-Turbo",
        puissance: 500,
        couple: 660,
        transmission: "Tiptronic 8",
        acceleration_0_100: 4.7,
        vitesse_max: 275,
        consommation: 11.1,
      },
      description:
        "Cayenne GTS d'occasion 2021. Version sportive du SUV Porsche, état irréprochable. Kilométrage: 25 000 km.",
      prix_base: 98000,
      numero_vin: "WP1ZZZ9PZMS234567",
      couleur_exterieur: createdIds.couleurs_exterieur["black"],
      couleur_interieur: createdIds.couleurs_interieur["caramel"],
      taille_jante: createdIds.tailles_jante["22"],
      package: createdIds.packages["Sport Chrono"],
      concessionnaire: "Porsche Centre Nantes",
    },
  ];

  for (const model of models) {
    try {
      const response = await axios.post(`${API_URL}/model_porsche/new`, model, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      createdIds.model_porsche[model.nom_model] = response.data._id;
      console.log(`Model Porsche créé: ${model.nom_model}`);
      await delay(DELAY);
    } catch (error) {
      console.error(
        `Erreur création model ${model.nom_model}:`,
        error.response?.data?.message || error.message
      );
    }
  }

  // Créer les modèles d'occasion
  console.log("\nCréation des modèles Porsche d'occasion...");
  for (const model of modelsOccasion) {
    try {
      const response = await axios.post(`${API_URL}/model_porsche/new`, model, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      console.log(
        `Model Porsche d'occasion créé: ${model.nom_model} ${
          model.type_carrosserie
        } (${new Date(model.annee_production).getFullYear()}) - ${
          model.prix_base
        }€`
      );
      await delay(DELAY);
    } catch (error) {
      console.error(
        `Erreur création model d'occasion ${model.nom_model} ${model.type_carrosserie}:`,
        error.response?.data?.message || error.message
      );
    }
  }
}

/**
 * Créer les couleurs d'accessoires
 */
async function createCouleursAccesoire() {
  console.log("\nCréation des couleurs d'accessoires...");

  const couleurs = [
    {
      nom_couleur: "black",
    },
    {
      nom_couleur: "black_white",
    },
    {
      nom_couleur: "bleu_sky",
    },
    {
      nom_couleur: "caramel",
    },
    {
      nom_couleur: "gray",
    },
    {
      nom_couleur: "green",
    },
    {
      nom_couleur: "red",
    },
  ];

  for (const couleur of couleurs) {
    try {
      const response = await axios.post(
        `${API_URL}/couleur_accesoire/new`,
        couleur,
        {
          headers: { Authorization: `Bearer ${adminToken}` },
        }
      );
      createdIds.couleurs_accesoire[couleur.nom_couleur] = response.data._id;
      console.log(`Couleur accessoire créée: ${couleur.nom_couleur}`);
      await delay(DELAY);
    } catch (error) {
      console.error(
        `Erreur création couleur ${couleur.nom_couleur}:`,
        error.response?.data?.message || error.message
      );
    }
  }
}

/**
 * Créer les accessoires
 */
async function createAccessoires() {
  console.log("\nCréation des accessoires...");

  const accessoires = [
    {
      type_accesoire: "porte-clés",
      nom_accesoire: "Porte-clés écusson noir",
      description:
        "Chaque Porsche l'arbore. Pourquoi ne le feriez-vous pas vous aussi ? L'écusson Porsche, Porte-clés écusson noir classique Porsche.",
      prix: 35,
    },
    {
      type_accesoire: "porte-clés",
      nom_accesoire: "Porte-clés Bicolore noir et blanc",
      description:
        "Chaque Porsche l'arbore. Pourquoi ne le feriez-vous pas vous aussi ? L'écusson Porsche, Porte-clés bicolore noir et blanc avec écusson Porsche.",
      prix: 45,
    },
    {
      type_accesoire: "vetement",
      nom_accesoire: "Casquette Porsche Racing rouge",
      description:
        "Casquette officielle Porsche Motorsport. Broderie de haute qualité.",
      prix: 55,
    },
    {
      type_accesoire: "vetement",
      nom_accesoire: "Casquette GT noir",
      description: "Casquette noire style GT avec logo Porsche.",
      prix: 60,
    },
    {
      type_accesoire: "decoration",
      nom_accesoire: "Modèle réduit 911 gris",
      description:
        "Réplique miniature 1:43 de la Porsche 911 GT3. Détails ultra-précis.",
      prix: 89,
    },
    {
      type_accesoire: "decoration",
      nom_accesoire: "Plaque émaillée écusson Porsche",
      description:
        "Plaque décorative en émail véritable. Logo Porsche classique.",
      prix: 75,
    },
  ];

  for (const accessoire of accessoires) {
    try {
      const response = await axios.post(
        `${API_URL}/accesoire/new`,
        accessoire,
        {
          headers: { Authorization: `Bearer ${adminToken}` },
        }
      );
      createdIds.accesoires[accessoire.nom_accesoire] = response.data._id;
      console.log(`Accessoire créé: ${accessoire.nom_accesoire}`);
      await delay(DELAY);
    } catch (error) {
      console.error(
        `Erreur création accessoire ${accessoire.nom_accesoire}:`,
        error.response?.data?.message || error.message
      );
    }
  }
}

/**
 * Créer les packages
 */
async function createPackages() {
  console.log("\nCréation des packages...");

  const packages = [
    {
      nom_package: "Weissach",
      description:
        "Le package Weissach transforme votre Porsche en machine de course ultime. Avec des composants en fibre de carbone, des suspensions sport réglables et une réduction de poids significative, ce package est conçu pour les puristes à la recherche de performances maximales sur circuit.",
      prix: 16000,
      disponible: true,
    },
    {
      nom_package: "Sport Chrono",
      description:
        "Le package Sport Chrono ajoute un chronomètre analogique/numérique au tableau de bord, le bouton Sport Plus sur le volant, et le système PSM Sport. Il permet également d'accéder aux modes de conduite Normal, Sport, Sport Plus et Individual pour une expérience de conduite personnalisée.",
      prix: 2500,
      disponible: true,
    },
  ];

  for (const pkg of packages) {
    try {
      const response = await axios.post(`${API_URL}/package/new`, pkg, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      createdIds.packages[pkg.nom_package] = response.data._id;
      console.log(`Package créé: ${pkg.nom_package}`);
      await delay(DELAY);
    } catch (error) {
      console.error(
        `Erreur création package ${pkg.nom_package}:`,
        error.response?.data?.message || error.message
      );
    }
  }
}

/**
 * Créer les sièges
 */
async function createSieges() {
  console.log("\nCréation des sièges...");

  const sieges = [
    {
      nom_siege: "Sièges sport",
      description:
        "Les sièges sport offrent un maintien latéral exceptionnel grâce à leurs appuie-têtes intégrés et leurs assises latérales prononcées. Parfaits pour une conduite sportive tout en conservant le confort au quotidien.",
      prix: 0,
      options_confort: {
        ventilation: false,
        chauffage: true,
      },
    },
    {
      nom_siege: "Sièges sport adaptatifs Plus",
      description:
        "Les sièges sport adaptatifs Plus combinent un design sportif avec un confort premium. Ils disposent d'un réglage électrique 18 positions, d'une fonction mémoire, de la ventilation et du chauffage intégrés. Le support lombaire électrique et les coussins latéraux ajustables garantissent un maintien optimal.",
      prix: 3500,
      options_confort: {
        ventilation: true,
        chauffage: true,
      },
    },
  ];

  for (const siege of sieges) {
    try {
      const response = await axios.post(`${API_URL}/siege/new`, siege, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      createdIds.sieges[siege.nom_siege] = response.data._id;
      console.log(`Siège créé: ${siege.nom_siege}`);
      await delay(DELAY);
    } catch (error) {
      console.error(
        `Erreur création siège ${siege.nom_siege}:`,
        error.response?.data?.message || error.message
      );
    }
  }
}

/**
 * Créer les voitures actuelles de l'utilisateur
 */
async function createModelPorscheActuel() {
  console.log("\nCréation des voitures actuelles de l'utilisateur...");

  // Générer un timestamp pour rendre les VIN uniques
  const timestamp = Date.now().toString().slice(-8);

  const voitures = [
    {
      type_model: "Porsche 911 Turbo",
      type_carrosserie: "Targa",
      annee_production: "1975-01-01",
      info_moteur: "3.0 litres 260 ch",
      info_transmission: "Manuelle",
      numero_win: `9306${timestamp}`,
      couleur_exterieur: createdIds.couleurs_exterieur["green"],
      couleur_interieur: createdIds.couleurs_interieur["caramel"],
      taille_jante: createdIds.tailles_jante["16"],
    },
    {
      type_model: "Porsche Cayenne S",
      type_carrosserie: "SUV",
      annee_production: "2018-06-15",
      info_moteur: "V8 3.0l Bi-Turbo 440 ch",
      info_transmission: "Tiptronic",
      numero_win: `WP1ZZZ${timestamp}`,
      couleur_exterieur: createdIds.couleurs_exterieur["black"],
      couleur_interieur: createdIds.couleurs_interieur["black"],
      taille_jante: createdIds.tailles_jante["22"],
    },
  ];

  for (const voiture of voitures) {
    try {
      const response = await axios.post(
        `${API_URL}/model_porsche_actuel/new`,
        voiture,
        {
          headers: { Authorization: `Bearer ${userToken}` },
        }
      );
      console.log(`Voiture actuelle créée: ${voiture.type_model}`);
      await delay(DELAY);
    } catch (error) {
      const errorMsg = error.response?.data?.message || error.message;
      const errorDetails =
        error.response?.data?.errors || error.response?.data?.error || "";
      console.error(
        `Erreur création voiture ${voiture.type_model}: ${errorMsg}`
      );
      if (errorDetails) {
        console.error(`  Détails:`, errorDetails);
      }
    }
  }
}

/**
 * Afficher un résumé des données créées
 */
function displaySummary() {
  console.log("\n" + "=".repeat(60));
  console.log("RÉSUMÉ DES DONNÉES CRÉÉES");
  console.log("=".repeat(60));
  console.log(`Utilisateurs: 4 (admin, responsable, conseiller, user)`);
  console.log(
    `Couleurs extérieures: ${Object.keys(createdIds.couleurs_exterieur).length}`
  );
  console.log(
    `Couleurs intérieures: ${Object.keys(createdIds.couleurs_interieur).length}`
  );
  console.log(
    `Tailles de jantes: ${Object.keys(createdIds.tailles_jante).length}`
  );
  console.log(`Voitures (base neuves): 3 (911, Cayenne, Cayman)`);
  console.log(`Voitures (base occasions): 3 (911, Cayenne, Cayman)`);
  console.log(
    `Model Porsche neufs: ${Object.keys(createdIds.model_porsche).length}`
  );
  console.log(`Model Porsche occasions: 12`);
  console.log(`  - 2 Carrera Coupe`);
  console.log(`  - 2 Targa (4S, GTS)`);
  console.log(`  - 2 GT3 (GT3, GT3 RS)`);
  console.log(`  - 2 Cabriolet (Carrera S, Turbo)`);
  console.log(`  - 2 Cayman (GTS, GT4 RS)`);
  console.log(`  - 2 Cayenne (S, GTS)`);
  console.log(`Packages: ${Object.keys(createdIds.packages).length}`);
  console.log(`Sièges: ${Object.keys(createdIds.sieges).length}`);
  console.log(
    `Couleurs accessoires: ${Object.keys(createdIds.couleurs_accesoire).length}`
  );
  console.log(`Accessoires: ${Object.keys(createdIds.accesoires).length}`);
  console.log("=".repeat(60));
  console.log("\nINITIALISATION TERMINÉE AVEC SUCCÈS!\n");
  console.log("Informations de connexion:");
  console.log("   Admin: admin@porsche.com / Admin123!");
  console.log("   Responsable: responsable@porsche.com / Responsable123!");
  console.log("   Conseiller: conseiller@porsche.com / Conseiller123!");
  console.log("   User: user@gmail.com / User123!");
  console.log("=".repeat(60) + "\n");
}

/**
 * Fonction principale
 */
async function main() {
  console.log("\n" + "=".repeat(60));
  console.log("INITIALISATION DE LA BASE DE DONNÉES PORSCHE");
  console.log("=".repeat(60) + "\n");

  try {
    // 0. Nettoyer la base de données (optionnel - décommenter si besoin)
    await cleanDatabase();

    // 1. Créer les utilisateurs
    await createUsers();

    // 1b. Vérifier que tous les IDs utilisateurs sont récupérés
    console.log("\nVérification des IDs utilisateurs...");
    const requiredUsers = ["admin", "responsable", "conseillere", "user"];
    const usersData = [
      {
        email: "admin@porsche.com",
        password: "Admin123!",
        targetRole: "admin",
      },
      {
        email: "responsable@porsche.com",
        password: "Responsable123!",
        targetRole: "responsable",
      },
      {
        email: "conseiller@porsche.com",
        password: "Conseiller123!",
        targetRole: "conseillere",
      },
      { email: "user@gmail.com", password: "User123!", targetRole: "user" },
    ];

    for (const userData of usersData) {
      if (!createdIds.users[userData.targetRole]) {
        try {
          const loginResponse = await axios.post(`${API_URL}/user/login`, {
            email: userData.email,
            password: userData.password,
          });
          if (loginResponse.data.user?.id) {
            createdIds.users[userData.targetRole] = loginResponse.data.user.id;
            console.log(
              `  ID récupéré pour ${userData.email}: ${loginResponse.data.user.id}`
            );
          }
        } catch (error) {
          console.error(`  Erreur récupération ID pour ${userData.email}`);
        }
      }
    }

    // 2. Promouvoir le premier utilisateur en admin directement dans MongoDB
    console.log("\nPromotion du premier utilisateur en admin...");
    try {
      if (!mongoose.connection.readyState) {
        await mongoose.connect(
          process.env.DB_URI || "mongodb://localhost:27017/porsche"
        );
      }

      if (!createdIds.users["admin"]) {
        throw new Error("ID de l'admin non trouvé, impossible de continuer");
      }

      // Utiliser mongoose.connection.db pour une requête directe
      await mongoose.connection.db.collection("users").updateOne(
        { _id: new mongoose.Types.ObjectId(createdIds.users["admin"]) },
        {
          $set: {
            role: "admin",
            isAdmin: true,
          },
        }
      );
      console.log("Premier utilisateur promu en admin");
    } catch (error) {
      console.error("Erreur lors de la promotion en admin:", error.message);
      throw error;
    }

    // 3. Login admin
    console.log("\nConnexion de l'administrateur...");
    adminToken = await login("admin@porsche.com", "Admin123!");

    // 4. Mettre à jour les rôles des autres utilisateurs
    await updateUserRoles();

    // 5. Créer les données de base (nécessite admin)
    await createCouleursExterieur();
    await createCouleursInterieur();
    await createTaillesJante();
    await createPackages();
    await createSieges();
    await createVoitures();
    await createModelPorsche();
    await createCouleursAccesoire();
    await createAccessoires();

    // 6. Login user
    console.log("\nConnexion de l'utilisateur...");
    userToken = await login("user@gmail.com", "User123!");

    // 7. Créer les voitures de l'utilisateur
    await createModelPorscheActuel();

    // 8. Afficher le résumé
    displaySummary();
  } catch (error) {
    console.error("\nERREUR FATALE:", error.message);
    console.error("\nVérifiez que:");
    console.error("   1. Le serveur Node.js est démarré (npm start)");
    console.error("   2. MongoDB est en cours d'exécution");
    console.error("   3. L'URL de l'API est correcte:", API_URL);
    process.exit(1);
  }
}

// Lancer le script
main();
