/**
 * Modèle Package
 * - Définit les packages/options (nom, description, prix) pour les variantes
 * - Permet d'ajouter des bundles d'options sur la configuration d'une voiture
 */
import mongoose from "mongoose";
import { TYPES_PACKAGE } from "../utils/package.constants.js";
const packageSchema = new mongoose.Schema(
  {
    // Nom du package ( Weissach Package, Sport Chrono)
    nom_package: {
      type: String,
      required: true,
      trim: true,
      enum: TYPES_PACKAGE,
      maxlength: 150,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    prix: {
      type: Number,
      min: 0,
      default: 0,
      max: 100000,
    },
    photo_package: {
      type: String,
      trim: true,
    },
    // Disponibilité true=disponible, false=indisponible
    disponible: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Index pour accélérer les recherches
packageSchema.index({ nom_package: 1 });
packageSchema.index({ prix: 1 });
packageSchema.index({ disponible: 1 });

export default mongoose.model("Package", packageSchema);
