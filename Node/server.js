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
import model_porscheRoutes from "./routes/model_porsche.route.js";
import voitureRoutes from "./routes/voiture.route.js";
import photo_voitureRoutes from "./routes/photo_voiture.route.js";
import couleur_interieurRoutes from "./routes/couleur_interieur.route.js";
import couleur_exterieurRoutes from "./routes/couleur_exterieur.route.js";
import taille_janteRoutes from "./routes/taille_jante.route.js";
import accesoireRoutes from "./routes/accesoire.route.js";
import photo_accesoireRoutes from "./routes/photo_accesoire.route.js";
import couleur_accesoireRoutes from "./routes/couleur_accesoire.route.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Configuration CORS sécurisée

// const corsOptions = {
//   origin: function (origin, callback) {
//     const allowedOrigins = [
//       process.env.FRONTEND_URL,
//       "http://localhost:3001",
//     ];

//     if (!origin || allowedOrigins.includes(origin)) {
//       callback(null, true);
//     } else {
//       callback(new Error("Non autorisé par CORS"));
//     }
//   },
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
//   allowedHeaders: ["Content-Type", "Authorization"],
// };
// app.use(cors(corsOptions));

app.use(cors());
app.use(express.json());
// Route spéciale webhook pour les paiements Stripe
app.post("/webhook", express.raw({ type: "application/json" }), webhookHandler);
app.listen(port, () => {
  console.log(`le serveur est démarré sur le port ${port}`);
});
app.get("/", (req, res) => {
  res.send("This is Porsche API");
});
db();

// Middlewares de sécurité
app.use(helmet());

// Rate limiting global - Protection contre les attaques DDoS
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requêtes par IP
  message: "Trop de requêtes depuis cette adresse IP, réessayez plus tard",
  standardHeaders: true,
  legacyHeaders: false,
});

// Limiter les tentatives de connexion
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentatives max
  message: "Trop de tentatives de connexion, réessayez dans 15 minutes",
  standardHeaders: true,
  legacyHeaders: false,
});

// Limiter les inscriptions
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 3, // 3 inscriptions max
  message: "Trop d'inscriptions, réessayez dans 1 heure",
});

// Limiter les paiements
const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 10, // 10 tentatives de paiement max
  message: "Trop de tentatives de paiement, réessayez plus tard",
});

// Limiter les uploads d'images
const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 heure
  max: 20, // 20 uploads max
  message: "Trop d'uploads d'images, réessayez plus tard",
});

// Appliquer rate limiting global sur toutes les routes
app.use(globalLimiter);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/photo_voiture", uploadLimiter, photo_voitureRoutes);
app.use("/photo_voiture_actuel", uploadLimiter, photo_voiture_actuelRoutes);
app.use("/photo_accesoire", uploadLimiter, photo_accesoireRoutes);

app.use("/user/login", loginLimiter);
app.use("/user/register", registerLimiter);
app.use("/user", userRoutes);

app.use("/api/payment", paymentLimiter, paymentRoutes);

app.use("/reservation", reservationRoutes);
app.use("/commande", commandeRoutes);
app.use("/ligneCommande", ligneCommandeRoutes);
app.use("/model_porsche_actuel", model_porsche_actuelRoutes);
app.use("/model_porsche", model_porscheRoutes);
app.use("/voiture", voitureRoutes);
app.use("/couleur_exterieur", couleur_exterieurRoutes);
app.use("/couleur_interieur", couleur_interieurRoutes);
app.use("/taille_jante", taille_janteRoutes);
app.use("/accesoire", accesoireRoutes);
app.use("/couleur_accesoire", couleur_accesoireRoutes);
