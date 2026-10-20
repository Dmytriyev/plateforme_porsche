/**
 * - Tableau de bord utilisateur avec gestion des réservations, commandes et voitures. 
 * - séparation sidebar/main, extraction de sous-composants mémorisés
 * - useCallback pour les handlers, useMemo pour les calculs coûteux
 * - useState pour UI locale, useContext pour auth globale, useRef pour mounted state
 * - mémorisation des composants avec React.memo
 */
import Loading from "../components/common/Loading.jsx";
import { AuthContext } from "../context/AuthContext.jsx";
import "../css/components/Message.css";
import "../css/MonCompte.css";
import commandeService from "../services/commande.service.js";
import maVoitureService from "../services/ma_voiture.service.js";
import buildUrl from "../utils/buildUrl";
import ImageWithFallback from "../components/common/ImageWithFallback.jsx";
import { formatPrice, formatDate } from "../utils/helpers.js";
import { useState, useEffect, useCallback, useContext, useMemo, useRef, memo } from "react";
import { useNavigate } from "react-router-dom";

const selectMainPhoto = (photos, preferThird = false) => {
  if (!Array.isArray(photos) || photos.length === 0) return null;
  const validPhotos = photos.filter((p) => p && (p.name || p._id));
  if (validPhotos.length === 0) return null;
  // Si preferThird = true, privilégier la 3ème photo (réservations)
  // Sinon, prendre la première photo (mes voitures)
  if (preferThird && validPhotos.length > 2) {
    return validPhotos[2];
  }
  return validPhotos[0];
};

/**
 * Construit le nom complet d'un modèle Porsche.
 * Combine marque + modèle + variante de manière sécurisée.
 * 
 * @param {string} nomModele - Nom du modèle (ex: "911")
 * @param {string} nomVariante - Nom de la variante (ex: "Carrera S")
 * @returns {string} - Nom complet (ex: "Porsche 911 Carrera S")
 */
const buildPorscheName = (nomModele = "", nomVariante = "") => {
  return `Porsche ${nomModele} ${nomVariante}`.trim();
};

/**
 * Messages d'erreur standardisés pour l'UX.
 * Évite d'exposer des détails techniques (RGPD, sécurité).
 */
const ERROR_MESSAGES = {
  FETCH_DATA: "Impossible de charger vos données. Veuillez réessayer.",
  CANCEL_RESERVATION: "Impossible d'annuler la réservation. Veuillez réessayer.",
  ACCEPT_RESERVATION: "Impossible d'accepter la réservation. Veuillez réessayer.",
  REFUSE_RESERVATION: "Impossible de refuser la réservation. Veuillez réessayer.",
  DELETE_CAR: "Impossible de supprimer la voiture. Veuillez réessayer.",
};

const SUCCESS_MESSAGES = {
  CANCEL_RESERVATION: "Réservation annulée avec succès",
  ACCEPT_RESERVATION: "Réservation acceptée avec succès",
  REFUSE_RESERVATION: "Réservation refusée avec succès",
  DELETE_CAR: "Voiture supprimée avec succès",
};

// Durée d'affichage des messages de succès (en ms)
const SUCCESS_MESSAGE_DURATION = 3000;


/**
 * Composant mémorisé pour la gestion des achats (admin uniquement).
 * 
 * 🎯 Optimisation : React.memo évite le re-render si `commandes` n'a pas changé.
 * 💡 Performance : Tri et filtrage mémorisés avec useMemo pour éviter recalculs inutiles.
 * 
 * @param {Array} commandes - Liste de toutes les commandes
 */
const GestionAchatsBlock = memo(({ commandes }) => {
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

  // Mémorisation du handler pour éviter sa recréation à chaque render
  const toggleSort = useCallback((type) => {
    setSortBy((prevSortBy) => {
      if (prevSortBy === type) {
        // Si même critère, inverser l'ordre
        setSortOrder((prev) => prev === "asc" ? "desc" : "asc");
        return prevSortBy;
      }
      // Nouveau critère, reset ordre à desc
      setSortOrder("desc");
      return type;
    });
  }, []);

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
});

// Display name pour React DevTools (facilite le debugging)
GestionAchatsBlock.displayName = "GestionAchatsBlock";

/**
 * Barre d'outils mobile pour la navigation (visible sur tablettes/mobiles).
 * 
 * 🎯 Responsive Design : composant affiché uniquement sur petits écrans via CSS.
 * ♿ Accessibilité : aria-labels, aria-pressed, tabIndex pour navigation clavier.
 * 
 * @param {string} activeSection - Section actuellement active
 * @param {Function} setActiveSection - Setter pour changer de section
 * @param {Function} navigate - Hook de navigation React Router
 * @param {Function} handleLogout - Handler de déconnexion
 */
const MobileToolbar = memo(({ activeSection, setActiveSection, navigate, handleLogout }) => {
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
});

MobileToolbar.displayName = "MobileToolbar";


/**
 * Page MonCompte — Dashboard utilisateur avec gestion complète du compte.
 * 
 *  Sécurité : requiert authentification (redirect si pas de user).
 *  Features : réservations, commandes, voitures personnelles, paramètres.
 *  Admin : features additionnelles (gestion achats, ajout voitures occasion).
 */
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

  /**
   * Récupère toutes les données utilisateur en parallèle.
   * 
   * 🚀 Performance : Promise.all pour appels API parallèles (plus rapide que séquentiel).
   * 🛡️ Sécurité : chaque promesse a son propre catch pour éviter échec complet.
   * ♻️ Memory leak prevention : vérification de mountedRef avant setState.
   * 
   * 💡 Pourquoi Promise.all ?
   * - 3 appels indépendants → gain de temps significatif
   * - Fallback sur [] si erreur individuelle → UX dégradée mais pas bloquée
   */
  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const userId = user?._id || user?.id;

      // 🔄 Appels API parallèles avec fallback sur tableau vide
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

      // ⚠️ Protection contre memory leak (component unmounted pendant l'appel)
      if (!mountedRef.current) return;

      // 🔒 Validation des types avant setState (defensive programming)
      setReservations(Array.isArray(reservationsData) ? reservationsData : []);
      setCommandes(Array.isArray(commandesData) ? commandesData : []);
      setMesVoitures(Array.isArray(mesVoituresData) ? mesVoituresData : []);
      setUserData(user);
    } catch (err) {
      if (!mountedRef.current) return;
      // 🔐 RGPD : message générique sans détails techniques
      setError(ERROR_MESSAGES.FETCH_DATA);
      console.error("[MonCompte] Erreur chargement données:", err);
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

  /**
   * Factory générique pour créer des handlers d'actions sur réservations.
   * 
   *  DRY Principle : mutualise la logique commune (confirm, try/catch, success, refresh).
   * Pattern Factory : génère des handlers spécialisés depuis un template.
   * 
   * @param {Function} serviceMethod - Méthode du service à appeler
   * @param {string} confirmMessage - Message de confirmation
   * @param {string} successMessage - Message de succès
   * @param {string} errorMessage - Message d'erreur
   * @returns {Function} - Handler async prêt à l'emploi
   */
  const createReservationHandler = useCallback(
    (serviceMethod, confirmMessage, successMessage, errorMessage) =>
      async (id) => {
        if (!window.confirm(confirmMessage)) return;

        try {
          await serviceMethod(id);
          setSuccess(successMessage);
          setTimeout(() => setSuccess(""), SUCCESS_MESSAGE_DURATION);
          fetchAllData();
        } catch (err) {
          setError(errorMessage);
          console.error(`[MonCompte] Erreur réservation ${id}:`, err);
        }
      },
    [fetchAllData]
  );

  // 🎨 Handlers spécialisés créés via factory (moins de duplication)
  const handleAnnulerReservation = useMemo(
    () =>
      createReservationHandler(
        commandeService.cancelReservation,
        "Êtes-vous sûr de vouloir annuler cette réservation ?",
        SUCCESS_MESSAGES.CANCEL_RESERVATION,
        ERROR_MESSAGES.CANCEL_RESERVATION
      ),
    [createReservationHandler]
  );

  const handleAccepterReservation = useMemo(
    () =>
      createReservationHandler(
        commandeService.acceptReservation,
        "Êtes-vous sûr de vouloir accepter cette réservation ?",
        SUCCESS_MESSAGES.ACCEPT_RESERVATION,
        ERROR_MESSAGES.ACCEPT_RESERVATION
      ),
    [createReservationHandler]
  );

  const handleRefuserReservation = useMemo(
    () =>
      createReservationHandler(
        commandeService.refuseReservation,
        "Êtes-vous sûr de vouloir refuser cette réservation ?",
        SUCCESS_MESSAGES.REFUSE_RESERVATION,
        ERROR_MESSAGES.REFUSE_RESERVATION
      ),
    [createReservationHandler]
  );

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
                    // 🔍 Extraction des données de la réservation
                    const modelPorsche = reservation.model_porsche;
                    const voitureBase = modelPorsche?.voiture;

                    // 🏷️ Nom complet via fonction utilitaire
                    const nomComplet = buildPorscheName(
                      voitureBase?.nom_model,
                      modelPorsche?.nom_model
                    );

                    // 💰 Prix avec fallback sur 0
                    const prix =
                      modelPorsche?.prix_base_variante ||
                      modelPorsche?.prix_base ||
                      0;

                    // 📸 Photo principale via fonction utilitaire (3ème photo pour réservations)
                    const photos =
                      modelPorsche?.photo_porsche || voitureBase?.photo_voiture;
                    const photoPrincipale = selectMainPhoto(photos, true);

                    // 🔑 Données complémentaires
                    const modelPorscheId = modelPorsche?._id;
                    const reservationUser = reservation.user;
                    const concessionnaire =
                      modelPorsche?.concessionnaire || "Non spécifié";

                    // 📅 Formatage de la date avec helper unifié
                    const dateFormatted = reservation.date_reservation
                      ? formatDate(reservation.date_reservation)
                      : "N/A";

                    // ⏰ Heure séparée pour affichage précis
                    const heureFormatted = reservation.date_reservation
                      ? new Date(reservation.date_reservation).toLocaleTimeString("fr-FR", {
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
                            onClick={() => modelPorscheId && navigate(`/occasion/${modelPorscheId}`)}
                            disabled={!modelPorscheId}
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
                    // 🚗 Extraction des données de la voiture
                    const modelPorsche = voiture.model_porsche;
                    const nomModele =
                      modelPorsche?.nom_model || voiture.nom_model || "";
                    const typeCarrosserie =
                      modelPorsche?.type_carrosserie ||
                      voiture.type_carrosserie ||
                      "";

                    // 🏷️ Nom complet via fonction utilitaire
                    const nomComplet = buildPorscheName(nomModele, typeCarrosserie);

                    // 📸 Photo principale (première photo pour mes voitures)
                    const photoPrincipale = selectMainPhoto(voiture.photo_voiture_actuel, false);

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
                              if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette voiture ?")) return;

                              try {
                                await maVoitureService.supprimerMaVoiture(voiture._id);
                                setSuccess(SUCCESS_MESSAGES.DELETE_CAR);
                                setTimeout(() => setSuccess(""), SUCCESS_MESSAGE_DURATION);
                                fetchAllData();
                              } catch (err) {
                                setError(ERROR_MESSAGES.DELETE_CAR);
                                console.error(`[MonCompte] Erreur suppression voiture ${voiture._id}:`, err);
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
      </main>
    </div>
  );
};

export default MonCompte;
