import mongoose from "mongoose";

const ligneCommandeSchema = new mongoose.Schema(
  {
    type_produit_v: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Voiture",
    },
    type_produit_a: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Accesoire",
    },
    commande: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Commande",
      required: true,
    },
    nom_produit: {
      type: String,
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
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("LigneCommande", ligneCommandeSchema);
