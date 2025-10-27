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
    model_porsche_actuel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Model_porsche_actuel",
    },
  },
  { timestamps: true }
);

export default mongoose.model(
  "Photo_voiture_actuel",
  photo_voiture_actuelSchema
);
