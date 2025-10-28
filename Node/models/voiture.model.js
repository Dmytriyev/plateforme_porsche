import mongoose from "mongoose";

const voitureSchema = new mongoose.Schema(
  {
    type_voiture: {
      type: Boolean,
      required: true,
      default: false,
    },
    nom_model: {
      type: String,
      required: true,
    },
    concessionnaire: {
      type: String,
    },
    acompte: {
      type: Number,
      default: 0,
    },
    prix: {
      type: Number,
      default: 0,
    },
    // relation many to many [ {} ]
    // relation many to one {}
    photo_voiture: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Photo_voiture",
        required: true,
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Voiture", voitureSchema);
