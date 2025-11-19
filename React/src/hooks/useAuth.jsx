import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext.jsx';

/**
 * Hook personnalisé pour utiliser le contexte d'authentification
 * 
 * Utilisation :
 * const { user, login, logout, isAdmin } = useAuth();
 * 
 * @returns {Object} Méthodes et état d'authentification
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth doit être utilisé dans un AuthProvider');
  }

  return context;
};

export default useAuth;

