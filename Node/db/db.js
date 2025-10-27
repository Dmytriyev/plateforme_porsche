import { connect } from "mongoose";

export default function db() {
  // Tentative de connexion avec l'URI définie dans les variables d'environnement
  connect(process.env.DB_URI)
    .then(() => console.log("Connexion à mongoDB réussie")) // Succès de connexion
    .catch((error) => console.log(error.reason)); // Gestion des erreurs de connexion
}
