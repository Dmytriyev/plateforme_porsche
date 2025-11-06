import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema(
  {
    date_reservation: {
      type: Date,
      required: true,
    },
    // Status: true = réservation active/confirmée, false = annulée
    status: {
      type: Boolean,
      default: true,
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

// Index pour accélérer les recherches
reservationSchema.index({ user: 1 });
reservationSchema.index({ voiture: 1 });
reservationSchema.index({ date_reservation: 1 });
reservationSchema.index({ status: 1 });
reservationSchema.index({ voiture: 1, date_reservation: 1, status: 1 });

export default mongoose.model("Reservation", reservationSchema);
