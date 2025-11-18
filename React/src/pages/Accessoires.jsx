import { useState, useEffect } from 'react';
import accesoireService from '../services/accesoire.service.jsx';
import { usePanier } from '../hooks/usePanier.jsx';
import { Loading, Card, Button, Alert } from '../components/common';
import './Accessoires.css';

/**
 * Page catalogue des accessoires avec images et filtres
 */
const Accessoires = () => {
  const [accessoires, setAccessoires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [filtreType, setFiltreType] = useState('tous');
  const { ajouterAccessoire } = usePanier();

  useEffect(() => {
    fetchAccessoires();
  }, []);

  const fetchAccessoires = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await accesoireService.getAllAccessoires();
      setAccessoires(data);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des accessoires');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAjouterAuPanier = (accessoire) => {
    ajouterAccessoire(accessoire, 1);
    setSuccessMessage(`${accessoire.nom_accesoire} ajouté au panier`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Filtrer les accessoires
  const accessoiresFiltres = accessoires.filter((acc) => {
    if (filtreType === 'tous') return true;
    return acc.type_accesoire === filtreType;
  });

  // Types disponibles
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
        {/* En-tête */}
        <div className="accessoires-header">
          <div>
            <h1 className="accessoires-title">Accessoires Porsche</h1>
            <p className="accessoires-subtitle">
              Personnalisez votre expérience avec nos accessoires premium
            </p>
          </div>
        </div>

        {/* Message de succès */}
        {successMessage && (
          <Alert variant="success" onClose={() => setSuccessMessage('')}>
            {successMessage}
          </Alert>
        )}

        {/* Filtres par type */}
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

        {/* Compteur */}
        <div className="accessoires-count">
          <p>{accessoiresFiltres.length} accessoire{accessoiresFiltres.length > 1 ? 's' : ''}</p>
        </div>

        {/* Liste des accessoires */}
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
          <div className="accessoires-grid">
            {accessoiresFiltres.map((accessoire) => (
              <Card key={accessoire._id} hover padding="md">
                {/* Image */}
                <div className="accessoire-image-container">
                  {accessoire.photo_accesoire && accessoire.photo_accesoire.length > 0 ? (
                    <img
                      src={`http://localhost:3000${accessoire.photo_accesoire[0].name}`}
                      alt={accessoire.photo_accesoire[0].alt || accessoire.nom_accesoire}
                      className="accessoire-image"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className="accessoire-image-placeholder" 
                    style={{ display: accessoire.photo_accesoire && accessoire.photo_accesoire.length > 0 ? 'none' : 'flex' }}
                  >
                    <span className="accessoire-image-letter">
                      {accessoire.nom_accesoire?.charAt(0) || '?'}
                    </span>
                  </div>
                </div>

                {/* Informations */}
                <div className="accessoire-details">
                  {/* Type badge */}
                  {accessoire.type_accesoire && (
                    <span className="accessoire-type-badge">
                      {accessoire.type_accesoire}
                    </span>
                  )}

                  <h3 className="accessoire-name">
                    {accessoire.nom_accesoire}
                  </h3>

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
                        <p className="accessoire-price">
                          {new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(accessoire.prix)}
                        </p>

                  {/* Bouton */}
                  <Button
                    fullWidth
                    onClick={() => handleAjouterAuPanier(accessoire)}
                  >
                    Ajouter au panier
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

export default Accessoires;
