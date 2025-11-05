import mongoose from "mongoose";

const model_porsche_actuelSchema = new mongoose.Schema(
  {
    // Modèle: 911 Carrera S, Cayman GTS, Cayenne E-Hybrid.
    type_model: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    // Carrosserie: Coupe, Cabriolet, Targa, SUV
    type_carrosserie: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    annee_production: {
      type: Date,
      required: true,
      max: Date.now(),
    },
    // Moteur: Flat-6 3.4L, V6, V8, Hybrid
    info_moteur: {
      type: String,
      default: "N/A",
      trim: true,
      maxlength: 100,
    },
    // Transmission: Manuelle, PDK, Tiptronic
    info_transmission: {
      type: String,
      trim: true,
      default: "N/A",
      maxlength: 50,
    },
    // unique: true, sparse: true dit que les valeurs présentes doivent être uniques, mais l'absence de valeur est autorisée pour plusieurs documents
    // Numéro de série unique (VIN)
    numero_win: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
      trim: true,
      maxlength: 17,
    },
    // Relation Many-to-One: Propriétaire
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Relation Many-to-One: Couleur extérieure
    couleur_exterieur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Couleur_exterieur",
    },
    // Relation Many-to-One: Couleur intérieure
    couleur_interieur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Couleur_interieur",
    },
    // Relation Many-to-One: Taille de jantes
    taille_jante: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Taille_jante",
    },
    // Relation One-to-Many: Photos de la voiture
    photo_voiture_actuel: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Photo_voiture_actuel",
      },
    ],
  },
  { timestamps: true }
);

// Index pour accélérer les recherches
model_porsche_actuelSchema.index({ user: 1 });
model_porsche_actuelSchema.index({ type_model: 1 });
model_porsche_actuelSchema.index({ annee_production: -1 });
model_porsche_actuelSchema.index({ createdAt: -1 });

export default mongoose.model(
  "Model_porsche_actuel",
  model_porsche_actuelSchema
);
