/**
 * Middleware de validation d'ObjectId
 * - Vérifie que le paramètre d'URL fourni est un ObjectId MongoDB valide
 * - Protège contre les injections NoSQL et erreurs de conversion
 */
import mongoose from "mongoose";
// Protège contre les injections NoSQL en validant les IDs MongoDB
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
