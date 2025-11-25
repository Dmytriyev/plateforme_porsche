/**
 * pages/Panier.jsx — Gère affichage panier, totaux et navigation vers checkout.
 *
 * @file pages/Panier.jsx
 */

import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext.jsx";
import commandeService from "../services/commande.service.js";
import Loading from "../components/common/Loading.jsx";
import buildUrl from "../utils/buildUrl";
import { formatPrice } from "../utils/helpers.js";
import "../css/Panier.css";
import "../css/components/Message.css";

const Panier = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [lignes, setLignes] = useState([]);
  const [total, setTotal] = useState(0);

  const fetchPanier = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await commandeService.getPanier();
      setLignes(Array.isArray(data.lignesCommande) ? data.lignesCommande : []);
      // Le total sera recalculé dans useEffect
    } catch (err) {
      if (
        err.message?.includes("Panier") ||
        err.message?.includes("Aucun panier")
      ) {
        setLignes([]);
        setTotal(0);
      } else {
        setError(err.message || "Erreur lors du chargement du panier");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchPanier();
    }
     
  }, [user]);

  // Recalculer le total : acompte pour voitures neuves, prix complet pour accessoires
  useEffect(() => {
    const nouveauTotal = lignes.reduce((sum, ligne) => {
      const isVoiture = ligne.type_produit === true;
      // Pour les voitures : utiliser l'acompte
      // Pour les accessoires : ligne.prix contient déjà le prix total (prix unitaire × quantité)
      const montantLigne = isVoiture ? ligne.acompte || 0 : ligne.prix || 0;
      return sum + montantLigne;
    }, 0);
    setTotal(nouveauTotal);
  }, [lignes]);

  const handleUpdateQuantite = async (ligneId, nouvelleQuantite) => {
    if (nouvelleQuantite < 1) return;

    try {
      setError("");
      await commandeService.updateQuantiteLigne(ligneId, nouvelleQuantite);
      setSuccess("Quantité mise à jour");
      setTimeout(() => setSuccess(""), 2000);
      fetchPanier();
    } catch (err) {
      setError(err.message || "Erreur lors de la mise à jour de la quantité");
    }
  };

  const handleSupprimerLigne = async (ligneId) => {
    if (
      !window.confirm(
        "Êtes-vous sûr de vouloir retirer cet article du panier ?",
      )
    )
      return;

    try {
      setError("");
      await commandeService.supprimerLignePanier(ligneId);
      setSuccess("Article retiré du panier");
      setTimeout(() => setSuccess(""), 2000);
      fetchPanier();
    } catch (err) {
      setError(err.message || "Erreur lors de la suppression");
    }
  };

  const handlePasserCommande = () => {
    navigate("/commande/checkout");
  };

  if (!user) {
    return (
      <div className="panier-error">
        <p>Vous devez être connecté pour accéder à votre panier</p>
        <button onClick={() => navigate("/login")}>Se connecter</button>
      </div>
    );
  }

  if (loading) {
    return <Loading fullScreen message="Chargement de votre panier..." />;
  }

  const nombreArticles = lignes.reduce(
    (sum, ligne) => sum + (ligne.quantite || 1),
    0,
  );

  return (
    <div className="panier-container-porsche">
      <div className="panier-content-porsche">
        <div className="panier-back-link">
          <Link to="/" className="panier-back-btn">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Continuer les achats
          </Link>
        </div>

        <h1 className="panier-title-porsche">Mon panier</h1>

        {error && (
          <div className="panier-messages">
            <div className="message-box message-error">
              <p>{error}</p>
            </div>
          </div>
        )}
        {success && (
          <div className="panier-messages">
            <div className="message-box message-success">
              <p>{success}</p>
            </div>
          </div>
        )}

        {lignes.length === 0 ? (
          <div className="panier-empty-porsche">
            <p className="panier-empty-text">Votre panier est vide</p>
            <div className="panier-empty-buttons">
              <Link to="/catalogue/neuve" className="panier-empty-btn">
                Parcourir les voitures
              </Link>
              <Link to="/accessoires" className="panier-empty-btn">
                Voir les accessoires
              </Link>
            </div>
          </div>
        ) : (
          <div className="panier-layout-porsche">
            <div className="panier-articles-porsche">
              {lignes.map((ligne) => {
                const isVoiture = ligne.type_produit === true;
                const produit = isVoiture
                  ? ligne.model_porsche_id
                  : ligne.accesoire;
                if (!produit) return null;

                const photos = isVoiture
                  ? ligne.model_porsche_id?.photo_porsche?.filter(
                      (p) => p && (p.name || p._id),
                    ) || []
                  : ligne.accesoire?.photo_accesoire?.filter(
                      (p) => p && (p.name || p._id),
                    ) || [];

                const photoPrincipale = photos[0] || null;
                // Pour les voitures : afficher l'acompte
                // Pour les accessoires : ligne.prix contient déjà le prix total (prix unitaire × quantité)
                const prixTotalLigne = isVoiture
                  ? ligne.acompte || 0
                  : ligne.prix || 0;
                const prixTotalVoiture = isVoiture ? ligne.prix || 0 : null;

                return (
                  <article
                    key={ligne._id}
                    className="panier-article-card-porsche"
                  >
                    <div className="panier-article-image-porsche">
                      {photoPrincipale && photoPrincipale.name ? (
                        <img
                          src={buildUrl(photoPrincipale.name)}
                          alt={
                            isVoiture
                              ? produit.nom_model
                              : produit.nom_accesoire
                          }
                          className="panier-article-img-porsche"
                          onError={(e) => {
                            e.target.style.display = "none";
                            if (e.target.nextSibling) {
                              e.target.nextSibling.style.display = "flex";
                            }
                          }}
                        />
                      ) : null}
                      <div
                        className="panier-article-placeholder-porsche"
                        style={{
                          display:
                            photoPrincipale && photoPrincipale.name
                              ? "none"
                              : "flex",
                        }}
                      >
                        <span className="panier-article-letter-porsche">
                          {isVoiture
                            ? produit.nom_model?.charAt(0) || "P"
                            : produit.nom_accesoire?.charAt(0) || "A"}
                        </span>
                      </div>
                    </div>

                    <div className="panier-article-details-porsche">
                      <h3 className="panier-article-name-porsche">
                        {isVoiture ? produit.nom_model : produit.nom_accesoire}
                      </h3>

                      {!isVoiture && ligne.accesoire && (
                        <div className="panier-article-attributes-porsche">
                          {ligne.accesoire.couleur_accesoire && (
                            <div className="panier-attribute-item-porsche">
                              <span className="panier-attribute-label-porsche">
                                Couleur:
                              </span>
                              <div className="panier-attribute-value-porsche">
                                <span
                                  className="panier-color-swatch-porsche"
                                  style={{
                                    backgroundColor:
                                      ligne.accesoire.couleur_accesoire
                                        .nom_couleur === "Rouge"
                                        ? "#dc2626"
                                        : "#9ca3af",
                                  }}
                                />
                                {ligne.accesoire.couleur_accesoire.nom_couleur}
                              </div>
                            </div>
                          )}
                          {ligne.accesoire.type_accesoire && (
                            <div className="panier-attribute-item-porsche">
                              <span className="panier-attribute-label-porsche">
                                Matériau:
                              </span>
                              <span className="panier-attribute-value-porsche">
                                {ligne.accesoire.description || "N/A"}
                              </span>
                            </div>
                          )}
                          <div className="panier-attribute-item-porsche">
                            <span className="panier-attribute-label-porsche">
                              Taille:
                            </span>
                            <span className="panier-attribute-value-porsche">
                              Taille unique
                            </span>
                          </div>
                        </div>
                      )}

                      {isVoiture && ligne.model_porsche_id && (
                        <div className="panier-article-attributes-porsche">
                          {ligne.model_porsche_id.couleur_exterieur && (
                            <div className="panier-attribute-item-porsche">
                              <span className="panier-attribute-label-porsche">
                                Couleur extérieure:
                              </span>
                              <span className="panier-attribute-value-porsche">
                                {
                                  ligne.model_porsche_id.couleur_exterieur
                                    .nom_couleur
                                }
                              </span>
                            </div>
                          )}
                          {ligne.model_porsche_id.type_carrosserie && (
                            <div className="panier-attribute-item-porsche">
                              <span className="panier-attribute-label-porsche">
                                Carrosserie:
                              </span>
                              <span className="panier-attribute-value-porsche">
                                {ligne.model_porsche_id.type_carrosserie}
                              </span>
                            </div>
                          )}
                          {isVoiture && (
                            <>
                              <div className="panier-attribute-item-porsche">
                                <span className="panier-attribute-label-porsche">
                                  Prix total:
                                </span>
                                <span className="panier-attribute-value-porsche">
                                  {formatPrice(prixTotalVoiture || 0)}
                                </span>
                              </div>
                              <div className="panier-attribute-item-porsche">
                                <span className="panier-attribute-label-porsche">
                                  Acompte:
                                </span>
                                <span className="panier-attribute-value-porsche">
                                  {formatPrice(ligne.acompte || 0)} (10% du prix
                                  total)
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      )}

                      {!isVoiture && (
                        <div className="panier-quantity-porsche">
                          <button
                            className="panier-quantity-btn-porsche"
                            onClick={() =>
                              handleUpdateQuantite(
                                ligne._id,
                                (ligne.quantite || 1) - 1,
                              )
                            }
                            disabled={ligne.quantite <= 1}
                          >
                            -
                          </button>
                          <span className="panier-quantity-value-porsche">
                            {ligne.quantite || 1}
                          </span>
                          <button
                            className="panier-quantity-btn-porsche"
                            onClick={() =>
                              handleUpdateQuantite(
                                ligne._id,
                                (ligne.quantite || 1) + 1,
                              )
                            }
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="panier-article-actions-porsche">
                      <div className="panier-article-price-porsche">
                        {formatPrice(prixTotalLigne)}
                      </div>
                      <button
                        className="panier-article-remove-porsche"
                        onClick={() => handleSupprimerLigne(ligne._id)}
                        aria-label="Retirer du panier"
                      >
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  </article>
                );
              })}

              <div className="panier-info-porsche">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="panier-info-icon-porsche"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 16v-4M12 8h.01" />
                </svg>
                <span>
                  Les produits dans votre panier ne sont pas réservés.
                </span>
              </div>
            </div>

            <aside className="panier-summary-porsche">
              <div className="panier-summary-card-porsche">
                <h2 className="panier-summary-title-porsche">Montant total</h2>
                <div className="panier-summary-total-porsche">
                  {formatPrice(total)}
                  <span className="panier-summary-ttc-porsche">T.T.C.</span>
                </div>

                <button
                  className="panier-checkout-btn-porsche"
                  onClick={handlePasserCommande}
                >
                  Passer la commande
                </button>

                <div className="panier-summary-details-porsche">
                  <div className="panier-summary-detail-item-porsche">
                    <span>
                      {nombreArticles} produit{nombreArticles > 1 ? "s" : ""}
                    </span>
                    <span>{formatPrice(total)}</span>
                  </div>
                  <div className="panier-summary-detail-item-porsche">
                    <span>Emballage et expédition</span>
                    <span className="panier-shipping-free-porsche">
                      gratuit
                    </span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
};

export default Panier;
