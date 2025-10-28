import mongoose from "mongoose";

const model_porscheSchema = new mongoose.Schema(
  {
    type_model: {
      type: String,
      required: true,
    },
    type_carrosserie: {
      type: String,
      required: true,
    },
    annee_production: {
      type: Date,
      required: true,
    },
    info_moteur: {
      type: String,
      required: true,
    },
    info_puissance: {
      type: Number,
      required: true,
    },
    info_transmission: {
      type: String,
      required: true,
    },
    info_acceleration: {
      type: Number,
      required: true,
    },
    info_vitesse_max: {
      type: Number,
      required: true,
    },
    info_consomation: {
      type: Number,
      required: true,
    },
    numero_win: {
      type: String,
      unique: true,
      uppercase: true,
    },
    prix: {
      type: Number,
      required: true,
      default: 0,
    },
    voiture: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Voiture",
    },
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
  },
  { timestamps: true }
);

export default mongoose.model("Model_porsche", model_porscheSchema);
