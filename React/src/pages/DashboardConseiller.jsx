import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { commandeService } from '../services';
import { useAuth } from '../hooks/useAuth.jsx';
import { Loading, Button, Card } from '../components/common';
import { formatDate } from '../utils/format.js';
import './DashboardConseiller.css';

/**
 * Dashboard Conseiller - Gestion des réservations et propositions
 */
const DashboardConseiller = () => {
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();

  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasRole('conseillere') && !hasRole('admin')) {
      navigate('/');
      return;
    }
    fetchReservations();
  }, [hasRole, navigate]);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      // Les conseillers et admins voient toutes les réservations
      const data = await commandeService.getAllReservations();
      setReservations(Array.isArray(data) ? data : []);
    } catch (err) {
      // En cas d'erreur (pas admin), essayer de récupérer les réservations de l'utilisateur
      const userId = user?._id || user?.id;
      if (userId) {
        try {
          const userData = await commandeService.getMyReservations(userId);
          setReservations(Array.isArray(userData) ? userData : []);
        } catch (userErr) {
          setReservations([]);
        }
      } else {
        setReservations([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (reservation) => {
    if (reservation.status === false) {
      return <span className="dashboard-status status-cancelled">Annulée</span>;
    }
    return <span className="dashboard-status status-active">Active</span>;
  };

  if (!hasRole('conseillere') && !hasRole('admin')) {
    return null;
  }

  if (loading) return <Loading fullScreen message="Chargement du dashboard..." />;

  return (
    <div className="dashboard-conseiller-container">
      <div className="dashboard-conseiller-content">
        {/* En-tête */}
        <div className="dashboard-conseiller-header">
          <div>
            <h1 className="dashboard-conseiller-title">Dashboard Conseiller</h1>
            <p className="dashboard-conseiller-subtitle">
              Bonjour, {user?.prenom} - Gestion des clients et réservations
            </p>
          </div>
        </div>

        {/* Statistiques */}
        <div className="dashboard-stats-grid">
          <Card padding="lg" className="dashboard-stat-card">
            <div className="dashboard-stat-icon dashboard-stat-icon-reservations">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="dashboard-stat-content">
              <p className="dashboard-stat-label">Réservations</p>
              <p className="dashboard-stat-value">{reservations.length}</p>
            </div>
          </Card>

          <Card padding="lg" className="dashboard-stat-card">
            <div className="dashboard-stat-icon dashboard-stat-icon-actives">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="dashboard-stat-content">
              <p className="dashboard-stat-label">Actives</p>
              <p className="dashboard-stat-value">
                {reservations.filter(r => r.status === true).length}
              </p>
            </div>
          </Card>
        </div>

        {/* Réservations récentes */}
        <div className="dashboard-reservations">
          <h2 className="dashboard-reservations-title">Réservations Récentes</h2>

          {reservations.length === 0 ? (
            <Card padding="lg">
              <p className="dashboard-empty-text">Aucune réservation pour le moment</p>
            </Card>
          ) : (
            <div className="dashboard-reservations-list">
              {reservations.slice(0, 10).map((reservation) => (
                <Card key={reservation._id} padding="md" hover>
                  <div className="dashboard-reservation-item">
                    <div className="dashboard-reservation-info">
                      <p className="dashboard-reservation-client">
                        Client: {reservation.user?.prenom} {reservation.user?.nom}
                      </p>
                      <p className="dashboard-reservation-voiture">
                        {reservation.model_porsche?.voiture?.nom_model} {reservation.model_porsche?.nom_model}
                      </p>
                      <p className="dashboard-reservation-date">
                        {formatDate(reservation.date_reservation)}
                      </p>
                    </div>
                    <div className="dashboard-reservation-actions">
                      {getStatusBadge(reservation)}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/reservations/${reservation._id}`)}
                      >
                        Voir détails
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Informations */}
        <div className="dashboard-info">
          <h3>Guide Conseiller</h3>
          <p>
            En tant que conseiller(ère), voici vos principales responsabilités :
          </p>
          <ul>
            <li><strong>Réservations</strong>: Consulter et valider les réservations de voitures d'occasion (48h)</li>
            <li><strong>Clients</strong>: Contacter les clients pour confirmer leurs réservations</li>
            <li><strong>Propositions</strong>: Évaluer et valider les propositions de vente des clients</li>
            <li><strong>Accompagnement</strong>: Guider les clients dans leur processus d'achat</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DashboardConseiller;

