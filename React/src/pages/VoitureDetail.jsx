import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { voitureService } from '../services';
import { usePanier } from '../hooks/usePanier.jsx';
import { Loading, Button, Alert } from '../components/common';
import { formatPrice } from '../utils/format.js';
import './VoitureDetail.css';

/**
 * Page de détail d'une voiture
 */
const VoitureDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { ajouterArticle } = usePanier();
  
  const [voiture, setVoiture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchVoiture = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await voitureService.getById(id);
        setVoiture(data);
      } catch (err) {
        setError('Erreur lors du chargement de la voiture');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchVoiture();
    }
  }, [id]);

  const handleReservation = () => {
    if (voiture) {
      // Ajouter au panier
      ajouterArticle({
        id: voiture._id,
        nom: voiture.nom_model || 'Porsche',
        prix: voiture.prix || 0,
        type: 'voiture',
        quantite: 1,
      });
      setSuccess('Voiture ajoutée au panier !');
      setTimeout(() => {
        navigate('/panier');
      }, 1500);
    }
  };

  const handleConfigurer = () => {
    if (voiture?.voiture?._id) {
      navigate(`/configurateur/${voiture.voiture._id}`);
    }
  };

  if (loading) {
    return <Loading fullScreen message="Chargement de la voiture..." />;
  }

  if (error) {
    return (
      <div className="error-container">
        <Alert type="error">{error}</Alert>
        <Button onClick={() => navigate('/voitures')}>
          Retour au catalogue
        </Button>
      </div>
    );
  }

  if (!voiture) {
    return (
      <div className="error-container">
        <Alert type="warning">Voiture non trouvée</Alert>
        <Button onClick={() => navigate('/voitures')}>
          Retour au catalogue
        </Button>
      </div>
    );
  }

  // Images de la voiture (placeholder si pas d'images)
  const images = voiture.photo_voiture?.length > 0
    ? voiture.photo_voiture
    : [{ name: 'placeholder', alt: voiture.nom_model }];

  return (
    <div className="voiture-detail-container">
      {success && <Alert type="success">{success}</Alert>}

      <div className="voiture-detail-content">
        {/* Navigation retour */}
        <div className="voiture-detail-breadcrumb">
          <Link to="/voitures" className="breadcrumb-link">
            ← Retour au catalogue
          </Link>
        </div>

        {/* En-tête */}
        <div className="voiture-detail-header">
          <div>
            <h1 className="voiture-detail-title">{voiture.nom_model}</h1>
            {voiture.description && (
              <p className="voiture-detail-subtitle">{voiture.description}</p>
            )}
          </div>
          
          {/* Badge type */}
          <div>
            {voiture.voiture?.type_voiture === true ? (
              <span className="voiture-badge voiture-badge-new">✨ Neuve</span>
            ) : voiture.voiture?.type_voiture === false ? (
              <span className="voiture-badge voiture-badge-used">🔄 Occasion certifiée</span>
            ) : null}
          </div>
        </div>

        <div className="voiture-detail-grid">
          {/* Galerie photos */}
          <div className="voiture-gallery">
            {/* Image principale */}
            <div className="voiture-gallery-main">
              <div className="voiture-image-placeholder">
                <span className="voiture-image-letter">
                  {voiture.nom_model?.charAt(0) || '?'}
                </span>
              </div>
            </div>

            {/* Miniatures */}
            {images.length > 1 && (
              <div className="voiture-gallery-thumbnails">
                {images.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`voiture-thumbnail ${
                      selectedImage === index ? 'voiture-thumbnail-active' : ''
                    }`}
                  >
                    <div className="voiture-image-placeholder-small">
                      <span>{index + 1}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Informations et actions */}
          <div className="voiture-info">
            {/* Prix */}
            {voiture.prix && (
              <div className="voiture-price-section">
                <p className="voiture-price-label">Prix TTC</p>
                <p className="voiture-price-amount">{formatPrice(voiture.prix)}</p>
              </div>
            )}

            {/* Spécifications techniques */}
            {voiture.specifications && (
              <div className="voiture-specs">
                <h2 className="voiture-specs-title">Caractéristiques techniques</h2>
                <div className="voiture-specs-grid">
                  {voiture.specifications.moteur && (
                    <div className="voiture-spec-item">
                      <span className="voiture-spec-label">Moteur</span>
                      <span className="voiture-spec-value">{voiture.specifications.moteur}</span>
                    </div>
                  )}
                  {voiture.specifications.puissance && (
                    <div className="voiture-spec-item">
                      <span className="voiture-spec-label">Puissance</span>
                      <span className="voiture-spec-value">{voiture.specifications.puissance} ch</span>
                    </div>
                  )}
                  {voiture.specifications.transmission && (
                    <div className="voiture-spec-item">
                      <span className="voiture-spec-label">Transmission</span>
                      <span className="voiture-spec-value">{voiture.specifications.transmission}</span>
                    </div>
                  )}
                  {voiture.specifications.acceleration_0_100 && (
                    <div className="voiture-spec-item">
                      <span className="voiture-spec-label">0-100 km/h</span>
                      <span className="voiture-spec-value">{voiture.specifications.acceleration_0_100} s</span>
                    </div>
                  )}
                  {voiture.specifications.vitesse_max && (
                    <div className="voiture-spec-item">
                      <span className="voiture-spec-label">Vitesse max</span>
                      <span className="voiture-spec-value">{voiture.specifications.vitesse_max} km/h</span>
                    </div>
                  )}
                  {voiture.specifications.consommation && (
                    <div className="voiture-spec-item">
                      <span className="voiture-spec-label">Consommation</span>
                      <span className="voiture-spec-value">{voiture.specifications.consommation} L/100km</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Configuration (si voiture neuve) */}
            {voiture.voiture?.type_voiture === true && (
              <div className="voiture-config">
                <h2 className="voiture-config-title">Configuration</h2>
                <div className="voiture-config-grid">
                  {voiture.couleur_exterieur && (
                    <div className="voiture-config-item">
                      <span className="voiture-config-label">Couleur extérieure</span>
                      <span className="voiture-config-value">{voiture.couleur_exterieur.nom_couleur}</span>
                    </div>
                  )}
                  {voiture.couleur_interieur && voiture.couleur_interieur.length > 0 && (
                    <div className="voiture-config-item">
                      <span className="voiture-config-label">Couleur intérieure</span>
                      <span className="voiture-config-value">
                        {voiture.couleur_interieur.map(c => c.nom_couleur).join(', ')}
                      </span>
                    </div>
                  )}
                  {voiture.taille_jante && (
                    <div className="voiture-config-item">
                      <span className="voiture-config-label">Jantes</span>
                      <span className="voiture-config-value">{voiture.taille_jante.taille_jante}"</span>
                    </div>
                  )}
                  {voiture.package && (
                    <div className="voiture-config-item">
                      <span className="voiture-config-label">Package</span>
                      <span className="voiture-config-value">{voiture.package.nom_package}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Boutons d'action */}
            <div className="voiture-actions">
              {voiture.voiture?.type_voiture === true ? (
                <>
                  <Button fullWidth size="lg" onClick={handleConfigurer}>
                    Configurer votre Porsche
                  </Button>
                  <Button fullWidth size="lg" variant="outline" onClick={handleReservation}>
                    Ajouter au panier
                  </Button>
                </>
              ) : (
                <Button fullWidth size="lg" onClick={handleReservation}>
                  Réserver cette voiture d'occasion
                </Button>
              )}
            </div>

            {/* Information livraison */}
            <div className="voiture-delivery-info">
              <div className="voiture-delivery-item">
                <svg className="voiture-delivery-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>Garantie Porsche Approved</span>
              </div>
              <div className="voiture-delivery-item">
                <svg className="voiture-delivery-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Possibilité d'essai sur route</span>
              </div>
              <div className="voiture-delivery-item">
                <svg className="voiture-delivery-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <span>Financement disponible</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoitureDetail;

