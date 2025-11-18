import { useContext } from 'react';
import { PanierContext } from '../context/PanierContext.jsx';

/**
 * Hook personnalisé pour utiliser le contexte du panier
 * 
 * Utilisation :
 * const { articles, ajouterVoiture, ajouterAccessoire, total } = usePanier();
 * 
 * @returns {Object} Méthodes et état du panier
 */
export const usePanier = () => {
  const context = useContext(PanierContext);

  if (!context) {
    throw new Error('usePanier doit être utilisé dans un PanierProvider');
  }

  return context;
};

export default usePanier;

