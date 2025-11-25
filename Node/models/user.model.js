/*
  - Le mot de passe est hashé automatiquement avant `save` et `findOneAndUpdate`.
  - Le champ `role` est synchronisé avec `isAdmin` (si rôle = 'admin', isAdmin = true).
  - `telephone` est unique et utilisé pour contact.
  - Les rôles sont définis dans utils/roles.constants.js pour garantir la cohérence.
*/
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import {
  AVAILABLE_ROLES,
  DEFAULT_ROLE,
  isAdminRole,
} from "../utils/roles.constants.js";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 100,
    },
    password: {
      type: String,
      required: true,
      trim: true,
      select: false,
      minlength: 6,
      maxlength: 1024,
    },
    isAdmin: {
      type: Boolean,
      default: false,
    },
    role: {
      type: String,
      enum: AVAILABLE_ROLES,
      default: DEFAULT_ROLE,
    },
    nom: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    prenom: {
      type: String,
      required: true,
      trim: true,
      maxlength: 50,
    },
    telephone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      maxlength: 20,
    },
    adresse: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    code_postal: {
      type: String,
      required: true,
      trim: true,
      maxlength: 10,
    },
    panier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Commande",
    },
  },
  { timestamps: true },
);
// Indexes pour optimiser les recherches courantes
userSchema.index({ isAdmin: 1 });
userSchema.index({ role: 1 });
// Avant de sauvegarder ou mettre à jour, hasher le mot de passe si modifié
userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }

  if (this.isModified("role")) {
    this.isAdmin = isAdminRole(this.role);
  }

  if (this.isModified("isAdmin") && this.isAdmin) {
    this.role = "admin";
  }

  next();
});
// Middleware avant `findOneAndUpdate` pour hasher le mot de passe si modifié
userSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();

  if (update.password) {
    update.password = await bcrypt.hash(update.password, 10);
  }

  // Normaliser l'email si fourni dans une mise à jour
  if (update.email) {
    if (typeof update.email === "string") {
      update.email = update.email.toLowerCase().trim();
    }
  }

  if (update.role) {
    update.isAdmin = isAdminRole(update.role);
  }

  if (update.isAdmin !== undefined && update.isAdmin === true) {
    update.role = "admin";
  }

  this.setUpdate(update);
  next();
});

export default mongoose.model("User", userSchema);
