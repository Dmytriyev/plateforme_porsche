import mongoose from "mongoose";

const voitureSchema = new mongoose.Schema(
  {
    // true = neuf, false = occasion
    type_voiture: {
      type: Boolean,
      required: true,
      default: false,
    },
    // 911 Cayman Cayenne
    nom_model: {
      type: String,
      required: true,
    },
    // info general sur la model
    description: {
      type: String,
    },
    // prix de base
    prix: {
      type: Number,
      default: 0,
    },
    // relation many to many [ {} ]
    photo_voiture: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Photo_voiture",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Voiture", voitureSchema);
