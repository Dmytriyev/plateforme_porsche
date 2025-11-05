import mongoose from "mongoose";

/**
 * 1. USER visite /model-start/911
 * 2. USER choisit une VARIANTE (Carrera, Carrera S, GTS, Turbo, etc.)
 * 3. Chaque variante a ses specs (puissance, transmission, accélération)
 * 4. USER configure: couleurs, jantes, sièges, package, options
 * 5. Système calcule prix total (prix_base_variante + options)
 * model_porsche = Configuration complète d'une variante spécifique
 */
const model_porscheSchema = new mongoose.Schema(
  {
    // Nom de la variante: "911 Carrera", "911 Carrera S", "911 GTS", "911 Turbo"
    nom_model: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    // Carrosserie: Coupe, Cabriolet, Targa
    type_carrosserie: {
      type: String,
      required: true,
      enum: ["Coupé", "Cabriolet", "Targa", "SUV"],
      trim: true,
    },
    // Année de production
    annee_production: {
      type: Date,
    },
    // SPÉCIFICATIONS TECHNIQUES DE LA VARIANTE
    specifications: {
      // Moteur: "Flat-6 3.0L bi-turbo", "Flat-6 3.7L"
      moteur: {
        type: String,
        required: true,
        trim: true,
        maxlength: 150,
      },
      // Puissance en chevaux (CV)
      puissance: {
        type: Number,
        required: true,
        min: 0,
        max: 1500,
      },
      // Couple en Nm
      couple: {
        type: Number,
        min: 0,
        max: 1500,
      },
      // Transmission: "PDK", "Manuelle 7 vitesses"
      transmission: {
        type: String,
        required: true,
        enum: ["PDK", "Manuelle", "PDK 8 rapports", "Manuelle 7 vitesses"],
      },
      // Accélération 0-100 km/h en secondes
      acceleration_0_100: {
        type: Number,
        required: true,
        min: 0,
        max: 20,
      },
      // Vitesse maximale en km/h
      vitesse_max: {
        type: Number,
        required: true,
        min: 0,
        max: 500,
      },
      // Consommation mixte en L/100km
      consommation: {
        type: Number,
        required: true,
        min: 0,
        max: 50,
      },
      // Émissions CO2 en g/km
      emissions_co2: {
        type: Number,
        min: 0,
        max: 500,
      },
    },
    // Description commerciale
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    // Disponibilité de la variante
    disponible: {
      type: Boolean,
      default: true,
    },
    // PRIX DE BASE DE LA VARIANTE SPÉCIFIQUE
    // Ex: 911 Carrera = 120 000€, 911 GTS = 150 000€, 911 Turbo = 200 000€
    // Le prix total = prix_base + options (couleurs, jantes, package, etc.)
    prix_base: {
      type: Number,
      required: true,
      min: 0,
      max: 10000000,
    },

    // RELATIONS - Modèle de base (911, Cayenne, Cayman, etc.)
    voiture: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Voiture",
      required: true,
    },

    // CONFIGURATION UTILISATEUR (comme sur site Porsche)
    // Étape 1: Couleur extérieure
    couleur_exterieur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Couleur_exterieur",
    },
    // Étape 2: Couleur(s) intérieure(s)
    couleur_interieur: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Couleur_interieur",
      },
    ],
    // Étape 3: Jantes
    taille_jante: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Taille_jante",
    },
    // Étape 4: Sièges
    siege: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Siege",
    },
    // Étape 5: Package (Weissach, Sport Chrono, etc.)
    package: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Package",
    },
    // Photos de la configuration
    photo_porsche: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Photo_porsche",
      },
    ],

    // INFORMATIONS COMMANDE (pour voitures configurées et commandées)
    // Statut de la configuration
    statut: {
      type: String,
      enum: [
        "configuration", // En cours de configuration
        "sauvegardee", // Configuration sauvegardée
        "commandee", // Commande passée
        "en_production", // En cours de fabrication
        "livree", // Livrée au client
      ],
      default: "configuration",
    },
    // Numéro VIN (attribué lors de la production)
    numero_vin: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
      trim: true,
      maxlength: 17,
    },
    // Concessionnaire de livraison
    concessionnaire: {
      type: String,
      trim: true,
      maxlength: 400,
    },
    // Date de livraison estimée
    date_livraison_estimee: {
      type: Date,
    },
  },
  { timestamps: true }
);

// Index pour accélérer les recherches
model_porscheSchema.index({ voiture: 1 });
model_porscheSchema.index({ nom_model: 1 });
model_porscheSchema.index({ type_carrosserie: 1 });
model_porscheSchema.index({ statut: 1 });
model_porscheSchema.index({ disponible: 1 });
model_porscheSchema.index({ concessionnaire: 1 });
model_porscheSchema.index({ createdAt: -1 });

/**
 * Méthode d'instance: calcule le prix total dynamiquement
 * Prix total = prix_base_variante + couleurs + jantes + package + siege
 */
model_porscheSchema.methods.calculerPrixTotal = async function () {
  await this.populate([
    { path: "couleur_exterieur", select: "prix" },
    { path: "couleur_interieur", select: "prix" },
    { path: "taille_jante", select: "prix" },
    { path: "package", select: "prix" },
    { path: "siege", select: "prix" },
  ]);

  // Prix de base de la variante (ex: 911 Carrera, 911 GTS)
  const prixBase = this.prix_base || 0;
  const prixCouleurExt = this.couleur_exterieur?.prix || 0;
  const prixCouleursInt = Array.isArray(this.couleur_interieur)
    ? this.couleur_interieur.reduce((sum, c) => sum + (c.prix || 0), 0)
    : 0;
  const prixJante = this.taille_jante?.prix || 0;
  const prixPackage = this.package?.prix || 0;
  const prixSiege = this.siege?.prix || 0;

  return (
    prixBase +
    prixCouleurExt +
    prixCouleursInt +
    prixJante +
    prixPackage +
    prixSiege
  );
};

/**
 * Méthode d'instance: calcule l'acompte (20% par défaut du prix total)
 */
model_porscheSchema.methods.calculerAcompte = async function (
  pourcentage = 0.2
) {
  const prixTotal = await this.calculerPrixTotal();
  return prixTotal * pourcentage;
};

/**
 * Méthode d'instance: obtenir un résumé de la configuration
 * Utile pour affichage récapitulatif comme sur le site Porsche
 */
model_porscheSchema.methods.obtenirResume = async function () {
  await this.populate([
    { path: "voiture", select: "nom_model type_voiture description" },
    { path: "couleur_exterieur", select: "nom_couleur prix" },
    { path: "couleur_interieur", select: "nom_couleur prix" },
    { path: "taille_jante", select: "taille_jante prix" },
    { path: "siege", select: "nom_siege prix" },
    { path: "package", select: "nom_package prix" },
  ]);

  const prixTotal = await this.calculerPrixTotal();
  const acompte = await this.calculerAcompte();

  return {
    modele: this.voiture?.nom_model,
    variante: this.nom_model,
    carrosserie: this.type_carrosserie,
    specifications: this.specifications,
    configuration: {
      couleur_exterieur: this.couleur_exterieur?.nom_couleur,
      couleurs_interieur: this.couleur_interieur?.map((c) => c.nom_couleur),
      jantes: this.taille_jante?.taille_jante,
      sieges: this.siege?.nom_siege,
      package: this.package?.nom_package,
    },
    prix: {
      prix_base_variante: this.prix_base || 0,
      prix_total: prixTotal,
      acompte_requis: acompte,
    },
    statut: this.statut,
  };
};

/**
 * Méthode statique: obtenir toutes les variantes disponibles d'une voiture
 * Ex: toutes les variantes de 911 (Carrera, Carrera S, GTS, Turbo)
 */
model_porscheSchema.statics.obtenirVariantesDisponibles = async function (
  voitureId
) {
  return await this.find({
    voiture: voitureId,
    disponible: true,
  })
    .select("nom_model type_carrosserie specifications description")
    .populate("voiture", "nom_model")
    .sort({ "specifications.puissance": 1 });
};

/**
 * Méthode statique: rechercher par spécifications
 * Ex: toutes les 911 avec plus de 450CV
 */
model_porscheSchema.statics.rechercherParSpecifications = async function (
  criteres
) {
  const query = { disponible: true };

  if (criteres.puissance_min) {
    query["specifications.puissance"] = { $gte: criteres.puissance_min };
  }
  if (criteres.transmission) {
    query["specifications.transmission"] = criteres.transmission;
  }
  if (criteres.type_carrosserie) {
    query.type_carrosserie = criteres.type_carrosserie;
  }

  return await this.find(query)
    .populate("voiture", "nom_model")
    .sort({ "specifications.puissance": -1 });
};

export default mongoose.model("Model_porsche", model_porscheSchema);
