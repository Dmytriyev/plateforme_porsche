import "dotenv/config";
// Normaliser la variable JWT pour éviter les incohérences entre
// `SECRET_KEY` et `JWT_SECRET`. On garde les deux keys synchronisées.
const _jwtSecret =
  process.env.JWT_SECRET || process.env.SECRET_KEY || process.env.JWT || null;
if (_jwtSecret) {
  process.env.JWT_SECRET = _jwtSecret;
  process.env.SECRET_KEY = _jwtSecret;
}
import express from "express";
import cors from "cors";
import compression from "compression";
import zlib from "node:zlib";
import db from "./db/db.js";
import path from "node:path";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import mongoSanitize from "express-mongo-sanitize";
import xss from "xss-clean";
import { createRequire } from "module";
// `xss-clean` fournit une fonction middleware par défaut, mais expose
// aussi une utilitaire de nettoyage dans `lib/xss`. Pour pouvoir
// l'utiliser côté ESM, on crée un `require` local.
const require = createRequire(import.meta.url);
const { clean: xssClean } = require("xss-clean/lib/xss");
import hpp from "hpp";
import cookieParser from "cookie-parser";

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
import demandeContactRoutes from "./routes/demande_contact.route.js";

// __dirname pour retrouver le dossier courant
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Création de l'application express et port par défaut
const app = express();
// Configurer trust proxy si déployé derrière un reverse proxy (ex: Heroku, nginx)
app.set(
  "trust proxy",
  process.env.TRUST_PROXY === "1" || process.env.TRUST_PROXY === "true"
);
const port = process.env.PORT || 3000;

// Connexion à la base de données MongoDB
db();

// Configuration CORS sécurisée
const allowedOrigins = [process.env.FRONTEND_URL, "http://localhost:5173"]
  .filter(Boolean)
  .map((url) => url.replace(/\/$/, "")); // retirer le slash final

// Options CORS personnalisées
const corsOptions = {
  origin: (origin, callback) => {
    // Permettre les requêtes sans origin (ex: Postman, curl)
    if (!origin) return callback(null, true);
    // Vérifier si l'origine est dans la liste des autorisées
    const normalizedOrigin = origin.replace(/\/$/, "");
    if (allowedOrigins.includes(normalizedOrigin)) {
      callback(null, true);
    } else {
      // En développement, autoriser localhost
      if (
        normalizedOrigin.startsWith("http://localhost") ||
        normalizedOrigin.startsWith("http://127.0.0.1")
      ) {
        return callback(null, true);
      }
      // Rejeter les origines non autorisées
      callback(new Error(`Origin ${origin} non autorisée par CORS`));
    }
  },
  // Autoriser les cookies et les credentials
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

// Middlewares globaux
app.use(cors(corsOptions)); // Autorise les requêtes entre origines CORS

// Helmet avec configuration pour permettre le chargement des images
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }, // Permet le chargement des images depuis d'autres origines
    crossOriginEmbedderPolicy: false, // Désactive pour compatibilité avec les images
  })
);

// Limiteur global pour éviter les attaques DDoS
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // fenêtre de 15 minutes
  max: 1000, // max 1000 requêtes par IP
  message: "Trop de requêtes depuis cette adresse IP, réessayez plus tard",
  standardHeaders: true,
  legacyHeaders: false,
});

// Limiteur pour les tentatives de login
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // max 100 tentatives par IP
  message: "Trop de tentatives de connexion, réessayez plus tard",
  standardHeaders: true,
  legacyHeaders: false,
});

// Limiteur pour les inscriptions utilisateurs
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 50, // max 50 inscriptions par IP
  message: "Trop d'inscriptions, réessayez plus tard",
});

// Limiteur pour les endpoints de paiement
const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 200, // max 200 tentatives de paiement par IP
  message: "Trop de tentatives de paiement, réessayez plus tard",
});

// Limiteur pour uploads d'images
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 500, // max 500 uploads par IP
  message: "Trop d'uploads d'images, réessayez plus tard",
});

// Activer compression (favoriser la vitesse de compression pour réduire CPU
// overhead). Threshold à 1kb pour éviter compresser les très petites réponses.
app.use(
  compression({
    level: zlib.constants.Z_BEST_SPEED,
    threshold: 1024,
  })
);

// Stripe webhook : on parser le body (raw required by Stripe)
app.post("/webhook", express.raw({ type: "application/json" }), webhookHandler);

// Parser JSON pour le reste des endpoints (limiter la taille des bodies)
app.use(express.json({ limit: "100kb" }));
// Parser des bodies encodés en application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true, limit: "100kb" }));
// Protection et sanitation des entrées pour empêcher les injections
// Cookie parser (utile si vous utilisez des cookies pour auth later)
app.use(cookieParser());
// Nettoie les inputs pour supprimer les opérateurs mongo ($ne, $gt, etc.)
// express-mongo-sanitize middleware réassigne parfois `req.query` qui
// peut être non-écrasable (getter-only) dans certaines versions
// d'Express/Node. On utilise la fonction `sanitize` exposée par le
// package et on applique une stratégie de fallback : tentative
// d'assignation normale, et si elle échoue on mutile l'objet en place.
app.use((req, res, next) => {
  try {
    const sanitizer =
      mongoSanitize && mongoSanitize.sanitize ? mongoSanitize.sanitize : null;
    const keys = ["body", "params", "headers", "query"];
    keys.forEach((key) => {
      if (req[key] && typeof req[key] === "object") {
        try {
          const sanitized = sanitizer ? sanitizer(req[key]) : req[key];
          // Essayer l'assignation normale (comportement standard)
          try {
            req[key] = sanitized;
          } catch (assignErr) {
            // si l'assignation échoue (ex: getter-only), muter l'objet en place
            Object.keys(req[key]).forEach((k) => delete req[key][k]);
            Object.keys(sanitized).forEach((k) => (req[key][k] = sanitized[k]));
          }
        } catch (innerErr) {
          // En cas d'erreur pendant la sanitation, on ignore mais on logge
          logger.warn(
            `mongoSanitize fallback: erreur de sanitation sur ${key}`,
            innerErr && innerErr.stack ? innerErr.stack : innerErr
          );
        }
      }
    });
  } catch (err) {
    logger.warn(
      "Erreur middleware sanitize global:",
      err && err.stack ? err.stack : err
    );
  }
  next();
});
// Protection contre les XSS en nettoyant les champs strings
// Le middleware officiel de `xss-clean` tente d'assigner `req.query`.
// Dans certains environnements `req.query` est getter-only et l'assignation
// provoque une exception. On instancie le middleware puis on le wrappe
// avec un fallback qui mutera l'objet en place si nécessaire.
const _xssMiddleware = xss();
app.use((req, res, next) => {
  try {
    return _xssMiddleware(req, res, next);
  } catch (err) {
    // Fallback: nettoyer manuellement les propriétés possibles
    try {
      const keys = ["body", "params", "query"];
      keys.forEach((key) => {
        if (req[key] && typeof req[key] === "object") {
          const sanitized = xssClean(req[key]);
          try {
            req[key] = sanitized;
          } catch (assignErr) {
            // getter-only: muter l'objet en place
            Object.keys(req[key]).forEach((k) => delete req[key][k]);
            if (sanitized && typeof sanitized === "object") {
              Object.keys(sanitized).forEach(
                (k) => (req[key][k] = sanitized[k])
              );
            }
          }
        } else if (typeof req[key] === "string") {
          try {
            req[key] = xssClean(req[key]);
          } catch (e) {
            // ignore
          }
        }
      });
    } catch (inner) {
      logger.warn(
        "xss-clean fallback failed:",
        inner && inner.stack ? inner.stack : inner
      );
    }
    return next();
  }
});
// Protection contre HTTP Parameter Pollution
app.use(hpp());

// Note: La validation NoSQL et métier doit rester via Joi/express-validator

// Appliquer le limiteur global après le parsing JSON
app.use(globalLimiter);

// Dossier statique pour les fichiers uploadés avec cache côté client
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"), { maxAge: "7d", etag: false })
);

// Route racine
app.get("/", (req, res) => {
  res.json({
    message: "API Porsche - Plateforme de vente de voitures et accessoires",
    version: "1.0.0",
    status: "running",
  });
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

// Routes user (les limiteurs spécifiques login/register sont appliqués
// directement dans le routeur utilisateur pour éviter des chemins dupliqués)
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
app.use("/contact", demandeContactRoutes);

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
    logger.error(
      "Shutdown reason",
      err && (err.stack || err.message) ? err.stack || err.message : err
    );
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
  logger.error(
    "Unhandled Rejection",
    (reason && (reason.stack || reason.message)) || String(reason)
  );
  gracefulShutdown("unhandledRejection", reason);
});
// Capturer les exceptions non gérées
process.on("uncaughtException", (err) => {
  logger.error(
    "Uncaught Exception",
    err && (err.stack || err.message) ? err.stack || err.message : err
  );
  gracefulShutdown("uncaughtException", err);
});
