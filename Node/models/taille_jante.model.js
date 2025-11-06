import mongoose from "mongoose";
import { TAILLES_JANTE, COULEURS_JANTE } from "../utils/jante.constants.js";

const taille_janteSchema = new mongoose.Schema(
  {
    taille_jante: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
      enum: TAILLES_JANTE,
    },
    couleur_jante: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      enum: COULEURS_JANTE,
    },
    photo_jante: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    prix: {
      type: Number,
      min: 0,
      default: 0,
      max: 100000,
    },
  },
  { timestamps: true }
);

// Index pour accélérer les recherches
taille_janteSchema.index({ taille_jante: 1 });
taille_janteSchema.index({ prix: 1 });

export default mongoose.model("Taille_jante", taille_janteSchema);
