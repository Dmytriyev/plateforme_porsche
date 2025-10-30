import mongoose from "mongoose";

const model_porsche_actuelSchema = new mongoose.Schema(
  {
    // 911(Carrera, S, GTS, GT3, GT3RS), Cayman(S, GTS, GT4RS), Cayenne(Hybrid, Turbo)
    type_model: {
      type: String,
      required: true,
    },
    // Coupe, Cabriolet, Targa, SUV
    type_carrosserie: {
      type: String,
      required: true,
      default: "Coupe",
    },
    annee_production: {
      type: Date,
      required: true,
    },
    // ex: Flat-6 3.4L, 4.0L, V6, V8, Hybrid
    info_moteur: {
      type: String,
      default: "N/A",
    },
    // manuelle, PDK, Tiptronic
    info_transmission: {
      type: String,
    },
    // numero de serie
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
