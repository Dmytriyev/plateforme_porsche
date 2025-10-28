import { connect } from "mongoose";

export default function db() {
  connect(process.env.DB_URI)
    .then(() => console.log("Connexion à mongoDB réussie"))
    .catch((error) => console.log(error.reason));
}
