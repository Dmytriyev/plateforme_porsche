import mongoose from "mongoose";

const accesoireSchema = new mongoose.Schema(
  {
    type_accesoire: {
      type: String,
      required: true,
    },
    nom: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    prix: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Accesoire", accesoireSchema);
