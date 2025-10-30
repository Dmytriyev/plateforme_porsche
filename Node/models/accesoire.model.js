import mongoose from "mongoose";

const accesoireSchema = new mongoose.Schema(
  {
    // Type d'accessoire (porte-clés, casquettes, decoration, )
    type_accesoire: {
      type: String,
      required: true,
    },
    nom_accesoire: {
      type: String,
      required: true,
    },
    // Information de l'accessoire
    description: {
      type: String,
      required: true,
    },
    prix: {
      type: Number,
      required: true,
    },
    couleur_accesoire: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Couleur_accesoire",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Accesoire", accesoireSchema);
