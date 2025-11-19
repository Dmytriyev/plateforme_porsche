import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { voitureService } from '../services';
import { Loading, Alert, Button } from '../components/common';
import { formatPrice } from '../utils/format.js';
import './VoiturePage.css';

/**
 * Page explicative complète d'une voiture model-start (911, Cayman, Cayenne)
 * Affiche toutes les informations, photos et variantes disponibles
 */
const VoiturePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await voitureService.getVoiturePage(id);
        setPageData(data);
      } catch (err) {
        setError(err.message || 'Erreur lors du chargement de la page');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPageData();
    }
  }, [id]);

  const handleVarianteClick = (varianteId) => {
    if (pageData?.voiture?.type_voiture) {
      // Voiture neuve: aller vers la page explicative de la variante
      navigate(`/variante/${varianteId}`);
    } else {
      // Voiture occasion: aller vers la page explicative de l'occasion
      navigate(`/occasion/${varianteId}`);
    }
  };

  if (loading) {
    return <Loading fullScreen message="Chargement de la page..." />;
  }

  if (error) {
    return (
      <div className="voiture-page-error">
        <Alert type="error">{error}</Alert>
        <Button onClick={() => navigate('/choix-voiture')}>
          Retour au choix
        </Button>
      </div>
    );
  }

  if (!pageData || !pageData.voiture) {
    return (
      <div className="voiture-page-error">
        <Alert type="warning">Voiture non trouvée</Alert>
        <Button onClick={() => navigate('/choix-voiture')}>
          Retour au choix
        </Button>
      </div>
    );
  }

  const { voiture, statistiques, variantes } = pageData;
  const images = voiture.photos || [];
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  return (
    <div className="voiture-page-container">
      <div className="voiture-page-content">
        {/* Breadcrumb */}
        <div className="voiture-page-breadcrumb">
          <Link to="/choix-voiture" className="breadcrumb-link">
            Accueil
          </Link>
          <span className="breadcrumb-separator">/</span>
          <Link 
            to={`/catalogue/${voiture.type_voiture ? 'neuve' : 'occasion'}`}
            className="breadcrumb-link"
          >
            {voiture.type_voiture ? 'Neuve' : 'Occasion'}
          </Link>
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{voiture.nom_model}</span>
        </div>

        {/* En-tête */}
        <div className="voiture-page-header">
          <div className="voiture-page-title-section">
            <h1 className="voiture-page-title">{voiture.nom_model}</h1>
            {voiture.description && (
              <p className="voiture-page-description">{voiture.description}</p>
            )}
          </div>
          <div className="voiture-page-badges">
            {voiture.type_voiture ? (
              <span className="voiture-badge voiture-badge-new">Neuve</span>
            ) : (
              <span className="voiture-badge voiture-badge-used">Occasion</span>
            )}
          </div>
        </div>

        {/* Galerie photos */}
        {images.length > 0 && (
          <div className="voiture-page-gallery">
            <div className="voiture-page-gallery-main">
              <img
                src={`${API_URL}${images[selectedImage]?.name}`}
                alt={images[selectedImage]?.alt || voiture.nom_model}
                className="voiture-page-main-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
            {images.length > 1 && (
              <div className="voiture-page-gallery-thumbnails">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`voiture-page-thumbnail ${
                      selectedImage === index ? 'voiture-page-thumbnail-active' : ''
                    }`}
                  >
                    <img
                      src={`${API_URL}${image.name}`}
                      alt={image.alt || `${voiture.nom_model} - Photo ${index + 1}`}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Statistiques */}
        {statistiques && (
          <div className="voiture-page-stats">
            <div className="voiture-page-stat-item">
              <span className="voiture-page-stat-label">Variantes disponibles</span>
              <span className="voiture-page-stat-value">{statistiques.nombre_variantes}</span>
            </div>
            {statistiques.prix_depuis > 0 && (
              <div className="voiture-page-stat-item">
                <span className="voiture-page-stat-label">Prix à partir de</span>
                <span className="voiture-page-stat-value">{formatPrice(statistiques.prix_depuis)}</span>
              </div>
            )}
            {statistiques.carrosseries_disponibles?.length > 0 && (
              <div className="voiture-page-stat-item">
                <span className="voiture-page-stat-label">Carrosseries</span>
                <span className="voiture-page-stat-value">
                  {statistiques.carrosseries_disponibles.join(', ')}
                </span>
              </div>
            )}
            {statistiques.transmissions_disponibles?.length > 0 && (
              <div className="voiture-page-stat-item">
                <span className="voiture-page-stat-label">Transmissions</span>
                <span className="voiture-page-stat-value">
                  {statistiques.transmissions_disponibles.join(', ')}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Liste des variantes */}
        {variantes && variantes.length > 0 && (
          <div className="voiture-page-variantes">
            <h2 className="voiture-page-section-title">Variantes disponibles</h2>
            <div className="voiture-page-variantes-grid">
              {variantes.map((variante) => (
                <div
                  key={variante._id}
                  className="voiture-page-variante-card"
                  onClick={() => handleVarianteClick(variante._id)}
                >
                  {variante.photo_principale && (
                    <div className="voiture-page-variante-image">
                      <img
                        src={`${API_URL}${variante.photo_principale.name}`}
                        alt={variante.nom_model}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                    </div>
                  )}
                  <div className="voiture-page-variante-info">
                    <h3 className="voiture-page-variante-name">{variante.nom_model}</h3>
                    {variante.type_carrosserie && (
                      <p className="voiture-page-variante-carrosserie">
                        {variante.type_carrosserie}
                      </p>
                    )}
                    {variante.description && (
                      <p className="voiture-page-variante-description">
                        {variante.description.length > 100
                          ? variante.description.substring(0, 100) + '...'
                          : variante.description
                        }
                      </p>
                    )}
                    {variante.specifications && (
                      <div className="voiture-page-variante-specs">
                        {variante.specifications.puissance && (
                          <span className="voiture-page-variante-spec">
                            {variante.specifications.puissance} ch
                          </span>
                        )}
                        {variante.specifications.acceleration_0_100 && (
                          <span className="voiture-page-variante-spec">
                            0-100: {variante.specifications.acceleration_0_100}s
                          </span>
                        )}
                      </div>
                    )}
                    {variante.prix_base > 0 && (
                      <div className="voiture-page-variante-price">
                        {formatPrice(variante.prix_base)}
                      </div>
                    )}
                  </div>
                  <div className="voiture-page-variante-cta">
                    Voir les détails →
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="voiture-page-actions">
          <Button
            variant="outline"
            onClick={() => navigate(`/catalogue/${voiture.type_voiture ? 'neuve' : 'occasion'}`)}
          >
            Retour au catalogue
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VoiturePage;

