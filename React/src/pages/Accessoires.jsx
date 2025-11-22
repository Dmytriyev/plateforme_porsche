import { useState, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import accesoireService from '../services/accesoire.service.js';
import { PanierContext } from '../context/PanierContext.jsx';
import { AuthContext } from '../context/AuthContext.jsx';
import { Loading } from '../components/common';
import LoginPromptModal from '../components/modals/LoginPromptModal.jsx';
import buildUrl from '../utils/buildUrl';
import '../css/Accessoires.css';
import '../css/components/Message.css';

const Accessoires = () => {
  const navigate = useNavigate();
  const [accessoires, setAccessoires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [filtreType, setFiltreType] = useState('tous');
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
        <div className="message-box message-error">
          <p>{error}</p>
        </div>
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
          <div className="message-box message-success">
            <p>{successMessage}</p>
            <button onClick={() => setSuccessMessage('')} className="message-close">×</button>
          </div>
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
                {type === 'tous' ? 'Tous les produits' : type === 'Porsche Design' ? 'Porsche Design portes-clés' : type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        )}

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
              const isOutOfStock = accessoire.stock === 0 || accessoire.disponible === false;
              const hasDiscount = accessoire.prix_promotion && accessoire.prix_promotion < accessoire.prix;

              return (
                <div key={accessoire._id} className="accessoire-card-porsche" data-accessoire-id={accessoire._id}>
                  <div className="accessoire-card-image-container">
                    {hasDiscount && !isOutOfStock && (
                      <div className="accessoire-card-badge">
                        Cyber Week
                      </div>
                    )}
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
                  </div>

                  <div className="accessoire-card-content">
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
                        AJOUTER AU PANIER
                      </button>
                      <button
                        className="accessoire-card-btn accessoire-card-btn-secondary"
                        onClick={() => handleVoirDetails(accessoire._id)}
                      >
                        DÉTAILS
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
