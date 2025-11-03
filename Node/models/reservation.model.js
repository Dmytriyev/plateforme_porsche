import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema(
  {
    date_reservation: {
      type: Date,
      required: true,
    },
    // Status: true = confirmée, false = en attente
    status: {
      type: Boolean,
      default: false,
    },
    // Relation Many-to-One: Utilisateur
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Relation Many-to-One: Voiture (occasion uniquement)
    voiture: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Voiture",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Reservation", reservationSchema);
