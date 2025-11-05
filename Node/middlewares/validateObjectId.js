import mongoose from "mongoose";
/**
 * Middleware pour valider les ObjectId MongoDB
 * Protège contre les injections NoSQL
 */
const validateObjectId = (paramName = "id") => {
  return (req, res, next) => {
    const id = req.params[paramName];

    if (!id) {
      return res.status(400).json({ message: "ID manquant" });
    }
    // Vérifie si l'ID est un ObjectId MongoDB valide
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "ID invalide" });
    }

    next();
  };
};

export default validateObjectId;
