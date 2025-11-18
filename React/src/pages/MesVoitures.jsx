import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { maVoitureService } from '../services';
import { useAuth } from '../hooks/useAuth.jsx';
import { Loading, Button, Card, Alert } from '../components/common';
import { formatPrice } from '../utils/format.js';
import './MesVoitures.css';

/**
 * Page Mes Voitures - Gérer mes Porsche
 */
const MesVoitures = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [voitures, setVoitures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchMesVoitures();
  }, []);

  const fetchMesVoitures = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await maVoitureService.getMesVoitures();
      setVoitures(data);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des voitures');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSupprimer = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette voiture ?')) {
      return;
    }

    try {
      await maVoitureService.supprimerMaVoiture(id);
      setSuccess('Voiture supprimée avec succès');
      setTimeout(() => setSuccess(''), 3000);
      fetchMesVoitures();
    } catch (err) {
      setError(err.message || 'Erreur lors de la suppression');
      console.error(err);
    }
  };

  const handleProposerVente = (voiture) => {
    navigate('/proposer-vente', { state: { voiture } });
  };

  if (!user) {
    return (
      <div className="error-container">
        <p className="error-text">Vous devez être connecté pour accéder à cette page</p>
        <Button onClick={() => navigate('/login')}>Se connecter</Button>
      </div>
    );
  }

  if (loading) return <Loading fullScreen message="Chargement de vos voitures..." />;

  return (
    <div className="mes-voitures-container">
      <div className="mes-voitures-content">
        {/* En-tête */}
        <div className="mes-voitures-header">
          <div>
            <h1 className="mes-voitures-title">Mes Porsche</h1>
            <p className="mes-voitures-subtitle">
              Gérez votre collection personnelle
            </p>
          </div>
          <Button onClick={() => navigate('/ajouter-ma-voiture')}>
            + Ajouter ma Porsche
          </Button>
        </div>

        {/* Messages */}
        {error && <Alert variant="error">{error}</Alert>}
        {success && <Alert variant="success">{success}</Alert>}

        {/* Liste des voitures */}
        {voitures.length === 0 ? (
          <div className="mes-voitures-empty">
            <svg className="mes-voitures-empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            <p className="mes-voitures-empty-text">Vous n'avez pas encore ajouté de Porsche</p>
            <Button onClick={() => navigate('/ajouter-ma-voiture')}>
              Ajouter ma première Porsche
            </Button>
          </div>
        ) : (
          <div className="mes-voitures-grid">
            {voitures.map((voiture) => (
              <Card key={voiture._id} hover padding="md">
                {/* Image */}
                <div className="mes-voitures-image-container">
                  {voiture.photo_voiture_actuel && voiture.photo_voiture_actuel.length > 0 ? (
                    <img
                      src={`http://localhost:3000${voiture.photo_voiture_actuel[0].name}`}
                      alt={voiture.nom_model}
                      className="mes-voitures-image"
                    />
                  ) : (
                    <div className="mes-voitures-placeholder">
                      <span>{voiture.nom_model?.charAt(0) || 'P'}</span>
                    </div>
                  )}
                </div>

                {/* Informations */}
                <div className="mes-voitures-details">
                  <h3 className="mes-voitures-name">{voiture.nom_model}</h3>
                  
                  {voiture.annee_production && (
                    <p className="mes-voitures-year">
                      Année: {new Date(voiture.annee_production).getFullYear()}
                    </p>
                  )}

                  {/* Configuration */}
                  <div className="mes-voitures-config">
                    {voiture.couleur_exterieur && (
                      <span className="mes-voitures-config-item">
                        {voiture.couleur_exterieur.nom_couleur}
                      </span>
                    )}
                    {voiture.taille_jante && (
                      <span className="mes-voitures-config-item">
                        Jantes {voiture.taille_jante.taille_jante}"
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mes-voitures-actions">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/mes-voitures/${voiture._id}`)}
                    >
                      Détails
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleProposerVente(voiture)}
                    >
                      Proposer à la vente
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleSupprimer(voiture._id)}
                      className="mes-voitures-btn-delete"
                    >
                      Supprimer
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MesVoitures;

