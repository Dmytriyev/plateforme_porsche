import mongoose from "mongoose";

const siegeSchema = new mongoose.Schema(
  {
    // Nom de siège "Sièges sport", "Sièges sport adaptatifs Plus", "Sièges baquets légers"
    nom_siege: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    options_confort: {
      ventilation: {
        type: Boolean,
        default: false,
      },
      chauffage: {
        type: Boolean,
        default: false,
      },
    },
    photo_siege: {
      type: String,
      trim: true,
    },
    prix: {
      type: Number,
      min: 0,
      default: 0,
      max: 50000,
    },
  },
  { timestamps: true }
);

// Index pour accélérer les recherches
siegeSchema.index({ nom_siege: 1 });
siegeSchema.index({ prix: 1 });

export default mongoose.model("Siege", siegeSchema);
