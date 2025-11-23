import { useState, useEffect, useCallback, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { commandeService } from '../services';
import { Loading } from '../components/common';
import { API_URL } from '../config/api.js';
import buildUrl from '../utils/buildUrl';
import { formatPrice, formatDate } from '../utils/format.js';
import '../css/MonCompte.css';
import '../css/components/Message.css';

/**
 * Composant Gestion des Achats pour Staff/Admin
 */
const GestionAchatsBlock = ({ commandes }) => {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState('date'); // date, user
  const [sortOrder, setSortOrder] = useState('desc'); // asc, desc

  // Filtrer uniquement les commandes validées (achats effectués)
  const achats = useMemo(() => {
    return commandes.filter(cmd => cmd.status === true);
  }, [commandes]);

  // Trier les achats
  const achatsTries = useMemo(() => {
    const sorted = [...achats];

    sorted.sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'date':
          comparison = new Date(b.date_commande) - new Date(a.date_commande);
          break;
        case 'user':
          const nameA = `${a.user?.nom || ''} ${a.user?.prenom || ''}`.toLowerCase();
          const nameB = `${b.user?.nom || ''} ${b.user?.prenom || ''}`.toLowerCase();
          comparison = nameA.localeCompare(nameB);
          break;
        default:
          comparison = 0;
      }

      return sortOrder === 'asc' ? -comparison : comparison;
    });

    return sorted;
  }, [achats, sortBy, sortOrder]);

  const toggleSort = (type) => {
    if (sortBy === type) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(type);
      setSortOrder('desc');
    }
  };

  return (
    <div className="mon-compte-block mon-compte-admin-block">
      <div className="mon-compte-block-header">
        <h2 className="mon-compte-block-title">Gestion des achats</h2>
        <p className="mon-compte-admin-subtitle">
          Tous les achats effectués par les utilisateurs ({achats.length} commande{achats.length > 1 ? 's' : ''})
        </p>
      </div>

      {/* Filtres de tri */}
      <div className="gestion-achats-filters">
        <button
          className={`gestion-achats-filter-btn ${sortBy === 'date' ? 'active' : ''}`}
          onClick={() => toggleSort('date')}
        >
          Par date
          {sortBy === 'date' && (
            <span className="sort-arrow">{sortOrder === 'asc' ? '↑' : '↓'}</span>
          )}
        </button>
        <button
          className={`gestion-achats-filter-btn ${sortBy === 'user' ? 'active' : ''}`}
          onClick={() => toggleSort('user')}
        >
          Par utilisateur
          {sortBy === 'user' && (
            <span className="sort-arrow">{sortOrder === 'asc' ? '↑' : '↓'}</span>
          )}
        </button>
      </div>

      {/* Liste des achats */}
      {achatsTries.length === 0 ? (
        <div className="mon-compte-block-empty">
          <p className="mon-compte-block-empty-text">Aucun achat effectué pour le moment</p>
        </div>
      ) : (
        <div className="gestion-achats-list">
          {achatsTries.map((achat) => (
            <div key={achat._id} className="gestion-achat-card">
              <div className="gestion-achat-header">
                <div className="gestion-achat-numero">
                  <span className="gestion-achat-label">Commande</span>
                  <span className="gestion-achat-value">#{achat._id.slice(-8)}</span>
                </div>
                <div className="gestion-achat-date">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  {formatDate(achat.date_commande)}
                </div>
              </div>

              <div className="gestion-achat-body">
                {/* Informations utilisateur */}
                <div className="gestion-achat-user">
                  <div className="gestion-achat-user-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <div className="gestion-achat-user-info">
                    <p className="gestion-achat-user-name">
                      {achat.user?.prenom} {achat.user?.nom}
                    </p>
                    {achat.user?.email && (
                      <p className="gestion-achat-user-email">{achat.user.email}</p>
                    )}
                    {achat.user?.telephone && (
                      <p className="gestion-achat-user-phone">{achat.user.telephone}</p>
                    )}
                  </div>
                </div>

                {/* Produits commandés */}
                {achat.lignesCommande && achat.lignesCommande.length > 0 && (
                  <div className="gestion-achat-produits">
                    <h4 className="gestion-achat-produits-title">Produits:</h4>
                    <ul className="gestion-achat-produits-list">
                      {achat.lignesCommande.map((ligne, index) => (
                        <li key={index} className="gestion-achat-produit-item">
                          {ligne.model_porsche_id && (
                            <span className="gestion-achat-produit-nom">
                              🚗 {ligne.model_porsche_id.voiture?.nom_model || ligne.model_porsche_id.nom_model || 'Voiture neuve'}
                            </span>
                          )}
                          {ligne.voiture && !ligne.model_porsche_id && (
                            <span className="gestion-achat-produit-nom">
                              🚗 {ligne.voiture.nom_model} ({ligne.voiture.type_voiture || 'Occasion'})
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

                {/* Prix total */}
                <div className="gestion-achat-prix">
                  <p className="gestion-achat-total">
                    <strong>Prix total:</strong> {formatPrice(achat.prix)}
                  </p>
                </div>

                {/* Facture Stripe */}
                {achat.factureUrl && (
                  <div className="gestion-achat-facture">
                    <a
                      href={achat.factureUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="gestion-achat-btn-facture"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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

/**
 * Page Mon Compte - Design style Tesla/Connect Store
 * Inspiré de: https://connect-store.porsche.com/offer/fr/fr-FR/911_2026/products
 * 
 * EXPLICATION POUR ÉTUDIANT:
 * ==========================
 * Cette page permet à l'utilisateur de gérer son compte avec :
 * - Gestion de compte (paramètres)
 * - Gestion des réservations
 * - Gestion des achats (commandes)
 * - Gestion des voitures (mes Porsche)
 * 
 * Toutes les données proviennent de la base de données.
 */
const MonCompte = () => {
  const navigate = useNavigate();
  const { user, logout, isStaff } = useContext(AuthContext);

  const [activeSection, setActiveSection] = useState('mes-produits');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Données
  const [reservations, setReservations] = useState([]);
  const [commandes, setCommandes] = useState([]);
  const [userData, setUserData] = useState(null);

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      // Récupérer l'ID utilisateur (peut être _id ou id)
      const userId = user?._id || user?.id;

      // Récupérer toutes les données en parallèle
      // Pour staff/admin : récupérer toutes les réservations
      // Pour utilisateur normal : récupérer uniquement ses réservations
      const promises = [
        isStaff()
          ? commandeService.getAllReservations().catch(() => [])
          : userId ? commandeService.getMyReservations(userId).catch(() => []) : Promise.resolve([]),
        isStaff()
          ? commandeService.getAllCommandes().catch(() => [])
          : commandeService.getMyCommandes().catch(() => []),
      ];

      const [reservationsData, commandesData] = await Promise.all(promises);

      setReservations(Array.isArray(reservationsData) ? reservationsData : []);
      setCommandes(Array.isArray(commandesData) ? commandesData : []);
      setUserData(user);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchAllData();
    }
  }, [user, fetchAllData]);

  const handleLogout = () => {
    if (window.confirm('Êtes-vous sûr de vouloir vous déconnecter ?')) {
      logout();
      navigate('/login');
    }
  };

  const handleAnnulerReservation = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
      return;
    }

    try {
      await commandeService.cancelReservation(id);
      setSuccess('Réservation annulée avec succès');
      setTimeout(() => setSuccess(''), 3000);
      fetchAllData();
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'annulation');
    }
  };

  const handleAccepterReservation = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir accepter cette réservation ?')) {
      return;
    }

    try {
      await commandeService.acceptReservation(id);
      setSuccess('Réservation acceptée avec succès');
      setTimeout(() => setSuccess(''), 3000);
      fetchAllData();
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'acceptation');
    }
  };

  const handleRefuserReservation = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir refuser cette réservation ?')) {
      return;
    }

    try {
      await commandeService.refuseReservation(id);
      setSuccess('Réservation refusée avec succès');
      setTimeout(() => setSuccess(''), 3000);
      fetchAllData();
    } catch (err) {
      setError(err.message || 'Erreur lors du refus');
    }
  };

  if (!user) {
    return (
      <div className="mon-compte-error">
        <p>Vous devez être connecté pour accéder à cette page</p>
        <button onClick={() => navigate('/login')}>Se connecter</button>
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
              Bonjour, {userData.prenom || userData.nom || 'Utilisateur'}
            </p>
          </div>
        )}
        <nav className="mon-compte-nav">
          <button
            className={`mon-compte-nav-item ${activeSection === 'mes-produits' ? 'active' : ''}`}
            onClick={() => setActiveSection('mes-produits')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span>Mes produits</span>
          </button>

          <button
            className="mon-compte-nav-item"
            onClick={() => navigate('/mes-commandes')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <span>Mes commandes</span>
          </button>

          <button
            className={`mon-compte-nav-item ${activeSection === 'parametres' ? 'active' : ''}`}
            onClick={() => setActiveSection('parametres')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span>Paramètres de votre compte</span>
          </button>

          <button
            className={`mon-compte-nav-item ${activeSection === 'paiement' ? 'active' : ''}`}
            onClick={() => setActiveSection('paiement')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
            <span>Mode de paiement</span>
          </button>

          <button
            className="mon-compte-nav-item mon-compte-nav-logout"
            onClick={handleLogout}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span>Déconnexion</span>
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="mon-compte-main">
        {/* Messages */}
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

        {/* Section: Mes produits */}
        {activeSection === 'mes-produits' && (
          <div className="mon-compte-section">
            <h1 className="mon-compte-title">Mes produits</h1>

            {/* Bloc: Mes réservations */}
            <div className="mon-compte-block">
              <div className="mon-compte-block-header">
                <h2 className="mon-compte-block-title">Mes réservations de voitures d'occasion</h2>
                <div className="mon-compte-block-actions">
                  <button
                    className="mon-compte-block-btn mon-compte-block-btn-primary"
                    onClick={() => navigate('/catalogue/occasion')}
                  >
                    Choisir une voiture d'occasion
                  </button>
                </div>
              </div>

              {reservations.length === 0 ? (
                <div className="mon-compte-block-empty">
                  <p className="mon-compte-block-empty-text">Aucune réservation pour le moment</p>
                </div>
              ) : (
                <div className="mon-compte-reservations-list">
                  {reservations.map((reservation) => {
                    // Structure: reservation.model_porsche est un Model_porsche (occasion)
                    const modelPorsche = reservation.model_porsche;
                    const voitureBase = modelPorsche?.voiture; // Voiture de base

                    // Construire le nom complet: Porsche + modèle + variante
                    const nomModele = voitureBase?.nom_model || '';
                    const nomVariante = modelPorsche?.nom_model || '';
                    const nomComplet = `Porsche ${nomModele} ${nomVariante}`.trim();

                    const prix = modelPorsche?.prix_base_variante || modelPorsche?.prix_base || 0;

                    // Récupérer la photo (index 2 de préférence, comme sur OccasionPage)
                    let photoPrincipale = null;
                    const photos = modelPorsche?.photo_porsche || voitureBase?.photo_voiture;
                    if (Array.isArray(photos) && photos.length > 0) {
                      const validPhotos = photos.filter(p => p && (p.name || p._id));
                      if (validPhotos.length > 2) {
                        photoPrincipale = validPhotos[2];
                      } else if (validPhotos.length > 0) {
                        photoPrincipale = validPhotos[0];
                      }
                    }

                    const modelPorscheId = modelPorsche?._id;

                    // Informations utilisateur (pour staff)
                    const reservationUser = reservation.user;
                    const concessionnaire = modelPorsche?.concessionnaire || 'Non spécifié';

                    // Formatter date et heure
                    const dateReservation = reservation.date_reservation ? new Date(reservation.date_reservation) : null;
                    const dateFormatted = dateReservation ? dateReservation.toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    }) : 'N/A';
                    const heureFormatted = dateReservation ? dateReservation.toLocaleTimeString('fr-FR', {
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'N/A';

                    return (
                      <div key={reservation._id} className={`mon-compte-reservation-card ${isStaff() ? 'mon-compte-reservation-card-staff' : ''}`}>
                        {photoPrincipale && photoPrincipale.name ? (
                          <img
                            src={buildUrl(photoPrincipale.name)}
                            alt={nomComplet}
                            className="mon-compte-reservation-img"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <div className="mon-compte-reservation-placeholder">
                            <span>P</span>
                          </div>
                        )}
                        <div className="mon-compte-reservation-info">
                          <h3 className="mon-compte-reservation-name">
                            {nomComplet}
                          </h3>

                          {/* Informations pour staff */}
                          {isStaff() && reservationUser && (
                            <div className="mon-compte-reservation-user-info">
                              <p className="mon-compte-reservation-user-label">Client :</p>
                              <p className="mon-compte-reservation-user-details">
                                {reservationUser.nom} {reservationUser.prenom}
                              </p>
                              <p className="mon-compte-reservation-user-contact">
                                {reservationUser.email} {reservationUser.telephone && `• ${reservationUser.telephone}`}
                              </p>
                            </div>
                          )}

                          {reservation.date_reservation && (
                            <p className="mon-compte-reservation-date">
                              {isStaff() ? `Réservation : ${dateFormatted} à ${heureFormatted}` : `Date : ${dateFormatted} à ${heureFormatted}`}
                            </p>
                          )}

                          {/* Concessionnaire pour tous */}
                          <p className="mon-compte-reservation-concessionnaire">
                            Concessionnaire : {concessionnaire}
                          </p>

                          {/* Statut de la réservation */}
                          <div className="mon-compte-reservation-status-container">
                            <span className="mon-compte-reservation-status-label">Statut :</span>
                            <span className={`mon-compte-reservation-status-badge ${reservation.status ? 'status-confirmed' : 'status-cancelled'}`}>
                              {reservation.status ? 'Confirmée' : 'Annulée'}
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

                          {isStaff() ? (
                            <>
                              <button
                                className="mon-compte-reservation-btn mon-compte-reservation-btn-accept"
                                onClick={() => handleAccepterReservation(reservation._id)}
                              >
                                Accepter
                              </button>
                              <button
                                className="mon-compte-reservation-btn mon-compte-reservation-btn-refuse"
                                onClick={() => handleRefuserReservation(reservation._id)}
                              >
                                Refuser
                              </button>
                            </>
                          ) : (
                            <button
                              className="mon-compte-reservation-btn mon-compte-reservation-btn-delete"
                              onClick={() => handleAnnulerReservation(reservation._id)}
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

            {/* Bloc: Gestion achats (Staff/Admin uniquement) */}
            {isStaff && isStaff() && (
              <GestionAchatsBlock commandes={commandes} />
            )}

            {/* Bloc: Gestion anonces (Staff/Admin uniquement) */}
            {isStaff && isStaff() && (
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
                    onClick={() => navigate('/occasion/ajouter')}
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Ajouter une voiture Occasion
                  </button>
                  <button
                    className="mon-compte-admin-btn mon-compte-admin-btn-manage"
                    onClick={() => navigate('/accessoires/ajouter')}
                  >
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 4V16M4 10H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                    Ajouter un accessoire
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Section: Paramètres */}
        {activeSection === 'parametres' && (
          <div className="mon-compte-section">
            <h1 className="mon-compte-title">Paramètres de votre compte</h1>

            <div className="mon-compte-settings">
              {userData && (
                <div className="mon-compte-settings-group">
                  <h2 className="mon-compte-settings-title">Informations personnelles</h2>

                  <div className="mon-compte-settings-item">
                    <span className="mon-compte-settings-label">Nom complet</span>
                    <p className="mon-compte-settings-value">
                      {userData.prenom} {userData.nom}
                    </p>
                  </div>

                  <div className="mon-compte-settings-item">
                    <span className="mon-compte-settings-label">Email</span>
                    <p className="mon-compte-settings-value">{userData.email}</p>
                  </div>

                  {userData.telephone && (
                    <div className="mon-compte-settings-item">
                      <span className="mon-compte-settings-label">Téléphone</span>
                      <p className="mon-compte-settings-value">{userData.telephone}</p>
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
                  onClick={() => navigate('/mon-compte/modifier')}
                >
                  Modifier mes informations
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Section: Mode de paiement */}
        {activeSection === 'paiement' && (
          <div className="mon-compte-section">
            <h1 className="mon-compte-title">Mode de paiement</h1>

            <div className="mon-compte-payment">
              <div className="mon-compte-payment-empty">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mon-compte-payment-icon">
                  <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                  <line x1="1" y1="10" x2="23" y2="10" />
                </svg>
                <p className="mon-compte-payment-text">
                  Aucun mode de paiement enregistré
                </p>
                <button
                  className="mon-compte-payment-btn"
                  onClick={() => navigate('/paiement/ajouter')}
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
