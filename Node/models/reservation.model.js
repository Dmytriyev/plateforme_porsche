import mongoose from "mongoose";

const reservationSchema = new mongoose.Schema(
  {
    date_reservation: {
      type: Date,
      required: true,
    },
    status: {
      type: Boolean,
      required: true,
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
