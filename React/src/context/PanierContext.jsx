/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { sanitizeObject } from '../utils/sanitize';
import logger from '../utils/logger';

export const PanierContext = createContext();

export const PanierProvider = ({ children }) => {
  const normalizeArticles = (data) => {
    if (Array.isArray(data)) return data;
    if (data && typeof data === 'object') {
      if (Array.isArray(data.articles)) return data.articles;

      // Migration: handle array-like objects saved as { "0": {...}, "1": {...} }
      const keys = Object.keys(data);
      const isNumericKeys = keys.length > 0 && keys.every((k) => String(Number(k)) === k);
      if (isNumericKeys) return keys.sort((a, b) => Number(a) - Number(b)).map((k) => data[k]);
    }

    logger.warn('PanierContext: unexpected panier format, normalizing to []', data);
    return [];
  };
  // Lazy init from localStorage to avoid calling setState synchronously inside useEffect
  const [articles, setArticles] = useState(() => {
    try {
      const savedPanier = localStorage.getItem('panier');
      const parsed = savedPanier ? JSON.parse(savedPanier) : [];
      return normalizeArticles(parsed);
    } catch (e) {

      logger.warn('PanierContext: failed to parse saved panier', e);
      return [];
    }
  });
  const saveTimer = useRef(null);

  // Sauvegarder le panier avec debounce pour réduire les écritures
  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        const safe = sanitizeObject(Array.isArray(articles) ? articles : []);
        localStorage.setItem('panier', JSON.stringify(safe));
      } catch (e) {
        logger.warn('PanierContext: failed to save panier', e);
      }
    }, 250);
    return () => clearTimeout(saveTimer.current);
  }, [articles]);

  const ajouterArticle = useCallback((article) => {
    const nouvelArticle = { ...article, id: Date.now() + Math.random(), dateAjout: new Date().toISOString() };
    setArticles((prev) => [...prev, nouvelArticle]);
  }, []);

  const calculerPrixConfiguration = useCallback((configuration) => {
    let total = configuration.prixBase || 0;
    if (configuration.couleurExterieur?.prix) total += configuration.couleurExterieur.prix;
    if (configuration.couleurInterieur?.prix) total += configuration.couleurInterieur.prix;
    if (configuration.jantes?.prix) total += configuration.jantes.prix;
    if (configuration.sieges?.prix) total += configuration.sieges.prix;
    if (configuration.package?.prix) total += configuration.package.prix;
    return total;
  }, []);

  const ajouterVoiture = useCallback((voiture, configuration) => {
    const prixTotal = calculerPrixConfiguration(configuration);
    const article = { type: 'voiture', voiture, configuration, prix: prixTotal, quantite: 1 };
    ajouterArticle(article);
  }, [ajouterArticle, calculerPrixConfiguration]);

  const ajouterAccessoire = useCallback((accessoire, quantite = 1) => {
    setArticles((prev) => {
      const existant = prev.find((a) => a.type === 'accessoire' && a.accessoire._id === accessoire._id);
      if (existant) return prev.map((a) => (a.id === existant.id ? { ...a, quantite: a.quantite + quantite } : a));
      const article = { type: 'accessoire', accessoire, prix: accessoire.prix, quantite };
      return [...prev, article];
    });
  }, []);

  const retirerArticle = useCallback((id) => setArticles((prev) => prev.filter((article) => article.id !== id)), []);

  const modifierQuantite = useCallback((id, nouvelleQuantite) => {
    if (nouvelleQuantite <= 0) return retirerArticle(id);
    setArticles((prev) => prev.map((article) => (article.id === id ? { ...article, quantite: nouvelleQuantite } : article)));
  }, [retirerArticle]);

  const viderPanier = useCallback(() => {
    setArticles([]);
    try {
      localStorage.removeItem('panier');
    } catch (e) {
      logger.warn('PanierContext: failed to remove panier', e);
    }
  }, []);

  const calculerTotal = useCallback(() => {
    if (!Array.isArray(articles)) return 0;
    return articles.reduce((total, article) => total + ((article.prix || 0) * (article.quantite || 1)), 0);
  }, [articles]);

  const getNombreArticles = useCallback(() => {
    if (!Array.isArray(articles)) return 0;
    return articles.reduce((total, article) => total + (article.quantite || 1), 0);
  }, [articles]);

  const value = useMemo(() => ({
    articles,
    ajouterArticle,
    ajouterVoiture,
    ajouterAccessoire,
    retirerArticle,
    modifierQuantite,
    viderPanier,
    calculerTotal,
    getNombreArticles,
    total: calculerTotal(),
    nombreArticles: getNombreArticles(),
  }), [articles, ajouterArticle, ajouterVoiture, ajouterAccessoire, retirerArticle, modifierQuantite, viderPanier, calculerTotal, getNombreArticles]);

  return <PanierContext.Provider value={value}>{children}</PanierContext.Provider>;
};

export default PanierContext;

