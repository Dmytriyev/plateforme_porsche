import { useState, useEffect, useCallback, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext.jsx';
import { commandeService, maVoitureService } from '../services';
import { Loading } from '../components/common';
import { API_URL } from '../config/api.js';
import buildUrl from '../utils/buildUrl';
import { formatPrice, formatDate } from '../utils/format.js';
import '../css/MonCompte.css';
import '../css/components/Message.css';

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
  const { user, logout } = useContext(AuthContext);

  const [activeSection, setActiveSection] = useState('mes-produits');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Données
  const [reservations, setReservations] = useState([]);
  const [commandes, setCommandes] = useState([]);
  const [voitures, setVoitures] = useState([]);
  const [userData, setUserData] = useState(null);

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      // Récupérer l'ID utilisateur (peut être _id ou id)
      const userId = user?._id || user?.id;

      // Récupérer toutes les données en parallèle
      // getMesVoitures et getMyCommandes récupèrent l'ID depuis le token JWT
      const promises = [
        userId ? commandeService.getMyReservations(userId).catch(() => []) : Promise.resolve([]),
        commandeService.getMyCommandes().catch(() => []),
        maVoitureService.getMesVoitures().catch(() => []),
      ];

      const [reservationsData, commandesData, voituresData] = await Promise.all(promises);

      setReservations(Array.isArray(reservationsData) ? reservationsData : []);
      setCommandes(Array.isArray(commandesData) ? commandesData : []);
      setVoitures(Array.isArray(voituresData) ? voituresData : []);
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

  // Récupérer la première photo disponible pour l'image de la carte "Réserver un véhicule"
  const _photoReservation = voitures.length > 0 && voitures[0]?.photo_voiture_actuel?.length > 0
    ? voitures[0].photo_voiture_actuel[0]
    : null;

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
            className="mon-compte-nav-item"
            onClick={() => navigate('/mes-commandes')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <span>Mes commandes</span>
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
                    onClick={() => navigate('/occasion')}
                  >
                    Choisir une voiture d'occasion
                  </button>
                </div>
              </div>

              {reservations.length === 0 ? (
                <div className="mon-compte-block-empty">
                  <p className="mon-compte-block-empty-text">Aucune réservation pour le moment</p>
                  <button
                    className="mon-compte-block-empty-btn"
                    onClick={() => navigate('/occasion')}
                  >
                    Parcourir les voitures d'occasion
                  </button>
                </div>
              ) : (
                <div className="mon-compte-reservations-list">
                  {reservations.map((reservation) => {
                    // Structure: reservation.model_porsche est un Model_porsche (occasion)
                    const modelPorsche = reservation.model_porsche;
                    const voitureBase = modelPorsche?.voiture; // Voiture de base
                    const typeModel = modelPorsche?.type_model || voitureBase?.nom_model || 'Porsche';
                    const prix = modelPorsche?.prix_base_variante || modelPorsche?.prix_base || 0;
                    const photoPrincipale = modelPorsche?.photo_voiture_actuel?.[0] ||
                      modelPorsche?.photo_voiture?.[0] ||
                      voitureBase?.photo_voiture?.[0];
                    const modelPorscheId = modelPorsche?._id;

                    return (
                      <div key={reservation._id} className="mon-compte-reservation-card">
                        {photoPrincipale && photoPrincipale.name ? (
                          <img
                            src={buildUrl(photoPrincipale.name)}
                            alt={typeModel}
                            className="mon-compte-reservation-img"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <div className="mon-compte-reservation-placeholder">
                            <span>{typeModel.charAt(0)}</span>
                          </div>
                        )}
                        <div className="mon-compte-reservation-info">
                          <h3 className="mon-compte-reservation-name">
                            {typeModel}
                          </h3>
                          {reservation.date_reservation && (
                            <p className="mon-compte-reservation-date">
                              Réservée le {formatDate(reservation.date_reservation)}
                            </p>
                          )}
                          {prix > 0 && (
                            <p className="mon-compte-reservation-price">
                              {formatPrice(prix)}
                            </p>
                          )}
                        </div>
                        <div className="mon-compte-reservation-actions">
                          <button
                            className="mon-compte-reservation-btn mon-compte-reservation-btn-modify"
                            onClick={() => {
                              if (modelPorscheId) {
                                navigate(`/occasion/${modelPorscheId}`);
                              }
                            }}
                          >
                            Modifier
                          </button>
                          <button
                            className="mon-compte-reservation-btn mon-compte-reservation-btn-delete"
                            onClick={() => handleAnnulerReservation(reservation._id)}
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

            {/* Bloc: Mes commandes */}
            <div className="mon-compte-block">
              <div className="mon-compte-block-header">
                <h2 className="mon-compte-block-title">Mes commandes</h2>
                <div className="mon-compte-block-actions">
                  <button
                    className="mon-compte-block-btn mon-compte-block-btn-secondary"
                    onClick={() => navigate('/mes-commandes')}
                  >
                    Voir toutes mes commandes
                  </button>
                </div>
              </div>

              {commandes.length === 0 ? (
                <div className="mon-compte-block-empty">
                  <p className="mon-compte-block-empty-text">Aucune commande pour le moment</p>
                  <button
                    className="mon-compte-block-empty-btn"
                    onClick={() => navigate('/catalogue/neuve')}
                  >
                    Parcourir les modèles
                  </button>
                </div>
              ) : (
                <div className="mon-compte-commandes-list">
                  {commandes.slice(0, 3).map((commande) => (
                    <div key={commande._id} className="mon-compte-commande-card">
                      <div className="mon-compte-commande-header">
                        <div>
                          <h3 className="mon-compte-commande-id">
                            Commande #{commande._id?.slice(-8) || 'N/A'}
                          </h3>
                          {commande.date_commande && (
                            <p className="mon-compte-commande-date">
                              {formatDate(commande.date_commande)}
                            </p>
                          )}
                        </div>
                        <div className="mon-compte-commande-status">
                          <span className={`mon-compte-commande-badge ${commande.status ? 'validated' : 'pending'}`}>
                            {commande.status ? 'Validée' : 'En attente'}
                          </span>
                        </div>
                      </div>
                      {commande.total && (
                        <div className="mon-compte-commande-total">
                          <span className="mon-compte-commande-total-label">Total:</span>
                          <span className="mon-compte-commande-total-value">
                            {formatPrice(commande.total)}
                          </span>
                        </div>
                      )}
                      <div className="mon-compte-commande-actions">
                        <button
                          className="mon-compte-commande-btn"
                          onClick={() => navigate(`/mes-commandes/${commande._id}`)}
                        >
                          Voir les détails
                        </button>
                        <button
                          className="mon-compte-commande-btn mon-compte-commande-btn-modify"
                          onClick={() => navigate(`/mes-commandes/${commande._id}/modifier`)}
                        >
                          Modifier
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Bloc: Mes voitures */}
            <div className="mon-compte-block">
              <div className="mon-compte-block-header">
                <h2 className="mon-compte-block-title">Mes voitures</h2>
                <div className="mon-compte-block-actions">
                  <button
                    className="mon-compte-block-btn mon-compte-block-btn-primary"
                    onClick={() => navigate('/mes-voitures')}
                  >
                    Voir toutes mes voitures
                  </button>
                  <button
                    className="mon-compte-block-btn mon-compte-block-btn-secondary"
                    onClick={() => navigate('/ajouter-ma-voiture')}
                  >
                    Ajouter une voiture
                  </button>
                </div>
              </div>

              {voitures.length === 0 ? (
                <div className="mon-compte-block-empty">
                  <p className="mon-compte-block-empty-text">Aucune voiture enregistrée</p>
                  <button
                    className="mon-compte-block-empty-btn"
                    onClick={() => navigate('/ajouter-ma-voiture')}
                  >
                    Ajouter ma première Porsche
                  </button>
                </div>
              ) : (
                <div className="mon-compte-voitures-list">
                  {voitures.slice(0, 3).map((voiture) => {
                    const photoPrincipale = voiture.photo_voiture_actuel?.[0];

                    return (
                      <div key={voiture._id} className="mon-compte-voiture-card">
                        {photoPrincipale && photoPrincipale.name ? (
                          <img
                            src={buildUrl(photoPrincipale.name)}
                            alt={voiture.type_model || 'Porsche'}
                            className="mon-compte-voiture-img"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <div className="mon-compte-voiture-placeholder">
                            <span>{voiture.type_model?.charAt(0) || 'P'}</span>
                          </div>
                        )}
                        <div className="mon-compte-voiture-info">
                          <h3 className="mon-compte-voiture-name">
                            {voiture.type_model || 'Porsche'}
                          </h3>
                          {voiture.annee_production && (
                            <p className="mon-compte-voiture-year">
                              {new Date(voiture.annee_production).getFullYear()}
                            </p>
                          )}
                          {voiture.couleur_exterieur && (
                            <p className="mon-compte-voiture-color">
                              {voiture.couleur_exterieur.nom_couleur}
                            </p>
                          )}
                        </div>
                        <div className="mon-compte-voiture-actions">
                          <button
                            className="mon-compte-voiture-btn mon-compte-voiture-btn-view"
                            onClick={() => navigate(`/mes-voitures/${voiture._id}`)}
                          >
                            Voir
                          </button>
                          <button
                            className="mon-compte-voiture-btn mon-compte-voiture-btn-modify"
                            onClick={() => navigate(`/mes-voitures/${voiture._id}/modifier`)}
                          >
                            Modifier
                          </button>
                          <button
                            className="mon-compte-voiture-btn mon-compte-voiture-btn-delete"
                            onClick={async () => {
                              if (window.confirm('Êtes-vous sûr de vouloir supprimer cette voiture ?')) {
                                try {
                                  await maVoitureService.supprimerMaVoiture(voiture._id);
                                  setSuccess('Voiture supprimée avec succès');
                                  setTimeout(() => setSuccess(''), 3000);
                                  fetchAllData();
                                } catch (err) {
                                  setError(err.message || 'Erreur lors de la suppression');
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

                  <div className="mon-compte-settings-item">
                    <span className="mon-compte-settings-label">Rôle</span>
                    <p className="mon-compte-settings-value">{userData.role || 'Utilisateur'}</p>
                  </div>
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
