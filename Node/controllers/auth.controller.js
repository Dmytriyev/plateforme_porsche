// Fichier servant à gérer le rafraîchissement des tokens d'authentification.
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import logger from "../utils/logger.js";

// Contrôleur pour rafraîchir le token d'authentification
export const refreshToken = async (req, res) => {
  try {
    // Récupérer le refresh token depuis le cookie ou le corps de la requête
    const fromCookie = req.cookies?.refresh_token;
    // Récupérer le refresh token depuis le corps de la requête
    const fromBody = req.body?.refreshToken;
    // Priorité au token dans le corps
    const token = fromBody || fromCookie;

    // Vérifier la présence du token
    if (!token) {
      return res.status(401).json({ message: "Refresh token manquant" });
    }
    // Vérifier et décoder le refresh token
    const refreshSecret = process.env.REFRESH_SECRET || process.env.SECRET_KEY;
    // Vérification du token
    let payload;
    try {
      payload = jwt.verify(token, refreshSecret);
    } catch (err) {
      logger.warn("Refresh token invalide", { error: err?.message });
      return res.status(403).json({ message: "Refresh token invalide" });
    }

    // payload doit contenir l'id utilisateur
    const userId = payload?.id;
    if (!userId) return res.status(400).json({ message: "Payload invalide" });

    // Récupérer l'utilisateur depuis la base de données
    const user = await User.findById(userId);
    if (!user)
      return res.status(404).json({ message: "Utilisateur non trouvé" });

    // Créer un nouvel access token
    const accessToken = jwt.sign(
      {
        id: user._id,
        email: user.email,
        isAdmin: user.isAdmin,
        role: user.role,
      },
      process.env.SECRET_KEY,
      { expiresIn: "24h" }
    );

    // Optionnel: rotater le refresh token
    const newRefreshToken = jwt.sign({ id: user._id }, refreshSecret, {
      expiresIn: "7d",
    });

    // Envoyer le nouveau refresh token dans un cookie HTTP-only
    try {
      res.cookie("refresh_token", newRefreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });
    } catch (err) {
      // Logger un avertissement si le cookie ne peut pas être défini
      logger.warn("Impossible de définir le cookie refresh_token", {
        error: err?.message,
      });
    }

    return res.status(200).json({ accessToken });
  } catch (error) {
    logger.error("Erreur lors du refresh token", { error: error?.message });
    return res.status(500).json({ message: "Erreur serveur" });
  }
};

export default { refreshToken };
