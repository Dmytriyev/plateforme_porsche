import { createContext, useState, useEffect } from 'react';

/**
 * Contexte du panier
 * Gère les articles (voitures configurées et accessoires)
 */
export const PanierContext = createContext();

export const PanierProvider = ({ children }) => {
  const [articles, setArticles] = useState([]);

  // Charger le panier depuis localStorage au démarrage
  useEffect(() => {
    try {
      const savedPanier = localStorage.getItem('panier');
      if (savedPanier) {
        setArticles(JSON.parse(savedPanier));
      }
    } catch (error) {
      console.error('Erreur chargement panier:', error);
    }
  }, []);

  // Sauvegarder le panier dans localStorage à chaque modification
  useEffect(() => {
    try {
      localStorage.setItem('panier', JSON.stringify(articles));
    } catch (error) {
      console.error('Erreur sauvegarde panier:', error);
    }
  }, [articles]);

  /**
   * Ajouter un article au panier
   * @param {Object} article - Article à ajouter
   */
  const ajouterArticle = (article) => {
    const nouvelArticle = {
      ...article,
      id: Date.now() + Math.random(), // ID unique
      dateAjout: new Date().toISOString(),
    };
    setArticles((prev) => [...prev, nouvelArticle]);
  };

  /**
   * Ajouter une voiture configurée au panier
   * @param {Object} voiture - Voiture sélectionnée
   * @param {Object} configuration - Configuration choisie
   */
  const ajouterVoiture = (voiture, configuration) => {
    const prixTotal = calculerPrixConfiguration(configuration);
    const article = {
      type: 'voiture',
      voiture,
      configuration,
      prix: prixTotal,
      quantite: 1,
    };
    ajouterArticle(article);
  };

  /**
   * Ajouter un accessoire au panier
   * @param {Object} accessoire - Accessoire sélectionné
   * @param {number} quantite - Quantité
   */
  const ajouterAccessoire = (accessoire, quantite = 1) => {
    // Vérifier si l'accessoire existe déjà
    const existant = articles.find(
      (a) => a.type === 'accessoire' && a.accessoire._id === accessoire._id
    );

    if (existant) {
      modifierQuantite(existant.id, existant.quantite + quantite);
    } else {
      const article = {
        type: 'accessoire',
        accessoire,
        prix: accessoire.prix,
        quantite,
      };
      ajouterArticle(article);
    }
  };

  /**
   * Retirer un article du panier
   * @param {string} id - ID de l'article
   */
  const retirerArticle = (id) => {
    setArticles((prev) => prev.filter((article) => article.id !== id));
  };

  /**
   * Modifier la quantité d'un article
   * @param {string} id - ID de l'article
   * @param {number} nouvelleQuantite - Nouvelle quantité
   */
  const modifierQuantite = (id, nouvelleQuantite) => {
    if (nouvelleQuantite <= 0) {
      retirerArticle(id);
      return;
    }

    setArticles((prev) =>
      prev.map((article) =>
        article.id === id ? { ...article, quantite: nouvelleQuantite } : article
      )
    );
  };

  /**
   * Vider le panier
   */
  const viderPanier = () => {
    setArticles([]);
    localStorage.removeItem('panier');
  };

  /**
   * Calculer le prix total de la configuration
   * @param {Object} configuration - Configuration de la voiture
   * @returns {number} Prix total
   */
  const calculerPrixConfiguration = (configuration) => {
    let total = configuration.prixBase || 0;

    if (configuration.couleurExterieur?.prix) {
      total += configuration.couleurExterieur.prix;
    }

    if (configuration.couleurInterieur?.prix) {
      total += configuration.couleurInterieur.prix;
    }

    if (configuration.jantes?.prix) {
      total += configuration.jantes.prix;
    }

    if (configuration.sieges?.prix) {
      total += configuration.sieges.prix;
    }

    if (configuration.package?.prix) {
      total += configuration.package.prix;
    }

    return total;
  };

  /**
   * Calculer le total du panier
   * @returns {number} Total
   */
  const calculerTotal = () => {
    return articles.reduce((total, article) => {
      const prix = article.prix * (article.quantite || 1);
      return total + prix;
    }, 0);
  };

  /**
   * Obtenir le nombre d'articles
   * @returns {number} Nombre d'articles
   */
  const getNombreArticles = () => {
    return articles.reduce((total, article) => {
      return total + (article.quantite || 1);
    }, 0);
  };

  const value = {
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
  };

  return <PanierContext.Provider value={value}>{children}</PanierContext.Provider>;
};

export default PanierContext;

