/**
 * Modèle Réservation
 * - Représente une réservation pour une voiture d'occasion (date, user, status)
 * - Utilisé pour bloquer une voiture sur une date spécifique
 */
import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema(
  {
    date_reservation: {
      type: Date,
      required: true,
    },
    // Status: true = réservation confirmée, false = annulée
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
    // Relation Many-to-One: model_porsche (occasion uniquement)
    model_porsche: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Model_porsche",
      required: true,
    },
  },
  { timestamps: true }
);

// Index pour accélérer les recherches
reservationSchema.index({ user: 1 });
reservationSchema.index({ model_porsche: 1 });
reservationSchema.index({ date_reservation: 1 });
reservationSchema.index({ status: 1 });
reservationSchema.index({ model_porsche: 1, date_reservation: 1, status: 1 });

export default mongoose.model("Reservation", reservationSchema);
