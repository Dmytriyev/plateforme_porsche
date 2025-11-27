// - Tableau de bord utilisateur avec gestion des réservations, commandes et voitures.
// - Montre l'usage de plusieurs services (commandeService, maVoitureService) pour récupérer et gérer les données utilisateur.
// - Utilisation de useContext pour accéder aux informations d'authentification et de rôle utilisateur.
// - Gestion des états de chargement, erreurs et succès avec useState et useEffect.
import Loading from "../components/common/Loading.jsx";
import { API_URL } from "../config/api.js";
import { AuthContext } from "../context/AuthContext.jsx";
import "../css/components/Message.css";
import "../css/MonCompte.css";
import commandeService from "../services/commande.service.js";
import maVoitureService from "../services/ma_voiture.service.js";
import buildUrl from "../utils/buildUrl";
import ImageWithFallback from "../components/common/ImageWithFallback.jsx";
import { formatPrice, formatDate } from "../utils/helpers.js";
import { useState, useEffect, useCallback, useContext, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
// Bloc de gestion des achats pour les administrateurs.
const GestionAchatsBlock = ({ commandes }) => {
  const [sortBy, setSortBy] = useState("date"); // date, user
  const [sortOrder, setSortOrder] = useState("desc");
  // Tri et filtrage des achats.
  const achats = useMemo(() => {
    return commandes.filter((cmd) => cmd.status === true);
  }, [commandes]);
  // Achats triés selon les critères sélectionnés.
  const achatsTries = useMemo(() => {
    const sorted = [...achats];
    // Tri personnalisé selon le critère choisi.
    sorted.sort((a, b) => {
      let comparison = 0;
      // Définition du critère de tri.
      switch (sortBy) {
        case "date":
          comparison = new Date(b.date_commande) - new Date(a.date_commande);
          break;
        case "user": {
          const nameA =
            `${a.user?.nom || ""} ${a.user?.prenom || ""}`.toLowerCase();
          const nameB =
            `${b.user?.nom || ""} ${b.user?.prenom || ""}`.toLowerCase();
          comparison = nameA.localeCompare(nameB);
          break;
        }
        default:
          comparison = 0;
      }

      return sortOrder === "asc" ? -comparison : comparison;
    });

    return sorted;
  }, [achats, sortBy, sortOrder]);

  const toggleSort = (type) => {
    if (sortBy === type) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(type);
      setSortOrder("desc");
    }
  };

  return (
    <div className="mon-compte-block mon-compte-admin-block">
      <div className="mon-compte-block-header">
        <h2 className="mon-compte-block-title">Gestion des achats</h2>
        <p className="mon-compte-admin-subtitle">
          Tous les achats effectués par les utilisateurs ({achats.length}{" "}
          commande{achats.length > 1 ? "s" : ""})
        </p>
      </div>

      <div className="gestion-achats-filters">
        <button
          className={`gestion-achats-filter-btn ${sortBy === "date" ? "active" : ""}`}
          onClick={() => toggleSort("date")}
        >
          Par date
          {sortBy === "date" && (
            <span className="sort-arrow">
              {sortOrder === "asc" ? "↑" : "↓"}
            </span>
          )}
        </button>
        <button
          className={`gestion-achats-filter-btn ${sortBy === "user" ? "active" : ""}`}
          onClick={() => toggleSort("user")}
        >
          Par utilisateur
          {sortBy === "user" && (
            <span className="sort-arrow">
              {sortOrder === "asc" ? "↑" : "↓"}
            </span>
          )}
        </button>
      </div>

      {achatsTries.length === 0 ? (
        <div className="mon-compte-block-empty">
          <p className="mon-compte-block-empty-text">
            Aucun achat effectué pour le moment
          </p>
        </div>
      ) : (
        <div className="gestion-achats-list">
          {achatsTries.map((achat) => (
            <div key={achat._id} className="gestion-achat-card">
              <div className="gestion-achat-header">
                <div className="gestion-achat-numero">
                  <span className="gestion-achat-label">Commande</span>
                  <span className="gestion-achat-value">
                    #{achat._id.slice(-8)}
                  </span>
                </div>
                <div className="gestion-achat-date">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  {formatDate(achat.date_commande)}
                </div>
              </div>

              <div className="gestion-achat-body">
                <div className="gestion-achat-user">
                  <div className="gestion-achat-user-icon">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <div className="gestion-achat-user-info">
                    <p className="gestion-achat-user-name">
                      {achat.user?.prenom} {achat.user?.nom}
                    </p>
                    {achat.user?.email && (
                      <p className="gestion-achat-user-email">
                        {achat.user.email}
                      </p>
                    )}
                    {achat.user?.telephone && (
                      <p className="gestion-achat-user-phone">
                        {achat.user.telephone}
                      </p>
                    )}
                  </div>
                </div>

                {achat.lignesCommande && achat.lignesCommande.length > 0 && (
                  <div className="gestion-achat-produits">
                    <h4 className="gestion-achat-produits-title">Produits:</h4>
                    <ul className="gestion-achat-produits-list">
                      {achat.lignesCommande.map((ligne, index) => (
                        <li key={index} className="gestion-achat-produit-item">
                          {ligne.model_porsche_id && (
                            <span className="gestion-achat-produit-nom">
                              {" "}
                              {ligne.model_porsche_id.voiture?.nom_model ||
                                ligne.model_porsche_id.nom_model ||
                                "Voiture neuve"}
                            </span>
                          )}
                          {ligne.voiture && !ligne.model_porsche_id && (
                            <span className="gestion-achat-produit-nom">
                              {ligne.voiture.nom_model} (
                              {ligne.voiture.type_voiture || "Occasion"})
                            </span>
                          )}
                          {ligne.accesoire && (
                            <span className="gestion-achat-produit-nom">
                              🔧 {ligne.accesoire.nom_accesoire}
                              {ligne.quantite > 1 && ` (x${ligne.quantite})`}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="gestion-achat-prix">
                  <p className="gestion-achat-total">
                    <strong>Prix total:</strong> {formatPrice(achat.prix)}
                  </p>
                </div>

                {achat.factureUrl && (
                  <div className="gestion-achat-facture">
                    <a
                      href={achat.factureUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="gestion-achat-btn-facture"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                        <line x1="16" y1="13" x2="8" y2="13" />
                        <line x1="16" y1="17" x2="8" y2="17" />
                        <polyline points="10 9 9 9 8 9" />
                      </svg>
                      Télécharger la facture
                    </a>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Mobile toolbar: small round buttons shown on tablet / mobile
const MobileToolbar = ({ activeSection, setActiveSection, navigate, handleLogout, isStaff }) => {
  return (
    <div className="mon-compte-mobile-toolbar" role="toolbar" aria-label="Navigation mobile">
      <button
        className={`mon-compte-mobile-btn ${activeSection === "mes-produits" ? "active" : ""}`}
        onClick={() => setActiveSection("mes-produits")}
        aria-label="Mes produits"
        title="Mes produits"
        aria-pressed={activeSection === "mes-produits"}
        aria-current={activeSection === "mes-produits" ? "true" : undefined}
        tabIndex={0}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      </button>

      <button
        className={`mon-compte-mobile-btn`}
        onClick={() => navigate('/mes-commandes')}
        aria-label="Mes commandes"
        title="Mes commandes"
        aria-pressed={false}
        tabIndex={0}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
          <line x1="3" y1="6" x2="21" y2="6" />
          <path d="M16 10a4 4 0 0 1-8 0" />
        </svg>
      </button>

      <button
        className={`mon-compte-mobile-btn ${activeSection === "parametres" ? "active" : ""}`}
        onClick={() => setActiveSection('parametres')}
        aria-label="Paramètres"
        title="Paramètres"
        aria-pressed={activeSection === "parametres"}
        aria-current={activeSection === "parametres" ? "true" : undefined}
        tabIndex={0}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </button>

      <button
        className={`mon-compte-mobile-btn ${activeSection === "paiement" ? "active" : ""}`}
        onClick={() => setActiveSection('paiement')}
        aria-label="Paiement"
        title="Paiement"
        aria-pressed={activeSection === "paiement"}
        aria-current={activeSection === "paiement" ? "true" : undefined}
        tabIndex={0}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
          <line x1="1" y1="10" x2="23" y2="10" />
        </svg>
      </button>

      <button
        className={`mon-compte-mobile-btn mon-compte-mobile-btn-logout`}
        onClick={handleLogout}
        aria-label="Déconnexion"
        title="Déconnexion"
        aria-pressed={false}
        tabIndex={0}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
          <polyline points="16 17 21 12 16 7" />
          <line x1="21" y1="12" x2="9" y2="12" />
        </svg>
      </button>
    </div>
  );
};
// Page : dashboard utilisateur (infos, commandes, réservations, voitures). Requiert authentification.
const MonCompte = () => {
  const navigate = useNavigate();
  const { user, logout, isStaff } = useContext(AuthContext);

  // Memoize staff flag to avoid repeated calls to isStaff()
  const staff = useMemo(() => !!isStaff && isStaff(), [isStaff]);

  // Mounted ref to avoid setting state on unmounted component
  const mountedRef = useRef(true);
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const [activeSection, setActiveSection] = useState("mes-produits");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [reservations, setReservations] = useState([]);
  const [commandes, setCommandes] = useState([]);
  const [mesVoitures, setMesVoitures] = useState([]);
  const [userData, setUserData] = useState(null);

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const userId = user?._id || user?.id;

      const promises = [
        staff
          ? commandeService.getAllReservations().catch(() => [])
          : userId
            ? commandeService.getMyReservations(userId).catch(() => [])
            : Promise.resolve([]),
        staff
          ? commandeService.getAllCommandes().catch(() => [])
          : commandeService.getMyCommandes().catch(() => []),
        maVoitureService.getMesVoitures().catch(() => []),
      ];

      const [reservationsData, commandesData, mesVoituresData] =
        await Promise.all(promises);

      if (!mountedRef.current) return;

      setReservations(Array.isArray(reservationsData) ? reservationsData : []);
      setCommandes(Array.isArray(commandesData) ? commandesData : []);
      setMesVoitures(Array.isArray(mesVoituresData) ? mesVoituresData : []);
      setUserData(user);
    } catch (err) {
      if (!mountedRef.current) return;
      setError(err.message || "Erreur lors du chargement des données");
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [user, staff]);

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user, fetchAllData]);

  const handleLogout = () => {
    if (window.confirm("Êtes-vous sûr de vouloir vous déconnecter ?")) {
      logout();
      navigate("/login");
    }
  };

  const handleAnnulerReservation = async (id) => {
    if (
      !window.confirm("Êtes-vous sûr de vouloir annuler cette réservation ?")
    ) {
      return;
    }

    try {
      await commandeService.cancelReservation(id);
      setSuccess("Réservation annulée avec succès");
      setTimeout(() => setSuccess(""), 3000);
      fetchAllData();
    } catch (err) {
      setError(err.message || "Erreur lors de l'annulation");
    }
  };

  const handleAccepterReservation = async (id) => {
    if (
      !window.confirm("Êtes-vous sûr de vouloir accepter cette réservation ?")
    ) {
      return;
    }

    try {
      await commandeService.acceptReservation(id);
      setSuccess("Réservation acceptée avec succès");
      setTimeout(() => setSuccess(""), 3000);
      fetchAllData();
    } catch (err) {
      setError(err.message || "Erreur lors de l'acceptation");
    }
  };

  const handleRefuserReservation = async (id) => {
    if (
      !window.confirm("Êtes-vous sûr de vouloir refuser cette réservation ?")
    ) {
      return;
    }

    try {
      await commandeService.refuseReservation(id);
      setSuccess("Réservation refusée avec succès");
      setTimeout(() => setSuccess(""), 3000);
      fetchAllData();
    } catch (err) {
      setError(err.message || "Erreur lors du refus");
    }
  };

  if (!user) {
    return (
      <div className="mon-compte-error">
        <p>Vous devez être connecté pour accéder à cette page</p>
        <button onClick={() => navigate("/login")}>Se connecter</button>
      </div>
    );
  }

  if (loading) {
    return <Loading fullScreen message="Chargement de votre compte..." />;
  }

  return (
    <div className="mon-compte-container">
      {/* Sidebar Navigation */}
      <aside className="mon-compte-sidebar">
        {/* Message de bienvenue */}
        {userData && (
          <div className="mon-compte-welcome">
            <p className="mon-compte-welcome-text">
              Bonjour, {userData.prenom || userData.nom || "Utilisateur"}
            </p>
          </div>
        )}
        <nav className="mon-compte-nav">
          <button
            className={`mon-compte-nav-item ${activeSection === "mes-produits" ? "active" : ""}`}
            onClick={() => setActiveSection("mes-produits")}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span>Mes produits</span>
          </button>

          <button
            className="mon-compte-nav-item"
            onClick={() => navigate("/mes-commandes")}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <span>Mes commandes</span>
          </button>

          <button
            className={`mon-compte-nav-item ${activeSection === "parametres" ? "active" : ""}`}
            onClick={() => setActiveSection("parametres")}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>Paramètres de votre compte</span>
          </button>

          <button
            className={`mon-compte-nav-item ${activeSection === "paiement" ? "active" : ""}`}
            onClick={() => setActiveSection("paiement")}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
            <span>Mode de paiement</span>
          </button>

          <button
            className="mon-compte-nav-item mon-compte-nav-logout"
            onClick={handleLogout}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Déconnexion</span>
          </button>
        </nav>
      </aside>

      <main className="mon-compte-main">
        {error && (
          <div className="mon-compte-messages">
            <div className="message-box message-error">
              <p>{error}</p>
            </div>
          </div>
        )}
        {success && (
          <div className="mon-compte-messages">
            <div className="message-box message-success">
              <p>{success}</p>
            </div>
          </div>
        )}

        {activeSection === "mes-produits" && (
          <div className="mon-compte-section">
            <h1 className="mon-compte-title">Mes produits</h1>

            {/* Mobile toolbar (visible on tablet/mobile via CSS) */}
            <MobileToolbar
              activeSection={activeSection}
              setActiveSection={setActiveSection}
              navigate={navigate}
              handleLogout={handleLogout}
              isStaff={staff}
            />

            <div className="mon-compte-block">
              <div className="mon-compte-block-header">
                <h2 className="mon-compte-block-title">
                  Mes réservations de voitures d'occasion
                </h2>
                <div className="mon-compte-block-actions">
                  <button
                    className="mon-compte-block-btn mon-compte-block-btn-primary"
                    onClick={() => navigate("/catalogue/occasion")}
                  >
                    Choisir une voiture d'occasion
                  </button>
                </div>
              </div>

              {reservations.length === 0 ? (
                <div className="mon-compte-block-empty">
                  <p className="mon-compte-block-empty-text">
                    Aucune réservation pour le moment
                  </p>
                </div>
              ) : (
                <div className="mon-compte-reservations-list">
                  {reservations.map((reservation) => {
                    const modelPorsche = reservation.model_porsche;
                    const voitureBase = modelPorsche?.voiture;

                    const nomModele = voitureBase?.nom_model || "";
                    const nomVariante = modelPorsche?.nom_model || "";
                    const nomComplet =
                      `Porsche ${nomModele} ${nomVariante}`.trim();

                    const prix =
                      modelPorsche?.prix_base_variante ||
                      modelPorsche?.prix_base ||
                      0;

                    let photoPrincipale = null;
                    const photos =
                      modelPorsche?.photo_porsche || voitureBase?.photo_voiture;
                    if (Array.isArray(photos) && photos.length > 0) {
                      const validPhotos = photos.filter(
                        (p) => p && (p.name || p._id),
                      );
                      if (validPhotos.length > 2) {
                        photoPrincipale = validPhotos[2];
                      } else if (validPhotos.length > 0) {
                        photoPrincipale = validPhotos[0];
                      }
                    }

                    const modelPorscheId = modelPorsche?._id;

                    const reservationUser = reservation.user;
                    const concessionnaire =
                      modelPorsche?.concessionnaire || "Non spécifié";

                    const dateReservation = reservation.date_reservation
                      ? new Date(reservation.date_reservation)
                      : null;
                    const dateFormatted = dateReservation
                      ? dateReservation.toLocaleDateString("fr-FR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })
                      : "N/A";
                    const heureFormatted = dateReservation
                      ? dateReservation.toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                      : "N/A";

                    return (
                      <div
                        key={reservation._id}
                        className={`mon-compte-reservation-card ${staff ? "mon-compte-reservation-card-staff" : ""}`}
                      >
                        <ImageWithFallback
                          src={photoPrincipale && photoPrincipale.name ? buildUrl(photoPrincipale.name) : null}
                          alt={nomComplet}
                          imgClass="mon-compte-reservation-img"
                          placeholder={
                            <div className="mon-compte-reservation-placeholder">
                              <span>P</span>
                            </div>
                          }
                        />
                        <div className="mon-compte-reservation-info">
                          <h3 className="mon-compte-reservation-name">
                            {nomComplet}
                          </h3>

                          {staff && reservationUser && (
                            <div className="mon-compte-reservation-user-info">
                              <p className="mon-compte-reservation-user-label">
                                Client :
                              </p>
                              <p className="mon-compte-reservation-user-details">
                                {reservationUser.nom} {reservationUser.prenom}
                              </p>
                              <p className="mon-compte-reservation-user-contact">
                                {reservationUser.email}{" "}
                                {reservationUser.telephone &&
                                  `• ${reservationUser.telephone}`}
                              </p>
                            </div>
                          )}

                          {reservation.date_reservation && (
                            <p className="mon-compte-reservation-date">
                              {staff
                                ? `Réservation : ${dateFormatted} à ${heureFormatted}`
                                : `Date : ${dateFormatted} à ${heureFormatted}`}
                            </p>
                          )}

                          <p className="mon-compte-reservation-concessionnaire">
                            Concessionnaire : {concessionnaire}
                          </p>

                          <div className="mon-compte-reservation-status-container">
                            <span className="mon-compte-reservation-status-label">
                              Statut :
                            </span>
                            <span
                              className={`mon-compte-reservation-status-badge ${reservation.status ? "status-confirmed" : "status-cancelled"}`}
                            >
                              {reservation.status ? "Confirmée" : "Annulée"}
                            </span>
                          </div>

                          {prix > 0 && (
                            <p className="mon-compte-reservation-price">
                              {formatPrice(prix)}
                            </p>
                          )}
                        </div>
                        <div className="mon-compte-reservation-actions">
                          <button
                            className="mon-compte-reservation-btn mon-compte-reservation-btn-view"
                            onClick={() => {
                              if (modelPorscheId) {
                                navigate(`/occasion/${modelPorscheId}`);
                              }
                            }}
                          >
                            Voir
                          </button>

                          {staff ? (
                            <>
                              <button
                                className="mon-compte-reservation-btn mon-compte-reservation-btn-accept"
                                onClick={() =>
                                  handleAccepterReservation(reservation._id)
                                }
                              >
                                Accepter
                              </button>
                              <button
                                className="mon-compte-reservation-btn mon-compte-reservation-btn-refuse"
                                onClick={() =>
                                  handleRefuserReservation(reservation._id)
                                }
                              >
                                Refuser
                              </button>
                            </>
                          ) : (
                            <button
                              className="mon-compte-reservation-btn mon-compte-reservation-btn-delete"
                              onClick={() =>
                                handleAnnulerReservation(reservation._id)
                              }
                            >
                              Supprimer
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Bloc Mes Voitures */}
            <div className="mon-compte-block">
              <div className="mon-compte-block-header">
                <h2 className="mon-compte-block-title">Mes voitures</h2>
                <div className="mon-compte-block-actions">
                  <button
                    className="mon-compte-block-btn mon-compte-block-btn-primary"
                    onClick={() => navigate("/ajouter-ma-voiture")}
                  >
                    Ajouter ma voiture
                  </button>
                </div>
              </div>

              {mesVoitures.length === 0 ? (
                <div className="mon-compte-block-empty">
                  <p className="mon-compte-block-empty-text">
                    Aucune voiture ajoutée pour le moment
                  </p>
                </div>
              ) : (
                <div className="mon-compte-reservations-list">
                  {mesVoitures.map((voiture) => {
                    const modelPorsche = voiture.model_porsche;
                    const nomModele =
                      modelPorsche?.nom_model || voiture.nom_model || "";
                    const typeCarrosserie =
                      modelPorsche?.type_carrosserie ||
                      voiture.type_carrosserie ||
                      "";
                    const nomComplet =
                      `Porsche ${nomModele} ${typeCarrosserie}`.trim();

                    let photoPrincipale = null;
                    const photos = voiture.photo_voiture_actuel;
                    if (Array.isArray(photos) && photos.length > 0) {
                      const validPhotos = photos.filter(
                        (p) => p && (p.name || p._id),
                      );
                      if (validPhotos.length > 0) {
                        photoPrincipale = validPhotos[0];
                      }
                    }

                    return (
                      <div
                        key={voiture._id}
                        className="mon-compte-reservation-card"
                      >
                        <ImageWithFallback
                          src={photoPrincipale && photoPrincipale.name ? buildUrl(photoPrincipale.name) : null}
                          alt={nomComplet}
                          imgClass="mon-compte-reservation-img"
                          placeholder={
                            <div className="mon-compte-reservation-placeholder">
                              <span>P</span>
                            </div>
                          }
                        />
                        <div className="mon-compte-reservation-info">
                          <h3 className="mon-compte-reservation-name">
                            {nomComplet}
                          </h3>

                          {voiture.annee && (
                            <p className="mon-compte-reservation-date">
                              Année : {voiture.annee}
                            </p>
                          )}

                          {voiture.kilometrage && (
                            <p className="mon-compte-reservation-concessionnaire">
                              Kilométrage :{" "}
                              {voiture.kilometrage.toLocaleString()} km
                            </p>
                          )}

                          {voiture.description && (
                            <p className="mon-compte-reservation-description">
                              {voiture.description.length > 100
                                ? `${voiture.description.substring(0, 100)}...`
                                : voiture.description}
                            </p>
                          )}
                        </div>
                        <div className="mon-compte-reservation-actions">
                          <button
                            className="mon-compte-reservation-btn mon-compte-reservation-btn-view"
                            onClick={() =>
                              navigate(`/mes-voitures/${voiture._id}`)
                            }
                          >
                            Voir
                          </button>
                          <button
                            className="mon-compte-reservation-btn mon-compte-reservation-btn-view"
                            onClick={() =>
                              navigate(`/mes-voitures/${voiture._id}/modifier`)
                            }
                          >
                            Modifier
                          </button>
                          <button
                            className="mon-compte-reservation-btn mon-compte-reservation-btn-delete"
                            onClick={async () => {
                              if (
                                window.confirm(
                                  "Êtes-vous sûr de vouloir supprimer cette voiture ?",
                                )
                              ) {
                                try {
                                  await maVoitureService.supprimerMaVoiture(
                                    voiture._id,
                                  );
                                  setSuccess("Voiture supprimée avec succès");
                                  setTimeout(() => setSuccess(""), 3000);
                                  fetchAllData();
                                } catch (err) {
                                  setError(
                                    err.message ||
                                    "Erreur lors de la suppression",
                                  );
                                }
                              }
                            }}
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {staff && (
              <GestionAchatsBlock commandes={commandes} />
            )}

            {staff && (
              <div className="mon-compte-block mon-compte-admin-block">
                <div className="mon-compte-block-header">
                  <h2 className="mon-compte-block-title">Gestion anonces</h2>
                  <p className="mon-compte-admin-subtitle">
                    Gérez les voitures d'occasion disponibles sur la plateforme
                  </p>
                </div>

                <div className="mon-compte-admin-actions">
                  <button
                    className="mon-compte-admin-btn mon-compte-admin-btn-add"
                    onClick={() => navigate("/occasion/ajouter")}
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
                    Ajouter une voiture Occasion
                  </button>
                  <button
                    className="mon-compte-admin-btn mon-compte-admin-btn-manage"
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
          </div>
        )}

        {activeSection === "parametres" && (
          <div className="mon-compte-section">
            <h1 className="mon-compte-title">Paramètres de votre compte</h1>

            <div className="mon-compte-settings">
              {userData && (
                <div className="mon-compte-settings-group">
                  <h2 className="mon-compte-settings-title">
                    Informations personnelles
                  </h2>

                  <div className="mon-compte-settings-item">
                    <span className="mon-compte-settings-label">
                      Nom complet
                    </span>
                    <p className="mon-compte-settings-value">
                      {userData.prenom} {userData.nom}
                    </p>
                  </div>

                  <div className="mon-compte-settings-item">
                    <span className="mon-compte-settings-label">Email</span>
                    <p className="mon-compte-settings-value">
                      {userData.email}
                    </p>
                  </div>

                  {userData.telephone && (
                    <div className="mon-compte-settings-item">
                      <span className="mon-compte-settings-label">
                        Téléphone
                      </span>
                      <p className="mon-compte-settings-value">
                        {userData.telephone}
                      </p>
                    </div>
                  )}

                  {userData.adresse && (
                    <div className="mon-compte-settings-item">
                      <span className="mon-compte-settings-label">Adresse</span>
                      <p className="mon-compte-settings-value">
                        {userData.adresse}
                        {userData.code_postal && `, ${userData.code_postal}`}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="mon-compte-settings-actions">
                <button
                  className="mon-compte-settings-btn"
                  onClick={() => navigate("/mon-compte/modifier")}
                >
                  Modifier mes informations
                </button>
              </div>
            </div>
          </div>
        )}

        {activeSection === "paiement" && (
          <div className="mon-compte-section">
            <h1 className="mon-compte-title">Mode de paiement</h1>

            <div className="mon-compte-payment">
              <div className="mon-compte-payment-empty">
                <svg
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="mon-compte-payment-icon"
                >
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
                <p className="mon-compte-payment-text">
                  Aucun mode de paiement enregistré
                </p>
                <button
                  className="mon-compte-payment-btn"
                  onClick={() => navigate("/paiement/ajouter")}
                >
                  Ajouter un mode de paiement
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default MonCompte;
