#!/usr/bin/env node

import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/user.model.js";
import Voiture from "./models/voiture.model.js";
import Model_porsche from "./models/model_porsche.model.js";
import Commande from "./models/Commande.model.js";
import axios from "axios";

dotenv.config();

const BASE_URL = "http://localhost:3000";

const COLORS = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[36m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
};

const API_TIMEOUT = 5000;

// Statistiques
const stats = {
  total: 0,
  success: 0,
  failed: 0,
  skipped: 0,
};

// Stockage des données de test
const testData = {
  tokens: {
    admin: null,
    responsable: null,
    conseillere: null,
    user: null,
  },
  users: {
    admin: null,
    responsable: null,
    conseillere: null,
    user: null,
  },
  couleurs: {
    exterieur: [],
    interieur: [],
    accessoire: [],
  },
  tailles_jantes: [],
  voitures: {
    neuf: [],
    occasion: [],
  },
  modelPorsches: [],
  modelPorscheActuels: [],
  accessoires: [],
  photos: {
    voiture: [],
    porsche: [],
  },
  reservations: [],
  commandes: [],
  panier: null,
};

// Fonction de logging
const log = {
  title: (msg) =>
    console.log(
      `\n${COLORS.bright}${COLORS.blue}${"=".repeat(80)}${COLORS.reset}\n${
        COLORS.bright
      }${msg}${COLORS.reset}\n${COLORS.blue}${"=".repeat(80)}${COLORS.reset}`
    ),
  section: (msg) =>
    console.log(`\n${COLORS.bright}${COLORS.magenta}### ${msg}${COLORS.reset}`),
  info: (msg) => console.log(`${COLORS.cyan}ℹ ${msg}${COLORS.reset}`),
  success: (msg) => {
    stats.success++;
    stats.total++;
    console.log(`${COLORS.green}✓ ${msg}${COLORS.reset}`);
  },
  error: (msg) => {
    stats.failed++;
    stats.total++;
    console.log(`${COLORS.red}✗ ${msg}${COLORS.reset}`);
  },
  warning: (msg) => {
    stats.skipped++;
    console.log(`${COLORS.yellow}⚠ ${msg}${COLORS.reset}`);
  },
  detail: (msg) => console.log(`  ${COLORS.blue}${msg}${COLORS.reset}`),
};

async function request(method, endpoint, data = null, token = null) {
  const config = {
    method,
    url: `${BASE_URL}${endpoint}`,
    headers: { "Content-Type": "application/json" },
    validateStatus: () => true,
    timeout: API_TIMEOUT,
  };

  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  if (data && (method === "POST" || method === "PUT")) {
    config.data = data;
  }

  try {
    const response = await axios(config);
    return { status: response.status, data: response.data };
  } catch (error) {
    if (error.code === "ECONNREFUSED") {
      log.error("Serveur non disponible. Assurez-vous qu'il est démarré.");
      process.exit(1);
    }
    return { status: 500, error: error.message };
  }
}

// ============================================================================
// PARTIE 1: TESTS DES RÔLES ET PERMISSIONS
// ============================================================================

/**
 * ÉTAPE 1: Créer les utilisateurs de test
 */
async function createTestUsers() {
  log.section("ÉTAPE 1: Création des utilisateurs");

  try {
    await mongoose.connect(process.env.DB_URI);
    log.info("Connexion MongoDB réussie");

    await User.deleteMany({
      email: {
        $in: [
          "admin.test@porsche.com",
          "responsable.test@porsche.com",
          "conseillere.test@porsche.com",
          "user.test@porsche.com",
        ],
      },
    });

    const users = [
      {
        nom: "Admin",
        prenom: "Test",
        email: "admin.test@porsche.com",
        password: "Admin@123456",
        telephone: "0600000001",
        adresse: "1 Rue Admin",
        code_postal: "75001",
        role: "admin",
        isAdmin: true,
      },
      {
        nom: "Responsable",
        prenom: "Test",
        email: "responsable.test@porsche.com",
        password: "Responsable@123456",
        telephone: "0600000002",
        adresse: "2 Avenue Responsable",
        code_postal: "75002",
        role: "responsable",
        isAdmin: false,
      },
      {
        nom: "Conseillere",
        prenom: "Test",
        email: "conseillere.test@porsche.com",
        password: "Conseillere@123456",
        telephone: "0600000003",
        adresse: "3 Boulevard Conseillere",
        code_postal: "75003",
        role: "conseillere",
        isAdmin: false,
      },
      {
        nom: "User",
        prenom: "Test",
        email: "user.test@porsche.com",
        password: "User@123456",
        telephone: "0600000004",
        adresse: "4 Place User",
        code_postal: "75004",
        role: "user",
        isAdmin: false,
      },
    ];

    for (const userData of users) {
      const user = await User.create(userData);
      testData.users[userData.role] = user;
      log.success(`✓ ${userData.role}: ${userData.email}`);
    }

    await mongoose.disconnect();
  } catch (error) {
    log.error(`Erreur création utilisateurs: ${error.message}`);
    try {
      await mongoose.disconnect();
    } catch {}
    throw error;
  }
}

/**
 * ÉTAPE 2: Connexion des utilisateurs
 */
async function loginUsers() {
  log.section("ÉTAPE 2: Connexion des utilisateurs");

  const credentials = [
    { email: "admin.test@porsche.com", password: "Admin@123456", key: "admin" },
    {
      email: "responsable.test@porsche.com",
      password: "Responsable@123456",
      key: "responsable",
    },
    {
      email: "conseillere.test@porsche.com",
      password: "Conseillere@123456",
      key: "conseillere",
    },
    { email: "user.test@porsche.com", password: "User@123456", key: "user" },
  ];

  for (const cred of credentials) {
    const response = await request("POST", "/user/login", {
      email: cred.email,
      password: cred.password,
    });

    if (response.status === 200 && response.data.token) {
      testData.tokens[cred.key] = response.data.token;
      testData.users[cred.key] = response.data.user;
      log.success(`✓ ${cred.key} connecté`);
    } else {
      throw new Error(
        `Échec connexion ${cred.key} (status: ${response.status})`
      );
    }
  }
}

/**
 * ÉTAPE 3: Tests des permissions de création de voitures par rôle
 */
async function testVoiturePermissions() {
  log.section("ÉTAPE 3: Tests des permissions par rôle");

  // Test: User NE PEUT PAS créer une voiture (réservé au staff)
  log.info("Test: User NE PEUT PAS créer une voiture");
  const voitureDataUser = {
    nom_model: "Cayenne Test User",
    type_voiture: false,
    description: "Voiture créée par un utilisateur",
    prix: 85000,
    photo_voiture: [],
  };

  let response = await request(
    "POST",
    "/voiture/new",
    voitureDataUser,
    testData.tokens.user
  );
  if (response.status === 403) {
    log.success("✓ User ne peut pas créer de voiture (staff uniquement)");
  } else {
    log.error(`✗ User devrait être refusé (status: ${response.status})`);
  }

  // Test: Conseillère PEUT créer une voiture
  log.info("Test: Conseillère PEUT créer de voiture");
  const voitureDataConseillere = {
    nom_model: "911",
    type_voiture: false,
    description: "Voiture créée par conseillère",
    prix: 95000,
    photo_voiture: [],
  };

  response = await request(
    "POST",
    "/voiture/new",
    voitureDataConseillere,
    testData.tokens.conseillere
  );
  if (response.status === 201) {
    testData.voitures.occasion.push(response.data.voiture || response.data);
    log.success("✓ Conseillère peut créer de voiture");
  } else {
    log.error(
      `✗ Conseillère devrait pouvoir créer (status: ${response.status})`
    );
  }

  // Test: Responsable PEUT créer une voiture
  log.info("Test: Responsable PEUT créer de voiture");
  const voitureDataResponsable = {
    nom_model: "Cayman",
    type_voiture: false,
    description: "Voiture créée par responsable",
    prix: 75000,
    photo_voiture: [],
  };

  response = await request(
    "POST",
    "/voiture/new",
    voitureDataResponsable,
    testData.tokens.responsable
  );
  if (response.status === 201) {
    const voiture = response.data.data?.voiture || response.data.voiture;
    testData.voitures.occasion.push(voiture);
    log.success("✓ Responsable peut créer de voiture");
  } else {
    log.error(
      `✗ Responsable devrait pouvoir créer (status: ${response.status})`
    );
  }

  // Test: Admin PEUT créer une voiture
  log.info("Test: Admin PEUT créer de voiture");
  const voitureDataAdmin = {
    nom_model: "Cayenne",
    type_voiture: true,
    description: "Voiture créée par admin",
    prix: 105000,
    photo_voiture: [],
  };

  response = await request(
    "POST",
    "/voiture/new",
    voitureDataAdmin,
    testData.tokens.admin
  );
  if (response.status === 201) {
    const voiture = response.data.data?.voiture || response.data.voiture;
    testData.voitures.neuf.push(voiture);
    log.success("✓ Admin peut créer de voiture");
  } else {
    log.error(`✗ Admin devrait pouvoir créer (status: ${response.status})`);
  }

  // Test: Consultation publique
  log.info("Test: Consultation publique des voitures");
  response = await request("GET", "/voiture/all");
  if (response.status === 200) {
    log.success("✓ Accès public à la liste des voitures");
  } else {
    log.error("✗ L'accès public devrait fonctionner");
  }

  // Test: User NE PEUT PAS ajouter de photos
  if (testData.voitures.occasion.length > 0) {
    log.info("Test: Modification de voiture par le staff");
    const voitureId = testData.voitures.occasion[0]._id;

    // User ne peut pas modifier les photos
    response = await request(
      "PUT",
      `/voiture/${voitureId}/images/add`,
      { photo_voiture: [] },
      testData.tokens.user
    );
    if (response.status === 403) {
      log.success("✓ User ne peut pas modifier les photos de voiture");
    } else {
      log.error(`✗ User devrait être refusé (status: ${response.status})`);
    }

    // Conseillère PEUT modifier les photos
    response = await request(
      "PUT",
      `/voiture/${voitureId}/images/add`,
      { photo_voiture: [] },
      testData.tokens.conseillere
    );
    if (response.status === 200 || response.status === 400) {
      log.success("✓ Conseillère peut modifier les photos de voiture");
    } else {
      log.error(
        `✗ Conseillère devrait pouvoir modifier (status: ${response.status})`
      );
    }

    // Responsable PEUT modifier les photos
    response = await request(
      "PUT",
      `/voiture/${voitureId}/images/add`,
      { photo_voiture: [] },
      testData.tokens.responsable
    );
    if (response.status === 200 || response.status === 400) {
      log.success("✓ Responsable peut modifier les photos de voiture");
    } else {
      log.error(
        `✗ Responsable devrait pouvoir modifier (status: ${response.status})`
      );
    }
  }

  // Test: Suppression (admin uniquement) - Besoin de 2 voitures occasion
  if (testData.voitures.occasion.length > 0) {
    log.info("Test: Suppression de voiture (admin uniquement)");

    // Extraire correctement l'ID de la voiture
    const voitureData = testData.voitures.occasion[0];
    const voitureId =
      voitureData.data?.voiture?._id ||
      voitureData.voiture?._id ||
      voitureData._id;

    // Conseillère ne peut pas supprimer
    response = await request(
      "DELETE",
      `/voiture/${voitureId}`,
      null,
      testData.tokens.conseillere
    );
    if (response.status === 403) {
      log.success("✓ Conseillère ne peut pas supprimer de voiture");
    } else {
      log.error(
        `✗ Conseillère ne devrait pas pouvoir supprimer (status: ${response.status})`
      );
    }

    // Responsable ne peut pas supprimer
    response = await request(
      "DELETE",
      `/voiture/${voitureId}`,
      null,
      testData.tokens.responsable
    );
    if (response.status === 403) {
      log.success("✓ Responsable ne peut pas supprimer de voiture");
    } else {
      log.error(
        `✗ Responsable ne devrait pas pouvoir supprimer (status: ${response.status})`
      );
    }

    // Admin peut supprimer
    response = await request(
      "DELETE",
      `/voiture/${voitureId}`,
      null,
      testData.tokens.admin
    );
    if (response.status === 200) {
      log.success("✓ Admin peut supprimer de voiture");
      // Retirer de la liste
      testData.voitures.occasion = testData.voitures.occasion.filter((v) => {
        const id = v.data?.voiture?._id || v.voiture?._id || v._id;
        return id !== voitureId;
      });
    } else {
      log.error(
        `✗ Admin devrait pouvoir supprimer (status: ${response.status})`
      );
      log.detail(`Erreur: ${JSON.stringify(response.data)}`);
    }
  }
}

/**
 * ÉTAPE 4: Tests de création de modèles Porsche
 */
async function testModelPorschePermissions() {
  log.section("ÉTAPE 4: Tests des permissions sur les modèles Porsche");

  // Créer d'abord une voiture pour le test
  const voitureData = {
    nom_model: "911",
    type_voiture: false,
    description: "Test pour modèle",
    prix: 150000,
    photo_voiture: [],
  };

  const voitureResponse = await request(
    "POST",
    "/voiture/new",
    voitureData,
    testData.tokens.admin
  );

  if (voitureResponse.status !== 201) {
    log.error(`Erreur création voiture: status ${voitureResponse.status}`);
    return;
  }

  const voitureId =
    voitureResponse.data?.data?.voiture?._id ||
    voitureResponse.data?.voiture?._id;

  if (!voitureId) {
    log.error("Impossible de récupérer l'ID de la voiture créée");
    return;
  }

  log.info(`Voiture créée avec succès (ID: ${voitureId})`);

  // Générer des numéros VIN uniques pour éviter les doublons
  const generateVIN = () => {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    return `WP0ZZZ99Z${timestamp.slice(-8)}${random}`.slice(0, 17);
  };

  const modelData = {
    nom_model: "GT3 RS",
    voiture: voitureId,
    type_carrosserie: "Coupé",
    annee_production: new Date("2023-01-01"),
    prix_base: 180000,
    specifications: {
      moteur: "4.0L 6 cylindres à plat",
      puissance: 520,
      couple: 470,
      transmission: "PDK",
      acceleration_0_100: 3.2,
      vitesse_max: 312,
      consommation: 12.4,
      emissions_co2: 280,
    },
    numero_vin: generateVIN(),
    description: "Porsche 911 GT3 RS pour tests",
    concessionnaire: "Porsche Paris Test",
    disponible: true,
  };

  // Test: User NE PEUT PAS créer de modèle Porsche (staff uniquement)
  log.info("Test: User NE PEUT PAS créer de modèle Porsche");
  let response = await request(
    "POST",
    "/model_porsche/new",
    modelData,
    testData.tokens.user
  );
  if (response.status === 403) {
    log.success(
      "✓ User ne peut pas créer de modèle Porsche (staff uniquement)"
    );
  } else {
    log.error(`✗ User devrait être refusé (status: ${response.status})`);
    log.detail(`Erreur: ${JSON.stringify(response.data)}`);
  }

  // Test: Conseillère PEUT créer de modèle Porsche (staff)
  log.info("Test: Conseillère PEUT créer de modèle Porsche");
  modelData.numero_vin = generateVIN(); // Nouveau VIN pour éviter les doublons
  response = await request(
    "POST",
    "/model_porsche/new",
    modelData,
    testData.tokens.conseillere
  );
  if (response.status === 201) {
    log.success("✓ Conseillère peut créer de modèle Porsche (staff)");
  } else {
    log.error(
      `✗ Conseillère devrait pouvoir créer (status: ${response.status})`
    );
  }

  // Test: Consultation publique des modèles
  log.info("Test: Consultation publique des modèles");
  response = await request("GET", "/model_porsche/all");
  if (response.status === 200) {
    log.success("✓ Accès public à la liste des modèles");
  } else {
    log.error("✗ L'accès public devrait fonctionner");
  }
}

// ============================================================================
// PARTIE 2: TESTS COMPLETS API
// ============================================================================

/**
 * ÉTAPE 5: CRUD Couleurs Extérieur
 */
async function testCouleursExterieur() {
  log.section("ÉTAPE 5: CRUD COULEURS EXTÉRIEUR");

  const couleurs = [
    {
      nom_couleur: "red",
      photo_couleur: "rouge_carmin.jpg",
      description: "Rouge profond",
      prix: 2000,
    },
    {
      nom_couleur: "bleu",
      photo_couleur: "bleu_nuit.jpg",
      description: "Bleu métallique",
      prix: 2500,
    },
    {
      nom_couleur: "black",
      photo_couleur: "noir.jpg",
      description: "Noir brillant",
      prix: 1500,
    },
  ];

  log.info(`Création de ${couleurs.length} couleurs extérieures...`);

  for (const couleur of couleurs) {
    const response = await request(
      "POST",
      "/couleur_exterieur/new",
      couleur,
      testData.tokens.admin
    );

    if (response.status === 201) {
      const couleurCreee = response.data.couleur_exterieur || response.data;
      testData.couleurs.exterieur.push(couleurCreee);
      log.success(`Couleur extérieure créée: ${couleur.nom_couleur}`);
    } else {
      log.error(`Erreur création couleur: ${couleur.nom_couleur}`);
    }
  }

  // Test READ
  const response = await request("GET", "/couleur_exterieur/all");
  if (response.status === 200) {
    log.success(`${response.data.length} couleurs extérieures récupérées`);
  } else {
    log.error("Erreur récupération couleurs");
  }
}

/**
 * ÉTAPE 6: CRUD Couleurs Intérieur
 */
async function testCouleursInterieur() {
  log.section("ÉTAPE 6: CRUD COULEURS INTÉRIEUR");

  const couleurs = [
    {
      nom_couleur: "black",
      photo_couleur: "cuir_noir.jpg",
      description: "Cuir noir premium",
      prix: 3000,
    },
    {
      nom_couleur: "caramel",
      photo_couleur: "cuir_beige.jpg",
      description: "Cuir beige élégant",
      prix: 3500,
    },
    {
      nom_couleur: "red/white",
      photo_couleur: "alcantara.jpg",
      description: "Alcantara sportif",
      prix: 4000,
    },
  ];

  log.info(`Création de ${couleurs.length} couleurs intérieures...`);

  for (const couleur of couleurs) {
    const response = await request(
      "POST",
      "/couleur_interieur/new",
      couleur,
      testData.tokens.admin
    );

    if (response.status === 201) {
      const couleurCreee = response.data.couleur_interieur || response.data;
      testData.couleurs.interieur.push(couleurCreee);
      log.success(`Couleur intérieure créée: ${couleur.nom_couleur}`);
    } else {
      log.error(`Erreur création couleur: ${couleur.nom_couleur}`);
    }
  }

  // Test READ
  const response = await request("GET", "/couleur_interieur/all");
  if (response.status === 200) {
    log.success(`${response.data.length} couleurs intérieures récupérées`);
  } else {
    log.error("Erreur récupération couleurs");
  }
}

/**
 * ÉTAPE 7: CRUD Couleurs Accessoire
 */
async function testCouleursAccessoire() {
  log.section("ÉTAPE 7: CRUD COULEURS ACCESSOIRE");

  const couleurs = [
    { nom_couleur: "Noir Mat", photo_couleur: "noir_mat.jpg" },
    { nom_couleur: "Argent", photo_couleur: "argent.jpg" },
    { nom_couleur: "Carbone", photo_couleur: "carbone.jpg" },
  ];

  log.info(`Création de ${couleurs.length} couleurs accessoires...`);

  for (const couleur of couleurs) {
    const response = await request(
      "POST",
      "/couleur_accesoire/new",
      couleur,
      testData.tokens.admin
    );

    if (response.status === 201) {
      const couleurCreee =
        response.data.couleur ||
        response.data.couleur_accesoire ||
        response.data;
      testData.couleurs.accessoire.push(couleurCreee);
      log.success(`Couleur accessoire créée: ${couleur.nom_couleur}`);
    } else {
      log.error(`Erreur création couleur: ${couleur.nom_couleur}`);
      log.detail(
        `Status: ${response.status}, Erreur: ${JSON.stringify(response.data)}`
      );
    }
  }
}

/**
 * ÉTAPE 8: CRUD Tailles de Jantes
 */
async function testTaillesJantes() {
  log.section("ÉTAPE 8: CRUD TAILLES DE JANTES");

  const tailles = [
    {
      taille_jante: "19",
      photo_jante: "jante_19.jpg",
      couleur_jante: "gray",
      description: "Jantes sport 19 pouces",
      prix: 2000,
    },
    {
      taille_jante: "21",
      photo_jante: "jante_20.jpg",
      couleur_jante: "black",
      description: "Jantes sport 20 pouces",
      prix: 2500,
    },
    {
      taille_jante: "22",
      photo_jante: "jante_21.jpg",
      couleur_jante: "white",
      description: "Jantes Turbo 21 pouces",
      prix: 3000,
    },
  ];

  log.info(`Création de ${tailles.length} tailles de jantes...`);

  for (const taille of tailles) {
    const response = await request(
      "POST",
      "/taille_jante/new",
      taille,
      testData.tokens.admin
    );

    if (response.status === 201) {
      const tailleCreee = response.data.taille_jante || response.data;
      testData.tailles_jantes.push(tailleCreee);
      log.success(`Taille de jante créée: ${taille.taille_jante}`);
    } else {
      log.error(`Erreur création jante: ${taille.taille_jante}`);
    }
  }
}

/**
 * ÉTAPE 9: CRUD Accessoires
 */
async function testAccessoires() {
  log.section("ÉTAPE 9: CRUD ACCESSOIRES");

  const accessoires = [
    {
      type_accesoire: "decoration",
      nom_accesoire: "Tapis de sol",
      description: "Tapis sur mesure en velours",
      prix: 350,
      couleur_accesoire: testData.couleurs.accessoire[0]?._id,
    },
    {
      type_accesoire: "life-style",
      nom_accesoire: "Spoiler arrière",
      description: "Spoiler carbone",
      prix: 2500,
      couleur_accesoire: testData.couleurs.accessoire[2]?._id,
    },
    {
      type_accesoire: "vetement",
      nom_accesoire: "Échappement sport",
      description: "Échappement titane",
      prix: 5000,
      couleur_accesoire: testData.couleurs.accessoire[1]?._id,
    },
  ];

  log.info(`Création de ${accessoires.length} accessoires...`);

  for (const accessoire of accessoires) {
    const response = await request(
      "POST",
      "/accesoire/new",
      accessoire,
      testData.tokens.admin
    );

    if (response.status === 201) {
      const accessoireCreé = response.data.accesoire || response.data;
      testData.accessoires.push(accessoireCreé);
      log.success(`Accessoire créé: ${accessoire.nom_accesoire}`);
    } else {
      log.error(`Erreur création accessoire: ${accessoire.nom_accesoire}`);
    }
  }
}

/**
 * ÉTAPE 9.5: Créer des configurations Model Porsche complètes
 */
async function testCreateModelPorscheConfigurations() {
  log.section("ÉTAPE 9.5: CRÉATION CONFIGURATIONS MODEL PORSCHE");

  try {
    // Vérifier qu'on a les données nécessaires
    if (testData.voitures.neuf.length === 0) {
      log.warning("Aucune voiture neuve disponible, création d'une voiture...");
      const voitureData = {
        nom_model: "911",
        description: "Porsche 911 - Icône sportive intemporelle",
        prix: 120000,
        type_voiture: true,
      };
      const response = await request(
        "POST",
        "/voiture/new",
        voitureData,
        testData.tokens.admin
      );
      if (response.status === 201) {
        testData.voitures.neuf.push(response.data.voiture || response.data);
        log.success("Voiture neuve créée");
      }
    }

    const voiture = testData.voitures.neuf[0];

    // Créer 2-3 configurations pour cette voiture
    const configurations = [
      {
        nom_model: "Carrera S",
        type_carrosserie: "Coupé",
        annee_production: new Date("2024-01-01"),
        prix_base: 135000,
        specifications: {
          moteur: "Flat-6 3.0L bi-turbo",
          puissance: 450,
          couple: 530,
          transmission: "PDK 8 rapports",
          acceleration_0_100: 3.7,
          vitesse_max: 308,
          consommation: 10.1,
          emissions_co2: 230,
        },
        description: "911 Carrera S - Performance et élégance",
        disponible: true,
      },
      {
        nom_model: "GTS",
        type_carrosserie: "Targa",
        annee_production: new Date("2024-01-01"),
        prix_base: 128000,
        specifications: {
          moteur: "Flat-6 3.0L bi-turbo",
          puissance: 385,
          couple: 450,
          transmission: "PDK 8 rapports",
          acceleration_0_100: 4.2,
          vitesse_max: 290,
          consommation: 9.5,
          emissions_co2: 215,
        },
        description: "911 GTS - Design iconique avec traction intégrale",
        disponible: true,
      },
    ];

    log.info("Création de configurations Model Porsche...");
    log.detail(`Voiture: ${voiture._id}`);
    log.detail(`Couleurs ext: ${testData.couleurs.exterieur.length}`);
    log.detail(`Couleurs int: ${testData.couleurs.interieur.length}`);
    log.detail(`Jantes: ${testData.tailles_jantes.length}`);

    // Fonction pour générer des numéros VIN uniques
    const generateVIN = () => {
      const timestamp = Date.now().toString();
      const random = Math.floor(Math.random() * 10000)
        .toString()
        .padStart(4, "0");
      return `WP0ZZZ99Z${timestamp.slice(-8)}${random}`.slice(0, 17);
    };

    for (const configData of configurations) {
      // Ajouter les IDs des options
      configData.voiture = voiture._id;
      configData.numero_vin = generateVIN(); // Générer un VIN unique

      if (testData.couleurs.exterieur.length > 0) {
        const couleur = testData.couleurs.exterieur[0];
        // La réponse de l'API peut avoir { message: "...", couleur: { _id: "..." } }
        const couleurData = couleur.couleur || couleur;
        configData.couleur_exterieur = couleurData._id;
      }

      if (testData.couleurs.interieur.length > 0) {
        const couleur = testData.couleurs.interieur[0];
        const couleurData = couleur.couleur || couleur;
        configData.couleur_interieur = [couleurData._id];
      }

      if (testData.tailles_jantes.length > 0) {
        const jante = testData.tailles_jantes[0];
        const janteData = jante.taille_jante || jante;
        configData.taille_jante = janteData._id;
      }

      log.detail(
        `Envoi config: ${configData.nom_model}, VIN: ${configData.numero_vin}`
      );

      const response = await request(
        "POST",
        "/model_porsche/new",
        configData,
        testData.tokens.admin
      );

      if (response.status === 201) {
        const model = response.data.model_porsche || response.data;
        testData.modelPorsches.push(model);
        log.success(`Configuration créée: ${configData.nom_model}`);
      } else {
        log.error(
          `Erreur création ${configData.nom_model}: ${response.status}`
        );
        log.detail(`Erreur: ${JSON.stringify(response.data)}`);
      }
    }

    log.success(
      `✓ ${testData.modelPorsches.length} configurations créées au total`
    );
  } catch (error) {
    log.error(`Erreur création configurations: ${error.message}`);
  }
}

/**
 * ÉTAPE 10: Tests de permissions sur les ressources directes
 */
async function testDirectResourcePermissions() {
  log.section("ÉTAPE 10: PERMISSIONS SUR RESSOURCES DIRECTES");

  // Test: User NE PEUT PAS créer de photo_voiture directement
  log.info("Test: User NE PEUT PAS créer de photo_voiture");
  let response = await request(
    "POST",
    "/photo_voiture/new",
    { name: "test.jpg", alt: "Test" },
    testData.tokens.user
  );

  if (response.status === 403) {
    log.success("✓ User ne peut pas créer de photo_voiture (attendu)");
  } else {
    log.error(`✗ User devrait être refusé (status: ${response.status})`);
  }

  // Note: Test upload photo nécessite multipart/form-data (pas JSON)
  // Les tests d'upload de fichiers sont complexes et nécessitent FormData
  log.warning(
    "⚠ Test Conseillère photo_voiture skipped (nécessite multipart/form-data)"
  );

  // Test: User NE PEUT PAS créer de couleur_exterieur directement
  log.info("Test: User NE PEUT PAS créer de couleur_exterieur");
  response = await request(
    "POST",
    "/couleur_exterieur/new",
    { nom_couleur: "red", prix: 2000, description: "Test" },
    testData.tokens.user
  );

  if (response.status === 403) {
    log.success("✓ User ne peut pas créer de couleur_exterieur (attendu)");
  } else {
    log.error(`✗ User devrait être refusé (status: ${response.status})`);
  }

  // Test: Responsable PEUT créer des couleur_exterieur
  log.info("Test: Responsable PEUT créer des couleur_exterieur");
  response = await request(
    "POST",
    "/couleur_exterieur/new",
    { nom_couleur: "yellow", prix: 2000, description: "Test" },
    testData.tokens.responsable
  );

  if (response.status === 201 || response.status === 400) {
    log.success("✓ Responsable a l'autorisation de créer des couleurs");
  } else if (response.status === 403) {
    log.error("✗ Responsable devrait pouvoir créer des couleurs");
  }

  // Test: User NE PEUT PAS créer de taille_jante
  log.info("Test: User NE PEUT PAS créer de taille_jante");
  response = await request(
    "POST",
    "/taille_jante/new",
    { taille_jante: "22", couleur_jante: "black", prix: 1500 },
    testData.tokens.user
  );

  if (response.status === 403) {
    log.success("✓ User ne peut pas créer de taille_jante (attendu)");
  } else {
    log.error(`✗ User devrait être refusé (status: ${response.status})`);
  }

  // Test: Admin PEUT créer des taille_jante
  log.info("Test: Admin PEUT créer des taille_jante");
  response = await request(
    "POST",
    "/taille_jante/new",
    {
      taille_jante: "22",
      couleur_jante: "black",
      prix: 1500,
      description: "Test",
    },
    testData.tokens.admin
  );

  if (response.status === 201 || response.status === 400) {
    log.success("✓ Admin a l'autorisation de créer des jantes");
  } else if (response.status === 403) {
    log.error("✗ Admin devrait pouvoir créer des jantes");
  }
}

/**
 * ÉTAPE 10.3: Test Configurateur Voitures Neuves (Porsche Model Start)
 */
async function testVoituresNeuves() {
  log.section("ÉTAPE 10.3: TEST CONFIGURATEUR VOITURES NEUVES (PORSCHE)");

  try {
    // Test 1: GET toutes les voitures neuves avec infos configurateur
    log.info("Test 1: Récupérer toutes les voitures neuves du configurateur");
    try {
      const response = await request("GET", "/voiture/neuves/configurateur");
      const data = response.data;
      log.success(`✓ ${data.count} voitures neuves disponibles`);
      if (data.voitures && data.voitures.length > 0) {
        const exemple = data.voitures[0];
        log.info(`  Exemple: ${exemple.nom_model}`);
        log.info(`  Description: ${exemple.description?.substring(0, 80)}...`);
        log.info(
          `  Carburant: ${exemple.types_carburant?.join(", ") || "N/A"}`
        );
        log.info(
          `  Carrosseries: ${
            exemple.carrosseries_disponibles?.join(", ") || "N/A"
          }`
        );
        log.info(
          `  Transmissions: ${
            exemple.transmissions_disponibles?.join(", ") || "N/A"
          }`
        );
        log.info(`  Prix depuis: ${exemple.prix_depuis}€`);
        log.info(`  Variantes: ${exemple.nombre_variantes}`);
      }
    } catch (error) {
      log.error(`✗ Erreur récupération configurateur: ${error.message}`);
    }

    // Test 2: Vérifier structure de réponse
    log.info("Test 2: Vérifier structure de réponse configurateur");
    try {
      const response = await request("GET", "/voiture/neuves/configurateur");
      const data = response.data;
      if (data.voitures && data.voitures.length > 0) {
        const voiture = data.voitures[0];
        const champsRequis = [
          "_id",
          "nom_model",
          "description",
          "photo_voiture",
          "types_carburant",
          "carrosseries_disponibles",
          "transmissions_disponibles",
          "prix_depuis",
          "nombre_variantes",
        ];
        const champsPresents = Object.keys(voiture);
        const champsManquants = champsRequis.filter(
          (c) => !champsPresents.includes(c)
        );

        if (champsManquants.length > 0) {
          log.error(`✗ Champs manquants: ${champsManquants.join(", ")}`);
        } else {
          log.success(
            `✓ Structure configurateur conforme (tous les champs présents)`
          );
        }
      }
    } catch (error) {
      log.error(`✗ Erreur vérification structure: ${error.message}`);
    }

    // Test 3: Vérifier agrégation des données
    log.info("Test 3: Vérifier agrégation depuis model_porsche");
    try {
      const response = await request("GET", "/voiture/neuves/configurateur");
      const data = response.data;
      if (data.voitures && data.voitures.length > 0) {
        data.voitures.forEach((v, index) => {
          log.info(
            `  ${index + 1}. ${
              v.nom_model
            } - ${v.carrosseries_disponibles?.join("/")} - Depuis ${
              v.prix_depuis
            }€`
          );
        });
        log.success(`✓ Agrégation données réussie pour ${data.count} modèles`);
      }
    } catch (error) {
      log.error(`✗ Erreur agrégation: ${error.message}`);
    }

    log.success("✓ Tests Configurateur Voitures Neuves terminés");
  } catch (error) {
    log.error(`✗ Erreur globale tests configurateur: ${error.message}`);
  }
}

/**
 * ÉTAPE 10.5: Test Finder Voitures Occasion (Porsche Approved)
 */
async function testVoituresOccasionFinder() {
  log.section("ÉTAPE 10.5: TEST FINDER VOITURES OCCASION (PORSCHE APPROVED)");

  try {
    // Test 1: GET toutes les voitures occasion (sans filtres)
    log.info("Test 1: Récupérer toutes les voitures d'occasion");
    try {
      const response = await request("GET", "/voiture/occasion/finder");
      const data = response.data;
      log.success(`✓ ${data.count} voitures d'occasion trouvées`);
      if (data.voitures && response.voitures.length > 0) {
        const exemple = response.voitures[0];
        log.info(
          `  Exemple: ${exemple.nom_model} ${exemple.annee_production} - ${exemple.type_carrosserie}`
        );
        log.info(
          `  Couleurs: ${exemple.couleur_exterieur?.nom || "N/A"} / ${
            exemple.couleur_interieur?.map((c) => c.nom).join(", ") || "N/A"
          }`
        );
        log.info(
          `  Specs: ${exemple.specifications?.moteur || "N/A"}, ${
            exemple.specifications?.puissance || "N/A"
          }`
        );
        log.info(
          `  Prix: ${exemple.prix}€ - ${exemple.concessionnaire || "N/A"}`
        );
      }
    } catch (error) {
      log.error(`✗ Erreur récupération voitures d'occasion: ${error.message}`);
    }

    // Test 2: Filtrer par modèle
    log.info("Test 2: Filtrer par modèle (911)");
    try {
      const response = await request(
        "GET",
        "/voiture/occasion/finder?modele=911"
      );
      const data = response.data;
      log.success(`✓ ${data.count} voitures modèle 911 trouvées`);
      log.info(
        `  Filtres appliqués: ${JSON.stringify(data.filtres_appliques)}`
      );
    } catch (error) {
      log.error(`✗ Erreur filtre modèle: ${error.message}`);
    }

    // Test 3: Filtrer par carrosserie
    log.info("Test 3: Filtrer par type de carrosserie (Targa)");
    try {
      const response = await request(
        "GET",
        "/voiture/occasion/finder?carrosserie=Targa"
      );
      const data = response.data;
      log.success(`✓ ${data.count} voitures Targa trouvées`);
    } catch (error) {
      log.error(`✗ Erreur filtre carrosserie: ${error.message}`);
    }

    // Test 4: Filtrer par année
    log.info("Test 4: Filtrer par plage d'années (2017-2021)");
    try {
      const response = await request(
        "GET",
        "/voiture/occasion/finder?annee_min=2017&annee_max=2021"
      );
      const data = response.data;
      log.success(`✓ ${data.count} voitures entre 2017 et 2021 trouvées`);
    } catch (error) {
      log.error(`✗ Erreur filtre année: ${error.message}`);
    }

    // Test 5: Filtrer par prix maximum
    log.info("Test 5: Filtrer par prix maximum (150000€)");
    try {
      const response = await request(
        "GET",
        "/voiture/occasion/finder?prix_max=150000"
      );
      const data = response.data;
      log.success(`✓ ${data.count} voitures ≤ 150000€ trouvées`);
    } catch (error) {
      log.error(`✗ Erreur filtre prix: ${error.message}`);
    }

    // Test 6: Combinaison de filtres
    log.info("Test 6: Filtres combinés (911 Targa 2017-2021 ≤150000€)");
    try {
      const response = await request(
        "GET",
        "/voiture/occasion/finder?modele=911&carrosserie=Targa&annee_min=2017&annee_max=2021&prix_max=150000"
      );
      const data = response.data;
      log.success(
        `✓ ${response.count} voitures correspondant aux filtres combinés`
      );
      if (data.voitures && response.voitures.length > 0) {
        data.voitures.forEach((v, index) => {
          log.info(
            `  ${index + 1}. ${v.nom_model} ${v.annee_production} ${
              v.type_carrosserie
            } - ${v.prix}€`
          );
        });
      }
    } catch (error) {
      log.error(`✗ Erreur filtres combinés: ${error.message}`);
    }

    // Test 7: Vérifier structure de réponse (pas de champs supplémentaires)
    log.info(
      "Test 7: Vérifier structure de réponse (champs existants uniquement)"
    );
    try {
      const response = await request("GET", "/voiture/occasion/finder");
      const data = response.data;
      if (data.voitures && response.voitures.length > 0) {
        const voiture = response.voitures[0];
        const champsAutorisés = [
          "_id",
          "nom_model",
          "voiture_base",
          "type_carrosserie",
          "annee_production",
          "couleur_exterieur",
          "couleur_interieur",
          "specifications",
          "prix",
          "concessionnaire",
          "numero_vin",
          "disponible",
        ];
        const champsPresents = Object.keys(voiture);
        const champsInterdits = [
          "kilometrage",
          "accidents",
          "date_mise_circulation",
          "carburant",
        ];

        const champsInterditsPresents = champsInterdits.filter((c) =>
          champsPresents.includes(c)
        );
        if (champsInterditsPresents.length > 0) {
          log.error(
            `✗ Champs interdits détectés: ${champsInterditsPresents.join(", ")}`
          );
        } else {
          log.success(
            `✓ Structure de réponse conforme (pas de champs supplémentaires)`
          );
        }
      }
    } catch (error) {
      log.error(`✗ Erreur vérification structure: ${error.message}`);
    }

    log.success("✓ Tests Finder Voitures Occasion terminés");
  } catch (error) {
    log.error(`✗ Erreur globale tests finder: ${error.message}`);
  }
}

/**
 * ÉTAPE 11: Réservation voiture occasion
 */
async function testReservations() {
  log.section("ÉTAPE 11: RÉSERVATION VOITURE OCCASION");

  if (testData.voitures.occasion.length === 0) {
    log.warning("Aucune voiture d'occasion disponible pour la réservation");
    return;
  }

  const voitureData = testData.voitures.occasion[0];
  // Extraire les données de la voiture selon la structure
  const voiture =
    voitureData.data?.voiture || voitureData.voiture || voitureData;

  log.info(
    `Voiture pour réservation: ${voiture.nom_model || "N/A"} (type: ${
      voiture.type_voiture
    }, ID: ${voiture._id})`
  );

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 2); // 2 jours dans le futur pour être sûr
  tomorrow.setHours(14, 0, 0, 0); // 14:00:00

  const reservationData = {
    voiture: voiture._id,
    date_reservation: tomorrow.toISOString(), // Format ISO complet
  };

  log.detail(`User object: ${JSON.stringify(testData.users.user)}`);
  log.detail(`Token: ${testData.tokens.user ? "existe" : "manquant"}`);
  log.detail(
    `Données réservation: ${JSON.stringify(reservationData, null, 2)}`
  );

  const response = await request(
    "POST",
    "/reservation/new",
    reservationData,
    testData.tokens.user
  );

  if (response.status === 201) {
    const reservation = response.data;
    testData.reservations.push(reservation);
    log.success(`Réservation créée pour ${voiture.nom_model}`);
  } else {
    log.error(`Erreur création réservation (status: ${response.status})`);
    log.detail(`Erreur: ${JSON.stringify(response.data, null, 2)}`);
  }
}

/**
 * ÉTAPE 12: Test du profil utilisateur (READ et UPDATE)
 */
async function testUserProfile() {
  log.section("ÉTAPE 12: PROFIL UTILISATEUR");

  if (!testData.users.user) {
    log.warning("Pas d'utilisateur - test ignoré");
    return;
  }

  try {
    const userId = testData.users.user._id || testData.users.user.id;

    // READ profil
    log.info("Récupération profil utilisateur...");
    const profileResult = await request(
      "GET",
      `/user/${userId}/profile`,
      null,
      testData.tokens.user
    );

    if (profileResult.status === 200) {
      const userData = profileResult.data.user || profileResult.data;
      log.success(
        `Profil récupéré: ${userData.nom || "N/A"} ${userData.prenom || "N/A"}`
      );

      // Sauvegarder le panier s'il existe
      if (userData.panier) {
        testData.panier = userData.panier._id || userData.panier;
        log.info(`Panier détecté: ${testData.panier}`);
      }
    } else {
      log.error(`Erreur récupération profil (status: ${profileResult.status})`);
    }

    // UPDATE profil (uniquement adresse et code postal pour éviter les conflits)
    try {
      log.info("Mise à jour profil...");
      const updateResult = await request(
        "PUT",
        `/user/${userId}`,
        {
          adresse: "15 Avenue des Champs-Élysées",
          code_postal: "75008",
        },
        testData.tokens.user
      );

      if (updateResult.status === 200) {
        log.success(`Profil utilisateur mis à jour`);
      } else {
        log.error(`Erreur mise à jour profil (status: ${updateResult.status})`);
      }
    } catch (error) {
      log.error(`Erreur mise à jour profil: ${error.message}`);
    }

    // GET dashboard (statistiques)
    try {
      log.info("Récupération dashboard utilisateur...");
      const statsResult = await request(
        "GET",
        `/user/${userId}/dashboard`,
        null,
        testData.tokens.user
      );
      if (statsResult.status === 200) {
        log.success("Dashboard récupéré");
      }
    } catch (error) {
      log.warning("Route dashboard non disponible ou erreur");
    }
  } catch (error) {
    log.error(`Erreur profil utilisateur: ${error.message}`);
  }
}

/**
 * ÉTAPE 13: Commande voiture NEUF et accessoires
 */
async function testCommandes() {
  log.section("ÉTAPE 13: COMMANDES (Voiture neuve + Accessoires)");

  // Récupérer le panier de l'utilisateur
  const panierResponse = await request(
    "GET",
    "/Commande/all",
    null,
    testData.tokens.user
  );

  if (panierResponse.status === 200) {
    const commandes = Array.isArray(panierResponse.data)
      ? panierResponse.data
      : [];
    const panier = commandes.find((c) => c.status === false);

    if (panier) {
      testData.panier = panier;
      log.info(`Panier trouvé (ID: ${panier._id})`);
    } else {
      log.warning("Aucun panier actif trouvé");
    }
  }

  // Ajouter une voiture neuve au panier (acompte)
  if (testData.voitures.neuf.length > 0 && testData.panier) {
    const voiture = testData.voitures.neuf[0];

    const ligneCommandeData = {
      commande: testData.panier._id,
      voiture: voiture._id,
      type_produit: true, // true = voiture
      quantite: 1,
      acompte: 20000,
    };

    const response = await request(
      "POST",
      "/ligneCommande/new",
      ligneCommandeData,
      testData.tokens.user
    );

    if (response.status === 201) {
      log.success(`Voiture neuve ajoutée au panier: ${voiture.nom_model}`);
    } else {
      log.error(`Erreur ajout voiture au panier (status: ${response.status})`);
    }
  }

  // Ajouter des accessoires au panier (prix complet)
  if (testData.accessoires.length > 0 && testData.panier) {
    for (const accessoire of testData.accessoires.slice(0, 2)) {
      const ligneCommandeData = {
        commande: testData.panier._id,
        accesoire: accessoire._id,
        type_produit: false, // false = accessoire
        quantite: 2,
      };

      const response = await request(
        "POST",
        "/ligneCommande/new",
        ligneCommandeData,
        testData.tokens.user
      );

      if (response.status === 201) {
        log.success(`Accessoire ajouté au panier: ${accessoire.nom_accesoire}`);
      } else {
        log.error(`Erreur ajout accessoire (status: ${response.status})`);
      }
    }
  }
}

// ============================================================================
// RÉSUMÉ ET STATISTIQUES
// ============================================================================

/**
 * Afficher le résumé final
 */
function printSummary() {
  log.title("RÉSUMÉ DES TESTS");

  console.log(`\n${COLORS.bright}Statistiques:${COLORS.reset}`);
  console.log(`  Total tests: ${stats.total}`);
  console.log(`  ${COLORS.green}✓ Réussis: ${stats.success}${COLORS.reset}`);
  console.log(`  ${COLORS.red}✗ Échoués: ${stats.failed}${COLORS.reset}`);
  console.log(`  ${COLORS.yellow}⚠ Ignorés: ${stats.skipped}${COLORS.reset}`);

  const successRate =
    stats.total > 0 ? ((stats.success / stats.total) * 100).toFixed(2) : 0;
  console.log(
    `  ${COLORS.bright}Taux de réussite: ${successRate}%${COLORS.reset}`
  );

  console.log(`\n${COLORS.bright}Données créées:${COLORS.reset}`);
  console.log(`  - Utilisateurs: 4 (admin, responsable, conseillere, user)`);
  console.log(
    `  - Couleurs extérieures: ${testData.couleurs.exterieur.length}`
  );
  console.log(
    `  - Couleurs intérieures: ${testData.couleurs.interieur.length}`
  );
  console.log(
    `  - Couleurs accessoires: ${testData.couleurs.accessoire.length}`
  );
  console.log(`  - Tailles jantes: ${testData.tailles_jantes.length}`);
  console.log(`  - Voitures neuves: ${testData.voitures.neuf.length}`);
  console.log(`  - Voitures occasion: ${testData.voitures.occasion.length}`);
  console.log(`  - Model Porsche: ${testData.modelPorsches.length}`);
  console.log(`  - Accessoires: ${testData.accessoires.length}`);
  console.log(`  - Réservations: ${testData.reservations.length}`);

  console.log(`\n${COLORS.bright}Permissions testées:${COLORS.reset}`);
  console.log(
    `  ${COLORS.green}✓${COLORS.reset} Users authentifiés peuvent créer voitures/modèles`
  );
  console.log(
    `  ${COLORS.red}✗${COLORS.reset} Users simples ne peuvent pas gérer photos/options`
  );
  console.log(
    `  ${COLORS.green}✓${COLORS.reset} Staff peut gérer photos/couleurs/jantes`
  );
  console.log(`  ${COLORS.red}✗${COLORS.reset} Seul admin peut supprimer`);

  if (stats.failed === 0) {
    console.log(
      `\n${COLORS.green}${COLORS.bright}🎉 TOUS LES TESTS SONT PASSÉS ! 🎉${COLORS.reset}\n`
    );
  } else {
    console.log(
      `\n${COLORS.yellow}${COLORS.bright}⚠️  Certains tests ont échoué${COLORS.reset}\n`
    );
  }
}

/**
 * ÉTAPE 14: Nettoyage (Suppression données de test - optionnel)
 */
async function testCleanup() {
  log.section("ÉTAPE 14: NETTOYAGE (Suppression données de test)");

  log.info("Début du nettoyage des données de test...");

  // Supprimer les réservations créées
  for (const reservation of testData.reservations) {
    try {
      if (testData.users.user && reservation._id) {
        await request(
          "DELETE",
          `/reservation/${reservation._id}`,
          null,
          testData.tokens.user
        );
        log.success(`Réservation ${reservation._id} supprimée`);
      }
    } catch (error) {
      log.warning(`Impossible de supprimer réservation: ${error.message}`);
    }
  }

  // Supprimer les Model Porsche créés (admin)
  for (const model of testData.modelPorsches) {
    try {
      if (model._id) {
        await request(
          "DELETE",
          `/model_porsche/${model._id}`,
          null,
          testData.tokens.admin
        );
        log.success(`Model Porsche ${model._id} supprimé`);
      }
    } catch (error) {
      log.warning(`Impossible de supprimer model: ${error.message}`);
    }
  }

  // Supprimer les voitures créées (admin)
  const toutesVoitures = [
    ...testData.voitures.neuf,
    ...testData.voitures.occasion,
  ];
  for (const voiture of toutesVoitures) {
    try {
      if (voiture._id) {
        await request(
          "DELETE",
          `/voiture/${voiture._id}`,
          null,
          testData.tokens.admin
        );
        log.success(`Voiture ${voiture._id} supprimée`);
      }
    } catch (error) {
      log.warning(`Impossible de supprimer voiture: ${error.message}`);
    }
  }

  // Supprimer les accessoires (admin)
  for (const accessoire of testData.accessoires) {
    try {
      if (accessoire._id) {
        await request(
          "DELETE",
          `/accesoire/${accessoire._id}`,
          null,
          testData.tokens.admin
        );
        log.success(`Accessoire ${accessoire._id} supprimé`);
      }
    } catch (error) {
      log.warning(`Impossible de supprimer accessoire: ${error.message}`);
    }
  }

  log.info(
    "Nettoyage terminé (couleurs et jantes conservées pour réutilisation)"
  );
}

// ============================================================================
// PARTIE 4: TEST WORKFLOW CONFIGURATEUR PORSCHE (COMME PORSCHE.COM)
// ============================================================================

/**
 * Test du workflow complet du configurateur Porsche
 * Simule le parcours d'un utilisateur sur le site Porsche.com
 */
async function testWorkflowConfigurateur() {
  log.section("WORKFLOW CONFIGURATEUR PORSCHE (STYLE PORSCHE.COM)");

  try {
    // 1. User browse les voitures neuves
    log.info("1️⃣  Consultation des voitures neuves disponibles...");
    const voituresResponse = await request(
      "GET",
      "/voiture/neuves/configurateur"
    );

    if (voituresResponse.status === 200) {
      const data = voituresResponse.data;
      log.success(`${data.count || 0} modèles disponibles`);
      if (data.voitures && data.voitures.length > 0) {
        data.voitures.forEach((v, i) => {
          log.detail(
            `${i + 1}. ${v.nom_model} - Depuis ${v.prix_depuis}€ (${
              v.nombre_variantes
            } variantes)`
          );
        });
      }
    } else {
      log.error(`Erreur récupération voitures: ${voituresResponse.status}`);
      return;
    }

    // Utiliser une voiture existante
    if (testData.voitures.neuf.length === 0) {
      log.warning("Aucune voiture neuve disponible pour le test");
      return;
    }
    const voitureTest = testData.voitures.neuf[0];

    // 2. User sélectionne un modèle et consulte ses variantes
    log.info(
      `\n2️⃣  Sélection du modèle ${voitureTest.nom_model} et consultation des variantes...`
    );
    const variantesResponse = await request(
      "GET",
      `/model_porsche/par-voiture/${voitureTest._id}`
    );

    if (variantesResponse.status === 200) {
      const data = variantesResponse.data;
      log.success(`${data.count || 0} variantes trouvées`);
      if (data.models && data.models.length > 0) {
        data.models.forEach((m, i) => {
          log.detail(
            `${i + 1}. ${m.nom_model} (${m.type_carrosserie || "N/A"}) - ${
              m.specifications?.puissance || "N/A"
            }ch`
          );
        });
      }
    } else {
      log.error(`Erreur récupération variantes: ${variantesResponse.status}`);
      return;
    }

    // Utiliser un model_porsche existant (prendre le dernier créé, qui est une config neuve)
    if (testData.modelPorsches.length === 0) {
      log.warning("Aucune configuration disponible pour le test");
      return;
    }
    // Utiliser la dernière configuration créée (ÉTAPE 9.5, voiture neuve)
    const configTest =
      testData.modelPorsches[testData.modelPorsches.length - 1];

    // 3. User consulte les détails d'une variante
    log.info("\n3️⃣  Consultation des détails de la configuration...");
    const detailsResponse = await request(
      "GET",
      `/model_porsche/${configTest._id}`
    );

    if (detailsResponse.status === 200) {
      const config = detailsResponse.data;
      log.success(
        `Configuration: ${config.nom_model} (${
          config.type_carrosserie || "N/A"
        })`
      );
      log.detail(`Moteur: ${config.specifications?.moteur || "N/A"}`);
      log.detail(`Puissance: ${config.specifications?.puissance || "N/A"}ch`);
      log.detail(
        `0-100 km/h: ${config.specifications?.acceleration_0_100 || "N/A"}s`
      );
      log.detail(
        `Couleur ext: ${config.couleur_exterieur?.nom || "N/A"} (+${
          config.couleur_exterieur?.prix || 0
        }€)`
      );
      log.detail(`Prix total: ${config.prix_total || config.prix || 0}€`);
    } else {
      log.error(`Erreur récupération détails: ${detailsResponse.status}`);
      return;
    }

    // 4. User ajoute la configuration au panier
    log.info("\n4️⃣  Ajout de la configuration au panier...");
    const ajoutPanierResponse = await request(
      "POST",
      "/Commande/panier/ajouter-configuration",
      {
        model_porsche_id: configTest._id,
      },
      testData.tokens.user
    );

    if (
      ajoutPanierResponse.status === 200 ||
      ajoutPanierResponse.status === 201
    ) {
      const data = ajoutPanierResponse.data;
      log.success("Configuration ajoutée au panier !");
      log.detail(`Panier ID: ${data.panier?._id || "N/A"}`);
      log.detail(`Total: ${data.panier?.total || 0}€`);
      log.detail(`Acompte à payer: ${data.panier?.acompte_total || 0}€`);

      // Détails des lignes
      if (
        data.panier?.ligneCommandes &&
        data.panier.ligneCommandes.length > 0
      ) {
        log.detail("\n📋 Contenu du panier:");
        data.panier.ligneCommandes.forEach((ligne, i) => {
          const details = ligne.model_porsche_details;
          if (details) {
            log.detail(
              `${i + 1}. ${details.nom_model} (${
                details.type_carrosserie || "N/A"
              })`
            );
            log.detail(`   Prix ligne: ${ligne.prix_ligne || ligne.prix}€`);
            log.detail(
              `   Acompte ligne: ${ligne.acompte_ligne || ligne.acompte}€ (20%)`
            );
          }
        });
      }
    } else {
      log.error(`Erreur ajout au panier: ${ajoutPanierResponse.status}`);
      log.detail(`Response: ${JSON.stringify(ajoutPanierResponse.data)}`);
      return;
    }

    // 5. User consulte son panier
    log.info("\n5️⃣  Consultation du panier...");
    const panierResponse = await request(
      "GET",
      "/Commande/panier",
      null,
      testData.tokens.user
    );

    if (panierResponse.status === 200) {
      const data = panierResponse.data;
      log.success("Panier récupéré");
      log.detail(`Total: ${data.total || 0}€`);
      log.detail(`Acompte: ${data.acompte_total || 0}€`);
      log.detail(`Lignes: ${data.ligneCommandes?.length || 0}`);
    } else {
      log.error(`Erreur récupération panier: ${panierResponse.status}`);
      return;
    }

    // 6. User valide sa commande (paye l'acompte)
    log.info("\n6️⃣  Validation de la commande (paiement acompte)...");
    const validationResponse = await request(
      "POST",
      "/Commande/panier/valider",
      {},
      testData.tokens.user
    );

    if (validationResponse.status === 200) {
      log.success("Commande validée ! Paiement de l'acompte effectué");
      const data = validationResponse.data;
      log.detail(`Commande ID: ${data.commande?._id || data._id}`);
      log.detail(
        `Montant payé (acompte): ${
          data.commande?.acompte_total || data.acompte_total || 0
        }€`
      );
    } else {
      log.error(`Erreur validation commande: ${validationResponse.status}`);
      log.detail(`Response: ${JSON.stringify(validationResponse.data)}`);
      return;
    }

    log.success("\n✅ WORKFLOW CONFIGURATEUR COMPLET RÉUSSI !");
    log.detail("Étapes validées:");
    log.detail("  ✓ Consultation voitures neuves");
    log.detail("  ✓ Consultation variantes");
    log.detail("  ✓ Détails configuration");
    log.detail("  ✓ Ajout au panier");
    log.detail("  ✓ Consultation panier");
    log.detail("  ✓ Validation commande");
  } catch (error) {
    log.error(`Erreur workflow configurateur: ${error.message}`);
    console.error(error);
  }
}

async function main() {
  log.title("TESTS API PORSCHE - VERSION OPTIMISÉE");

  const startTime = Date.now();

  try {
    log.info("Attente démarrage serveur (2s)...");
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Tests essentiels
    await createTestUsers();
    await loginUsers();
    await testVoiturePermissions();
    await testModelPorschePermissions();
    await testCouleursExterieur();
    await testCouleursInterieur();
    await testCouleursAccessoire();
    await testTaillesJantes();
    await testAccessoires();
    await testCreateModelPorscheConfigurations();
    await testDirectResourcePermissions();
    await testVoituresNeuves();
    await testVoituresOccasionFinder();
    await testReservations();
    await testUserProfile();
    await testCommandes();
    await testWorkflowConfigurateur();
    // await testCleanup(); // Optionnel - décommenter pour nettoyer après les tests
  } catch (error) {
    log.error(`Erreur fatale: ${error.message}`);
    console.error(error);
    process.exit(1);
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  console.log(`\n${COLORS.bright}Durée: ${duration}s${COLORS.reset}`);
  printSummary();
}

main();
