import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { accesoireService } from '../services';
import { Loading, Alert } from '../components/common';
import { formatPrice } from '../utils/format.js';
import './AccessoiresParCategorie.css';

/**
 * Page Liste Accessoires par Catégorie
 * Deuxième étape: Afficher les accessoires d'une catégorie
 */
const AccessoiresParCategorie = () => {
  const { categorie } = useParams();
  const navigate = useNavigate();
  const [accessoires, setAccessoires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAccessoires();
  }, [categorie]);

  const fetchAccessoires = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Récupérer tous les accessoires
      const response = await accesoireService.getAllAccessoires();
      
      // Vérifier que la réponse est bien un tableau
      const allAccessoires = Array.isArray(response) ? response : [];
      
      // Filtrer par catégorie
      const filteredAccessoires = allAccessoires.filter(
        acc => acc.type_accesoire === decodeURIComponent(categorie)
      );
      
      setAccessoires(filteredAccessoires);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des accessoires');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccessoireClick = (accessoire) => {
    navigate(`/accessoires/detail/${accessoire._id}`);
  };

  if (loading) {
    return <Loading fullScreen message="Chargement des accessoires..." />;
  }

  if (error) {
    return (
      <div className="error-container">
        <Alert variant="error">{error}</Alert>
      </div>
    );
  }

  return (
    <div className="accessoires-categorie-container">
      <div className="accessoires-categorie-content">
        {/* En-tête */}
        <div className="accessoires-categorie-header">
          <button 
            onClick={() => navigate('/accessoires')} 
            className="accessoires-back-btn"
          >
            ← Retour aux catégories
          </button>
          <h1 className="accessoires-categorie-title">
            {decodeURIComponent(categorie).charAt(0).toUpperCase() + decodeURIComponent(categorie).slice(1)}
          </h1>
          <p className="accessoires-categorie-subtitle">
            {accessoires.length} article{accessoires.length > 1 ? 's' : ''} disponible{accessoires.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Liste des accessoires */}
        {accessoires.length === 0 ? (
          <div className="accessoires-empty">
            <p>Aucun accessoire disponible dans cette catégorie.</p>
          </div>
        ) : (
          <div className="accessoires-grid">
            {accessoires.map((accessoire) => (
              <button
                key={accessoire._id}
                onClick={() => handleAccessoireClick(accessoire)}
                className="accessoire-card"
              >
                {/* Image */}
                <div className="accessoire-image-container">
                  {accessoire.photo_accesoire && accessoire.photo_accesoire.length > 0 ? (
                    <img
                      src={`http://localhost:3000${accessoire.photo_accesoire[0].name}`}
                      alt={accessoire.nom_accesoire}
                      className="accessoire-image"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className="accessoire-placeholder"
                    style={{ display: accessoire.photo_accesoire && accessoire.photo_accesoire.length > 0 ? 'none' : 'flex' }}
                  >
                    <span className="accessoire-letter">
                      {accessoire.nom_accesoire?.charAt(0) || '?'}
                    </span>
                  </div>
                </div>

                {/* Informations */}
                <div className="accessoire-info">
                  <h2 className="accessoire-name">{accessoire.nom_accesoire}</h2>
                  
                  {accessoire.description && (
                    <p className="accessoire-description">
                      {accessoire.description.length > 100
                        ? accessoire.description.substring(0, 100) + '...'
                        : accessoire.description
                      }
                    </p>
                  )}

                  {/* Couleur */}
                  {accessoire.couleur_accesoire && (
                    <div className="accessoire-couleur">
                      <span className="accessoire-couleur-label">Couleur:</span>
                      <span className="accessoire-couleur-value">
                        {accessoire.couleur_accesoire.nom_couleur}
                      </span>
                    </div>
                  )}

                  {/* Prix */}
                  <div className="accessoire-price">
                    {formatPrice(accessoire.prix)}
                  </div>
                </div>

                <div className="accessoire-cta">
                  Voir les détails →
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AccessoiresParCategorie;

