// composants/protection/RouteAdmin.jsx
// Composant pour protéger les routes réservées aux administrateurs

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

/**
 * Composant pour protéger une route admin
 * Redirige vers /connexion si non connecté
 * Redirige vers / si connecté mais pas admin
 * 
 * @example
 * <Route path="/admin" element={
 *   <RouteAdmin>
 *     <TableauDeBord />
 *   </RouteAdmin>
 * } />
 */
export default function RouteAdmin({ children }) {
  const { estConnecte, estAdmin, chargement, utilisateur } = useAuth();
  const location = useLocation();

  // Attendre le chargement
  if (chargement) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <p>Vérification des permissions...</p>
      </div>
    );
  }

  // Si non connecté, rediriger vers connexion
  if (!estConnecte) {
    return <Navigate to="/connexion" state={{ from: location }} replace />;
  }

  // Si connecté mais pas admin, rediriger vers accueil
  if (!estAdmin) {
    console.warn('🚫 Accès refusé - Utilisateur non admin:', utilisateur?.email);
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        gap: '1rem',
      }}>
        <h1>🚫 Accès refusé</h1>
        <p>Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
        <button onClick={() => window.location.href = '/'}>
          Retour à l'accueil
        </button>
      </div>
    );
  }

  // Si admin, afficher le contenu
  return children;
}

