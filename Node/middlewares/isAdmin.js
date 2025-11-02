/**
 * Middleware pour vérifier si l'utilisateur est administrateur
 * Doit être utilisé après le middleware auth
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
