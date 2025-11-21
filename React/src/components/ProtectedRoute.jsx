import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { Loading } from './common';
import '../css/ProtectedRoute.css';

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
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
          <a href="/" className="protected-route-link">Retour à l'accueil</a>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
