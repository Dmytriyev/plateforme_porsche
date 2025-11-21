import { createContext, useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { sanitizeObject } from '../utils/sanitize';

export const PanierContext = createContext();

export const PanierProvider = ({ children }) => {
  const [articles, setArticles] = useState(() => {
    try {
      const saved = localStorage.getItem('panier');
      const data = saved ? JSON.parse(saved) : [];
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  });

  const saveTimer = useRef(null);

  useEffect(() => {
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem('panier', JSON.stringify(sanitizeObject(articles)));
      } catch { }
    }, 250);
    return () => clearTimeout(saveTimer.current);
  }, [articles]);

  const calculerPrixConfiguration = useCallback((configuration) => {
    return (configuration.prixBase || 0) +
      (configuration.couleurExterieur?.prix || 0) +
      (configuration.couleurInterieur?.prix || 0) +
      (configuration.jantes?.prix || 0) +
      (configuration.sieges?.prix || 0) +
      (configuration.package?.prix || 0);
  }, []);

  const ajouterVoiture = useCallback((voiture, configuration) => {
    const prixTotal = calculerPrixConfiguration(configuration);
    setArticles(prev => [...prev, {
      type: 'voiture',
      voiture,
      configuration,
      prix: prixTotal,
      quantite: 1,
      id: `${Date.now()}-${Math.random()}`,
      dateAjout: new Date().toISOString()
    }]);
  }, [calculerPrixConfiguration]);

  const ajouterAccessoire = useCallback((accessoire, quantite = 1) => {
    setArticles(prev => {
      const existant = prev.find(a => a.type === 'accessoire' && a.accessoire._id === accessoire._id);
      if (existant) {
        return prev.map(a => a.id === existant.id ? { ...a, quantite: a.quantite + quantite } : a);
      }
      return [...prev, {
        type: 'accessoire',
        accessoire,
        prix: accessoire.prix,
        quantite,
        id: `${Date.now()}-${Math.random()}`,
        dateAjout: new Date().toISOString()
      }];
    });
  }, []);

  const retirerArticle = useCallback((id) => {
    setArticles(prev => prev.filter(article => article.id !== id));
  }, []);

  const modifierQuantite = useCallback((id, nouvelleQuantite) => {
    if (nouvelleQuantite <= 0) {
      retirerArticle(id);
      return;
    }
    setArticles(prev => prev.map(article =>
      article.id === id ? { ...article, quantite: nouvelleQuantite } : article
    ));
  }, [retirerArticle]);

  const viderPanier = useCallback(() => {
    setArticles([]);
    localStorage.removeItem('panier');
  }, []);

  const total = useMemo(() =>
    articles.reduce((sum, article) => sum + (article.prix || 0) * (article.quantite || 1), 0),
    [articles]
  );

  const nombreArticles = useMemo(() =>
    articles.reduce((sum, article) => sum + (article.quantite || 1), 0),
    [articles]
  );

  const value = useMemo(() => ({
    articles,
    ajouterVoiture,
    ajouterAccessoire,
    retirerArticle,
    modifierQuantite,
    viderPanier,
    total,
    nombreArticles,
  }), [articles, ajouterVoiture, ajouterAccessoire, retirerArticle, modifierQuantite, viderPanier, total, nombreArticles]);

  return <PanierContext.Provider value={value}>{children}</PanierContext.Provider>;
};

export default PanierContext;

