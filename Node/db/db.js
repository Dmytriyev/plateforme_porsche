import { connect } from "mongoose";
//  Connexion à la base de données MongoDB
export default function db() {
  const options = {
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    bufferCommands: false,
  };

  connect(process.env.DB_URI, options)
    .then(() => console.log("Connexion à mongoDB réussie"))
    .catch((error) => {
      console.error(
        "Erreur connexion MongoDB",
        error && (error.message || error.reason)
          ? { message: error.message, reason: error.reason }
          : error
      );
    });
}
