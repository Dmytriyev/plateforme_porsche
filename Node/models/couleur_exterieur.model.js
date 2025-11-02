import mongoose from "mongoose";

const couleur_exterieurSchema = new mongoose.Schema(
  {
    nom_couleur: {
      type: String,
      required: true,
    },
    photo_couleur: {
      type: String,
      default: null,
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Couleur_exterieur", couleur_exterieurSchema);
