import mongoose from "mongoose";

const photo_porscheSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    alt: {
      type: String,
      required: true,
    },
    // relation many to one {}
    // Many-to-One (plusieurs photos → un modèle)
    model_porsche: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Model_porsche",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Photo_porsche", photo_porscheSchema);
