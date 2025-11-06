import mongoose from "mongoose";
import { COULEURS_INTERIEUR } from "../utils/couleur_interieur.constants.js";

const couleur_interieurSchema = new mongoose.Schema(
  {
    nom_couleur: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      enum: COULEURS_INTERIEUR,
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
    // Relation One-to-Many
    model_porsche: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Model_porsche",
      },
    ],
  },
  { timestamps: true }
);

// Index pour accélérer les recherches
couleur_interieurSchema.index({ nom_couleur: 1 });
couleur_interieurSchema.index({ prix: 1 });

export default mongoose.model("Couleur_interieur", couleur_interieurSchema);
