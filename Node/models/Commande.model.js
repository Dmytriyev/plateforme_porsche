import mongoose from "mongoose";

const CommandeSchema = new mongoose.Schema(
  {
    date_commande: {
      type: Date,
      required: true,
    },
    prix: {
      type: Number,
      default: 0,
    },
    acompte: {
      type: Number,
      default: 0,
    },
    status: {
      type: Boolean,
      required: true,
    },
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
