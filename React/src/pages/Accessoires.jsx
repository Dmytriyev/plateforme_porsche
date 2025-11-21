import { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import accesoireService from '../services/accesoire.service.js';
import { PanierContext } from '../context/PanierContext.jsx';
import { AuthContext } from '../context/AuthContext.jsx';
import { Loading, Alert } from '../components/common';
import LoginPromptModal from '../components/modals/LoginPromptModal.jsx';
import buildUrl from '../utils/buildUrl';
import '../css/Accessoires.css';

const Accessoires = () => {
  const navigate = useNavigate();
  const [accessoires, setAccessoires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [filtreType, setFiltreType] = useState('tous');
  const [wishlist, setWishlist] = useState(new Set());
  const { ajouterAccessoire } = useContext(PanierContext);
  const { isAuthenticated } = useContext(AuthContext);
  const location = useLocation();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    fetchAccessoires();
  }, []);

  const fetchAccessoires = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await accesoireService.getAllAccessoires();

      if (Array.isArray(data)) {
        setAccessoires(data);
      } else {
        setError('Format de données invalide');
        setAccessoires([]);
      }
    } catch (err) {
      setError(err?.message || err?.response?.data?.message || 'Erreur lors du chargement des accessoires');
      setAccessoires([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAjouterAuPanier = (accessoire) => {
    if (!isAuthenticated()) {
      setShowLoginPrompt(true);
      return;
    }

    ajouterAccessoire(accessoire, 1);
    setSuccessMessage(`${accessoire.nom_accesoire} ajouté au panier`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  const handleToggleWishlist = (accessoireId, e) => {
    e.stopPropagation();
    setWishlist(prev => {
      const newSet = new Set(prev);
      if (newSet.has(accessoireId)) {
        newSet.delete(accessoireId);
      } else {
        newSet.add(accessoireId);
      }
      return newSet;
    });
  };

  const handleVoirDetails = (accessoireId) => {
    navigate(`/accessoires/detail/${accessoireId}`);
  };
  const accessoiresFiltres = accessoires.filter((acc) =>
    filtreType === 'tous' || acc.type_accesoire === filtreType
  );

  const types = ['tous', ...new Set(accessoires.map(a => a.type_accesoire).filter(Boolean))];

  if (loading) return <Loading fullScreen message="Chargement des accessoires..." />;

  if (error) {
    return (
      <div className="error-container">
        <Alert variant="error">{error}</Alert>
      </div>
    );
  }

  return (
    <div className="accessoires-container">
      <div className="accessoires-content">
        <div className="accessoires-header">
          <div>
            <h1 className="accessoires-title">Accessoires Porsche</h1>
            <p className="accessoires-subtitle">
              Personnalisez votre expérience avec nos accessoires premium
            </p>
          </div>
        </div>

        {successMessage && (
          <Alert variant="success" onClose={() => setSuccessMessage('')}>
            {successMessage}
          </Alert>
        )}

        {showLoginPrompt && (
          <LoginPromptModal
            onClose={() => setShowLoginPrompt(false)}
            onLogin={() => navigate('/login', { state: { from: location.pathname } })}
            title="Connexion requise"
            message="Vous devez être connecté pour ajouter un accessoire au panier. Connectez‑vous ou créez un compte pour continuer."
            primaryText="Se connecter / Créer un compte"
            secondaryText="Annuler"
          />
        )}

        {types.length > 1 && (
          <div className="accessoires-filtres">
            {types.map((type) => (
              <button
                key={type}
                className={`accessoires-filtre-btn ${filtreType === type ? 'active' : ''}`}
                onClick={() => setFiltreType(type)}
              >
                {type === 'tous' ? 'Tous' : type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        )}

        <div className="accessoires-count">
          <p>{accessoiresFiltres.length} accessoire{accessoiresFiltres.length > 1 ? 's' : ''}</p>
        </div>

        {accessoiresFiltres.length === 0 ? (
          <div className="accessoires-empty">
            <svg className="accessoires-empty-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <p className="accessoires-empty-text">
              Aucun accessoire disponible pour le moment.
            </p>
          </div>
        ) : (
          <div className="accessoires-grid-porsche">
            {accessoiresFiltres.map((accessoire) => {
              const photoPrincipale = accessoire.photo_accesoire?.[0] || null;
              const photoUrl = photoPrincipale?.name ? buildUrl(photoPrincipale.name) : null;
              const isWishlisted = wishlist.has(accessoire._id);
              const isOutOfStock = accessoire.stock === 0 || accessoire.disponible === false;
              const hasDiscount = accessoire.prix_promotion && accessoire.prix_promotion < accessoire.prix;

              return (
                <div key={accessoire._id} className="accessoire-card-porsche" data-accessoire-id={accessoire._id}>
                  <div className="accessoire-card-image-container">
                    {isOutOfStock && (
                      <div className="accessoire-card-out-of-stock">
                        En rupture de stock
                      </div>
                    )}
                    {photoUrl ? (
                      <img
                        src={photoUrl}
                        alt={photoPrincipale?.alt || accessoire.nom_accesoire}
                        className="accessoire-card-image"
                        loading="lazy"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          if (e.target.nextSibling) {
                            e.target.nextSibling.style.display = 'flex';
                          }
                        }}
                        onLoad={() => {
                          const placeholder = document.querySelector(`.accessoire-card-porsche[data-accessoire-id="${accessoire._id}"] .accessoire-card-image-placeholder`);
                          if (placeholder) {
                            placeholder.style.display = 'none';
                          }
                        }}
                      />
                    ) : null}
                    <div
                      className="accessoire-card-image-placeholder"
                      style={{ display: photoUrl ? 'none' : 'flex' }}
                    >
                      <span className="accessoire-card-image-letter">
                        {accessoire.nom_accesoire?.charAt(0) || '?'}
                      </span>
                    </div>
                    <button
                      className={`accessoire-card-wishlist ${isWishlisted ? 'active' : ''}`}
                      onClick={(e) => handleToggleWishlist(accessoire._id, e)}
                      aria-label={isWishlisted ? 'Retirer de la liste de souhaits' : 'Ajouter à la liste de souhaits'}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill={isWishlisted ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </button>
                  </div>

                  <div className="accessoire-card-content">
                    <div className="accessoire-card-brand">PORSCHE DESIGN</div>

                    <h3 className="accessoire-card-name">
                      {accessoire.nom_accesoire}
                    </h3>

                    <div className="accessoire-card-price">
                      {hasDiscount ? (
                        <>
                          <span className="accessoire-card-price-old">
                            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(accessoire.prix)}
                          </span>
                          <span className="accessoire-card-price-new">
                            {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(accessoire.prix_promotion)}
                          </span>
                        </>
                      ) : (
                        <span className="accessoire-card-price-current">
                          {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR', minimumFractionDigits: 2 }).format(accessoire.prix)}
                        </span>
                      )}
                    </div>

                    <div className="accessoire-card-actions">
                      <button
                        className="accessoire-card-btn accessoire-card-btn-primary"
                        onClick={() => handleAjouterAuPanier(accessoire)}
                        disabled={isOutOfStock}
                      >
                        Ajouter au panier
                      </button>
                      <button
                        className="accessoire-card-btn accessoire-card-btn-secondary"
                        onClick={() => handleVoirDetails(accessoire._id)}
                      >
                        Détails
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Accessoires;
