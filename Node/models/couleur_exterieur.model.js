import mongoose from "mongoose";
import { COULEURS_EXTERIEUR } from "../utils/couleur_exterieur.constants.js";

const couleur_exterieurSchema = new mongoose.Schema(
  {
    nom_couleur: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      enum: COULEURS_EXTERIEUR,
    },
    photo_couleur: {
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
couleur_exterieurSchema.index({ nom_couleur: 1 });
couleur_exterieurSchema.index({ prix: 1 });

export default mongoose.model("Couleur_exterieur", couleur_exterieurSchema);
