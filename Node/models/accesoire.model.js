import mongoose from "mongoose";

const accesoireSchema = new mongoose.Schema(
  {
    type_accesoire: {
      type: String,
      required: true,
    },
    nom_accesoire: {
      type: String,
      required: true,
    },
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
