import mongoose from "mongoose";

const couleur_accesoireSchema = new mongoose.Schema(
  {
    nom_couleur: {
      type: String,
      required: true,
    },
    photo_couleur: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Couleur_accesoire", couleur_accesoireSchema);
