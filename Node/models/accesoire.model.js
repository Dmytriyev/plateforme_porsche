import mongoose from "mongoose";

const accesoireSchema = new mongoose.Schema(
  {
    // Type: porte-clés, casquettes, decoration, etc.
    type_accesoire: {
      type: String,
      required: true,
      trim: true,
    },
    nom_accesoire: {
      type: String,
      required: true,
      trim: true,
    },
    // Description détaillée de l'accessoire
    description: {
      type: String,
      required: true,
      trim: true,
    },
    prix: {
      type: Number,
      required: true,
      min: 0,
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
