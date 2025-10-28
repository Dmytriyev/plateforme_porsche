import mongoose from "mongoose";

const model_porsche_actuelSchema = new mongoose.Schema(
  {
    type_model: {
      type: String,
      required: true,
    },
    type_carrosserie: {
      type: String,
      required: true,
      default: "Coupe",
    },
    annee_production: {
      type: Date,
      required: true,
    },
    info_moteur: {
      type: String,
      default: "N/A",
    },
    info_transmission: {
      type: String,
    },
    numero_win: {
      type: String,
      unique: true,
      uppercase: true,
    },
    // relation many to many [ {} ]
    // relation many to one {}
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    couleur_exterieur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Couleur_exterieur",
    },
    couleur_interieur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Couleur_interieur",
    },
    photo_voiture_actuel: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Photo_voiture_actuel",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model(
  "Model_porsche_actuel",
  model_porsche_actuelSchema
);
