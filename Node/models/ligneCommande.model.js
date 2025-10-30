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
    // Prix unitaire l'accesoire
    prix: {
      type: Number,
      default: 0,
    },
    // Acompte versé pour voiture neuf
    acompte: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("LigneCommande", ligneCommandeSchema);
