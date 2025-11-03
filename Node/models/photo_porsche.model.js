import mongoose from "mongoose";

const photo_porscheSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    alt: {
      type: String,
      required: true,
      trim: true,
    },
    // Relation Many-to-One: Modèle Porsche associé
    model_porsche: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Model_porsche",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Photo_porsche", photo_porscheSchema);
