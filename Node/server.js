import "dotenv/config";
import express from "express";
import cors from "cors";
import db from "./db/db.js";
import path from "node:path";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

import { fileURLToPath } from "node:url";
import { webhookHandler } from "./controllers/payment.controller.js";
import logger from "./utils/logger.js";
import errorMiddleware from "./middlewares/error.js";

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

// Connexion à la base de données MongoDB
db();

// Configuration CORS sécurisée
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  "http://localhost:3000",
].map((url) => url.replace(/\/$/, "")); // retirer le slash final

// Options CORS personnalisées
const corsOptions = {
  origin: (origin, callback) => {
    // Permettre les requêtes sans origin
    if (!origin) return callback(null, true);
    // Vérifier si l'origine est dans la liste des autorisées
    const normalizedOrigin = origin.replace(/\/$/, "");
    if (allowedOrigins.includes(normalizedOrigin)) {
      callback(null, true);
    } else {
      // Rejeter les origines non autorisées
      callback(new Error(`Origin ${origin} non autorisée par CORS`));
    }
  },
  // Autoriser les cookies et les credentials
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

// Middlewares globaux
app.use(cors(corsOptions)); // Autorise les requêtes entre origines CORS
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
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // max 10 tentatives par IP
  message: "Trop de tentatives de connexion, réessayez plus tard",
  standardHeaders: true,
  legacyHeaders: false,
});

// Limiteur pour les inscriptions utilisateurs
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 5, // max 5 inscriptions par IP
  message: "Trop d'inscriptions, réessayez plus tard",
});

// Limiteur pour les endpoints de paiement
const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 20, // max 20 tentatives de paiement par IP
  message: "Trop de tentatives de paiement, réessayez plus tard",
});

// Limiteur pour uploads d'images
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 50, // max 50 uploads par IP
  message: "Trop d'uploads d'images, réessayez plus tard",
});

// Stripe webhook : on parser le body
app.post("/webhook", express.raw({ type: "application/json" }), webhookHandler);

// Parser JSON pour le reste des endpoints
app.use(express.json());
// Parser des bodies encodés en application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));

// // Cache pour la déduplication des logs de requêtes
// const requestCache = new Map();
// // Fenêtre de déduplication en ms
// const DEDUPE_WINDOW_MS = 100;

// // Logger des requêtes entrantes avec déduplication
// app.use((req, res, next) => {
//   // Ignorer favicon et OPTIONS
//   if (req.originalUrl === "/favicon.ico" || req.method === "OPTIONS") {
//     return next();
//   }
//   const ip = req.ip || req.connection?.remoteAddress || "unknown";
//   const key = `${req.method}:${req.originalUrl}:${ip}`;
//   const now = Date.now();
//   const lastRequestTime = requestCache.get(key);

//   // Si une requête identique a été loggée il y a moins de 100ms, on la skip
//   if (lastRequestTime && now - lastRequestTime < DEDUPE_WINDOW_MS) {
//     return next(); // Passe sans logger
//   }

//   // Mettre à jour le cache
//   requestCache.set(key, now);

//   // Nettoyer les anciennes entrées du cache toutes les 1000 requêtes
//   if (requestCache.size > 1000) {
//     const threshold = now - DEDUPE_WINDOW_MS * 2;
//     for (const [k, timestamp] of requestCache.entries()) {
//       if (timestamp < threshold) {
//         requestCache.delete(k);
//       }
//     }
//   }

//   const start = Date.now();
//   res.on("finish", () => {
//     const duration = Date.now() - start;
//     const ua = req.headers["user-agent"] || "-";
//     logger.info(
//       `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`,
//       { ip, ua }
//     );
//   });
//   next();
// });

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

// Routes user
app.use("/reservation", reservationRoutes);
app.use("/commande", commandeRoutes);
app.use("/ligneCommande", ligneCommandeRoutes);
app.use("/model_porsche_actuel", model_porsche_actuelRoutes);
app.use("/model_porsche", model_porscheRoutes);
app.use("/voiture", voitureRoutes);
app.use("/accesoire", accesoireRoutes);

// Error handler (doit être après les routes)
app.use(errorMiddleware);

// Démarrage du serveur
const server = app.listen(port, () => {
  logger.info(`Le serveur est démarré sur le port ${port}`);
});
// Gestion de l'arrêt du serveur
const gracefulShutdown = (signal, err) => {
  logger.warn(`Received ${signal}. Shutting down gracefully...`);
  if (err)
    logger.error("Shutdown reason", { stack: err.stack || err.message || err });
  server.close(() => {
    logger.info("Closed out remaining connections");
    process.exit(err ? 1 : 0);
  });
  // si après 20s toujours pas fermé, forcer la sortie
  setTimeout(() => {
    logger.error("Forcing shutdown");
    process.exit(1);
  }, 20000).unref();
};

// Capturer les erreurs non gérées
process.on("unhandledRejection", (reason) => {
  logger.error("Unhandled Rejection", {
    reason: (reason && (reason.stack || reason.message)) || String(reason),
  });
  gracefulShutdown("unhandledRejection", reason);
});
// Capturer les exceptions non gérées
process.on("uncaughtException", (err) => {
  logger.error("Uncaught Exception", { stack: err.stack || err.message });
  gracefulShutdown("uncaughtException", err);
});
