// affiche l'historique des commandes de l'utilisateur; nécessite authentification.
import { AuthContext } from "../context/AuthContext.jsx";
import "../css/MesCommandes.css";
import commandeService from "../services/commande.service.js";
import { formatPrice, formatDate } from "../utils/helpers.js";
import { useState, useEffect, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

// Composant MesCommandes
const MesCommandes = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Vérifie si le paiement a réussi via les paramètres d'URL
  useEffect(() => {
    const paymentSuccess = searchParams.get("payment");
    // si paiement réussi, afficher message de succès temporaire et nettoyer l'URL 
    if (paymentSuccess === "success") {
      setSuccessMessage(
        "Paiement effectué avec succès ! Votre commande est en cours de traitement...",
      );
      // Nettoyer l'URL en supprimant les paramètres de requête
      window.history.replaceState({}, "", "/mes-commandes");

      // Attendre 2 secondes pour que le webhook Stripe traite la commande
      setTimeout(() => {
        fetchCommandes();
        setSuccessMessage("Paiement effectué avec succès ! Votre commande a été validée.");
      }, 2000);

      setTimeout(() => setSuccessMessage(""), 7000);
    } else {
      // Charger les commandes de l'utilisateur immédiatement
      fetchCommandes();
    }
  }, [searchParams]);

  // Fonction pour récupérer les commandes de l'utilisateur
  const fetchCommandes = async () => {
    try {
      setLoading(true);
      setError("");
      // Appel au service pour obtenir les commandes
      const data = await commandeService.getMyCommandes();
      setCommandes(data);
    } catch (err) {
      setError(err.message || "Erreur lors du chargement des commandes");
    } finally {
      setLoading(false);
    }
  };
  // Fonction pour obtenir le badge de statut de la commande
  const getStatusBadge = (status, acompte) => {
    // Statut validée si `status` true, acompte versé si `acompte` > 0, sinon en attente
    if (status) {
      return <span className="commande-status status-success">Validée</span>;
    }
    if (acompte > 0) {
      return (
        <span className="commande-status status-warning">Acompte versé</span>
      );
    }
    return <span className="commande-status status-pending">En attente</span>;
  };

  // Si l'utilisateur n'est pas connecté, afficher message d'erreur
  if (!user) {
    return (
      <div className="mes-commandes-error">
        <p>Vous devez être connecté pour accéder à cette page</p>
        <button
          onClick={() => navigate("/login")}
          className="mes-commandes-btn"
        >
          Se connecter
        </button>
      </div>
    );
  }

  // Afficher un indicateur de chargement pendant la récupération des données
  if (loading) {
    return (
      <div className="mes-commandes-loading">
        <div className="mes-commandes-spinner"></div>
        <p>Chargement de vos commandes...</p>
      </div>
    );
  }

  return (
    <div className="mes-commandes-container">
      <div className="mes-commandes-content">
        <div className="mes-commandes-header">
          <div>
            <h1 className="mes-commandes-title">Mes Commandes</h1>
            <p className="mes-commandes-subtitle">
              Historique de vos achats et réservations
            </p>
          </div>
          {/* Bouton pour accéder au panier */}
          <button
            onClick={() => navigate("/panier")}
            className="mes-commandes-btn-panier"
          >
            Voir mon panier
          </button>
        </div>

        {successMessage && (
          <div className="mes-commandes-success">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
            <p>{successMessage}</p>
          </div>
        )}
        {/* Afficher un message d'erreur en cas de problème lors du chargement des commandes */}
        {error && (
          <div className="mes-commandes-error-message">
            <p>{error}</p>
          </div>
        )}
        {/* Afficher un message si aucune commande n'est trouvée */}
        {commandes.length === 0 ? (
          <div className="mes-commandes-empty">
            <p className="mes-commandes-empty-text">
              Vous n'avez aucune commande
            </p>
            <div className="mes-commandes-empty-actions">
              <button
                onClick={() => navigate("/catalogue/neuve")}
                className="mes-commandes-btn mes-commandes-btn-primary"
              >
                Découvrir nos voitures
              </button>
              <button
                onClick={() => navigate("/accessoires")}
                className="mes-commandes-btn mes-commandes-btn-secondary"
              >
                Découvrir nos accessoires
              </button>
            </div>
          </div>
        ) : (
          // Afficher la liste des commandes de l'utilisateur 
          <div className="mes-commandes-list">
            {commandes.map((commande) => (
              <div key={commande._id} className="commande-card">
                <div className="commande-item">
                  <div className="commande-header">
                    <div>
                      <h3 className="commande-numero">
                        Commande #{commande._id.slice(-8)}
                      </h3>
                      <p className="commande-date">
                        {formatDate(commande.date_commande)}
                      </p>
                    </div>
                    {getStatusBadge(
                      commande.status,
                      commande.acompte,
                      commande.prix,
                    )}
                  </div>

                  <div className="commande-details">
                    <div className="commande-detail-item">
                      <span className="commande-label">Prix total:</span>
                      <span className="commande-value commande-price">
                        {formatPrice(commande.prix)}
                      </span>
                    </div>

                    {commande.acompte > 0 && (
                      <div className="commande-detail-item">
                        <span className="commande-label">Acompte versé:</span>
                        <span className="commande-value">
                          {formatPrice(commande.acompte)}
                        </span>
                      </div>
                    )}

                    {commande.acompte > 0 &&
                      commande.prix - commande.acompte > 0 && (
                        <div className="commande-detail-item">
                          <span className="commande-label">
                            Restant à payer:
                          </span>
                          <span className="commande-value commande-restant">
                            {formatPrice(commande.prix - commande.acompte)}
                          </span>
                        </div>
                      )}

                    {commande.lignesCommande &&
                      commande.lignesCommande.length > 0 && (
                        <div className="commande-detail-item">
                          <span className="commande-label">Articles:</span>
                          <span className="commande-value">
                            {commande.lignesCommande.length} article
                            {commande.lignesCommande.length > 1 ? "s" : ""}
                          </span>
                        </div>
                      )}

                    {commande.factureUrl && (
                      <div className="commande-detail-item">
                        <a
                          href={commande.factureUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="commande-facture-link"
                        >
                          Télécharger la facture
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mes-commandes-info">
          <h3>Informations sur vos commandes</h3>
          <ul>
            <li>
              <strong>Voiture neuve</strong>: Acompte de 10% requis à la
              commande
            </li>
            <li>
              <strong>Accessoires</strong>: Paiement intégral à la commande
            </li>
            <li>Une fois validée, votre commande sera traitée dans les 48h</li>
            <li>Pour toute question, contactez notre service client</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MesCommandes;
