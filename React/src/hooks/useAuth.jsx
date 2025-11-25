/**
 * hooks/useAuth.jsx — Hook consommant `AuthContext`
 *
 * - Fournit un accès centralisé au contexte d'authentification (user, token,
 *   méthodes login/logout) sans prop-drilling.
 * - Lancer une erreur si le hook est utilisé hors du provider aide à détecter
 *   erreurs d'usage chez les étudiants.
 */

import { useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur de AuthProvider");
  }
  return context;
};

// Hook utilitaire : expose le contexte d'authentification (user, token, méthodes)
