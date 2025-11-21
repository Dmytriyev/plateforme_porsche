/**
 * Middleware d'autorisation Admin
 * Vérifie que l'utilisateur authentifié a les droits d'administrateur
 */
const isAdmin = (req, res, next) => {
  if (!req.user?.isAdmin) {
    return res
      .status(403)
      .json({ message: "Accès réservé aux administrateurs" });
  }
  next();
};

export default isAdmin;
