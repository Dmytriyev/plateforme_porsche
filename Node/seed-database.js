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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_URL = "http://localhost:3000/api";
const DELAY = 500; // Délai entre les requêtes (ms)

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
};

let adminToken = "";
let userToken = "";

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Connexion et récupération du token
 */
async function login(email, password) {
  try {
    const response = await axios.post(`${API_URL}/users/login`, {
      email,
      password,
    });
    console.log(`Connecté: ${email}`);
    return response.data.token;
  } catch (error) {
    console.error(
      `Erreur de connexion pour ${email}:`,
      error.response?.data?.message || error.message
    );
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
      telephone: "+33612345678",
      adresse: "15 Avenue des Champs-Élysées",
      code_postal: "75008",
      role: "admin",
    },
    {
      email: "responsable@porsche.com",
      password: "Responsable123!",
      nom: "Durand",
      prenom: "Claire",
      telephone: "+33612345679",
      adresse: "20 Rue de la Paix",
      code_postal: "75002",
      role: "responsable",
    },
    {
      email: "conseiller@porsche.com",
      password: "Conseiller123!",
      nom: "Martin",
      prenom: "Sophie",
      telephone: "+33612345689",
      adresse: "22 Rue de Rivoli",
      code_postal: "75001",
      role: "conseillere",
    },
    {
      email: "user@gmail.com",
      password: "User123!",
      nom: "Bernard",
      prenom: "Pierre",
      telephone: "+33612345680",
      adresse: "10 Boulevard Saint-Germain",
      code_postal: "75005",
      role: "user",
    },
  ];

  for (const user of users) {
    try {
      const response = await axios.post(`${API_URL}/users/register`, user);
      createdIds.users[user.role] = response.data._id;
      console.log(`User créé: ${user.email} (${user.role})`);
      await delay(DELAY);
    } catch (error) {
      if (
        error.response?.status === 409 ||
        error.response?.data?.message?.includes("existe")
      ) {
        console.log(`User existe déjà: ${user.email}`);
      } else {
        console.error(
          `Erreur création ${user.email}:`,
          error.response?.data?.message || error.message
        );
      }
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
        `${API_URL}/couleur-exterieur`,
        couleur,
        {
          headers: { Authorization: `Bearer ${adminToken}` },
        }
      );
      createdIds.couleurs_exterieur[couleur.nom_couleur] = response.data._id;
      console.log(`Couleur extérieure créée: ${couleur.nom_couleur}`);
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
      nom_couleur: "red_white",
      description: "Cuir bicolore rouge et blanc",
      prix: 4000,
    },
  ];

  for (const couleur of couleurs) {
    try {
      const response = await axios.post(
        `${API_URL}/couleur-interieur`,
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
      photo_jante: "16.jpg",
      description: "Jantes 16 pouces classic noires",
      prix: 0,
    },
    {
      taille_jante: "19",
      couleur_jante: "gray",
      photo_jante: "19.jpg",
      description: "Jantes 19 pouces Sport gris anthracite",
      prix: 1100,
    },
    {
      taille_jante: "20",
      couleur_jante: "gray",
      photo_jante: "20.jpg",
      description: "Jantes 20 pouces GT gris anthracite",
      prix: 0,
    },
    {
      taille_jante: "21",
      couleur_jante: "black",
      photo_jante: "21.jpg",
      description: "Jantes 21 pouces Turbo noires",
      prix: 1800,
    },
    {
      taille_jante: "22",
      couleur_jante: "gray",
      photo_jante: "22.jpg",
      description: "Jantes 22 pouces Cayenne grises",
      prix: 2000,
    },
  ];

  for (const jante of jantes) {
    try {
      const response = await axios.post(`${API_URL}/taille-jante`, jante, {
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

  for (const voiture of voitures) {
    try {
      const response = await axios.post(`${API_URL}/voiture`, voiture, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      createdIds.voitures[voiture.nom_model] = response.data._id;
      console.log(`Voiture créée: ${voiture.nom_model}`);
      await delay(DELAY);
    } catch (error) {
      console.error(
        `Erreur création voiture ${voiture.nom_model}:`,
        error.response?.data?.message || error.message
      );
    }
  }
}

/**
 * Créer les model porsche (variantes)
 */
async function createModelPorsche() {
  console.log("\nCréation des model porsche (variantes)...");

  const models = [
    {
      nom_model: "911 Carrera S",
      type_carrosserie: "coupe",
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
        "Des lignes emblématiques épurées et un bouclier arrière puissant décrivant clairement le caractère.",
      prix: 158500,
      acompte: 500,
    },
    {
      nom_model: "911 Turbo",
      type_carrosserie: "coupe",
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
        "Allie un design expressif à des performances exceptionnelles, incarnant l'essence même de la sportivité.",
      prix: 278000,
      acompte: 500,
    },
    {
      nom_model: "911 GTS",
      type_carrosserie: "coupe",
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
        "Un design expressif et des performances dynamiques pour une expérience de conduite exaltante.",
      prix: 181000,
      acompte: 500,
    },
    {
      nom_model: "911 GT3",
      type_carrosserie: "coupe",
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
        "Conçue pour la piste, offrant une expérience de conduite pure et dynamique.",
      prix: 214000,
      acompte: 500,
    },
    {
      nom_model: "911 GT3 RS",
      type_carrosserie: "coupe",
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
        "Version extrême de la GT3, optimisée pour la performance sur circuit.",
      prix: 254000,
      acompte: 500,
    },
    {
      nom_model: "911 Carrera S",
      type_carrosserie: "cabriolet",
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
        "Profitez de la puissance de la 911 Carrera S avec le plaisir du cabriolet.",
      prix: 172000,
      acompte: 500,
    },
    {
      nom_model: "911 GTS",
      type_carrosserie: "cabriolet",
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
        "Allie design expressif et performances dynamiques en version cabriolet.",
      prix: 195000,
      acompte: 500,
    },
    {
      nom_model: "911 Turbo S",
      type_carrosserie: "cabriolet",
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
        "Allie un design expressif à des performances exceptionnelles, incarnant l'essence même de la sportivité.",
      prix: 290000,
      acompte: 500,
    },
    {
      nom_model: "911 Targa 4S",
      type_carrosserie: "targa",
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
        "Combine le plaisir d'un cabriolet avec la sécurité d'un toit rigide amovible.",
      prix: 185000,
      acompte: 500,
    },
    {
      nom_model: "911 Targa 4 GTS",
      type_carrosserie: "targa",
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
        "Version sportive de la Targa avec des performances accrues.",
      prix: 204000,
      acompte: 500,
    },
    {
      nom_model: "Cayenne E-Hybrid",
      type_carrosserie: "suv",
      specifications: {
        moteur: "V6 3.0l Turbo + Moteur électrique",
        puissance: 470,
        couple: 650,
        transmission: "Tiptronic 8",
        acceleration_0_100: 4.9,
        vitesse_max: 254,
        consommation: 3.2,
      },
      description: "Performance hybride rechargeable avancée.",
      prix: 119000,
      acompte: 500,
    },
    {
      nom_model: "Cayenne S",
      type_carrosserie: "suv",
      specifications: {
        moteur: "V8 4.0l Bi-Turbo",
        puissance: 474,
        couple: 550,
        transmission: "Tiptronic 8",
        acceleration_0_100: 5.0,
        vitesse_max: 273,
        consommation: 11.1,
      },
      description: "SUV performant avec un moteur V8 bi-turbo.",
      prix: 124000,
      acompte: 500,
    },
    {
      nom_model: "Cayenne GTS",
      type_carrosserie: "suv",
      specifications: {
        moteur: "V8 4.0l Bi-Turbo",
        puissance: 500,
        couple: 660,
        transmission: "Tiptronic 8",
        acceleration_0_100: 4.7,
        vitesse_max: 275,
        consommation: 11.1,
      },
      description: "SUV sportif avec des performances accrues.",
      prix: 147000,
      acompte: 500,
    },
    {
      nom_model: "Cayman GTS",
      type_carrosserie: "coupe",
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
        "L'essence du sport automobile avec un moteur atmosphérique qui monte jusqu'à 9000 tr/min.",
      prix: 125000,
      acompte: 500,
    },
    {
      nom_model: "Cayman GT4 RS",
      type_carrosserie: "coupe",
      specifications: {
        moteur: "Flat 6 4.0l Atmosphérique",
        puissance: 500,
        couple: 450,
        transmission: "PDK 7",
        acceleration_0_100: 3.4,
        vitesse_max: 315,
        consommation: 13.5,
      },
      description: " Version extrême du Cayman, optimisée pour la piste.",
      prix: 163000,
      acompte: 500,
    },
  ];

  for (const model of models) {
    try {
      const response = await axios.post(`${API_URL}/model-porsche`, model, {
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
}

/**
 * Créer les couleurs d'accessoires
 */
async function createCouleursAccesoire() {
  console.log("\nCréation des couleurs d'accessoires...");

  const couleurs = [
    {
      nom_couleur: "black",
      description: "Noir classique",
    },
    {
      nom_couleur: "black_white",
      description: "Bicolore noir et blanc",
    },
    {
      nom_couleur: "bleu_sky",
      description: "Bleu ciel",
    },
    {
      nom_couleur: "caramel",
      description: "Caramel premium",
    },
    {
      nom_couleur: "gray",
      description: "Gris anthracite",
    },
    {
      nom_couleur: "green",
      description: "Vert racing",
    },
    {
      nom_couleur: "red",
      description: "Rouge Carmin",
    },
  ];

  for (const couleur of couleurs) {
    try {
      const response = await axios.post(
        `${API_URL}/couleur-accesoire`,
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
      type_accesoire: "casquettes",
      nom_accesoire: "Casquette Porsche Racing rouge",
      description:
        "Casquette officielle Porsche Motorsport. Broderie de haute qualité.",
      prix: 55,
    },
    {
      type_accesoire: "casquettes",
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
      const response = await axios.post(`${API_URL}/accesoire`, accessoire, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
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
 * Créer les voitures actuelles de l'utilisateur
 */
async function createModelPorscheActuel() {
  console.log("\nCréation des voitures actuelles de l'utilisateur...");

  const voitures = [
    {
      type_model: "Porsche 911 Turbo",
      type_carrosserie: "targa",
      annee_production: "1975-01-01",
      info_moteur: "3.0 litres 260 ch",
      info_transmission: "manuel",
      numero_win: "9306700644",
      couleur_exterieur: createdIds.couleurs_exterieur["green"],
      couleur_interieur: createdIds.couleurs_interieur["caramel"],
      taille_jante: createdIds.tailles_jante["16"],
    },
    {
      type_model: "Porsche Cayenne S",
      type_carrosserie: "suv",
      annee_production: "2018-06-15",
      info_moteur: "V8 3.0l Bi-Turbo 440 ch",
      info_transmission: "tiptronic",
      numero_win: "WP1ZZZ92ZKL123456",
      couleur_exterieur: createdIds.couleurs_exterieur["black"],
      couleur_interieur: createdIds.couleurs_interieur["black"],
      taille_jante: createdIds.tailles_jante["22"],
    },
  ];

  for (const voiture of voitures) {
    try {
      const response = await axios.post(
        `${API_URL}/model-porsche-actuel`,
        voiture,
        {
          headers: { Authorization: `Bearer ${userToken}` },
        }
      );
      console.log(`Voiture actuelle créée: ${voiture.type_model}`);
      await delay(DELAY);
    } catch (error) {
      console.error(
        `Erreur création voiture ${voiture.type_model}:`,
        error.response?.data?.message || error.message
      );
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
  console.log(`Utilisateurs: 3 (admin, conseiller, user)`);
  console.log(
    `Couleurs extérieures: ${Object.keys(createdIds.couleurs_exterieur).length}`
  );
  console.log(
    `Couleurs intérieures: ${Object.keys(createdIds.couleurs_interieur).length}`
  );
  console.log(
    `Tailles de jantes: ${Object.keys(createdIds.tailles_jante).length}`
  );
  console.log(`Voitures (base): ${Object.keys(createdIds.voitures).length}`);
  console.log(`Model Porsche: ${Object.keys(createdIds.model_porsche).length}`);
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
  console.log("   User: user@example.com / User123!");
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
    // 1. Créer les utilisateurs
    await createUsers();

    // 2. Login admin
    console.log("\nConnexion de l'administrateur...");
    adminToken = await login("admin@porsche.com", "Admin123!");

    // 3. Créer les données de base (nécessite admin)
    await createCouleursExterieur();
    await createCouleursInterieur();
    await createTaillesJante();
    await createVoitures();
    await createModelPorsche();
    await createCouleursAccesoire();
    await createAccessoires();

    // 4. Login user
    console.log("\nConnexion de l'utilisateur...");
    userToken = await login("user@example.com", "User123!");

    // 5. Créer les voitures de l'utilisateur
    await createModelPorscheActuel();

    // 6. Afficher le résumé
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
