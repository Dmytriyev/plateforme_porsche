import mongoose from "mongoose";

const ligneCommandeSchema = new mongoose.Schema(
  {
    voiture: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Voiture",
    },
    accesoire: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Accesoire",
    },
    commande: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Commande",
      required: true,
    },
    quantite: {
      type: Number,
      required: true,
      default: 1,
    },
    prix: {
      type: Number,
      required: true,
      default: 0,
    },
    acompte: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("LigneCommande", ligneCommandeSchema);
