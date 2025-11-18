import { Link } from 'react-router-dom';
import { usePanier } from '../hooks/usePanier.jsx';
import { Button, Card } from '../components/common';
import { formatPrice } from '../utils/format.js';
import './Panier.css';

/**
 * Page du panier
 */
const Panier = () => {
  const { articles, retirerArticle, modifierQuantite, total, viderPanier } = usePanier();

  if (articles.length === 0) {
    return (
      <div className="panier-container">
        <div className="panier-content panier-empty">
          <h1 className="panier-empty-title">Votre panier est vide</h1>
          <p className="panier-empty-subtitle">
            Découvrez nos voitures et accessoires
          </p>
          <div className="panier-empty-buttons">
            <Link to="/voitures">
              <Button>Explorer les voitures</Button>
            </Link>
            <Link to="/accessoires">
              <Button variant="secondary">Voir les accessoires</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="panier-container">
      <div className="panier-content">
        <h1 className="panier-title">Mon panier</h1>

        <div className="panier-grid">
          {/* Liste des articles */}
          <div className="panier-articles">
            {articles.map((article) => (
              <Card key={article.id} padding="md">
                <div className="panier-article">
                  {/* Image placeholder */}
                  <div className="panier-article-image" />

                  {/* Détails */}
                  <div className="panier-article-details">
                    <h3 className="panier-article-title">
                      {article.type === 'voiture'
                        ? article.voiture?.nom_model
                        : article.accessoire?.nom}
                    </h3>

                    {article.type === 'voiture' && article.configuration && (
                      <div className="panier-article-config">
                        {article.configuration.couleurExterieur && (
                          <p>Couleur: {article.configuration.couleurExterieur.nom}</p>
                        )}
                        {article.configuration.jantes && (
                          <p>Jantes: {article.configuration.jantes.taille}</p>
                        )}
                      </div>
                    )}

                    {article.type === 'accessoire' && (
                      <div className="panier-quantity-control">
                        <label className="panier-quantity-label">Quantité:</label>
                        <div className="panier-quantity-buttons">
                          <button
                            onClick={() => modifierQuantite(article.id, article.quantite - 1)}
                            className="panier-quantity-btn"
                          >
                            -
                          </button>
                          <span className="panier-quantity-value">{article.quantite}</span>
                          <button
                            onClick={() => modifierQuantite(article.id, article.quantite + 1)}
                            className="panier-quantity-btn"
                          >
                            +
                          </button>
                        </div>
                      </div>
                    )}

                    <div className="panier-article-footer">
                      <p className="panier-article-price">
                        {formatPrice(article.prix * (article.quantite || 1))}
                      </p>
                      <button
                        onClick={() => retirerArticle(article.id)}
                        className="panier-remove-btn"
                      >
                        Retirer
                      </button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            <button
              onClick={viderPanier}
              className="panier-clear-btn"
            >
              Vider le panier
            </button>
          </div>

          {/* Résumé */}
          <div>
            <Card padding="lg" className="panier-summary">
              <h2 className="panier-summary-title">Résumé</h2>

              <div className="panier-summary-details">
                <div className="panier-summary-row">
                  <span>Sous-total</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <div className="panier-summary-row">
                  <span>Livraison</span>
                  <span>Gratuite</span>
                </div>
                <div className="panier-summary-total">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </div>

              <Button fullWidth size="lg">
                Passer la commande
              </Button>

              <p className="panier-summary-info">
                Paiement sécurisé avec Stripe
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Panier;
