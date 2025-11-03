import mongoose from "mongoose";

const couleur_exterieurSchema = new mongoose.Schema(
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
    description: {
      type: String,
      trim: true,
    },
    // Prix supplémentaire pour cette couleur
    prix: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Couleur_exterieur", couleur_exterieurSchema);
