import mongoose from "mongoose";

const couleur_interieurSchema = new mongoose.Schema(
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
    // relation one to many [ {} ]
    model_porsche: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Model_porsche",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Couleur_interieur", couleur_interieurSchema);
