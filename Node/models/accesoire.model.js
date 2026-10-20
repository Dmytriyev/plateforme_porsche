/**
 * Modèle Accesoire
 * - Décrit un accessoire (type, nom, description, prix, stock)
 * - Utilisé par le catalogue frontend et pour calcul du panier
 */
import mongoose from "mongoose";
import { TYPES_ACCESOIRE } from "../utils/accesoire.constants.js";

const accesoireSchema = new mongoose.Schema(
  {
    // Type: porte-clés, casquettes, decoration.
    type_accesoire: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      enum: TYPES_ACCESOIRE,
    },
    nom_accesoire: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    // Description détaillée de l'accesoire
    description: {
      type: String,
      required: true,
      maxlength: 1000,
      trim: true,
    },
    prix: {
      type: Number,
      required: true,
      min: 0,
      max: 100000,
    },
    // Prix promotionnel optionnel
    prix_promotion: {
      type: Number,
      min: 0,
      max: 100000,
      default: null,
    },
    // Stock disponible
    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    // Disponibilité
    disponible: {
      type: Boolean,
      required: true,
      default: true,
    },
    // Relation Many-to-One: Couleur de l'accessoire
    couleur_accesoire: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Couleur_accesoire",
    },
    // Relation One-to-Many: Photos associées
    photo_accesoire: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Photo_accesoire",
      },
    ],
  },
  { timestamps: true }
);

// Index pour accélérer les recherches
accesoireSchema.index({ type_accesoire: 1 });
accesoireSchema.index({ nom_accesoire: 1 });
accesoireSchema.index({ prix: 1 });

export default mongoose.model("Accesoire", accesoireSchema);
