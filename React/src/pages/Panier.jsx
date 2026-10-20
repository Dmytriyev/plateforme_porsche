// Gère affichage panier, totaux et navigation vers checkout
import commandeService from "../services/commande.service.js";
import buildUrl from "../utils/buildUrl";
import Loading from "../components/common/Loading.jsx";
import ImageWithFallback from "../components/common/ImageWithFallback.jsx";
import { AuthContext } from "../context/AuthContext.jsx";
import { formatPrice } from "../utils/helpers.js";
import { useState, useEffect, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../css/components/Message.css";
import "../css/Panier.css";

// retourne un tableau de photos valides pour une ligne (voiture ou accessoire)
const getPhotosFor = (ligne, isVoiture) => {
  const list = isVoiture
    // si c'est une voiture, on prend les photos du modèle
    ? ligne.model_porsche_id?.photo_porsche
    : ligne.accesoire?.photo_accesoire;
  return (Array.isArray(list) ? list : []).filter(
    (p) => p && (p.name || p._id),
  );
};

// Retourne l'initiale affichable d'un nom, ou la valeur de fallback
const getInitial = (name, fallback) => {
  // Trim et vérifie si la chaîne n'est pas vide  
  const s = (name || "").trim();
  if (!s) return fallback;
  // Array.from gère correctement les caractères Unicode composés (emoji, surrogate pairs)
  return Array.from(s)[0].toUpperCase();
};

// affiche le panier utilisateur, gestion des quantités et passage au paiement. Requiert connexion.
const Panier = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [lignes, setLignes] = useState([]);
  const [total, setTotal] = useState(0);

  // Récupérer le panier utilisateur depuis l'API
  const fetchPanier = async () => {
    try {
      setLoading(true);
      setError("");
      // Appel au service commande pour obtenir le panier
      const data = await commandeService.getPanier();
      setLignes(Array.isArray(data.lignesCommande) ? data.lignesCommande : []);
      // Le total sera recalculé dans useEffect
    } catch (err) {
      if (
        // Si le panier est vide ou n'existe pas, on initialise à vide
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
  // Charger le panier à l'initialisation si utilisateur connecté
  useEffect(() => {
    if (user) {
      fetchPanier();
    }

  }, [user]);

  // Recalculer le total : acompte pour voitures neuves, prix complet pour accessoires
  useEffect(() => {
    // Calcul du total du panier lorsque les lignes changent
    const nouveauTotal = lignes.reduce((sum, ligne) => {
      // Déterminer si la ligne correspond à une voiture ou un accessoire
      const isVoiture = ligne.type_produit === true;
      // Pour les voitures : utiliser l'acompte
      // Pour les accessoires : ligne.prix contient déjà le prix total (prix unitaire × quantité)
      const montantLigne = isVoiture ? ligne.acompte || 0 : ligne.prix || 0;
      return sum + montantLigne;
    }, 0);
    setTotal(nouveauTotal);
  }, [lignes]);
  // Met à jour la quantité d'une ligne dans le panier 
  const handleUpdateQuantite = async (ligneId, nouvelleQuantite) => {
    if (nouvelleQuantite < 1) return;
    // Appel au service commande pour mettre à jour la quantité
    try {
      setError("");
      // Met à jour la quantité via le service commande 
      await commandeService.updateQuantiteLigne(ligneId, nouvelleQuantite);
      setSuccess("Quantité mise à jour");
      setTimeout(() => setSuccess(""), 2000);
      fetchPanier();
    } catch (err) {
      setError(err.message || "Erreur lors de la mise à jour de la quantité");
    }
  };

  // Supprime une ligne du panier après confirmation  
  const handleSupprimerLigne = async (ligneId) => {
    if (
      !window.confirm(
        "Êtes-vous sûr de vouloir retirer cet article du panier ?",
      )
    )
      return;
    // Appel au service commande pour supprimer la ligne  
    try {
      setError("");
      // Supprime la ligne via le service commande
      await commandeService.supprimerLignePanier(ligneId);
      setSuccess("Article retiré du panier");
      setTimeout(() => setSuccess(""), 2000);
      fetchPanier();
    } catch (err) {
      setError(err.message || "Erreur lors de la suppression");
    }
  };

  // Navigation vers la page de checkout  
  const handlePasserCommande = () => {
    navigate("/commande/checkout");
  };

  // Si pas connecté, inviter à se connecter
  if (!user) {
    return (
      <div className="panier-error">
        <p>Vous devez être connecté pour accéder à votre panier</p>
        <button onClick={() => navigate("/login")}>Se connecter</button>
      </div>
    );
  }
  // Affichage du panier avec gestion des états de chargement, erreurs et succès
  if (loading) {
    return <Loading fullScreen message="Chargement de votre panier..." />;
  }
  // Calcul du nombre total d'articles dans le panier
  const nombreArticles = lignes.reduce(
    (sum, ligne) => sum + (ligne.quantite || 1),
    0,
  );

  return (
    // Affichage du panier
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
                // Déterminer si la ligne est une voiture ou un accessoire
                const isVoiture = ligne.type_produit === true;
                // Récupérer le produit correspondant
                const produit = isVoiture
                  ? ligne.model_porsche_id
                  : ligne.accesoire;
                if (!produit) return null;
                // Récupérer les photos du produit
                const photos = getPhotosFor(ligne, isVoiture);
                // Classe de couleur pour le swatch (éviter styles inline)
                const swatchColorClass = !isVoiture && ligne.accesoire?.couleur_accesoire?.nom_couleur === "Rouge"
                  ? "panier-color-swatch-rouge"
                  : "panier-color-swatch-default";
                // Photo principale du produit
                const photoPrincipale = photos[0] || null;
                // Pour les voitures : afficher l'acompte
                // Pour les accessoires : ligne.prix contient déjà le prix total (prix unitaire × quantité)
                const prixTotalLigne = isVoiture
                  ? ligne.acompte || 0
                  : ligne.prix || 0;
                const prixTotalVoiture = isVoiture ? ligne.prix || 0 : null;

                // Rendu de la ligne du panier 
                return (
                  <article
                    key={ligne._id}
                    className="panier-article-card-porsche"
                  >
                    <div className="panier-article-image-porsche">
                      {/*
                      ImageWithFallback:
                       - `src`: si `photoPrincipale` existe et contient une propriété `name`,
                      on génère l'URL complète via `buildUrl(photoPrincipale.name)`.
                      Sinon on passe `null` pour forcer l'affichage du placeholder.
                      - `placeholder`: contenu affiché lorsque l'image n'est pas disponible
                      - `buildUrl` est un utilitaire centralisé pour construire l'URL
                      - Le composant `ImageWithFallback` centralise la logique de
                      gestion d'erreur de chargement d'image (fallback)
                    */}
                      <ImageWithFallback
                        src={
                          photoPrincipale && photoPrincipale.name
                            ? buildUrl(photoPrincipale.name)
                            : null
                        }
                        // si isVoiture est true on utilise le nom du modèle, sinon le nom de l'accessoire
                        alt={isVoiture ? produit.nom_model : produit.nom_accesoire}
                        imgClass="panier-article-img-porsche"
                        placeholder={
                          <div className="panier-article-placeholder-porsche panier-article-placeholder-visible">
                            <span className="panier-article-letter-porsche">
                              {getInitial(
                                // si isVoiture est true on utilise la première lettre du nom du modèle, sinon la première lettre du nom de l'accessoire
                                isVoiture ? produit.nom_model : produit.nom_accesoire,
                                isVoiture ? "P" : "A",
                              )}
                            </span>
                          </div>
                        }
                      />
                    </div>

                    <div className="panier-article-details-porsche">
                      <h3 className="panier-article-name-porsche">
                        {/* si isVoiture est true on affiche le nom du modèle, sinon le nom de l'accessoire */}
                        {isVoiture ? produit.nom_model : produit.nom_accesoire}
                      </h3>
                      {/* si isVoiture est false et ligne.accesoire existe on affiche les attributs de l'accessoire */}
                      {!isVoiture && ligne.accesoire && (
                        <div className="panier-article-attributes-porsche">
                          {ligne.accesoire.couleur_accesoire && (
                            <div className="panier-attribute-item-porsche">
                              <span className="panier-attribute-label-porsche">
                                Couleur:
                              </span>
                              <div className="panier-attribute-value-porsche">
                                <span className={`panier-color-swatch-porsche ${swatchColorClass}`} />
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
                      {/* si isVoiture est true et ligne.model_porsche_id existe on affiche les attributs du modèle */}
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
                          {/* si isVoiture est true on affiche les attributs du modèle */}
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
                      {/* si isVoiture est false on affiche les boutons de quantité */}
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
                        {/* Bouton pour retirer un article du panier */}
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          {/* Icône de suppression (croix) */}
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                  </article>
                );
              })}
              {/* Information importante concernant le panier */}
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
                  {/* Icône d'information */}
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
                      {/* si nombreArticles est supérieur à 1, on ajoute un "s" à produit */}
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
