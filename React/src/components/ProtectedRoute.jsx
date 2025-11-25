/**
 * ProtectedRoute.jsx — Route protégée par authentification et rôles
 *
 * - Vérifie d'abord l'état `loading` pour ne pas rediriger prématurément.
 * - `isAuthenticated()` contrôle si l'utilisateur est connecté.
 * - `roles` permet d'illustrer la séparation responsabilités :
 *   la route déclare l'accès, le composant gère l'UI (refus/redirect).
 */

import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import { Loading } from "./common";
import "../css/ProtectedRoute.css";

// Composant route protégée : redirige si non-auth ou rôle manquant
const ProtectedRoute = ({ children, roles }) => {
  const { loading, isAuthenticated, hasRole } = useContext(AuthContext);

  if (loading) return <Loading fullScreen message="Vérification..." />;
  if (!isAuthenticated()) return <Navigate to="/login" replace />;

  if (roles && !hasRole(roles)) {
    return (
      <div className="protected-route-denied">
        <div className="protected-route-content">
          <h1 className="protected-route-title">Accès refusé</h1>
          <p className="protected-route-message">
            Vous n'avez pas les permissions nécessaires pour accéder à cette
            page.
          </p>
          <a href="/" className="protected-route-link">
            Retour à l'accueil
          </a>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
