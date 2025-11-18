import { useState, useEffect } from 'react';
import accesoireService from '../services/accesoire.service.jsx';
import { usePanier } from '../hooks/usePanier.jsx';
import { Loading, Card, Button, Alert } from '../components/common';
import { formatPrice } from '../utils/format.js';
import './Accessoires.css';

/**
 * Page catalogue des accessoires
 */
const Accessoires = () => {
  const [accessoires, setAccessoires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const { ajouterAccessoire } = usePanier();

  useEffect(() => {
    const fetchAccessoires = async () => {
      try {
        setLoading(true);
        const data = await accesoireService.getAllAccessoires();
        setAccessoires(data);
      } catch (err) {
        setError('Erreur lors du chargement des accessoires');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAccessoires();
  }, []);

  const handleAjouterAuPanier = (accessoire) => {
    ajouterAccessoire(accessoire, 1);
    setSuccessMessage(`${accessoire.nom} ajouté au panier`);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  if (loading) return <Loading fullScreen message="Chargement des accessoires..." />;

  if (error) {
    return (
      <div className="error-container">
        <Alert type="error" message={error} />
      </div>
    );
  }

  return (
    <div className="accessoires-container">
      <div className="accessoires-content">
        {/* En-tête */}
        <div className="accessoires-header">
          <h1 className="accessoires-title">Accessoires Porsche</h1>
          <p className="accessoires-subtitle">
            Personnalisez votre expérience avec nos accessoires premium
          </p>
        </div>

        {/* Message de succès */}
        {successMessage && (
          <div className="accessoires-success">
            <Alert type="success" message={successMessage} onClose={() => setSuccessMessage('')} />
          </div>
        )}

        {/* Liste des accessoires */}
        {accessoires.length === 0 ? (
          <div className="accessoires-empty">
            <p className="accessoires-empty-text">
              Aucun accessoire disponible pour le moment.
            </p>
          </div>
        ) : (
          <div className="accessoires-grid">
            {accessoires.map((accessoire) => (
              <Card key={accessoire._id} hover padding="md">
                {/* Image placeholder */}
                <div className="accessoire-image-placeholder">
                  <span className="accessoire-image-icon">🏎️</span>
                </div>

                {/* Informations */}
                <div className="accessoire-details">
                  <h3 className="accessoire-name">
                    {accessoire.nom}
                  </h3>

                  {accessoire.description && (
                    <p className="accessoire-description">
                      {accessoire.description}
                    </p>
                  )}

                  {/* Prix */}
                  <p className="accessoire-price">
                    {formatPrice(accessoire.prix)}
                  </p>

                  {/* Stock */}
                  {accessoire.stock !== undefined && (
                    <p className="accessoire-stock">
                      {accessoire.stock > 0 ? (
                        <span className="accessoire-stock-available">En stock ({accessoire.stock})</span>
                      ) : (
                        <span className="accessoire-stock-unavailable">Rupture de stock</span>
                      )}
                    </p>
                  )}

                  {/* Bouton */}
                  <Button
                    fullWidth
                    disabled={accessoire.stock === 0}
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
