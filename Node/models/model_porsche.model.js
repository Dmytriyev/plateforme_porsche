/**
 * Schéma Mongoose pour les configurations de modèles Porsche.
 * 1. USER visite voiture une model-start(911)
 * 2. USER choisit model_porsche une VARIANTE (Carrera, Carrera S, GTS, Turbo)
 * 3. Chaque variante a ses specs (puissance, transmission, accélération)
 * 4. USER configure: couleurs, jantes, sièges, package, options
 * 5. calcule prix total (prix_base_variante + options)
 * model_porsche = Configuration complète d'une variante spécifique
 */
import mongoose from "mongoose";
import {
  TYPES_CARROSSERIE,
  TOUTES_VARIANTES,
} from "../utils/model_porsche.constants.js";

const model_porscheSchema = new mongoose.Schema(
  {
    // Nom de la variante: "911 Carrera", "911 Carrera S", "911 GTS", "911 Turbo"
    // Valeurs prédéfinies selon le modèle de voiture (911, Cayenne, Cayman)
    nom_model: {
      type: String,
      required: true,
      trim: true,
      enum: {
        values: TOUTES_VARIANTES,
        message:
          "La variante {VALUE} n'est pas valide. Veuillez choisir une variante correspondant au modèle Porsche.",
      },
      maxlength: 100,
    },
    // Carrosserie: Coupe, Cabriolet, Targa
    type_carrosserie: {
      type: String,
      required: true,
      enum: {
        values: TYPES_CARROSSERIE,
        message:
          "Le type de carrosserie {VALUE} n'est pas valide. Choisissez parmi: " +
          TYPES_CARROSSERIE.join(", "),
      },
      trim: true,
    },
    // Année de production
    annee_production: {
      type: Date,
    },
    // specifications techniques détaillées
    specifications: {
      // Moteur: "Flat-6 4.0L bi-turbo", "V8 3.0L"
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
      // Transmission: "PDK 8 rapports"
      transmission: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100,
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
    },
    // Description commerciale
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },
    // Ex: 911 Carrera = 120 000€, 911 GTS = 150 000€, 911 Turbo = 200 000€
    // Le prix total = prix_base + options
    prix_base: {
      type: Number,
      required: true,
      min: 0,
      max: 10000000,
    },

    // Modèle de base (911, Cayenne, Cayman, etc.)
    voiture: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Voiture",
      required: true,
    },

    // configuration options choisies par l'utilisateur
    couleur_exterieur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Couleur_exterieur",
    },
    couleur_interieur: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Couleur_interieur",
      },
    ],
    taille_jante: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Taille_jante",
    },
    siege: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Siege",
    },
    // Package (Weissach, Sport Chrono)
    package: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Package",
    },
    photo_porsche: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Photo_porsche",
      },
    ],
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

// Prix total = prix_base_variante + couleurs + jantes + package + siege
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
  // Prix des options sélectionnées ou null si non sélectionnées
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

model_porscheSchema.methods.calculerAcompte = async function (
  pourcentage = 0.1
) {
  const prixTotal = await this.calculerPrixTotal();
  return prixTotal * pourcentage;
};

// Résumé complet de la configuration et du prix
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

// toutes les variantes disponibles pour un modèle de voiture
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

// rechercher par spécifications
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
