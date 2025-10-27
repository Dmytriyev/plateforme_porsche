import express from "express";
import cors from "cors"; // Pour les requêtes cross-origin
import db from "./db/db.js"; // Configuration de la base de données
import path from "node:path"; // Gestion des chemins de fichiers
import { fileURLToPath } from "node:url"; // Conversion URL vers chemin fichier
import { webhookHandler } from "./controllers/payment.controller.js"; // Gestionnaire webhooks Stripe
import paymentRoutes from "./routes/payment.route.js";
import ligneCommandeRoutes from "./routes/ligneCommande.route.js";
import commandeRoutes from "./routes/Commande.route.js";
import userRoutes from "./routes/user.route.js";
import model_porsche_actuelRoutes from "./routes/model_porsche_actuel.route.js";
import photo_voiture_actuelRoutes from "./routes/photo_voiture_actuel.route.js";
import reservationRoutes from "./routes/reservation.route.js";
import voitureRoutes from "./routes/voiture.route.js";
import model_porscheRoutes from "./routes/model_porsche.route.js";
import photo_voitureRoutes from "./routes/photo_voiture.route.js";
import accesoireRoutes from "./routes/accesoire.route.js";
import photo_accesoireRoutes from "./routes/photo_accesoire.route.js";
import couleur_exterieurRoutes from "./routes/couleur_exterieur.route.js";
import couleur_interieurRoutes from "./routes/couleur_interieur.route.js";
import couleur_accesoireRoutes from "./routes/couleur_accesoire.route.js";
import taille_janteRoutes from "./routes/taille_jante.route.js";

// Configuration des chemins pour les fichiers statiques
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Création de l'application Express
const app = express();
const port = process.env.PORT || 3000; // Port du serveur (3000 par défaut)

// Configuration des middlewares globaux
app.use(cors()); // Active CORS pour toutes les routes
app.use(express.json()); // Parse automatiquement le JSON des requêtes

// Route spéciale webhook pour les paiements Stripe (doit être avant express.json())
app.post("/webhook", express.raw({ type: "application/json" }), webhookHandler);

// Démarrage du serveur sur le port spécifié
app.listen(port, () => {
  console.log(`le serveur est démarré sur le port ${port}`);
});

// Route racine de l'API
app.get("/", (req, res) => {
  res.send("This is Porsche API"); // Message de bienvenue de l'API
});

db();

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/user", userRoutes);
app.use("/model_porsche_actuel", model_porsche_actuelRoutes);
app.use("/photo_voiture_actuel", photo_voiture_actuelRoutes);
app.use("/voiture", voitureRoutes);
app.use("/model_porsche", model_porscheRoutes);
app.use("/photo_voiture", photo_voitureRoutes);
app.use("/reservation", reservationRoutes);
app.use("/accesoire", accesoireRoutes);
app.use("/photo_accesoire", photo_accesoireRoutes);
app.use("/commande", commandeRoutes);
app.use("/ligneCommande", ligneCommandeRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/taille_jante", taille_janteRoutes);
app.use("/couleur_accesoire", couleur_accesoireRoutes);
app.use("/couleur_interieur", couleur_interieurRoutes);
app.use("/couleur_exterieur", couleur_exterieurRoutes);
