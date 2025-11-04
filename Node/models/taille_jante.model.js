import mongoose from "mongoose";

const taille_janteSchema = new mongoose.Schema(
  {
    taille_jante: {
      type: String,
      required: true,
      trim: true,
    },
    couleur_jante: {
      type: String,
      trim: true,
    },
    photo_jante: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    // Prix supplémentaire pour ces jantes
    prix: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  { timestamps: true }
);

// Index pour accélérer les recherches
taille_janteSchema.index({ taille_jante: 1 });
taille_janteSchema.index({ prix: 1 });

export default mongoose.model("Taille_jante", taille_janteSchema);
