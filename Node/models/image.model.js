import mongoose from "mongoose";

const imageSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    alt: {
      type: String,
      required: true,
      default: "Image",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Image", imageSchema);
