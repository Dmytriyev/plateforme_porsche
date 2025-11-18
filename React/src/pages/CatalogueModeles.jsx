import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { voitureService } from '../services';
import { Loading, Alert } from '../components/common';
import './CatalogueModeles.css';

/**
 * Page Catalogue des Modèles (911, Cayenne, Cayman...)
 * Deuxième étape: afficher les modèles selon type (neuf/occasion)
 */
const CatalogueModeles = () => {
  const { type } = useParams(); // 'neuve' ou 'occasion'
  const navigate = useNavigate();
  const [modeles, setModeles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isNeuf = type === 'neuve';

  useEffect(() => {
    fetchModeles();
  }, [type]);

  const fetchModeles = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Récupérer tous les modèles de voitures
      const data = await voitureService.getAll();
      
      // Filtrer selon le type (neuf/occasion)
      const filteredModeles = data.filter(voiture => 
        voiture.type_voiture === isNeuf
      );
      
      // Grouper par nom_model pour éviter les doublons
      const uniqueModeles = filteredModeles.reduce((acc, voiture) => {
        if (!acc.find(m => m.nom_model === voiture.nom_model)) {
          acc.push(voiture);
        }
        return acc;
      }, []);
      
      setModeles(uniqueModeles);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des modèles');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleModeleClick = (modele) => {
    // Rediriger vers la liste des variantes de ce modèle
    navigate(`/variantes/${type}/${modele._id}`);
  };

  if (loading) {
    return <Loading fullScreen message="Chargement des modèles..." />;
  }

  if (error) {
    return (
      <div className="error-container">
        <Alert variant="error">{error}</Alert>
      </div>
    );
  }

  return (
    <div className="catalogue-modeles-container">
      <div className="catalogue-modeles-content">
        {/* En-tête */}
        <div className="catalogue-modeles-header">
          <button 
            onClick={() => navigate('/choix-voiture')} 
            className="catalogue-back-btn"
          >
            ← Retour au choix
          </button>
          <h1 className="catalogue-modeles-title">
            {isNeuf ? '✨ Porsche Neuves' : '🔄 Porsche d\'Occasion'}
          </h1>
          <p className="catalogue-modeles-subtitle">
            {isNeuf 
              ? 'Choisissez votre modèle à configurer' 
              : 'Sélectionnez le modèle qui vous intéresse'
            }
          </p>
        </div>

        {/* Liste des modèles */}
        {modeles.length === 0 ? (
          <div className="catalogue-empty">
            <p>Aucun modèle {isNeuf ? 'neuf' : 'd\'occasion'} disponible pour le moment.</p>
          </div>
        ) : (
          <div className="catalogue-modeles-grid">
            {modeles.map((modele) => (
              <button
                key={modele._id}
                onClick={() => handleModeleClick(modele)}
                className="catalogue-modele-card"
              >
                {/* Image */}
                <div className="catalogue-modele-image-container">
                  {modele.photo_voiture && modele.photo_voiture.length > 0 ? (
                    <img
                      src={`http://localhost:3000${modele.photo_voiture[0].name}`}
                      alt={modele.nom_model}
                      className="catalogue-modele-image"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className="catalogue-modele-placeholder"
                    style={{ display: modele.photo_voiture && modele.photo_voiture.length > 0 ? 'none' : 'flex' }}
                  >
                    <span className="catalogue-modele-letter">
                      {modele.nom_model?.charAt(0) || '?'}
                    </span>
                  </div>
                </div>

                {/* Informations */}
                <div className="catalogue-modele-info">
                  <h2 className="catalogue-modele-name">{modele.nom_model}</h2>
                  {modele.description && (
                    <p className="catalogue-modele-description">
                      {modele.description.length > 100 
                        ? modele.description.substring(0, 100) + '...'
                        : modele.description
                      }
                    </p>
                  )}
                  <div className="catalogue-modele-badge">
                    {isNeuf ? '✨ Neuve' : '🔄 Occasion'}
                  </div>
                </div>

                <div className="catalogue-modele-cta">
                  Voir les variantes →
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CatalogueModeles;

