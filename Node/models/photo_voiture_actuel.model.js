import mongoose from "mongoose";

const photo_voiture_actuelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    alt: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model(
  "Photo_voiture_actuel",
  photo_voiture_actuelSchema
);
