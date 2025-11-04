import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false, // Ne pas retourner le password par défaut
    },
    // Droits administrateur
    isAdmin: {
      type: Boolean,
      default: false,
    },
    // Rôle utilisateur: "user", "responsable", "conseillere"
    role: {
      type: String,
      enum: ["user", "responsable", "conseillere", "admin"],
      default: "user",
    },
    nom: {
      type: String,
      required: true,
      trim: true,
    },
    prenom: {
      type: String,
      required: true,
      trim: true,
    },
    telephone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    adresse: {
      type: String,
      required: true,
      trim: true,
    },
    code_postal: {
      type: String,
      required: true,
      trim: true,
    },
    // Relation Many-to-One: Panier actif de l'utilisateur
    panier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Commande",
    },
  },
  { timestamps: true }
);

// Index pour accélérer les recherches
userSchema.index({ email: 1 });
userSchema.index({ telephone: 1 });
userSchema.index({ isAdmin: 1 });
userSchema.index({ role: 1 });

// Hash du mot de passe avant sauvegarde
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Hash du mot de passe avant mise à jour
userSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();

  if (update.password) {
    const hashed = await bcrypt.hash(update.password, 10);
    this.setUpdate({ ...update, password: hashed });
  }
  next();
});

export default mongoose.model("User", userSchema);
