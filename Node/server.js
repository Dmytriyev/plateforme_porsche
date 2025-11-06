import express from "express";
import cors from "cors";
import db from "./db/db.js";
import path from "node:path";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

import { fileURLToPath } from "node:url";
import { webhookHandler } from "./controllers/payment.controller.js";

import userRoutes from "./routes/user.route.js";
import reservationRoutes from "./routes/reservation.route.js";
import commandeRoutes from "./routes/Commande.route.js";
import ligneCommandeRoutes from "./routes/ligneCommande.route.js";
import paymentRoutes from "./routes/payment.route.js";

import model_porsche_actuelRoutes from "./routes/model_porsche_actuel.route.js";
import photo_voiture_actuelRoutes from "./routes/photo_voiture_actuel.route.js";

import voitureRoutes from "./routes/voiture.route.js";
import model_porscheRoutes from "./routes/model_porsche.route.js";
import photo_porscheRoutes from "./routes/photo_porsche.route.js";
import photo_voitureRoutes from "./routes/photo_voiture.route.js";
import couleur_interieurRoutes from "./routes/couleur_interieur.route.js";
import couleur_exterieurRoutes from "./routes/couleur_exterieur.route.js";
import taille_janteRoutes from "./routes/taille_jante.route.js";
import siegeRoutes from "./routes/siege.route.js";
import packageRoutes from "./routes/package.route.js";

import accesoireRoutes from "./routes/accesoire.route.js";
import photo_accesoireRoutes from "./routes/photo_accesoire.route.js";
import couleur_accesoireRoutes from "./routes/couleur_accesoire.route.js";

// __dirname pour retrouver le dossier courant
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Création de l'application express et port par défaut
const app = express();
const port = process.env.PORT || 3000;

// Connexion à la base de données (db/db.js)
db();

// Middlewares globaux
app.use(cors()); // Autorise les requêtes entre origines CORS
app.use(helmet()); // Définit des headers de sécurité HTTP

// Limiteur global pour éviter le DDoS attaques
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // fenêtre de 15 minutes
  max: 100, // max 100 requêtes par IP
  message: "Trop de requêtes depuis cette adresse IP, réessayez plus tard",
  standardHeaders: true,
  legacyHeaders: false,
});

// Limiteur pour les tentatives de login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: "Trop de tentatives de connexion, réessayez dans 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});

// Limiteur pour les inscriptions utilisateurs
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: "Trop d'inscriptions, réessayez dans 1 heure",
});

// Limiteur pour les endpoints de paiement
const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: "Trop de tentatives de paiement, réessayez plus tard",
});

// Limiteur pour uploads d'images
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 50,
  message: "Trop d'uploads d'images, réessayez plus tard",
});

// Stripe webhook : on parser le body
app.post("/webhook", express.raw({ type: "application/json" }), webhookHandler);

// Parser JSON pour le reste des endpoints
app.use(express.json());

// Appliquer le limiteur global après le parsing JSON
app.use(globalLimiter);

// Dossier statique les fichiers uploadés
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Route racine
app.get("/", (req, res) => {
  res.send("This is Porsche API");
});
// routes avec les limiteur upload
app.use("/photo_voiture", uploadLimiter, photo_voitureRoutes);
app.use("/photo_voiture_actuel", uploadLimiter, photo_voiture_actuelRoutes);
app.use("/photo_accesoire", uploadLimiter, photo_accesoireRoutes);
app.use("/photo_porsche", uploadLimiter, photo_porscheRoutes);
app.use("/couleur_exterieur", uploadLimiter, couleur_exterieurRoutes);
app.use("/couleur_interieur", uploadLimiter, couleur_interieurRoutes);
app.use("/couleur_accesoire", uploadLimiter, couleur_accesoireRoutes);
app.use("/taille_jante", uploadLimiter, taille_janteRoutes);
app.use("/siege", uploadLimiter, siegeRoutes);
app.use("/package", uploadLimiter, packageRoutes);

// Routes user avec limiteurs sur login/register
app.use("/user/login", loginLimiter, userRoutes);
app.use("/user/register", registerLimiter, userRoutes);
app.use("/user", userRoutes);

// Paiement avec limiteur payment
app.use("/api/payment", paymentLimiter, paymentRoutes);

app.use("/reservation", reservationRoutes);
app.use("/commande", commandeRoutes);
app.use("/ligneCommande", ligneCommandeRoutes);
app.use("/model_porsche_actuel", model_porsche_actuelRoutes);
app.use("/model_porsche", model_porscheRoutes);
app.use("/voiture", voitureRoutes);
app.use("/accesoire", accesoireRoutes);

// Démarrage du serveur
app.listen(port, () => {
  console.log(`Le serveur est démarré sur le port ${port}`);
});
