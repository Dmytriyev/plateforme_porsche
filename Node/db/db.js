import { connect } from "mongoose";
import logger from "../utils/logger.js";

// Connexion à la base de données MongoDB
export default function db() {
  // Options optimisées pour un bon compromis performance/stabilité
  const options = {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    bufferCommands: false,
    // Pool de connexions raisonnable par défaut (évite trop de connexions)
    maxPoolSize: parseInt(process.env.MONGO_MAX_POOL, 10) || 10,
    minPoolSize: parseInt(process.env.MONGO_MIN_POOL, 10) || 0,
    // Garder les connexions actives
    // Note: l'option `keepAlive`/`keepalive` est obsolète avec
    // les versions récentes du driver MongoDB/Mongoose. On laisse
    // le driver gérer la rétention des sockets par défaut.
  };

  // Vérifier que DB_URI est défini
  if (!process.env.DB_URI) {
    logger.error(
      "Erreur : DB_URI n'est pas défini dans les variables d'environnement"
    );
    process.exit(1);
  }

  connect(process.env.DB_URI, options)
    .then(() => logger.info("Connexion à MongoDB réussie"))
    .catch((error) => {
      logger.error(
        "Erreur de connexion à MongoDB",
        error && (error.message || error.reason)
          ? { message: error.message, reason: error.reason }
          : error
      );
      // En production, on peut choisir de ne pas arrêter le serveur
      // mais en développement, il est préférable de s'arrêter
      if (process.env.NODE_ENV === "development") {
        process.exit(1);
      }
    });
}
