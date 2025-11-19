import { connect } from "mongoose";

// Connexion à la base de données MongoDB
export default function db() {
  const options = {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    bufferCommands: false,
  };

  // Vérifier que DB_URI est défini
  if (!process.env.DB_URI) {
    console.error("Erreur : DB_URI n'est pas défini dans les variables d'environnement");
    process.exit(1);
  }

  connect(process.env.DB_URI, options)
    .then(() => console.log("Connexion à MongoDB réussie"))
    .catch((error) => {
      console.error(
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
