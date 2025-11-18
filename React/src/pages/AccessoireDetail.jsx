import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { accesoireService } from '../services';
import { usePanier } from '../hooks/usePanier.jsx';
import { Loading, Alert, Button } from '../components/common';
import { formatPrice } from '../utils/format.js';
import './AccessoireDetail.css';

/**
 * Page Détail d'un Accessoire
 * Affiche toutes les photos et informations complètes
 */
const AccessoireDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { ajouterAccessoire } = usePanier();
  
  const [accessoire, setAccessoire] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [photoActive, setPhotoActive] = useState(0);

  useEffect(() => {
    fetchAccessoire();
  }, [id]);

  const fetchAccessoire = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await accesoireService.getAccessoireById(id);
      setAccessoire(data);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement de l\'accessoire');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (accessoire) {
      ajouterAccessoire(accessoire, 1);
      setSuccess('Accessoire ajouté au panier !');
      setTimeout(() => {
        navigate('/panier');
      }, 1500);
    }
  };

  if (loading) {
    return <Loading fullScreen message="Chargement de l'accessoire..." />;
  }

  if (error || !accessoire) {
    return (
      <div className="error-container">
        <Alert variant="error">{error || 'Accessoire introuvable'}</Alert>
        <Button onClick={() => navigate('/accessoires')}>
          Retour aux accessoires
        </Button>
      </div>
    );
  }

  return (
    <div className="accessoire-detail-container">
      {success && <Alert variant="success">{success}</Alert>}

      <div className="accessoire-detail-content">
        {/* Bouton retour */}
        <button 
          onClick={() => navigate(-1)} 
          className="detail-back-btn"
        >
          ← Retour
        </button>

        {/* Contenu principal */}
        <div className="accessoire-detail-grid">
          {/* Galerie photos */}
          <div className="accessoire-detail-gallery">
            {/* Photo principale */}
            <div className="gallery-main">
              {accessoire.photo_accesoire && accessoire.photo_accesoire.length > 0 ? (
                <img
                  src={`http://localhost:3000${accessoire.photo_accesoire[photoActive].name}`}
                  alt={accessoire.photo_accesoire[photoActive].alt || accessoire.nom_accesoire}
                  className="gallery-main-image"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div 
                className="gallery-main-placeholder"
                style={{ display: accessoire.photo_accesoire && accessoire.photo_accesoire.length > 0 ? 'none' : 'flex' }}
              >
                <span className="gallery-placeholder-letter">
                  {accessoire.nom_accesoire?.charAt(0) || '?'}
                </span>
              </div>
            </div>

            {/* Miniatures */}
            {accessoire.photo_accesoire && accessoire.photo_accesoire.length > 1 && (
              <div className="gallery-thumbs">
                {accessoire.photo_accesoire.map((photo, index) => (
                  <button
                    key={index}
                    onClick={() => setPhotoActive(index)}
                    className={`gallery-thumb ${photoActive === index ? 'gallery-thumb-active' : ''}`}
                  >
                    <img
                      src={`http://localhost:3000${photo.name}`}
                      alt={photo.alt || `Photo ${index + 1}`}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Informations */}
          <div className="accessoire-detail-info">
            {/* Type */}
            {accessoire.type_accesoire && (
              <span className="detail-type-badge">
                {accessoire.type_accesoire}
              </span>
            )}

            {/* Nom */}
            <h1 className="detail-name">{accessoire.nom_accesoire}</h1>

            {/* Description */}
            {accessoire.description && (
              <p className="detail-description">{accessoire.description}</p>
            )}

            {/* Détails supplémentaires */}
            <div className="detail-features">
              {/* Couleur */}
              {accessoire.couleur_accesoire && (
                <div className="detail-feature-item">
                  <span className="detail-feature-label">Couleur</span>
                  <span className="detail-feature-value">
                    {accessoire.couleur_accesoire.nom_couleur}
                  </span>
                </div>
              )}

              {/* Type */}
              {accessoire.type_accesoire && (
                <div className="detail-feature-item">
                  <span className="detail-feature-label">Catégorie</span>
                  <span className="detail-feature-value">
                    {accessoire.type_accesoire.charAt(0).toUpperCase() + accessoire.type_accesoire.slice(1)}
                  </span>
                </div>
              )}
            </div>

            {/* Prix et action */}
            <div className="detail-purchase">
              <div className="detail-price-box">
                <span className="detail-price-label">Prix</span>
                <span className="detail-price-value">
                  {formatPrice(accessoire.prix)}
                </span>
              </div>

              <Button 
                size="lg" 
                fullWidth 
                onClick={handleAddToCart}
              >
                Ajouter au panier
              </Button>
            </div>

            {/* Informations complémentaires */}
            <div className="detail-info-card">
              <h3>Accessoire Porsche Authentique</h3>
              <p>
                Tous nos accessoires sont authentiques et bénéficient de la même 
                qualité et attention aux détails que nos véhicules.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessoireDetail;

