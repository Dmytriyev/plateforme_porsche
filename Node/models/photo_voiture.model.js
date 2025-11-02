import mongoose from "mongoose";

const photo_voitureSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    alt: {
      type: String,
      required: true,
    },
    // relation many to many [ {} ]
    // relation many to one {}
    voiture: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Voiture",
        required: true,
      },
    ],
    couleur_exterieur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Couleur_exterieur",
    },
    couleur_interieur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Couleur_interieur",
    },
    taille_jante: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Taille_jante",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Photo_voiture", photo_voitureSchema);
