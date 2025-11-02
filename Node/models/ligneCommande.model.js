import mongoose from "mongoose";

const ligneCommandeSchema = new mongoose.Schema(
  {
    // relation many to one {}
    // nom de la voiture
    voiture: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Voiture",
    },
    // relation many to one {}
    // nom de l'accesoire
    accesoire: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Accesoire",
    },
    // relation many to one {}
    commande: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Commande",
      required: true,
    },
    // true = voiture, false = accesoire
    type_produit: {
      type: Boolean,
      required: true,
      default: false,
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
