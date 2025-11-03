import mongoose from "mongoose";

const photo_voitureSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    alt: {
      type: String,
      required: true,
      trim: true,
    },
    // Relation Many-to-Many: Voitures associées
    voiture: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Voiture",
        required: true,
      },
    ],
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
  },
  { timestamps: true }
);

export default mongoose.model("Photo_voiture", photo_voitureSchema);
