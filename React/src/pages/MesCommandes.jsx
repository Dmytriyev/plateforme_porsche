import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { commandeService } from '../services';
import { useAuth } from '../hooks/useAuth.jsx';
import { Loading, Button, Card, Alert } from '../components/common';
import { formatPrice, formatDate } from '../utils/format.js';
import './MesCommandes.css';

/**
 * Page Mes Commandes - Historique des commandes
 */
const MesCommandes = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [commandes, setCommandes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCommandes();
  }, []);

  const fetchCommandes = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await commandeService.getMyCommandes();
      setCommandes(data);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des commandes');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status, acompte, prix) => {
    if (status) {
      return <span className="commande-status status-success">Validée</span>;
    }
    if (acompte > 0) {
      return <span className="commande-status status-warning">Acompte versé</span>;
    }
    return <span className="commande-status status-pending">En attente</span>;
  };

  if (!user) {
    return (
      <div className="error-container">
        <p className="error-text">Vous devez être connecté pour accéder à cette page</p>
        <Button onClick={() => navigate('/login')}>Se connecter</Button>
      </div>
    );
  }

  if (loading) return <Loading fullScreen message="Chargement de vos commandes..." />;

  return (
    <div className="mes-commandes-container">
      <div className="mes-commandes-content">
        {/* En-tête */}
        <div className="mes-commandes-header">
          <div>
            <h1 className="mes-commandes-title">Mes Commandes</h1>
            <p className="mes-commandes-subtitle">
              Historique de vos achats et réservations
            </p>
          </div>
          <Button onClick={() => navigate('/panier')}>
            Voir mon panier
          </Button>
        </div>

        {/* Messages */}
        {error && <Alert variant="error">{error}</Alert>}

        {/* Liste des commandes */}
        {commandes.length === 0 ? (
          <div className="mes-commandes-empty">
            <svg className="mes-commandes-empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <p className="mes-commandes-empty-text">Vous n'avez aucune commande</p>
            <Button onClick={() => navigate('/voitures')}>
              Découvrir nos voitures
            </Button>
          </div>
        ) : (
          <div className="mes-commandes-list">
            {commandes.map((commande) => (
              <Card key={commande._id} padding="lg">
                <div className="commande-item">
                  {/* En-tête commande */}
                  <div className="commande-header">
                    <div>
                      <h3 className="commande-numero">
                        Commande #{commande._id.slice(-8)}
                      </h3>
                      <p className="commande-date">
                        {formatDate(commande.date_commande)}
                      </p>
                    </div>
                    {getStatusBadge(commande.status, commande.acompte, commande.prix)}
                  </div>

                  {/* Détails commande */}
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

                    {commande.acompte > 0 && commande.prix - commande.acompte > 0 && (
                      <div className="commande-detail-item">
                        <span className="commande-label">Restant à payer:</span>
                        <span className="commande-value commande-restant">
                          {formatPrice(commande.prix - commande.acompte)}
                        </span>
                      </div>
                    )}

                    {commande.lignesCommande && commande.lignesCommande.length > 0 && (
                      <div className="commande-detail-item">
                        <span className="commande-label">Articles:</span>
                        <span className="commande-value">
                          {commande.lignesCommande.length} article{commande.lignesCommande.length > 1 ? 's' : ''}
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

                  {/* Actions */}
                  <div className="commande-actions">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/commandes/${commande._id}`)}
                    >
                      Voir le détail
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Information */}
        <div className="mes-commandes-info">
          <h3>Informations sur vos commandes</h3>
          <ul>
            <li><strong>Voiture neuve</strong>: Acompte de 10% requis à la commande</li>
            <li><strong>Accessoires</strong>: Paiement intégral à la commande</li>
            <li>Une fois validée, votre commande sera traitée dans les 48h</li>
            <li>Pour toute question, contactez notre service client</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MesCommandes;

