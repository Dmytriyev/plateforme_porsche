import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { commandeService } from '../services';
import { useAuth } from '../hooks/useAuth.jsx';
import { Loading, Button, Card, Alert } from '../components/common';
import { formatPrice, formatDate } from '../utils/format.js';
import './MesReservations.css';

/**
 * Page Mes Réservations - Gérer mes réservations de voitures d'occasion
 */
const MesReservations = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchReservations();
  }, []);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Récupérer l'ID utilisateur (peut être _id ou id)
      const userId = user?._id || user?.id;
      
      if (!userId) {
        setError('ID utilisateur manquant');
        setLoading(false);
        return;
      }
      
      const data = await commandeService.getMyReservations(userId);
      setReservations(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des réservations');
    } finally {
      setLoading(false);
    }
  };

  const handleAnnuler = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir annuler cette réservation ?')) {
      return;
    }

    try {
      await commandeService.cancelReservation(id);
      setSuccess('Réservation annulée avec succès');
      setTimeout(() => setSuccess(''), 3000);
      fetchReservations();
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'annulation');
    }
  };

  const getStatusBadge = (statut) => {
    const badges = {
      en_attente: { label: 'En attente', class: 'status-warning' },
      confirmee: { label: 'Confirmée', class: 'status-success' },
      annulee: { label: 'Annulée', class: 'status-error' },
      expiree: { label: 'Expirée', class: 'status-error' },
    };

    const badge = badges[statut] || { label: statut, class: '' };
    return (
      <span className={`reservation-status ${badge.class}`}>
        {badge.label}
      </span>
    );
  };

  if (!user) {
    return (
      <div className="error-container">
        <p className="error-text">Vous devez être connecté pour accéder à cette page</p>
        <Button onClick={() => navigate('/login')}>Se connecter</Button>
      </div>
    );
  }

  if (loading) return <Loading fullScreen message="Chargement de vos réservations..." />;

  return (
    <div className="mes-reservations-container">
      <div className="mes-reservations-content">
        {/* En-tête */}
        <div className="mes-reservations-header">
          <div>
            <h1 className="mes-reservations-title">Mes Réservations</h1>
            <p className="mes-reservations-subtitle">
              Gérez vos réservations de voitures d'occasion (48h)
            </p>
          </div>
          <Button onClick={() => navigate('/voitures?type=occasions')}>
            Réserver une voiture
          </Button>
        </div>

        {/* Messages */}
        {error && <Alert variant="error">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        {/* Liste des réservations */}
        {reservations.length === 0 ? (
          <div className="mes-reservations-empty">
            <svg className="mes-reservations-empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mes-reservations-empty-text">Vous n'avez aucune réservation</p>
            <Button onClick={() => navigate('/voitures?type=occasions')}>
              Voir les voitures d'occasion
            </Button>
          </div>
        ) : (
          <div className="mes-reservations-list">
            {reservations.map((reservation) => (
              <Card key={reservation._id} padding="lg">
                <div className="reservation-item">
                  {/* Image */}
                  <div className="reservation-image-container">
                    {reservation.model_porsche?.photo_porsche?.[0] ? (
                      <img
                        src={`http://localhost:3000${reservation.model_porsche.photo_porsche[0].name}`}
                        alt={reservation.model_porsche.nom_model}
                        className="reservation-image"
                      />
                    ) : (
                      <div className="reservation-placeholder">
                        <span>{reservation.model_porsche?.nom_model?.charAt(0) || 'P'}</span>
                      </div>
                    )}
                  </div>

                  {/* Informations */}
                  <div className="reservation-info">
                    <div className="reservation-header-info">
                      <h3 className="reservation-name">
                        {reservation.model_porsche?.voiture?.nom_model} {reservation.model_porsche?.nom_model}
                      </h3>
                      {getStatusBadge(reservation.statut)}
                    </div>

                    <div className="reservation-details">
                      <div className="reservation-detail-item">
                        <span className="reservation-label">Date de réservation:</span>
                        <span className="reservation-value">{formatDate(reservation.createdAt)}</span>
                      </div>

                      {reservation.model_porsche?.prix_calcule?.prix_total && (
                        <div className="reservation-detail-item">
                          <span className="reservation-label">Prix:</span>
                          <span className="reservation-value reservation-price">
                            {formatPrice(reservation.model_porsche.prix_calcule.prix_total)}
                          </span>
                        </div>
                      )}

                      {reservation.message && (
                        <div className="reservation-detail-item">
                          <span className="reservation-label">Message:</span>
                          <span className="reservation-value">{reservation.message}</span>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="reservation-actions">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigate(`/voitures/${reservation.model_porsche?._id}`)}
                      >
                        Voir la voiture
                      </Button>
                      {reservation.statut === 'en_attente' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleAnnuler(reservation._id)}
                          className="reservation-btn-cancel"
                        >
                          Annuler
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Information */}
        <div className="mes-reservations-info">
          <h3>Informations sur les réservations</h3>
          <ul>
            <li>Vos réservations sont valables pendant <strong>48 heures</strong></li>
            <li>Un conseiller vous contactera pour confirmer votre réservation</li>
            <li>Vous pouvez annuler une réservation tant qu'elle n'est pas confirmée</li>
            <li>Une fois confirmée, contactez directement votre conseiller pour toute modification</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MesReservations;

