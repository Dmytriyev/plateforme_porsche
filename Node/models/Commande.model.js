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
    // status de la commande payée ou non payée
    status: {
      type: Boolean,
      required: true,
      default: false,
      // false = non payée , true = payée
    },
    // URL de la facture générée
    factureUrl: {
      type: String,
    },
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
