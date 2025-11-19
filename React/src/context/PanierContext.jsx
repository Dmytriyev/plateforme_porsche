import { createContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';

export const PanierContext = createContext();

export const PanierProvider = ({ children }) => {
  const [articles, setArticles] = useState([]);
  const saveTimer = useRef(null);

  // Charger le panier depuis localStorage au démarrage
  useEffect(() => {
    try {
      const savedPanier = localStorage.getItem('panier');
      if (savedPanier) setArticles(JSON.parse(savedPanier));
    } catch (error) { }
  }, []);

  // Sauvegarder le panier avec debounce pour réduire les écritures
  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem('panier', JSON.stringify(articles));
      } catch (e) { }
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
    try { localStorage.removeItem('panier'); } catch (e) { }
  }, []);

  const calculerTotal = useCallback(() => articles.reduce((total, article) => total + (article.prix * (article.quantite || 1)), 0), [articles]);

  const getNombreArticles = useCallback(() => articles.reduce((total, article) => total + (article.quantite || 1), 0), [articles]);

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

