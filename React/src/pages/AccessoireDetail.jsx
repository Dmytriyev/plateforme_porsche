import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { accesoireService } from '../services';
import { usePanier } from '../hooks/usePanier.jsx';
import { Loading, Alert, Button } from '../components/common';
import { formatPrice } from '../utils/format.js';
import { API_URL } from '../config/api.jsx';
import './AccessoireDetail.css';

const AccessoireDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { ajouterAccessoire } = usePanier();

  const [accessoire, setAccessoire] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [photoActive, setPhotoActive] = useState(0);
  const [isWishlist, setIsWishlist] = useState(false);

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
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = () => {
    if (accessoire) {
      ajouterAccessoire(accessoire, 1);
      setSuccess('Accessoire ajouté au panier !');
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    }
  };

  const handleToggleWishlist = () => setIsWishlist((s) => !s);

  const handlePrevPhoto = () => {
    if (accessoire?.photo_accesoire && accessoire.photo_accesoire.length > 0) {
      setPhotoActive((prev) =>
        prev === 0 ? accessoire.photo_accesoire.length - 1 : prev - 1
      );
    }
  };

  const handleNextPhoto = () => {
    if (accessoire?.photo_accesoire && accessoire.photo_accesoire.length > 0) {
      setPhotoActive((prev) =>
        prev === accessoire.photo_accesoire.length - 1 ? 0 : prev + 1
      );
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

  const photos = accessoire?.photo_accesoire || [];
  const hasMultiplePhotos = photos.length > 1;

  return (
    <div className="accessoire-detail-container-porsche">
      {success && (
        <div className="accessoire-success-message">
          <Alert variant="success">{success}</Alert>
        </div>
      )}

      <div className="accessoire-detail-content-porsche">
        {/* Breadcrumb */}
        <nav className="accessoire-breadcrumb">
          <Link to="/accessoires" className="breadcrumb-link">
            Accessoires
          </Link>
          {accessoire?.type_accesoire && (
            <>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-current">
                {accessoire.type_accesoire.charAt(0).toUpperCase() + accessoire.type_accesoire.slice(1)}
              </span>
            </>
          )}
          <span className="breadcrumb-separator">/</span>
          <span className="breadcrumb-current">{accessoire?.nom_accesoire}</span>
        </nav>

        {/* Contenu principal */}
        <div className="accessoire-detail-grid-porsche">
          {/* Galerie photos */}
          <div className="accessoire-gallery-porsche">
            {/* Photo principale avec navigation */}
            <div className="gallery-main-porsche">
              {photos.length > 0 ? (
                <>
                  {hasMultiplePhotos && (
                    <button
                      className="gallery-nav-btn gallery-nav-prev"
                      onClick={handlePrevPhoto}
                      aria-label="Photo précédente"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                      </svg>
                    </button>
                  )}
                  <img
                    src={photos[photoActive]?.name?.startsWith('http')
                      ? photos[photoActive].name
                      : photos[photoActive]?.name?.startsWith('/')
                        ? `${API_URL}${photos[photoActive].name}`
                        : `${API_URL}/${photos[photoActive].name}`}
                    alt={photos[photoActive]?.alt || accessoire.nom_accesoire}
                    className="gallery-main-image-porsche"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      if (e.target.nextSibling) {
                        e.target.nextSibling.style.display = 'flex';
                      }
                    }}
                  />
                  {hasMultiplePhotos && (
                    <button
                      className="gallery-nav-btn gallery-nav-next"
                      onClick={handleNextPhoto}
                      aria-label="Photo suivante"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </button>
                  )}
                  {hasMultiplePhotos && (
                    <div className="gallery-counter">
                      {photoActive + 1} / {photos.length}
                    </div>
                  )}
                </>
              ) : (
                <div className="gallery-main-placeholder-porsche">
                  <span className="gallery-placeholder-letter-porsche">
                    {accessoire.nom_accesoire?.charAt(0) || '?'}
                  </span>
                </div>
              )}
            </div>

            {/* Miniatures */}
            {hasMultiplePhotos && (
              <div className="gallery-thumbs-porsche">
                {photos.map((photo, index) => (
                  <button
                    key={index}
                    onClick={() => setPhotoActive(index)}
                    className={`gallery-thumb-porsche ${photoActive === index ? 'gallery-thumb-active-porsche' : ''}`}
                    aria-label={`Voir la photo ${index + 1}`}
                  >
                    <img
                      src={photo?.name?.startsWith('http')
                        ? photo.name
                        : photo?.name?.startsWith('/')
                          ? `${API_URL}${photo.name}`
                          : `${API_URL}/${photo.name}`}
                      alt={photo?.alt || `Photo ${index + 1}`}
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
          <div className="accessoire-info-porsche">
            {/* Wishlist icon en haut à droite */}
            <div className="accessoire-wishlist-header">
              <button
                className={`accessoire-wishlist-icon-btn ${isWishlist ? 'active' : ''}`}
                onClick={handleToggleWishlist}
                aria-label={isWishlist ? 'Retirer de la liste de souhaits' : 'Ajouter à la liste de souhaits'}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill={isWishlist ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                </svg>
              </button>
            </div>

            {/* Catégorie */}
            <div className="accessoire-category-porsche">
              Accessoires {accessoire?.type_accesoire && `/${accessoire.type_accesoire.charAt(0).toUpperCase() + accessoire.type_accesoire.slice(1)}`}
            </div>

            {/* Nom du produit */}
            <h1 className="accessoire-title-porsche">
              {accessoire.nom_accesoire}
            </h1>

            {/* Prix */}
            <div className="accessoire-price-porsche">
              {formatPrice(accessoire.prix)} T.T.C.
            </div>

            {/* Description courte */}
            {accessoire.description && (
              <div className="accessoire-short-description-porsche">
                {accessoire.description.length > 150 
                  ? accessoire.description.substring(0, 150) + '...' 
                  : accessoire.description}
              </div>
            )}

            {/* Bouton Ajouter au panier */}
            <div className="accessoire-actions-porsche">
              <button
                onClick={handleAddToCart}
                className="accessoire-add-cart-btn-porsche"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 0 1-8 0" />
                </svg>
                Ajouter au panier
              </button>
            </div>

            {/* Informations de livraison */}
            <div className="accessoire-delivery-info-porsche">
              <div className="accessoire-delivery-line"></div>
              <span className="accessoire-delivery-text">
                Livraison gratuite en 3–5 jours ouvrables via DHL
              </span>
            </div>

            {/* Sections d'informations supplémentaires */}
            <div className="accessoire-sections-porsche">
              {/* Description complète */}
              {accessoire.description && (
                <section className="accessoire-section-porsche">
                  <h2 className="accessoire-section-title-porsche">Description</h2>
                  <div className="accessoire-section-content-porsche">
                    <p className="accessoire-description-text-porsche">
                      {accessoire.description}
                    </p>
                  </div>
                </section>
              )}

              {/* Caractéristiques générales */}
              <section className="accessoire-section-porsche">
                <h2 className="accessoire-section-title-porsche">Caractéristiques</h2>
                <div className="accessoire-section-content-porsche">
                  {accessoire.type_accesoire && (
                    <div className="accessoire-characteristic-item">
                      <span className="accessoire-characteristic-label">Type</span>
                      <span className="accessoire-characteristic-value">
                        {accessoire.type_accesoire.charAt(0).toUpperCase() + accessoire.type_accesoire.slice(1)}
                      </span>
                    </div>
                  )}
                  {accessoire.couleur_accesoire && (
                    <div className="accessoire-characteristic-item">
                      <span className="accessoire-characteristic-label">Couleur</span>
                      <span className="accessoire-characteristic-value">
                        {accessoire.couleur_accesoire.nom_couleur}
                      </span>
                    </div>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccessoireDetail;

