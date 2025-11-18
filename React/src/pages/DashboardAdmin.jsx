import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { voitureService, commandeService } from '../services';
import { useAuth } from '../hooks/useAuth.jsx';
import { Loading, Button, Card } from '../components/common';
import './DashboardAdmin.css';

/**
 * Dashboard Admin - Gestion complète du catalogue et des commandes
 */
const DashboardAdmin = () => {
  const navigate = useNavigate();
  const { user, hasRole } = useAuth();
  
  const [stats, setStats] = useState({
    voitures: 0,
    commandes: 0,
    reservations: 0,
    users: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasRole('admin')) {
      navigate('/');
      return;
    }
    fetchStats();
  }, [hasRole, navigate]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      // Charger les statistiques
      const voitures = await voitureService.getAllVoitures();
      const commandes = await commandeService.getMyCommandes();
      
      setStats({
        voitures: voitures.length,
        commandes: commandes.length,
        reservations: 0,
        users: 0,
      });
    } catch (err) {
      console.error('Erreur chargement stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!hasRole('admin')) {
    return null;
  }

  if (loading) return <Loading fullScreen message="Chargement du dashboard..." />;

  return (
    <div className="dashboard-admin-container">
      <div className="dashboard-admin-content">
        {/* En-tête */}
        <div className="dashboard-admin-header">
          <div>
            <h1 className="dashboard-admin-title">Dashboard Admin</h1>
            <p className="dashboard-admin-subtitle">
              Bonjour, {user?.prenom} - Gestion complète de la plateforme
            </p>
          </div>
        </div>

        {/* Statistiques */}
        <div className="dashboard-stats-grid">
          <Card padding="lg" className="dashboard-stat-card">
            <div className="dashboard-stat-icon dashboard-stat-icon-voitures">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </div>
            <div className="dashboard-stat-content">
              <p className="dashboard-stat-label">Voitures</p>
              <p className="dashboard-stat-value">{stats.voitures}</p>
            </div>
          </Card>

          <Card padding="lg" className="dashboard-stat-card">
            <div className="dashboard-stat-icon dashboard-stat-icon-commandes">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div className="dashboard-stat-content">
              <p className="dashboard-stat-label">Commandes</p>
              <p className="dashboard-stat-value">{stats.commandes}</p>
            </div>
          </Card>

          <Card padding="lg" className="dashboard-stat-card">
            <div className="dashboard-stat-icon dashboard-stat-icon-reservations">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="dashboard-stat-content">
              <p className="dashboard-stat-label">Réservations</p>
              <p className="dashboard-stat-value">{stats.reservations}</p>
            </div>
          </Card>

          <Card padding="lg" className="dashboard-stat-card">
            <div className="dashboard-stat-icon dashboard-stat-icon-users">
              <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <div className="dashboard-stat-content">
              <p className="dashboard-stat-label">Utilisateurs</p>
              <p className="dashboard-stat-value">{stats.users}</p>
            </div>
          </Card>
        </div>

        {/* Actions rapides */}
        <div className="dashboard-actions">
          <h2 className="dashboard-actions-title">Actions Rapides</h2>
          <div className="dashboard-actions-grid">
            <Button onClick={() => navigate('/admin/voitures')} className="dashboard-action-btn">
              Gérer les voitures
            </Button>
            <Button onClick={() => navigate('/admin/options')} className="dashboard-action-btn">
              Gérer les options
            </Button>
            <Button onClick={() => navigate('/admin/accessoires')} className="dashboard-action-btn">
              Gérer les accessoires
            </Button>
            <Button onClick={() => navigate('/admin/utilisateurs')} className="dashboard-action-btn">
              Gérer les utilisateurs
            </Button>
            <Button onClick={() => navigate('/admin/commandes')} className="dashboard-action-btn">
              Gérer les commandes
            </Button>
            <Button onClick={() => navigate('/admin/reservations')} className="dashboard-action-btn">
              Gérer les réservations
            </Button>
          </div>
        </div>

        {/* Informations */}
        <div className="dashboard-info">
          <h3>Bienvenue dans le Dashboard Admin</h3>
          <p>
            En tant qu'administrateur, vous avez accès à toutes les fonctionnalités de gestion :
          </p>
          <ul>
            <li>Gestion complète du catalogue (voitures neuves et d'occasion)</li>
            <li>Gestion des options (couleurs, jantes, sièges, packages)</li>
            <li>Gestion des accessoires et photos</li>
            <li>Validation des commandes et réservations</li>
            <li>Gestion des utilisateurs et rôles</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DashboardAdmin;

