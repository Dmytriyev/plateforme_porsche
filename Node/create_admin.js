#!/usr/bin/env node

import mongoose from "mongoose";
import User from "./models/user.model.js";
import Commande from "./models/Commande.model.js";
import dotenv from "dotenv";

dotenv.config();

const createAdmin = async () => {
  try {
    // Connexion à MongoDB
    await mongoose.connect(process.env.DB_URI);
    console.log("✓ Connexion à MongoDB réussie");

    // Utiliser un email fixe pour les tests ou celui passé en argument
    const email = process.argv[2] || "admin@porsche.com";

    // Vérifier si l'admin existe déjà
    const existingAdmin = await User.findOne({ email });
    if (existingAdmin) {
      console.log("⚠ Un administrateur avec cet email existe déjà");
      console.log(`  Email: ${email}`);
      console.log(`  Mot de passe: Admin123!@#`);
      process.exit(0);
    }

    const timestamp = Date.now();
    const adminData = {
      email,
      password: "Admin123!@#",
      nom: "Admin",
      prenom: "Porsche",
      telephone: `012345${timestamp.toString().slice(-4)}`,
      adresse: "123 rue Porsche",
      code_postal: "75001",
      isAdmin: true,
      role: "responsable",
    };

    // Créer l'utilisateur admin
    const admin = new User(adminData);
    const newAdmin = await admin.save();
    console.log(`✓ Administrateur créé: ${newAdmin._id}`);
    console.log(`  Email: ${adminData.email}`);
    console.log(`  Mot de passe: ${adminData.password}`);

    // Créer un panier pour l'admin
    const commande = new Commande({
      user: newAdmin._id,
      date_commande: new Date(),
      prix: 0,
      acompte: 0,
      status: true,
    });

    await commande.save();
    console.log(`✓ Panier créé: ${commande._id}`);

    // Mettre à jour l'admin avec l'ID du panier
    newAdmin.panier = commande._id;
    await newAdmin.save();
    console.log(`✓ Panier associé à l'administrateur`);

    console.log("\n✓ Administrateur créé avec succès!");
    console.log("\nUtilisez ces identifiants pour vous connecter:");
    console.log(`  Email: ${adminData.email}`);
    console.log(`  Mot de passe: ${adminData.password}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("✗ Erreur:", error.message);
    await mongoose.disconnect();
    process.exit(1);
  }
};

createAdmin();
