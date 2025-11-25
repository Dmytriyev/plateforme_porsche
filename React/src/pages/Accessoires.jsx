/**
 * pages/Accessoires.jsx — Liste des accessoires; filtres et pagination.
 *
 * @file pages/Accessoires.jsx
 */

import { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import accesoireService from "../services/accesoire.service.js";
import commandeService from "../services/commande.service.js";
import { AuthContext } from "../context/AuthContext.jsx";
import Loading from "../components/common/Loading.jsx";
import LoginPromptModal from "../components/modals/LoginPromptModal.jsx";
import buildUrl from "../utils/buildUrl";
import "../css/Accessoires.css";
import "../css/components/Message.css";

// Page : liste des accessoires avec filtres et pagination; actions admin visibles aux staff.
const Accessoires = () => {
  const navigate = useNavigate();
  const [accessoires, setAccessoires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [filtreType, setFiltreType] = useState("tous");
  const { isAuthenticated, isStaff } = useContext(AuthContext);
  const location = useLocation();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    fetchAccessoires();
  }, []);

  const fetchAccessoires = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await accesoireService.getAllAccessoires();

      if (Array.isArray(data)) {
        setAccessoires(data);
      } else {
        setError("Format de données invalide");
        setAccessoires([]);
      }
    } catch (err) {
      setError(
        err?.message ||
        err?.response?.data?.message ||
        "Erreur lors du chargement des accessoires",
      );
      setAccessoires([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAjouterAuPanier = async (accessoire) => {
    if (!isAuthenticated()) {
      setShowLoginPrompt(true);
      return;
    }

    try {
      await commandeService.ajouterAccessoireAuPanier(accessoire._id, 1);
      setSuccessMessage(`${accessoire.nom_accesoire} ajouté au panier`);
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(err.message || "Erreur lors de l'ajout au panier");
      setTimeout(() => setError(""), 3000);
    }
  };

  const handleVoirDetails = (accessoireId) => {
    navigate(`/accessoires/detail/${accessoireId}`);
  };
  const accessoiresFiltres = accessoires.filter(
    (acc) => filtreType === "tous" || acc.type_accesoire === filtreType,
  );

  const types = [
    "tous",
    ...new Set(accessoires.map((a) => a.type_accesoire).filter(Boolean)),
  ];

  if (loading)
    return <Loading fullScreen message="Chargement des accessoires..." />;

  if (error) {
    return (
      <div className="error-container">
        <div className="message-box message-error">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="accessoires-container">
      <div className="accessoires-content">
        <div className="accessoires-header">
          <div>
            <h1 className="accessoires-title">Accessoires Porsche</h1>
            <p className="accessoires-subtitle">
              Personnalisez votre expérience avec nos accessoires premium
            </p>
          </div>
        </div>

        {isStaff && isStaff() && (
          <div className="accessoires-admin-box">
            <h3 className="accessoires-admin-title">Gestion des accessoires</h3>
            <div className="accessoires-admin-actions">
              <button
                className="accessoires-admin-btn accessoires-admin-btn-add"
                onClick={() => navigate("/accessoires/ajouter")}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M10 4V16M4 10H16"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
                Ajouter un accessoire
              </button>
            </div>
          </div>
        )}

        {successMessage && (
          <div className="message-box message-success">
            <p>{successMessage}</p>
            <button
              onClick={() => setSuccessMessage("")}
              className="message-close"
            >
              ×
            </button>
          </div>
        )}

        {showLoginPrompt && (
          <LoginPromptModal
            onClose={() => setShowLoginPrompt(false)}
            onLogin={() =>
              navigate("/login", { state: { from: location.pathname } })
            }
            title="Connexion requise"
            message="Vous devez être connecté pour ajouter un accessoire au panier. Connectez‑vous ou créez un compte pour continuer."
            primaryText="Se connecter / Créer un compte"
            secondaryText="Annuler"
          />
        )}

        {types.length > 1 && (
          <div className="accessoires-filtres">
            {types.map((type) => (
              <button
                key={type}
                className={`accessoires-filtre-btn ${filtreType === type ? "active" : ""}`}
                onClick={() => setFiltreType(type)}
              >
                {type === "tous"
                  ? "Tous les produits"
                  : type === "Porsche Design"
                    ? "Porsche Design portes-clés"
                    : type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        )}

        {accessoiresFiltres.length === 0 ? (
          <div className="accessoires-empty">
            <svg
              className="accessoires-empty-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
              />
            </svg>
            <p className="accessoires-empty-text">
              Aucun accessoire disponible pour le moment.
            </p>
          </div>
        ) : (
          <div className="accessoires-grid-porsche">
            {accessoiresFiltres.map((accessoire) => {
              const photoPrincipale = accessoire.photo_accesoire?.[0] || null;
              const photoUrl = photoPrincipale?.name
                ? buildUrl(photoPrincipale.name)
                : null;
              const isOutOfStock =
                accessoire.stock === 0 || accessoire.disponible === false;
              const hasDiscount =
                accessoire.prix_promotion &&
                accessoire.prix_promotion < accessoire.prix;

              return (
                <div
                  key={accessoire._id}
                  className="accessoire-card-porsche"
                  data-accessoire-id={accessoire._id}
                >
                  <div className="accessoire-card-image-container">
                    {hasDiscount && !isOutOfStock && (
                      <div className="accessoire-card-badge">Cyber Week</div>
                    )}
                    {isOutOfStock && (
                      <div className="accessoire-card-out-of-stock">
                        En rupture de stock
                      </div>
                    )}
                    {photoUrl ? (
                      <img
                        src={photoUrl}
                        alt={photoPrincipale?.alt || accessoire.nom_accesoire}
                        className="accessoire-card-image"
                        loading="lazy"
                        onError={(e) => {
                          e.target.style.display = "none";
                          if (e.target.nextSibling) {
                            e.target.nextSibling.style.display = "flex";
                          }
                        }}
                        onLoad={() => {
                          const placeholder = document.querySelector(
                            `.accessoire-card-porsche[data-accessoire-id="${accessoire._id}"] .accessoire-card-image-placeholder`,
                          );
                          if (placeholder) {
                            placeholder.style.display = "none";
                          }
                        }}
                      />
                    ) : null}
                    <div
                      className="accessoire-card-image-placeholder"
                      style={{ display: photoUrl ? "none" : "flex" }}
                    >
                      <span className="accessoire-card-image-letter">
                        {accessoire.nom_accesoire?.charAt(0) || "?"}
                      </span>
                    </div>
                  </div>

                  <div className="accessoire-card-content">
                    <h3 className="accessoire-card-name">
                      {accessoire.nom_accesoire}
                    </h3>

                    <div className="accessoire-card-price">
                      {hasDiscount ? (
                        <>
                          <span className="accessoire-card-price-old">
                            {new Intl.NumberFormat("fr-FR", {
                              style: "currency",
                              currency: "EUR",
                              minimumFractionDigits: 2,
                            }).format(accessoire.prix)}
                          </span>
                          <span className="accessoire-card-price-new">
                            {new Intl.NumberFormat("fr-FR", {
                              style: "currency",
                              currency: "EUR",
                              minimumFractionDigits: 2,
                            }).format(accessoire.prix_promotion)}
                          </span>
                        </>
                      ) : (
                        <span className="accessoire-card-price-current">
                          {new Intl.NumberFormat("fr-FR", {
                            style: "currency",
                            currency: "EUR",
                            minimumFractionDigits: 2,
                          }).format(accessoire.prix)}
                        </span>
                      )}
                    </div>

                    <div className="accessoire-card-actions">
                      <button
                        className="accessoire-card-btn accessoire-card-btn-primary"
                        onClick={() => handleAjouterAuPanier(accessoire)}
                        disabled={isOutOfStock}
                      >
                        AJOUTER AU PANIER
                      </button>
                      <button
                        className="accessoire-card-btn accessoire-card-btn-secondary"
                        onClick={() => handleVoirDetails(accessoire._id)}
                      >
                        DÉTAILS
                      </button>
                    </div>

                    {isStaff && isStaff() && (
                      <div className="accessoire-card-admin-actions">
                        <button
                          className="accessoire-card-admin-btn accessoire-card-admin-btn-edit"
                          onClick={() =>
                            navigate(`/accessoires/${accessoire._id}/modifier`)
                          }
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              d="M13.5858 3.58579C14.3668 2.80474 15.6332 2.80474 16.4142 3.58579C17.1953 4.36683 17.1953 5.63316 16.4142 6.41421L15.6213 7.20711L12.7929 4.37868L13.5858 3.58579Z"
                              fill="currentColor"
                            />
                            <path
                              d="M11.3787 5.79289L3 14.1716V17H5.82843L14.2071 8.62132L11.3787 5.79289Z"
                              fill="currentColor"
                            />
                          </svg>
                          Modifier
                        </button>
                        <button
                          className="accessoire-card-admin-btn accessoire-card-admin-btn-delete"
                          onClick={async () => {
                            if (
                              window.confirm(
                                `Êtes-vous sûr de vouloir supprimer "${accessoire.nom_accesoire}" ?`,
                              )
                            ) {
                              try {
                                await accesoireService.deleteAccessoire(
                                  accessoire._id,
                                );
                                setSuccessMessage(
                                  "Accessoire supprimé avec succès",
                                );
                                setTimeout(() => setSuccessMessage(""), 3000);
                                fetchAccessoires();
                              } catch (err) {
                                setError(
                                  err.message ||
                                  "Erreur lors de la suppression",
                                );
                                setTimeout(() => setError(""), 3000);
                              }
                            }
                          }}
                        >
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M9 2C8.62123 2 8.27497 2.214 8.10557 2.55279L7.38197 4H4C3.44772 4 3 4.44772 3 5C3 5.55228 3.44772 6 4 6V16C4 17.1046 4.89543 18 6 18H14C15.1046 18 16 17.1046 16 16V6C16.5523 6 17 5.55228 17 5C17 4.44772 16.5523 4 16 4H12.618L11.8944 2.55279C11.725 2.214 11.3788 2 11 2H9ZM7 8C7 7.44772 7.44772 7 8 7C8.55228 7 9 7.44772 9 8V14C9 14.5523 8.55228 15 8 15C7.44772 15 7 14.5523 7 14V8ZM12 7C11.4477 7 11 7.44772 11 8V14C11 14.5523 11.4477 15 12 15C12.5523 15 13 14.5523 13 14V8C13 7.44772 12.5523 7 12 7Z"
                              fill="currentColor"
                            />
                          </svg>
                          Supprimer
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Accessoires;
