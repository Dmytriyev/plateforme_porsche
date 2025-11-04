import mongoose from "mongoose";

const voitureSchema = new mongoose.Schema(
  {
    // Type: true = neuve, false = occasion
    type_voiture: {
      type: Boolean,
      required: true,
      default: false,
    },
    // Nom du modèle: 911, Cayman, Cayenne, etc.
    nom_model: {
      type: String,
      required: true,
      trim: true,
    },
    // Description générale du modèle
    description: {
      type: String,
      trim: true,
    },
    // Prix de base du modèle
    prix: {
      type: Number,
      min: 0,
      default: 0,
    },
    // Relation Many-to-Many: Photos associées
    photo_voiture: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Photo_voiture",
      },
    ],
  },
  { timestamps: true }
);

// Index pour accélérer les recherches
voitureSchema.index({ type_voiture: 1 });
voitureSchema.index({ nom_model: 1 });
voitureSchema.index({ prix: 1 });
voitureSchema.index({ createdAt: -1 });

export default mongoose.model("Voiture", voitureSchema);
