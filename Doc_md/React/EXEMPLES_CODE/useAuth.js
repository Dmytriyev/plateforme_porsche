// hooks/useAuth.js
// Hook personnalisé pour utiliser facilement le contexte d'authentification

import { useContext } from 'react';
import { AuthContexte } from '@/contextes/AuthContexte';

/**
 * Hook pour accéder au contexte d'authentification
 * 
 * @example
 * function MonComposant() {
 *   const { utilisateur, estConnecte, connexion, deconnexion } = useAuth();
 *   
 *   if (!estConnecte) {
 *     return <p>Vous devez vous connecter</p>;
 *   }
 *   
 *   return <p>Bonjour {utilisateur.prenom} !</p>;
 * }
 * 
 * @returns {object} Contexte d'authentification
 */
export function useAuth() {
  const contexte = useContext(AuthContexte);
  
  // Vérifier que le hook est utilisé dans un AuthProvider
  if (!contexte) {
    throw new Error(
      'useAuth doit être utilisé à l\'intérieur d\'un AuthProvider. ' +
      'Assurez-vous que votre composant est enveloppé dans <AuthProvider>.'
    );
  }
  
  return contexte;
}

// Export par défaut également pour flexibilité
export default useAuth;

