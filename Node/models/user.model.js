import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      bcrypt: true,
    },
    // admin ou user
    isAdmin: {
      type: Boolean,
      default: false,
    },
    // responsable, client, conseillere
    role: {
      type: String,
      default: "user",
    },
    nom: {
      type: String,
      required: true,
    },
    prenom: {
      type: String,
      required: true,
    },
    telephone: {
      type: String,
      required: true,
      unique: true,
    },
    adresse: {
      type: String,
      required: true,
    },
    code_postal: {
      type: String,
      required: true,
    },
    panier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Commande",
    },
  },
  { timestamps: true }
);

// Middleware exécuté avant de sauvegarder un utilisateur dans la base de données
// Si le mot de passe a été modifié, il est haché avant d'être sauvegardé
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

// Middleware exécuté avant de mettre à jour un utilisateur avec findOneAndUpdate
// Si le mot de passe est présent dans les mises à jour, il est haché avant d'être sauvegardé
userSchema.pre("findOneAndUpdate", async function (next) {
  let update = this.getUpdate();

  if (update.password) {
    const hashed = await bcrypt.hash(update.password, 10);
    this.setUpdate({
      ...update,
      password: hashed,
    });
  }
  next();
});

export default mongoose.model("User", userSchema);
