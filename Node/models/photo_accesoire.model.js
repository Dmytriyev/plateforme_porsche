/**
 * Modèle Photo Accesoire
 * - Représente une image liée à un accessoire (chemin, alt, couleur associée)
 * - Utilisé pour afficher les images dans le catalogue frontend
 */
import mongoose from "mongoose";

const photo_accesoireSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    alt: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    // Relation Many-to-One: accesoire associé
    accesoire: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Accesoire",
      required: true,
    },
    // Relation Many-to-One: couleur spécifique
    couleur_accesoire: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Couleur_accesoire",
    },
  },
  { timestamps: true }
);

// Index pour accélérer les recherches
photo_accesoireSchema.index({ accesoire: 1 });

export default mongoose.model("Photo_accesoire", photo_accesoireSchema);
