// Script pour créer des données de test pour vérifier l'affichage des commandes
import mongoose from "mongoose";
import "dotenv/config";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/porsche_db";

async function createTestData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connecté à MongoDB");

    // Récupérer un utilisateur existant ou en créer un
    const User = mongoose.model(
      "User",
      new mongoose.Schema({}, { strict: false })
    );
    let user = await User.findOne({});

    if (!user) {
      console.log(
        "❌ Aucun utilisateur trouvé. Veuillez d'abord vous inscrire sur l'application."
      );
      process.exit(1);
    }

    console.log("✅ Utilisateur trouvé:", user.email);

    // Créer une commande validée
    const Commande = mongoose.model(
      "Commande",
      new mongoose.Schema({}, { strict: false })
    );
    const commande = await Commande.create({
      user: user._id,
      date_commande: new Date(),
      prix: 95000,
      acompte: 9500,
      status: true,
      factureUrl: "https://invoice.stripe.com/test-invoice",
    });

    console.log("✅ Commande créée:", commande._id);

    // Créer des lignes de commande
    const LigneCommande = mongoose.model(
      "LigneCommande",
      new mongoose.Schema({}, { strict: false })
    );
    await LigneCommande.create({
      commande: commande._id,
      quantite: 1,
      prix: 95000,
      acompte: 9500,
    });

    console.log("✅ Ligne de commande créée");
    console.log("");
    console.log("🎉 Données de test créées avec succès !");
    console.log("");
    console.log("Vous pouvez maintenant vérifier la page:");
    console.log("👉 http://localhost:5173/mes-commandes");
    console.log("");
    console.log("Pour vous connecter, utilisez:");
    console.log("Email:", user.email);

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("❌ Erreur:", error.message);
    process.exit(1);
  }
}

createTestData();
