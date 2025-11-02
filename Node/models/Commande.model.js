import mongoose from "mongoose";

const CommandeSchema = new mongoose.Schema(
  {
    date_commande: {
      type: Date,
      required: true,
    },
    // Prix total de la commande
    prix: {
      type: Number,
    },
    // Acompte versé pour voiture neuf
    acompte: {
      type: Number,
    },
    // Status de la commande : true = panier actif (non validée), false = commande validée
    status: {
      type: Boolean,
      required: true,
      default: false,
    },
    // URL de la facture générée
    factureUrl: {
      type: String,
    },
    // relation many to one {}
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("Commande", CommandeSchema);
