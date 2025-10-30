import mongoose from "mongoose";

const taille_janteSchema = new mongoose.Schema(
  {
    taille_jante: {
      type: String,
      required: true,
    },
    couleur_jante: {
      type: String,
      required: true,
    },
    photo_couleur: {
      type: String,
      required: true,
    },
    // info sur la jante
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Taille_jante", taille_janteSchema);
