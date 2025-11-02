import mongoose from "mongoose";

const model_porscheSchema = new mongoose.Schema(
  {
    // 911(Carrera, S, GTS, GT3, GT3RS), Cayman(S, GTS, GT4RS), Cayenne(Hybrid, Turbo)
    nom_model: {
      type: String,
      required: true,
    },
    // Coupe, Cabriolet, Targa, SUV
    type_carrosserie: {
      type: String,
      required: true,
    },
    annee_production: {
      type: Date,
      required: true,
    },
    // Flat-6, V8,
    info_moteur: {
      type: String,
      required: true,
    },
    // ex: 300 ch, 450 ch, 580 ch
    info_puissance: {
      type: Number,
      required: true,
    },
    // PDK
    info_transmission: {
      type: String,
      required: true,
    },
    info_acceleration: {
      type: Number,
      required: true,
    },
    info_vitesse_max: {
      type: Number,
      required: true,
    },
    info_consomation: {
      type: Number,
      required: true,
    },
    // numero de serie unique
    numero_win: {
      type: String,
      unique: true,
      uppercase: true,
    },
    // ou situé la voiture
    concessionnaire: {
      type: String,
    },
    // info general sur la model
    description: {
      type: String,
      required: true,
    },
    // accompte pour reserver la voiture neuf
    acompte: {
      type: Number,
      default: 0,
    },
    // prix total de la voiture oocation ou neuf
    prix: {
      type: Number,
      default: 0,
    },
    // relation many to one {}
    voiture: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Voiture",
      required: true,
    },
    // relation many to one {}
    couleur_exterieur: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Couleur_exterieur",
    },
    // relation many to many [{}]
    couleur_interieur: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Couleur_interieur",
      },
    ],
    // relation many to one {}
    taille_jante: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Taille_jante",
    },
    // relation one to many [{}]
    photo_porsche: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Photo_porsche",
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Model_porsche", model_porscheSchema);
