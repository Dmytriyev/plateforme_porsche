import mongoose from "mongoose";

const ligneCommandeSchema = new mongoose.Schema(
  {
    // Relation Many-to-One: Voiture commandée (si type_produit = true)
    voiture: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Voiture",
    },
    // Relation Many-to-One: Accessoire commandé (si type_produit = false)
    accesoire: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Accesoire",
    },
    // Relation Many-to-One: Commande parent
    commande: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Commande",
      required: true,
    },
    // Type de produit: true = voiture, false = accessoire
    type_produit: {
      type: Boolean,
      required: true,
    },
    quantite: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
    // Prix total de la ligne
    prix: {
      type: Number,
      min: 0,
      default: 0,
    },
    // Acompte versé (voiture neuve uniquement: 20%)
    acompte: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("LigneCommande", ligneCommandeSchema);
