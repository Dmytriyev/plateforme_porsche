// composants/protection/RoutePrivee.jsx
// Composant pour protéger les routes nécessitant une authentification

import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

/**
 * Composant pour protéger une route
 * Redirige vers /connexion si l'utilisateur n'est pas connecté
 * 
 * @example
 * <Route path="/profil" element={
 *   <RoutePrivee>
 *     <MonProfil />
 *   </RoutePrivee>
 * } />
 */
export default function RoutePrivee({ children }) {
  const { estConnecte, chargement } = useAuth();
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
        <p>Vérification de l'authentification...</p>
      </div>
    );
  }

  // Si non connecté, rediriger vers connexion
  // On sauvegarde la location pour rediriger après connexion
  if (!estConnecte) {
    return <Navigate to="/connexion" state={{ from: location }} replace />;
  }

  // Si connecté, afficher le contenu
  return children;
}

