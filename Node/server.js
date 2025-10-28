import express from "express";
import cors from "cors";
import db from "./db/db.js";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { webhookHandler } from "./controllers/payment.controller.js";
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
import factureRoutes from "./routes/facture.route.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Configuration des middlewares globaux
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
app.use("/facture", factureRoutes);
