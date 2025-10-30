import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema(
  {
    date_reservation: {
      type: Date,
      required: true,
    },
    // true = confirmée, false = en attente
    status: {
      type: Boolean,
      default: false,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    voiture: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Voiture",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Reservation", reservationSchema);
