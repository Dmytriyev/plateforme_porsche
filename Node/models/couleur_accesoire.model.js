import mongoose from "mongoose";

const couleur_accesoireSchema = new mongoose.Schema(
  {
    nom_couleur: {
      type: String,
      required: true,
      trim: true,
    },
    photo_couleur: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

// Index pour accélérer les recherches
couleur_accesoireSchema.index({ nom_couleur: 1 });

export default mongoose.model("Couleur_accesoire", couleur_accesoireSchema);
