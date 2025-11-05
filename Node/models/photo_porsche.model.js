import mongoose from "mongoose";

const photo_porscheSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    alt: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
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

// Index pour accélérer les recherches
photo_porscheSchema.index({ model_porsche: 1 });

export default mongoose.model("Photo_porsche", photo_porscheSchema);
