#!/usr/bin/env node

/**
 * SCRIPT DE TEST COMPLET POUR L'API PORSCHE
 *
 * Ce script teste toutes les fonctionnalités de l'API :
 *
 * PARTIE ADMIN:
 * - Connexion admin
 * - CRUD Couleurs (extérieur, intérieur, accessoire)
 * - CRUD Tailles de jantes
 * - CRUD Voitures (neuf et occasion)
 * - CRUD Model Porsche (pour voitures neuves)
 * - CRUD Photos (voiture, porsche, accessoire)
 * - CRUD Accessoires
 *
 * PARTIE USER:
 * - Création compte utilisateur
 * - Connexion user
 * - CRUD Profil utilisateur
 * - CRUD Model Porsche Actuel (voiture personnelle)
 * - CRUD Photos voiture actuelle
 * - Réservation voiture occasion
 * - Commande voiture neuve (acompte)
 * - Commande accessoire (prix complet)
 * - Annulation réservation
 * - Annulation commande (avant paiement)
 */

import fetch from "node-fetch";

const BASE_URL = "http://localhost:3000";
const COLORS = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[36m",
  magenta: "\x1b[35m",
};

// Stockage des données de test
const testData = {
  admin: { token: null, user: null },
  user: { token: null, user: null },
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
    accessoire: [],
    voiture_actuel: [],
  },
  reservations: [],
  commandes: [],
  lignesCommande: [],
  panier: null,
};

// Statistiques des tests
const stats = {
  total: 0,
  success: 0,
  failed: 0,
  skipped: 0,
};

/**
 * Logger avec couleurs
 */
const log = {
  title: (msg) =>
    console.log(
      `\n${COLORS.bright}${COLORS.blue}${"=".repeat(80)}${COLORS.reset}`
    ),
  section: (msg) =>
    console.log(`\n${COLORS.bright}${COLORS.magenta}### ${msg}${COLORS.reset}`),
  info: (msg) => console.log(`${COLORS.blue}ℹ ${msg}${COLORS.reset}`),
  success: (msg) => {
    stats.success++;
    console.log(`${COLORS.green}✓ ${msg}${COLORS.reset}`);
  },
  error: (msg) => {
    stats.failed++;
    console.log(`${COLORS.red}✗ ${msg}${COLORS.reset}`);
  },
  warning: (msg) => {
    stats.skipped++;
    console.log(`${COLORS.yellow}⚠ ${msg}${COLORS.reset}`);
  },
  data: (label, data) =>
    console.log(
      `  ${COLORS.blue}${label}:${COLORS.reset}`,
      JSON.stringify(data, null, 2)
    ),
};

/**
 * Fonction pour faire des requêtes HTTP
 */
const request = async (endpoint, options = {}, useAdminToken = false) => {
  stats.total++;
  const url = `${BASE_URL}${endpoint}`;

  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  // Ajouter le token selon le contexte
  if (useAdminToken && testData.admin.token) {
    headers.Authorization = `Bearer ${testData.admin.token}`;
  } else if (!useAdminToken && testData.user.token) {
    headers.Authorization = `Bearer ${testData.user.token}`;
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    let data;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      throw new Error(`${response.status} - ${JSON.stringify(data)}`);
    }

    return { status: response.status, data };
  } catch (error) {
    throw error;
  }
};

/**
 * Attendre un délai
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// ============================================================================
// TESTS PARTIE ADMIN
// ============================================================================

/**
 * Test 1: Connexion admin avec compte existant
 */
const testAdminAuth = async () => {
  log.section("TEST 1: AUTHENTIFICATION ADMIN");

  try {
    // Utiliser le compte admin existant
    const adminData = {
      email: "admin@porsche.com",
      password: "Admin123!@#",
    };

    log.info("Connexion admin avec compte existant...");
    const loginResult = await request("/user/login", {
      method: "POST",
      body: JSON.stringify(adminData),
    });

    testData.admin.token = loginResult.data.token;
    testData.admin.user = loginResult.data.user || { email: adminData.email };
    log.success(`Admin connecté: ${adminData.email}`);
  } catch (error) {
    log.error(`Erreur auth admin: ${error.message}`);
  }
};

/**
 * Test 2: CRUD Couleurs Extérieur
 */
const testCouleursExterieur = async () => {
  log.section("TEST 2: CRUD COULEURS EXTÉRIEUR");

  const couleurs = [
    {
      nom_couleur: "Rouge Carmin",
      photo_couleur: "rouge_carmin.jpg",
      description: "Rouge profond",
    },
    {
      nom_couleur: "Bleu Nuit",
      photo_couleur: "bleu_nuit.jpg",
      description: "Bleu métallique",
    },
    {
      nom_couleur: "Noir Métallisé",
      photo_couleur: "noir.jpg",
      description: "Noir brillant",
    },
  ];

  // Création en parallèle pour gagner du temps
  log.info(`Création de ${couleurs.length} couleurs en parallèle...`);
  const promises = couleurs.map(async (couleur) => {
    try {
      const result = await request(
        "/couleur_exterieur/new",
        {
          method: "POST",
          body: JSON.stringify(couleur),
        },
        true
      );

      const couleurCreee =
        result.data?.data?.couleur ||
        result.data?.couleur ||
        result.data?.data ||
        result.data;
      testData.couleurs.exterieur.push(couleurCreee);
      log.success(
        `Couleur extérieure créée: ${couleurCreee.nom_couleur} (ID: ${couleurCreee._id})`
      );
      return couleurCreee;
    } catch (error) {
      log.error(`Erreur création couleur extérieure: ${error.message}`);
      return null;
    }
  });

  await Promise.all(promises);

  // Test READ
  try {
    log.info("Récupération de toutes les couleurs extérieures...");
    const result = await request("/couleur_exterieur/all");
    log.success(`${result.data.length} couleurs extérieures récupérées`);
  } catch (error) {
    log.error(`Erreur récupération couleurs: ${error.message}`);
  }

  // Test UPDATE
  if (testData.couleurs.exterieur.length > 0) {
    try {
      const couleurId = testData.couleurs.exterieur[0]._id;
      log.info(`Mise à jour couleur ${couleurId}...`);
      const result = await request(
        `/couleur_exterieur/${couleurId}`,
        {
          method: "PUT",
          body: JSON.stringify({ description: "Description mise à jour" }),
        },
        true
      );
      log.success("Couleur extérieure mise à jour");
    } catch (error) {
      log.error(`Erreur mise à jour couleur: ${error.message}`);
    }
  }
};

/**
 * Test 3: CRUD Couleurs Intérieur
 */
const testCouleursInterieur = async () => {
  log.section("TEST 3: CRUD COULEURS INTÉRIEUR");

  const couleurs = [
    {
      nom_couleur: "Cuir Noir",
      photo_couleur: "cuir_noir.jpg",
      description: "Cuir noir premium",
    },
    {
      nom_couleur: "Cuir Beige",
      photo_couleur: "cuir_beige.jpg",
      description: "Cuir beige élégant",
    },
    {
      nom_couleur: "Alcantara Gris",
      photo_couleur: "alcantara.jpg",
      description: "Alcantara sportif",
    },
  ];

  // Création en parallèle pour gagner du temps
  log.info(`Création de ${couleurs.length} couleurs en parallèle...`);
  const promises = couleurs.map(async (couleur) => {
    try {
      const result = await request(
        "/couleur_interieur/new",
        {
          method: "POST",
          body: JSON.stringify(couleur),
        },
        true
      );

      const couleurCreee =
        result.data?.data?.couleur ||
        result.data?.couleur ||
        result.data?.data ||
        result.data;
      testData.couleurs.interieur.push(couleurCreee);
      log.success(
        `Couleur intérieure créée: ${couleurCreee.nom_couleur} (ID: ${couleurCreee._id})`
      );
      return couleurCreee;
    } catch (error) {
      log.error(`Erreur création couleur intérieure: ${error.message}`);
      return null;
    }
  });

  await Promise.all(promises);

  // Test READ all
  try {
    log.info("Récupération de toutes les couleurs intérieures...");
    const result = await request("/couleur_interieur/all");
    log.success(`${result.data.length} couleurs intérieures récupérées`);
  } catch (error) {
    log.error(`Erreur récupération couleurs: ${error.message}`);
  }
};

/**
 * Test 4: CRUD Couleurs Accessoire
 */
const testCouleursAccessoire = async () => {
  log.section("TEST 4: CRUD COULEURS ACCESSOIRE");

  const couleurs = [
    { nom_couleur: "Noir Mat", photo_couleur: "noir_mat.jpg" },
    { nom_couleur: "Argent", photo_couleur: "argent.jpg" },
    { nom_couleur: "Carbone", photo_couleur: "carbone.jpg" },
  ];

  // Création en parallèle pour gagner du temps
  log.info(
    `Création de ${couleurs.length} couleurs accessoires en parallèle...`
  );
  const promises = couleurs.map(async (couleur) => {
    try {
      const result = await request(
        "/couleur_accesoire/new",
        {
          method: "POST",
          body: JSON.stringify(couleur),
        },
        true
      );

      const couleurCreee =
        result.data?.data?.couleur ||
        result.data?.couleur ||
        result.data?.data ||
        result.data;
      testData.couleurs.accessoire.push(couleurCreee);
      log.success(
        `Couleur accessoire créée: ${couleurCreee.nom_couleur} (ID: ${couleurCreee._id})`
      );
      return couleurCreee;
    } catch (error) {
      log.error(`Erreur création couleur accessoire: ${error.message}`);
      return null;
    }
  });

  await Promise.all(promises);
};

/**
 * Test 5: CRUD Tailles de Jantes
 */
const testTaillesJantes = async () => {
  log.section("TEST 5: CRUD TAILLES DE JANTES");

  const tailles = [
    {
      taille_jante: "19 pouces",
      photo_jante: "jante_19.jpg",
      couleur_jante: "Argent",
      description: "Jantes sport 19 pouces",
    },
    {
      taille_jante: "20 pouces",
      photo_jante: "jante_20.jpg",
      couleur_jante: "Noir",
      description: "Jantes sport 20 pouces",
    },
    {
      taille_jante: "21 pouces",
      photo_jante: "jante_21.jpg",
      couleur_jante: "Titane",
      description: "Jantes Turbo 21 pouces",
    },
  ];

  // Création en parallèle pour gagner du temps
  log.info(`Création de ${tailles.length} tailles de jantes en parallèle...`);
  const promises = tailles.map(async (taille) => {
    try {
      const result = await request(
        "/taille_jante/new",
        {
          method: "POST",
          body: JSON.stringify(taille),
        },
        true
      );

      // Le contrôleur taille_jante retourne directement l'objet sans wrapper
      const janteCreee = result.data;
      testData.tailles_jantes.push(janteCreee);
      log.success(
        `Taille jante créée: ${janteCreee.taille_jante} (ID: ${janteCreee._id})`
      );
      return janteCreee;
    } catch (error) {
      log.error(`Erreur création taille jante: ${error.message}`);
      return null;
    }
  });

  await Promise.all(promises);

  // Test UPDATE
  if (testData.tailles_jantes.length > 0) {
    try {
      const janteId = testData.tailles_jantes[0]._id;
      log.info(`Mise à jour jante ${janteId}...`);
      const result = await request(
        `/taille_jante/${janteId}`,
        {
          method: "PUT",
          body: JSON.stringify({ description: "Description mise à jour" }),
        },
        true
      );
      log.success("Taille jante mise à jour");
    } catch (error) {
      log.error(`Erreur mise à jour jante: ${error.message}`);
    }
  }
};

/**
 * Test 6: CRUD Voiture OCCASION
 */
const testVoituresOccasion = async () => {
  log.section("TEST 6: CRUD VOITURES OCCASION");

  const voitures = [
    {
      type_voiture: false, // false = occasion
      nom_model: "911 Carrera 4S Occasion",
      description: "Excellente condition, 20000 km",
      prix: 95000,
    },
    {
      type_voiture: false,
      nom_model: "Cayenne S Occasion",
      description: "SUV familial, 35000 km",
      prix: 75000,
    },
  ];

  for (const voiture of voitures) {
    try {
      log.info(`Création voiture occasion: ${voiture.nom_model}...`);
      const result = await request(
        "/voiture/new",
        {
          method: "POST",
          body: JSON.stringify(voiture),
        },
        true
      );

      const voitureCreee =
        result.data?.data?.voiture || result.data?.voiture || result.data;
      testData.voitures.occasion.push(voitureCreee);
      log.success(
        `Voiture occasion créée: ${voitureCreee.nom_model} (ID: ${voitureCreee._id})`
      );
    } catch (error) {
      log.error(`Erreur création voiture occasion: ${error.message}`);
    }
  }

  // Test READ
  try {
    log.info("Récupération de toutes les voitures...");
    const result = await request("/voiture/all");
    const voitures = Array.isArray(result.data)
      ? result.data
      : result.data.voitures || [];
    log.success(`${voitures.length} voitures récupérées`);
  } catch (error) {
    log.error(`Erreur récupération voitures: ${error.message}`);
  }

  // Test UPDATE
  if (testData.voitures.occasion.length > 0) {
    try {
      const voitureId = testData.voitures.occasion[0]._id;
      log.info(`Mise à jour voiture ${voitureId}...`);
      const result = await request(
        `/voiture/${voitureId}`,
        {
          method: "PUT",
          body: JSON.stringify({ prix: 92000 }),
        },
        true
      );
      log.success("Voiture occasion mise à jour");
    } catch (error) {
      log.error(`Erreur mise à jour voiture: ${error.message}`);
    }
  }
};

/**
 * Test 7: CRUD Voiture NEUF avec Model Porsche
 */
const testVoituresNeuf = async () => {
  log.section("TEST 7: CRUD VOITURES NEUF + MODEL PORSCHE");

  // D'abord créer une voiture neuve
  const voitureData = {
    type_voiture: true, // true = neuf
    nom_model: "911 Turbo S 2024",
    description: "Dernière génération, configuration sur mesure",
    prix: 250000,
  };

  try {
    log.info(`Création voiture neuve: ${voitureData.nom_model}...`);
    const voitureResult = await request(
      "/voiture/new",
      {
        method: "POST",
        body: JSON.stringify(voitureData),
      },
      true
    );

    const voitureCreee =
      voitureResult.data?.data?.voiture ||
      voitureResult.data?.voiture ||
      voitureResult.data;
    testData.voitures.neuf.push(voitureCreee);
    log.success(
      `Voiture neuve créée: ${voitureCreee.nom_model} (ID: ${voitureCreee._id})`
    );

    // Créer un Model Porsche associé
    const timestamp = Date.now().toString().slice(-6);
    const modelData = {
      nom_model: "911 Turbo S",
      type_carrosserie: "Coupé",
      annee_production: new Date("2024-01-01"),
      info_moteur: "3.8L Twin-Turbo Flat-6",
      info_puissance: 650,
      info_transmission: "PDK 8 vitesses",
      info_acceleration: 2.7,
      info_vitesse_max: 330,
      info_consommation: 11.5,
      numero_win: `WP0ZZZ99ZTS${timestamp}`,
      concessionnaire: "Porsche Center Paris",
      description: "Configuration premium avec Pack Sport Chrono",
      acompte: 25000,
      prix: 250000,
      voiture: voitureCreee._id,
      couleur_exterieur: testData.couleurs.exterieur[0]?._id,
      couleur_interieur: testData.couleurs.interieur.map((c) => c._id),
      taille_jante: testData.tailles_jantes[2]?._id,
    };

    log.info("Création Model Porsche associé...");
    const modelResult = await request(
      "/model_porsche/new",
      {
        method: "POST",
        body: JSON.stringify(modelData),
      },
      true
    );

    const modelCree = modelResult.data.model_porsche || modelResult.data;
    testData.modelPorsches.push(modelCree);
    log.success(
      `Model Porsche créé: ${modelCree.nom_model} (ID: ${modelCree._id})`
    );
  } catch (error) {
    log.error(`Erreur création voiture neuve/model: ${error.message}`);
  }

  // Test UPDATE Model Porsche
  if (testData.modelPorsches.length > 0) {
    try {
      const modelId = testData.modelPorsches[0]._id;
      log.info(`Mise à jour Model Porsche ${modelId}...`);
      const result = await request(
        `/model_porsche/${modelId}`,
        {
          method: "PUT",
          body: JSON.stringify({ info_puissance: 660 }),
        },
        true
      );
      log.success("Model Porsche mis à jour");
    } catch (error) {
      log.error(`Erreur mise à jour model: ${error.message}`);
    }
  }

  // Test ajout/retrait couleurs intérieures
  if (
    testData.modelPorsches.length > 0 &&
    testData.couleurs.interieur.length > 1
  ) {
    try {
      const modelId = testData.modelPorsches[0]._id;
      const couleurId = testData.couleurs.interieur[1]._id;

      log.info("Ajout couleur intérieure au Model Porsche...");
      await request(
        `/model_porsche/${modelId}/couleurs-interieur/add`,
        {
          method: "PUT",
          body: JSON.stringify({ couleur_interieur: [couleurId] }),
        },
        true
      );
      log.success("Couleur intérieure ajoutée");
    } catch (error) {
      log.error(`Erreur ajout couleur: ${error.message}`);
    }
  }
};

/**
 * Test 8: CRUD Accessoires
 */
const testAccessoires = async () => {
  log.section("TEST 8: CRUD ACCESSOIRES");

  const accessoires = [
    {
      type_accesoire: "Intérieur",
      nom_accesoire: "Tapis de sol",
      description: "Tapis sur mesure en velours",
      prix: 350,
      couleur_accesoire: testData.couleurs.accessoire[0]?._id,
    },
    {
      type_accesoire: "Extérieur",
      nom_accesoire: "Spoiler arrière",
      description: "Spoiler carbone",
      prix: 2500,
      couleur_accesoire: testData.couleurs.accessoire[2]?._id,
    },
    {
      type_accesoire: "Performance",
      nom_accesoire: "Échappement sport",
      description: "Échappement titane",
      prix: 5000,
      couleur_accesoire: testData.couleurs.accessoire[1]?._id,
    },
  ];

  // Création en parallèle pour gagner du temps
  log.info(`Création de ${accessoires.length} accessoires en parallèle...`);
  const promises = accessoires.map(async (accessoire) => {
    try {
      const result = await request(
        "/accesoire/new",
        {
          method: "POST",
          body: JSON.stringify(accessoire),
        },
        true
      );

      const accessoireCreee =
        result.data?.data?.accessoire || result.data?.accessoire || result.data;
      testData.accessoires.push(accessoireCreee);
      log.success(
        `Accessoire créé: ${accessoireCreee.nom_accesoire} (ID: ${accessoireCreee._id})`
      );
      return accessoireCreee;
    } catch (error) {
      log.error(`Erreur création accessoire: ${error.message}`);
      return null;
    }
  });

  await Promise.all(promises);

  // Test UPDATE
  if (testData.accessoires.length > 0) {
    try {
      const accessoireId = testData.accessoires[0]._id;
      log.info(`Mise à jour accessoire ${accessoireId}...`);
      const result = await request(
        `/accesoire/${accessoireId}`,
        {
          method: "PUT",
          body: JSON.stringify({ prix: 380 }),
        },
        true
      );
      log.success("Accessoire mis à jour");
    } catch (error) {
      log.error(`Erreur mise à jour accessoire: ${error.message}`);
    }
  }

  // Test DELETE (on supprimera à la fin)
};

// ============================================================================
// TESTS PARTIE UTILISATEUR
// ============================================================================

/**
 * Test 9: Création et connexion utilisateur
 */
const testUserAuth = async () => {
  log.section("TEST 9: AUTHENTIFICATION UTILISATEUR");

  try {
    const timestamp = Date.now();
    const userData = {
      email: `user-${timestamp}@gmail.com`,
      password: "User123!@#",
      nom: "Dupont",
      prenom: "Jean",
      telephone: `06${timestamp.toString().slice(-8)}`,
      adresse: "10 Rue de la République",
      code_postal: "75002",
    };

    log.info("Création compte utilisateur...");
    const registerResult = await request("/user/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });

    testData.user.user = registerResult.data.user || registerResult.data;
    testData.user.token = registerResult.data.token;
    log.success(
      `Utilisateur créé: ${testData.user.user.email} (ID: ${testData.user.user._id})`
    );

    // Test connexion
    log.info("Test connexion utilisateur...");
    const loginResult = await request("/user/login", {
      method: "POST",
      body: JSON.stringify({
        email: userData.email,
        password: userData.password,
      }),
    });

    testData.user.token = loginResult.data.token;
    log.success("Connexion utilisateur réussie");
  } catch (error) {
    log.error(`Erreur auth utilisateur: ${error.message}`);
  }
};

/**
 * Test 10: CRUD Profil Utilisateur
 */
const testUserProfile = async () => {
  log.section("TEST 10: CRUD PROFIL UTILISATEUR");

  if (!testData.user.user) {
    log.warning("Pas d'utilisateur - test ignoré");
    return;
  }

  try {
    const userId = testData.user.user._id;

    // READ profil
    log.info("Récupération profil utilisateur...");
    const profileResult = await request(`/user/${userId}/profile`, {}, false);

    // Accéder aux données imbriquées dans user
    const userData = profileResult.data.user || profileResult.data;
    log.success(
      `Profil récupéré: ${userData.nom || "N/A"} ${userData.prenom || "N/A"}`
    );

    // Sauvegarder le panier
    if (userData.panier) {
      testData.panier = userData.panier._id || userData.panier;
      log.info(`Panier détecté: ${testData.panier}`);
    }

    // UPDATE profil (uniquement adresse et code postal pour éviter les conflits)
    try {
      log.info("Mise à jour profil...");
      const updateResult = await request(
        `/user/${userId}`,
        {
          method: "PUT",
          body: JSON.stringify({
            adresse: "15 Avenue des Champs-Élysées",
            code_postal: "75008",
          }),
        },
        false
      );
      log.success(
        `Profil utilisateur mis à jour: ${updateResult.data.adresse}`
      );
    } catch (error) {
      log.error(`Erreur mise à jour profil: ${error.message}`);
    }

    // GET dashboard (statistiques)
    log.info("Récupération dashboard utilisateur...");
    const statsResult = await request(`/user/${userId}/dashboard`, {}, false);
    log.success("Dashboard récupéré");
  } catch (error) {
    log.error(`Erreur profil utilisateur: ${error.message}`);
  }
};

/**
 * Test 11: CRUD Model Porsche Actuel (voiture personnelle)
 */
const testModelPorscheActuel = async () => {
  log.section("TEST 11: CRUD MODEL PORSCHE ACTUEL (Voiture personnelle)");

  if (!testData.user.user) {
    log.warning("Pas d'utilisateur - test ignoré");
    return;
  }

  const timestamp = Date.now().toString().slice(-6);
  const modelData = {
    type_model: "911 Carrera",
    type_carrosserie: "Cabriolet",
    annee_production: new Date("2020-06-15"),
    info_moteur: "3.0L Turbo Flat-6",
    info_transmission: "PDK 7 vitesses",
    numero_win: `WP0CB2A90LS${timestamp}`,
    couleur_exterieur: testData.couleurs.exterieur[0]?._id,
    couleur_interieur: testData.couleurs.interieur[0]?._id,
    taille_jante: testData.tailles_jantes[0]?._id,
  };

  try {
    log.info("Création Model Porsche Actuel...");
    const result = await request(
      "/model_porsche_actuel/new",
      {
        method: "POST",
        body: JSON.stringify(modelData),
      },
      false
    );

    const modelCree = result.data.model || result.data;
    testData.modelPorscheActuels.push(modelCree);
    log.success(
      `Model Porsche Actuel créé: ${modelCree.type_model} (ID: ${modelCree._id})`
    );

    // READ mes porsches
    log.info("Récupération de mes Porsches...");
    const mesPortschesResult = await request(
      "/model_porsche_actuel/user/mes-porsches",
      {},
      false
    );
    const mesPorsches = mesPortschesResult.data || [];
    log.success(
      `${mesPorsches.length || 0} Porsche(s) personnelle(s) récupérée(s)`
    );

    // UPDATE
    if (testData.modelPorscheActuels.length > 0) {
      const modelId = testData.modelPorscheActuels[0]._id;
      log.info(`Mise à jour Model Porsche Actuel ${modelId}...`);
      await request(
        `/model_porsche_actuel/${modelId}`,
        {
          method: "PUT",
          body: JSON.stringify({
            info_moteur: "3.0L Turbo Flat-6 (modifié)",
          }),
        },
        false
      );
      log.success("Model Porsche Actuel mis à jour");
    }

    // Changement de couleur
    if (
      testData.modelPorscheActuels.length > 0 &&
      testData.couleurs.exterieur.length > 1
    ) {
      const modelId = testData.modelPorscheActuels[0]._id;
      const couleurId = testData.couleurs.exterieur[1]._id;

      log.info("Changement couleur extérieure...");
      await request(
        `/model_porsche_actuel/${modelId}/couleur-exterieur`,
        {
          method: "PUT",
          body: JSON.stringify({ couleur_exterieur: couleurId }),
        },
        false
      );
      log.success("Couleur extérieure changée");
    }

    // Changement de jantes
    if (
      testData.modelPorscheActuels.length > 0 &&
      testData.tailles_jantes.length > 1
    ) {
      const modelId = testData.modelPorscheActuels[0]._id;
      const janteId = testData.tailles_jantes[1]._id;

      if (modelId && janteId) {
        log.info("Changement taille jante...");
        await request(
          `/model_porsche_actuel/${modelId}/taille-jante`,
          {
            method: "PUT",
            body: JSON.stringify({ taille_jante: janteId }),
          },
          false
        );
        log.success("Taille jante changée");
      } else {
        log.warning("IDs manquants pour test changement jante");
      }
    }
  } catch (error) {
    log.error(`Erreur Model Porsche Actuel: ${error.message}`);
  }
};

/**
 * Test 12: Réservation voiture occasion
 */
const testReservations = async () => {
  log.section("TEST 12: RÉSERVATION VOITURE OCCASION");

  if (!testData.user.user || testData.voitures.occasion.length === 0) {
    log.warning("Prérequis manquants - test ignoré");
    return;
  }

  try {
    const userId = testData.user.user._id;
    const voitureOccasion = testData.voitures.occasion[0];

    // Vérifier disponibilité
    const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const dateString = futureDate.toISOString().split("T")[0]; // Format YYYY-MM-DD

    log.info(`Vérification disponibilité voiture ${voitureOccasion._id}...`);
    const dispoResult = await request(
      `/reservation/disponibilite/${voitureOccasion._id}?date=${dateString}`
    );
    log.success("Disponibilité vérifiée");

    // Créer réservation
    const reservationData = {
      voiture: voitureOccasion._id,
      date_reservation: futureDate,
      status: true,
    };

    log.info("Création réservation...");
    const result = await request(
      `/user/${userId}/reservations`,
      {
        method: "POST",
        body: JSON.stringify(reservationData),
      },
      false
    );

    const reservationCreee =
      result.data?.data?.reservation ||
      result.data?.reservation ||
      result.data?.data ||
      result.data;
    testData.reservations.push(reservationCreee);
    log.success(`Réservation créée: ${reservationCreee._id}`);

    // READ réservations
    log.info("Récupération mes réservations...");
    const mesReservations = await request(
      `/user/${userId}/reservations`,
      {},
      false
    );
    const reservations = Array.isArray(mesReservations.data)
      ? mesReservations.data
      : [];
    log.success(`${reservations.length} réservation(s) récupérée(s)`);

    // Test tentative réservation voiture NEUVE (doit échouer)
    if (testData.voitures.neuf.length > 0) {
      try {
        log.info("Test réservation voiture neuve (doit échouer)...");
        log.info(`ID voiture neuve testée: ${testData.voitures.neuf[0]._id}`);
        const result = await request(
          `/user/${userId}/reservations`,
          {
            method: "POST",
            body: JSON.stringify({
              voiture: testData.voitures.neuf[0]._id,
              date_reservation: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
              status: true,
            }),
          },
          false
        );
        log.error(
          `ERREUR: La réservation d'une voiture neuve devrait être refusée! Réponse: ${JSON.stringify(
            result.data
          )}`
        );
      } catch (error) {
        if (
          error.message.includes("400") &&
          error.message.includes("occasion")
        ) {
          log.success("Réservation voiture neuve correctement refusée");
        } else {
          log.error(`Erreur inattendue lors du test: ${error.message}`);
        }
      }
    }
  } catch (error) {
    log.error(`Erreur réservations: ${error.message}`);
  }
};

/**
 * Test 13: Commande voiture NEUF (acompte)
 */
const testCommandeVoitureNeuf = async () => {
  log.section("TEST 13: COMMANDE VOITURE NEUF (Acompte)");

  if (!testData.user.user || testData.voitures.neuf.length === 0) {
    log.warning("Prérequis manquants - test ignoré");
    return;
  }

  try {
    // Récupérer ou créer panier
    log.info("Récupération/création panier...");
    const panierResult = await request(
      "/commande/panier/get-or-create",
      {},
      false
    );
    // Le panier retourne l'objet Commande directement
    const panierData = panierResult.data?.data || panierResult.data;
    testData.panier = panierData._id || panierData;
    log.success(`Panier: ${testData.panier}`);

    // Ajouter ligne commande voiture neuve (avec acompte)
    const voitureNeuf = testData.voitures.neuf[0];
    const ligneData = {
      type_produit: true, // true = voiture
      quantite: 1,
      prix: voitureNeuf.prix,
      acompte: 25000, // Acompte pour voiture neuve
      voiture: voitureNeuf._id,
      commande: testData.panier,
    };

    log.info("Ajout voiture neuve au panier (acompte 25000€)...");
    const ligneResult = await request(
      "/ligneCommande/new",
      {
        method: "POST",
        body: JSON.stringify(ligneData),
      },
      false
    );

    const ligneCreee =
      ligneResult.data?.data?.ligneCommande ||
      ligneResult.data?.ligneCommande ||
      ligneResult.data?.data ||
      ligneResult.data;
    testData.lignesCommande.push(ligneCreee);
    log.success(
      `Ligne commande créée: ${ligneCreee._id} - Acompte: ${ligneCreee.acompte}€`
    );

    // Vérifier panier
    log.info("Vérification contenu panier...");
    const panierLignes = await request("/ligneCommande/panier", {}, false);
    const lignes = Array.isArray(panierLignes.data) ? panierLignes.data : [];
    log.success(`Panier contient ${lignes.length} ligne(s)`);
  } catch (error) {
    log.error(`Erreur commande voiture neuf: ${error.message}`);
  }
};

/**
 * Test 14: Commande accessoires (prix complet)
 */
const testCommandeAccessoires = async () => {
  log.section("TEST 14: COMMANDE ACCESSOIRES (Prix complet)");

  if (
    !testData.user.user ||
    testData.accessoires.length === 0 ||
    !testData.panier
  ) {
    log.warning("Prérequis manquants - test ignoré");
    return;
  }

  try {
    // Ajouter plusieurs accessoires
    for (let i = 0; i < Math.min(2, testData.accessoires.length); i++) {
      const accessoire = testData.accessoires[i];

      const ligneData = {
        type_produit: false, // false = accessoire
        quantite: 2,
        prix: accessoire.prix * 2, // Prix complet
        acompte: 0, // Pas d'acompte pour accessoires
        accesoire: accessoire._id,
        commande: testData.panier,
      };

      log.info(`Ajout accessoire au panier: ${accessoire.nom_accesoire}...`);
      const ligneResult = await request(
        "/ligneCommande/new",
        {
          method: "POST",
          body: JSON.stringify(ligneData),
        },
        false
      );

      const ligneCreee =
        ligneResult.data?.data?.ligneCommande ||
        ligneResult.data?.ligneCommande ||
        ligneResult.data?.data ||
        ligneResult.data;
      testData.lignesCommande.push(ligneCreee);
      log.success(
        `Accessoire ajouté: ${accessoire.nom_accesoire} x${ligneCreee.quantite} - ${ligneCreee.prix}€`
      );
    }

    // Vérifier panier
    log.info("Vérification panier final...");
    const panierLignes = await request("/ligneCommande/panier", {}, false);
    const lignes = Array.isArray(panierLignes.data) ? panierLignes.data : [];
    log.success(`Panier contient ${lignes.length} ligne(s)`);

    // Modifier quantité d'un accessoire
    if (testData.lignesCommande.length > 1) {
      const ligneId =
        testData.lignesCommande[testData.lignesCommande.length - 1]._id;

      if (ligneId) {
        log.info(`Modification quantité ligne ${ligneId}...`);
        await request(
          `/ligneCommande/${ligneId}/quantite`,
          {
            method: "PUT",
            body: JSON.stringify({ quantite: 3 }),
          },
          false
        );
        log.success("Quantité mise à jour");
      } else {
        log.warning("ID de ligne commande manquant pour modification");
      }
    }
  } catch (error) {
    log.error(`Erreur commande accessoires: ${error.message}`);
  }
};

/**
 * Test 15: Validation et affichage commande
 */
const testValidationCommande = async () => {
  log.section("TEST 15: VALIDATION COMMANDE");

  if (!testData.panier) {
    log.warning("Pas de panier - test ignoré");
    return;
  }

  try {
    // Afficher mes commandes
    log.info("Récupération historique commandes...");
    const historiqueResult = await request("/commande/historique", {}, false);
    const historique = Array.isArray(historiqueResult.data)
      ? historiqueResult.data
      : [];
    log.success(`${historique.length} commande(s) dans l'historique`);

    // Afficher statistiques (si la route existe)
    try {
      log.info("Récupération statistiques commandes...");
      const statsResult = await request("/commande/statistiques", {}, false);
      log.success("Statistiques récupérées");
    } catch (statError) {
      log.warning("Route statistiques non implémentée");
    }

    // Récupérer détails panier
    log.info("Récupération détails panier...");
    const panierResult = await request("/commande/panier", {}, false);
    const panier = panierResult.data?.data || panierResult.data || {};
    log.success(
      `Panier total: ${panier.prix || 0}€ (Acompte: ${panier.acompte || 0}€)`
    );
  } catch (error) {
    log.error(`Erreur validation commande: ${error.message}`);
  }
};

/**
 * Test 16: Annulation réservation
 */
const testAnnulationReservation = async () => {
  log.section("TEST 16: ANNULATION RÉSERVATION");

  if (!testData.user.user || testData.reservations.length === 0) {
    log.warning("Pas de réservation - test ignoré");
    return;
  }

  try {
    const userId = testData.user.user._id;
    const reservationId = testData.reservations[0]._id;

    log.info(`Annulation réservation ${reservationId}...`);
    await request(
      `/user/${userId}/reservations/${reservationId}/cancel`,
      {
        method: "PUT",
      },
      false
    );
    log.success("Réservation annulée (status = false)");

    // Vérifier que la réservation est bien annulée
    log.info("Vérification statut réservation...");
    const reservationResult = await request(
      `/reservation/${reservationId}`,
      {},
      false
    );
    const reservation = reservationResult.data?.data || reservationResult.data;
    if (reservation.status === false) {
      log.success("Statut réservation correctement mis à false");
    } else {
      log.error(
        `ERREUR: Le statut devrait être false, mais il est ${reservation.status}`
      );
    }
  } catch (error) {
    log.error(`Erreur annulation réservation: ${error.message}`);
  }
};

/**
 * Test 17: Annulation commande (avant paiement)
 */
const testAnnulationCommande = async () => {
  log.section("TEST 17: ANNULATION COMMANDE (Avant paiement)");

  if (!testData.panier) {
    log.warning("Pas de commande - test ignoré");
    return;
  }

  try {
    // Vider une ligne du panier
    if (testData.lignesCommande.length > 0) {
      const ligneId =
        testData.lignesCommande[testData.lignesCommande.length - 1]._id;

      if (ligneId) {
        log.info(`Suppression ligne commande ${ligneId}...`);
        await request(
          `/ligneCommande/${ligneId}`,
          {
            method: "DELETE",
          },
          false
        );
        log.success("Ligne commande supprimée");
      } else {
        log.warning("ID de ligne commande manquant pour suppression");
      }
    }

    // Vider tout le panier
    log.info("Vidage complet du panier...");
    await request(
      "/ligneCommande/panier/vider",
      {
        method: "DELETE",
      },
      false
    );
    log.success("Panier vidé");

    // Vérifier que le panier est vide
    log.info("Vérification panier vide...");
    const panierResult = await request("/ligneCommande/panier", {}, false);
    const panierData = Array.isArray(panierResult.data)
      ? panierResult.data
      : [];
    if (panierData.length === 0) {
      log.success("Panier correctement vidé");
    } else {
      log.warning(`Le panier contient encore ${panierData.length} ligne(s)`);
    }
  } catch (error) {
    log.error(`Erreur annulation commande: ${error.message}`);
  }
};

// ============================================================================
// TESTS DE NETTOYAGE
// ============================================================================

/**
 * Test 18: Suppression des données de test (cleanup)
 */
const testCleanup = async () => {
  log.section("TEST 18: NETTOYAGE (Suppression données de test)");

  // Supprimer Model Porsche Actuel
  for (const model of testData.modelPorscheActuels) {
    try {
      log.info(`Suppression Model Porsche Actuel ${model._id}...`);
      await request(
        `/model_porsche_actuel/${model._id}`,
        {
          method: "DELETE",
        },
        false
      );
      log.success("Model Porsche Actuel supprimé");
    } catch (error) {
      log.error(`Erreur suppression model actuel: ${error.message}`);
    }
  }

  // Supprimer réservations
  if (testData.user.user) {
    for (const reservation of testData.reservations) {
      try {
        log.info(`Suppression réservation ${reservation._id}...`);
        await request(
          `/user/${testData.user.user._id}/reservations/${reservation._id}`,
          {
            method: "DELETE",
          },
          false
        );
        log.success("Réservation supprimée");
      } catch (error) {
        log.error(`Erreur suppression réservation: ${error.message}`);
      }
    }
  }

  // Supprimer Model Porsche (admin)
  for (const model of testData.modelPorsches) {
    try {
      log.info(`Suppression Model Porsche ${model._id}...`);
      await request(
        `/model_porsche/${model._id}`,
        {
          method: "DELETE",
        },
        true
      );
      log.success("Model Porsche supprimé");
    } catch (error) {
      log.error(`Erreur suppression model: ${error.message}`);
    }
  }

  // Supprimer voitures
  const toutesVoitures = [
    ...testData.voitures.neuf,
    ...testData.voitures.occasion,
  ];
  for (const voiture of toutesVoitures) {
    try {
      log.info(`Suppression voiture ${voiture._id}...`);
      await request(
        `/voiture/${voiture._id}`,
        {
          method: "DELETE",
        },
        true
      );
      log.success("Voiture supprimée");
    } catch (error) {
      log.error(`Erreur suppression voiture: ${error.message}`);
    }
  }

  // Supprimer accessoires
  for (const accessoire of testData.accessoires) {
    try {
      log.info(`Suppression accessoire ${accessoire._id}...`);
      await request(
        `/accesoire/${accessoire._id}`,
        {
          method: "DELETE",
        },
        true
      );
      log.success("Accessoire supprimé");
    } catch (error) {
      log.error(`Erreur suppression accessoire: ${error.message}`);
    }
  }

  // Note: On garde les couleurs et jantes car elles peuvent être réutilisées
  log.info("Couleurs et jantes conservées pour réutilisation");
};

// ============================================================================
// FONCTION PRINCIPALE
// ============================================================================

const runAllTests = async () => {
  log.title();
  console.log(`${COLORS.bright}${COLORS.blue}
  ╔═══════════════════════════════════════════════════════════════════════════╗
  ║                   TEST COMPLET API PORSCHE                                ║
  ║                                                                           ║
  ║  Ce script teste toutes les fonctionnalités de l'API :                   ║
  ║  - Authentification Admin & User                                          ║
  ║  - CRUD Couleurs, Jantes, Voitures, Accessoires                          ║
  ║  - Model Porsche (neuf) & Model Porsche Actuel (user)                    ║
  ║  - Réservations (occasion uniquement)                                     ║
  ║  - Commandes (acompte neuf, prix complet accessoire)                     ║
  ║  - Annulations                                                            ║
  ╚═══════════════════════════════════════════════════════════════════════════╝
  ${COLORS.reset}`);

  const startTime = Date.now();

  try {
    // Attendre que le serveur soit prêt
    log.info("Attente démarrage serveur (500ms)...");
    await sleep(500);

    // ===== PARTIE ADMIN =====
    await testAdminAuth();
    await testCouleursExterieur();
    await testCouleursInterieur();
    await testCouleursAccessoire();
    await testTaillesJantes();
    await testVoituresOccasion();
    await testVoituresNeuf();
    await testAccessoires();

    // ===== PARTIE USER =====
    await testUserAuth();
    await testUserProfile();
    await testModelPorscheActuel();
    await testReservations();
    await testCommandeVoitureNeuf();
    await testCommandeAccessoires();
    await testValidationCommande();
    await testAnnulationReservation();
    await testAnnulationCommande();

    // ===== NETTOYAGE =====
    await testCleanup();
  } catch (error) {
    log.error(`Erreur fatale: ${error.message}`);
    console.error(error);
  }

  const endTime = Date.now();
  const duration = ((endTime - startTime) / 1000).toFixed(2);

  // ===== RÉSUMÉ =====
  log.title();
  console.log(
    `\n${COLORS.bright}${COLORS.blue}RÉSUMÉ DES TESTS${COLORS.reset}`
  );
  console.log(`${COLORS.blue}${"=".repeat(80)}${COLORS.reset}\n`);

  console.log(`${COLORS.bright}Durée totale:${COLORS.reset} ${duration}s`);
  console.log(`${COLORS.bright}Tests exécutés:${COLORS.reset} ${stats.total}`);
  console.log(`${COLORS.green}✓ Réussis: ${stats.success}${COLORS.reset}`);
  console.log(`${COLORS.red}✗ Échoués: ${stats.failed}${COLORS.reset}`);
  console.log(`${COLORS.yellow}⚠ Ignorés: ${stats.skipped}${COLORS.reset}`);

  const successRate =
    stats.total > 0 ? ((stats.success / stats.total) * 100).toFixed(2) : 0;
  console.log(
    `\n${COLORS.bright}Taux de réussite: ${successRate}%${COLORS.reset}`
  );

  console.log(`\n${COLORS.bright}Données créées:${COLORS.reset}`);
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
  console.log(
    `  - Model Porsche Actuel: ${testData.modelPorscheActuels.length}`
  );
  console.log(`  - Accessoires: ${testData.accessoires.length}`);
  console.log(`  - Réservations: ${testData.reservations.length}`);
  console.log(`  - Lignes commande: ${testData.lignesCommande.length}`);

  if (stats.failed > 0) {
    console.log(
      `\n${COLORS.red}${COLORS.bright}⚠ Des erreurs ont été détectées. Vérifiez les logs ci-dessus.${COLORS.reset}`
    );
    process.exit(1);
  } else {
    console.log(
      `\n${COLORS.green}${COLORS.bright}✓ Tous les tests ont réussi!${COLORS.reset}`
    );
    process.exit(0);
  }
};

// Lancer les tests
runAllTests().catch((error) => {
  console.error(`${COLORS.red}Erreur fatale:${COLORS.reset}`, error);
  process.exit(1);
});
