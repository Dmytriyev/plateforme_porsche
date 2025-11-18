import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import { Loading } from './common';
import './ProtectedRoute.css';

/**
 * Composant ProtectedRoute - Route protégée nécessitant authentification
 * 
 * Props:
 * - children: Composant à afficher si autorisé
 * - requireRole: Rôle requis (optionnel)
 */
const ProtectedRoute = ({ children, requireRole }) => {
  const { loading, isAuthenticated, hasRole } = useAuth();

  if (loading) {
    return <Loading fullScreen message="Vérification..." />;
  }

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (requireRole && !hasRole(requireRole)) {
    return (
      <div className="protected-route-denied">
        <div className="protected-route-content">
          <h1 className="protected-route-title">Accès refusé</h1>
          <p className="protected-route-message">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
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
