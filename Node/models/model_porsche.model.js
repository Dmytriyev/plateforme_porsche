import mongoose from "mongoose";

const model_porscheSchema = new mongoose.Schema(
  {
    // Modèle: 911 Carrera S, Cayman GTS, etc.
    nom_model: {
      type: String,
      required: true,
      trim: true,
    },
    // Carrosserie: Coupe, Cabriolet, Targa, SUV
    type_carrosserie: {
      type: String,
      required: true,
      trim: true,
    },
    annee_production: {
      type: Date,
    },
    // Moteur: Flat-6, V8, etc.
    info_moteur: {
      type: String,
      required: true,
      trim: true,
    },
    // Puissance en chevaux (ex: 450)
    info_puissance: {
      type: Number,
      required: true,
      min: 0,
    },
    // Transmission: PDK, Manuelle
    info_transmission: {
      type: String,
      required: true,
      trim: true,
    },
    // Accélération 0-100 km/h en secondes
    info_acceleration: {
      type: Number,
      required: true,
      min: 0,
    },
    // Vitesse maximale en km/h
    info_vitesse_max: {
      type: Number,
      required: true,
      min: 0,
    },
    // Consommation en L/100km
    info_consommation: {
      type: Number,
      required: true,
      min: 0,
    },
    // Numéro de série unique (VIN)
    numero_win: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
      trim: true,
    },
    // Localisation de la voiture
    concessionnaire: {
      type: String,
      trim: true,
    },
    // Description générale
    description: {
      type: String,
      required: true,
      trim: true,
    },
    // Acompte (voiture neuve: 20% du prix)
    acompte: {
      type: Number,
      min: 0,
      default: 0,
    },
    // Prix total de la configuration
    prix: {
      type: Number,
      min: 0,
      default: 0,
    },
    // Relation Many-to-One: Modèle de base
    voiture: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Voiture",
      required: true,
    },
    // Relation Many-to-One: Couleur extérieure
    couleur_exterieur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Couleur_exterieur",
    },
    // Relation One-to-Many: Couleurs intérieures
    couleur_interieur: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Couleur_interieur",
      },
    ],
    // Relation Many-to-One: Taille de jantes
    taille_jante: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Taille_jante",
    },
    // Relation One-to-Many: Photos
    photo_porsche: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Photo_porsche",
      },
    ],
  },
  { timestamps: true }
);

// Index pour accélérer les recherches
model_porscheSchema.index({ voiture: 1 });
model_porscheSchema.index({ numero_win: 1 });
model_porscheSchema.index({ nom_model: 1 });
model_porscheSchema.index({ prix: 1 });
model_porscheSchema.index({ concessionnaire: 1 });
model_porscheSchema.index({ createdAt: -1 });

export default mongoose.model("Model_porsche", model_porscheSchema);
