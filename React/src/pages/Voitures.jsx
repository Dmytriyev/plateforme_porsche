import { useState, useEffect } from 'react';
import voitureService from '../services/voiture.service.jsx';
import { Loading, Card, Button } from '../components/common';
import { formatPrice } from '../utils/format.js';
import './Voitures.css';

/**
 * Page catalogue des voitures
 */
const Voitures = () => {
  const [voitures, setVoitures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVoitures = async () => {
      try {
        setLoading(true);
        const data = await voitureService.getAllModels();
        setVoitures(data);
      } catch (err) {
        setError('Erreur lors du chargement des voitures');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVoitures();
  }, []);

  if (loading) return <Loading fullScreen message="Chargement des voitures..." />;

  if (error) {
    return (
      <div className="error-container">
        <p className="error-text">{error}</p>
      </div>
    );
  }

  return (
    <div className="voitures-container">
      <div className="voitures-content">
        {/* En-tête */}
        <div className="voitures-header">
          <h1 className="voitures-title">Catalogue Porsche</h1>
          <p className="voitures-subtitle">
            Découvrez notre collection de voitures neuves et d'occasion
          </p>
        </div>

        {/* Liste des voitures */}
        {voitures.length === 0 ? (
          <div className="voitures-empty">
            <p className="voitures-empty-text">Aucune voiture disponible pour le moment.</p>
          </div>
        ) : (
          <div className="voitures-grid">
            {voitures.map((voiture) => (
              <Card key={voiture._id} hover padding="md">
                {/* Image placeholder */}
                <div className="voiture-image-placeholder">
                  <span className="voiture-image-letter">
                    {voiture.nom_model?.charAt(0) || '?'}
                  </span>
                </div>

                {/* Informations */}
                <div className="voiture-details">
                  <h3 className="voiture-name">{voiture.nom_model}</h3>
                  
                  {voiture.description && (
                    <p className="voiture-description">
                      {voiture.description}
                    </p>
                  )}

                  {/* Badge type */}
                  <div>
                    {voiture.type_voiture ? (
                      <span className="voiture-badge voiture-badge-new">
                        Neuve
                      </span>
                    ) : (
                      <span className="voiture-badge voiture-badge-used">
                        Occasion
                      </span>
                    )}
                  </div>

                  {/* Prix */}
                  {voiture.prix && (
                    <p className="voiture-price">
                      {formatPrice(voiture.prix)}
                    </p>
                  )}

                  {/* Bouton */}
                  <Button fullWidth>
                    Voir les détails
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Voitures;
