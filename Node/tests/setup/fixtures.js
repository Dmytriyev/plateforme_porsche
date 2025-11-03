/**
 * Fixtures - Données de test réutilisables
 * Principe: DRY - Don't Repeat Yourself
 */

/**
 * Génère un timestamp unique pour les tests
 */
export const generateTimestamp = () => Date.now();

/**
 * Génère un numéro de téléphone unique
 */
export const generatePhone = () => {
  const timestamp = generateTimestamp().toString().slice(-8);
  return `06${timestamp}`;
};

/**
 * Génère un email unique pour les tests
 */
export const generateEmail = (prefix = "test") => {
  const timestamp = generateTimestamp();
  return `${prefix}-${timestamp}@gmail.com`;
};

/**
 * Génère un numéro WIN unique pour Porsche
 */
export const generateWIN = () => {
  const timestamp = generateTimestamp().toString().slice(-6);
  return `WP0ZZZ99ZTS${timestamp}`;
};

/**
 * Fixtures pour les couleurs extérieures
 */
export const couleursExterieurFixtures = [
  {
    nom_couleur: "Rouge Carmin",
    photo_couleur: "rouge_carmin.jpg",
    description: "Rouge profond et élégant",
  },
  {
    nom_couleur: "Bleu Nuit",
    photo_couleur: "bleu_nuit.jpg",
    description: "Bleu métallique sophistiqué",
  },
  {
    nom_couleur: "Noir Métallisé",
    photo_couleur: "noir_metallise.jpg",
    description: "Noir brillant premium",
  },
];

/**
 * Fixtures pour les couleurs intérieures
 */
export const couleursInterieurFixtures = [
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
    photo_couleur: "alcantara_gris.jpg",
    description: "Alcantara sportif",
  },
];

/**
 * Fixtures pour les couleurs accessoires
 */
export const couleursAccessoireFixtures = [
  { nom_couleur: "Noir Mat", photo_couleur: "noir_mat.jpg" },
  { nom_couleur: "Argent", photo_couleur: "argent.jpg" },
  { nom_couleur: "Carbone", photo_couleur: "carbone.jpg" },
];

/**
 * Fixtures pour les tailles de jantes
 */
export const taillesJantesFixtures = [
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

/**
 * Fixtures pour les voitures occasion
 */
export const voituresOccasionFixtures = [
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

/**
 * Fixtures pour les voitures neuves
 */
export const voituresNeufFixtures = [
  {
    type_voiture: true, // true = neuf
    nom_model: "911 Turbo S 2024",
    description: "Dernière génération, configuration sur mesure",
    prix: 250000,
  },
  {
    type_voiture: true,
    nom_model: "Taycan Turbo S",
    description: "Électrique haute performance",
    prix: 185000,
  },
];

/**
 * Factory pour créer un Model Porsche
 */
export const createModelPorscheFixture = (
  voitureId,
  couleurExtId,
  couleursIntIds,
  tailleJanteId
) => {
  const timestamp = generateTimestamp().toString().slice(-6);
  return {
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
    voiture: voitureId,
    couleur_exterieur: couleurExtId,
    couleur_interieur: couleursIntIds,
    taille_jante: tailleJanteId,
  };
};

/**
 * Fixtures pour les accessoires
 */
export const accessoiresFixtures = (couleurIds = []) => [
  {
    type_accesoire: "Intérieur",
    nom_accesoire: "Tapis de sol premium",
    description: "Tapis sur mesure en velours",
    prix: 350,
    couleur_accesoire: couleurIds[0] || null,
  },
  {
    type_accesoire: "Extérieur",
    nom_accesoire: "Spoiler arrière carbone",
    description: "Spoiler en carbone véritable",
    prix: 2500,
    couleur_accesoire: couleurIds[2] || null,
  },
  {
    type_accesoire: "Performance",
    nom_accesoire: "Échappement sport titane",
    description: "Échappement titane avec valve",
    prix: 5000,
    couleur_accesoire: couleurIds[1] || null,
  },
];

/**
 * Factory pour créer un utilisateur
 */
export const createUserFixture = (customData = {}) => {
  const timestamp = generateTimestamp();
  return {
    email: generateEmail("user"),
    password: "User123!@#",
    nom: "Dupont",
    prenom: "Jean",
    telephone: generatePhone(),
    adresse: "10 Rue de la République",
    code_postal: "75002",
    ...customData,
  };
};

/**
 * Factory pour créer un Model Porsche Actuel (voiture personnelle)
 */
export const createModelPorscheActuelFixture = (
  couleurExtId,
  couleurIntId,
  tailleJanteId
) => ({
  type_model: "911 Carrera",
  type_carrosserie: "Cabriolet",
  annee_production: new Date("2020-06-15"),
  info_moteur: "3.0L Turbo Flat-6",
  info_transmission: "PDK 7 vitesses",
  numero_win: generateWIN(),
  couleur_exterieur: couleurExtId,
  couleur_interieur: couleurIntId,
  taille_jante: tailleJanteId,
});

/**
 * Factory pour créer une réservation
 */
export const createReservationFixture = (voitureId, daysFromNow = 7) => {
  const futureDate = new Date(Date.now() + daysFromNow * 24 * 60 * 60 * 1000);
  return {
    voiture: voitureId,
    date_reservation: futureDate,
    status: true,
  };
};

export default {
  generateTimestamp,
  generatePhone,
  generateEmail,
  generateWIN,
  couleursExterieurFixtures,
  couleursInterieurFixtures,
  couleursAccessoireFixtures,
  taillesJantesFixtures,
  voituresOccasionFixtures,
  voituresNeufFixtures,
  createModelPorscheFixture,
  accessoiresFixtures,
  createUserFixture,
  createModelPorscheActuelFixture,
  createReservationFixture,
};
