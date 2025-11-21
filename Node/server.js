import "dotenv/config";
import express from "express";
import cors from "cors";
import db from "./db/db.js";
import path from "node:path";
import rateLimit from "express-rate-limit";
import hpp from "hpp"; // HTTP Parameter Pollution protection middleware
import cookieParser from "cookie-parser"; // Cookie parser middleware
import sanitizeInputs from "./middlewares/sanitizeInputs.js";
import logger from "./utils/logger.js";
import errorMiddleware from "./middlewares/error.js";
import { fileURLToPath } from "node:url";
import { webhookHandler } from "./controllers/payment.controller.js";

import userRoutes from "./routes/user.route.js";
import reservationRoutes from "./routes/reservation.route.js";
import commandeRoutes from "./routes/Commande.route.js";
import ligneCommandeRoutes from "./routes/ligneCommande.route.js";
import paymentRoutes from "./routes/payment.route.js";
import panierRoutes from "./routes/panier.route.js";

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
import demandeContactRoutes from "./routes/demande_contact.route.js";

// __dirname pour retrouver le dossier courant
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Création de l'application Express
const app = express();
const port = process.env.PORT || 3000;

// Connexion à la base de données MongoDB
db();

// Configuration CORS
const FRONTEND_URL = process.env.FRONTEND_URL?.replace(/\/$/, "");
const corsOptions = FRONTEND_URL
  ? { origin: FRONTEND_URL, credentials: true, optionsSuccessStatus: 200 }
  : {};
app.use(cors(corsOptions));

// ============================================
// RATE LIMITERS (Protection contre les abus)
// ============================================

// Limiteur global (protection DDoS)
const globalLimiter = rateLimit({
  windowMs: 20 * 60 * 1000, // 20 minutes
  max: 10000,
  message: "Trop de requêtes depuis cette adresse IP, réessayez plus tard",
  standardHeaders: true,
  legacyHeaders: false,
});

// Limiteur pour les tentatives de login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,
  message: "Trop de tentatives de connexion, réessayez plus tard",
  standardHeaders: true,
  legacyHeaders: false,
});

// Limiteur pour les inscriptions
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 50,
  message: "Trop d'inscriptions, réessayez plus tard",
});

// Limiteur pour les paiements
const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 200,
  message: "Trop de tentatives de paiement, réessayez plus tard",
});

// Limiteur pour les uploads d'images
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 500,
  message: "Trop d'uploads d'images, réessayez plus tard",
});

// ============================================
// MIDDLEWARES GLOBAUX
// ============================================

// Webhook Stripe - DOIT être avant le parser JSON
app.post("/webhook", express.raw({ type: "application/json" }), webhookHandler);

// Parsers pour les requêtes
app.use(express.json({ limit: "100kb" }));
app.use(express.urlencoded({ extended: true, limit: "100kb" }));

// Sécurité et sanitisation
app.use(cookieParser());
app.use(sanitizeInputs); // Trim + échappement HTML
app.use(hpp()); // Protection HTTP Parameter Pollution
app.use(globalLimiter); // Rate limiting global

// Fichiers statiques (uploads)
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), {
    maxAge: "7d",
    etag: false,
  })
);

// ============================================
// ROUTES
// ============================================

// Route racine (health check)
app.get("/", (req, res) => {
  res.json({
    message: "API Porsche - Plateforme de vente de voitures et accessoires",
    version: "1.0.0",
    status: "running",
  });
});
// Routes avec limitation d'upload
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

// Routes principales
app.use("/user", userRoutes);
app.use("/api/payment", paymentLimiter, paymentRoutes);
app.use("/api/panier", panierRoutes);
app.use("/reservation", reservationRoutes);
app.use("/commande", commandeRoutes);
app.use("/ligneCommande", ligneCommandeRoutes);
app.use("/model_porsche_actuel", model_porsche_actuelRoutes);
app.use("/model_porsche", model_porscheRoutes);
app.use("/voiture", voitureRoutes);
app.use("/accesoire", accesoireRoutes);
app.use("/contact", demandeContactRoutes);

// ============================================
// GESTION DES ERREURS
// ============================================
app.use(errorMiddleware);
// ============================================
// DÉMARRAGE DU SERVEUR
// ============================================
const server = app.listen(port, () => {
  logger.info(`Serveur démarré sur le port ${port}`);
});

/**
 * Arrêt gracieux du serveur
 * Permet de fermer proprement les connexions avant de quitter
 */
const gracefulShutdown = (signal, err) => {
  logger.warn(`Signal ${signal} reçu. Arrêt gracieux...`);

  if (err) {
    const errorDetail = err.stack || err.message || err;
    logger.error("Raison de l'arrêt:", errorDetail);
  }

  server.close(() => {
    logger.info("Connexions fermées proprement");
    process.exit(err ? 1 : 0);
  });

  // Forcer l'arrêt après 20 secondes
  setTimeout(() => {
    logger.error("Arrêt forcé après timeout");
    process.exit(1);
  }, 20000).unref();
};

// Gestion des erreurs non capturées
process.on("unhandledRejection", (reason) => {
  const errorDetail = reason?.stack || reason?.message || String(reason);
  logger.error("Promesse rejetée non gérée:", errorDetail);
  gracefulShutdown("unhandledRejection", reason);
});

process.on("uncaughtException", (err) => {
  const errorDetail = err?.stack || err?.message || err;
  logger.error("Exception non capturée:", errorDetail);
  gracefulShutdown("uncaughtException", err);
});
