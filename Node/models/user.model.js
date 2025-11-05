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
      enum: ["user", "responsable", "conseillere", "admin"],
      default: "user",
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
  { timestamps: true }
);

userSchema.index({ isAdmin: 1 });
userSchema.index({ role: 1 });

userSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    this.password = await bcrypt.hash(this.password, 10);
  }

  if (this.isModified("role")) {
    this.isAdmin = this.role === "admin";
  }

  if (this.isModified("isAdmin") && this.isAdmin) {
    this.role = "admin";
  }

  next();
});

userSchema.pre("findOneAndUpdate", async function (next) {
  const update = this.getUpdate();

  if (update.password) {
    update.password = await bcrypt.hash(update.password, 10);
  }

  if (update.role) {
    update.isAdmin = update.role === "admin";
  }

  if (update.isAdmin !== undefined && update.isAdmin === true) {
    update.role = "admin";
  }

  this.setUpdate(update);
  next();
});

export default mongoose.model("User", userSchema);
