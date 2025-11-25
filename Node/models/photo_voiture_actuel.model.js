/**
 * Modèle Photo Voiture Actuel
 * - Images pour les annonces de voitures actuelles (voitures d'occasion)
 * - Associées à `Model_porsche_actuel` et utilisées dans les fiches annonces
 */
import mongoose from "mongoose";

const photo_voiture_actuelSchema = new mongoose.Schema(
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
    // Relation Many-to-One: Voiture personnelle associée
    model_porsche_actuel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Model_porsche_actuel",
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
  },
  { timestamps: true }
);

// Index pour accélérer les recherches
photo_voiture_actuelSchema.index({ model_porsche_actuel: 1 });

export default mongoose.model(
  "Photo_voiture_actuel",
  photo_voiture_actuelSchema
);
