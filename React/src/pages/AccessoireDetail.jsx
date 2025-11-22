import { useState, useEffect, useCallback, useContext } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { accesoireService } from '../services';
import { AuthContext } from '../context/AuthContext.jsx';
import usePanierAPI from '../hooks/usePanierAPI.jsx';
import { Loading, Button } from '../components/common';
import LoginPromptModal from '../components/modals/LoginPromptModal.jsx';
import { formatPrice } from '../utils/format.js';
import buildUrl from '../utils/buildUrl';
import '../css/AccessoireDetail.css';
import '../css/components/Message.css';

const AccessoireDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { ajouterAccessoire } = usePanierAPI();
  const { isAuthenticated } = useContext(AuthContext);

  const [accessoire, setAccessoire] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [photoActive, setPhotoActive] = useState(0);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const fetchAccessoire = useCallback(async () => {
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
  }, [id]);

  useEffect(() => {
    fetchAccessoire();
  }, [fetchAccessoire]);

  const handleAddToCart = async () => {
    if (!isAuthenticated()) {
      setShowLoginPrompt(true);
      return;
    }

    if (accessoire) {
      try {
        await ajouterAccessoire(accessoire._id, 1);
        setSuccess('Accessoire ajouté au panier !');
        setTimeout(() => {
          setSuccess('');
        }, 3000);
      } catch (err) {
        setError(err.message || 'Erreur lors de l\'ajout au panier');
        setTimeout(() => {
          setError('');
        }, 3000);
      }
    }
  };

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
        <div className="message-box message-error">
          <p>{error || 'Accessoire introuvable'}</p>
        </div>
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
          <div className="message-box message-success">
            <p>{success}</p>
          </div>
        </div>
      )}

      {showLoginPrompt && (
        <LoginPromptModal
          onClose={() => setShowLoginPrompt(false)}
          onLogin={() => navigate('/login', { state: { from: location.pathname } })}
          title="Connexion requise"
          message="Vous devez être connecté pour ajouter un accessoire au panier. Connectez-vous ou créez un compte pour continuer."
        />
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
                    src={buildUrl(photos[photoActive]?.name)}
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
                    key={photo._id || `photo-${index}`}
                    onClick={() => setPhotoActive(index)}
                    className={`gallery-thumb-porsche ${photoActive === index ? 'gallery-thumb-active-porsche' : ''}`}
                    aria-label={`Voir la photo ${index + 1}`}
                  >
                    <img
                      src={buildUrl(photo?.name)}
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
                AJOUTER AU PANIER
              </button>
            </div>

            {/* Sections d'informations supplémentaires */}
            <div className="accessoire-sections-porsche">
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

