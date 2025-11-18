import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { voitureService, modelPorscheService } from '../services';
import { Loading, Alert } from '../components/common';
import { formatPrice } from '../utils/format.js';
import './ListeVariantes.css';

/**
 * Page Liste des Variantes (Carrera, Carrera S, GTS, Turbo...)
 * Troisième étape: afficher les variantes d'un modèle
 */
const ListeVariantes = () => {
  const { type, modeleId } = useParams(); // type: 'neuve'/'occasion', modeleId: ID du modèle
  const navigate = useNavigate();
  const [modele, setModele] = useState(null);
  const [variantes, setVariantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isNeuf = type === 'neuve';

  useEffect(() => {
    fetchData();
  }, [type, modeleId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Récupérer le modèle
      const modeleData = await voitureService.getById(modeleId);
      setModele(modeleData);
      
      // Récupérer toutes les variantes de ce modèle
      const response = await modelPorscheService.getAllModels();
      
      // Vérifier que la réponse est bien un tableau
      const allVariantes = Array.isArray(response) ? response : [];
      
      // Filtrer les variantes qui correspondent à ce modèle et type
      const filteredVariantes = allVariantes.filter(variante => 
        variante.voiture?._id === modeleId &&
        variante.voiture?.type_voiture === isNeuf
      );
      
      setVariantes(filteredVariantes);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des variantes');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleVarianteClick = (variante) => {
    if (isNeuf) {
      // Pour voiture neuve: aller vers la page de configuration complète
      navigate(`/configuration/${variante._id}`);
    } else {
      // Pour voiture d'occasion: aller vers la page détail (réservation)
      navigate(`/voitures/${variante._id}`);
    }
  };

  if (loading) {
    return <Loading fullScreen message="Chargement des variantes..." />;
  }

  if (error) {
    return (
      <div className="error-container">
        <Alert variant="error">{error}</Alert>
      </div>
    );
  }

  return (
    <div className="variantes-container">
      <div className="variantes-content">
        {/* En-tête */}
        <div className="variantes-header">
          <button 
            onClick={() => navigate(`/catalogue/${type}`)} 
            className="variantes-back-btn"
          >
            ← Retour aux modèles
          </button>
          <h1 className="variantes-title">
            {modele?.nom_model} {isNeuf ? '- Neuves' : '- Occasions'}
          </h1>
          <p className="variantes-subtitle">
            {modele?.description || 'Choisissez votre variante'}
          </p>
        </div>

        {/* Liste des variantes */}
        {variantes.length === 0 ? (
          <div className="variantes-empty">
            <p>Aucune variante disponible pour ce modèle.</p>
          </div>
        ) : (
          <div className="variantes-grid">
            {variantes.map((variante) => (
              <button
                key={variante._id}
                onClick={() => handleVarianteClick(variante)}
                className="variante-card"
              >
                {/* Image */}
                <div className="variante-image-container">
                  {variante.photo_porsche && variante.photo_porsche.length > 0 ? (
                    <img
                      src={`http://localhost:3000${variante.photo_porsche[0].name}`}
                      alt={variante.nom_model}
                      className="variante-image"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className="variante-placeholder"
                    style={{ display: variante.photo_porsche && variante.photo_porsche.length > 0 ? 'none' : 'flex' }}
                  >
                    <span className="variante-letter">
                      {variante.nom_model?.charAt(0) || '?'}
                    </span>
                  </div>
                </div>

                {/* Informations */}
                <div className="variante-info">
                  {/* Badges */}
                  <div className="variante-badges">
                    <span className={`variante-badge ${isNeuf ? 'variante-badge-new' : 'variante-badge-used'}`}>
                      {isNeuf ? '✨ Neuve' : '🔄 Occasion'}
                    </span>
                    {variante.disponible && (
                      <span className="variante-badge variante-badge-disponible">
                        ✅ Disponible
                      </span>
                    )}
                  </div>

                  <h2 className="variante-name">{variante.nom_model}</h2>
                  
                  {variante.description && (
                    <p className="variante-description">
                      {variante.description.length > 120
                        ? variante.description.substring(0, 120) + '...'
                        : variante.description
                      }
                    </p>
                  )}

                  {/* Spécifications */}
                  {variante.specifications && (
                    <div className="variante-specs">
                      {variante.specifications.puissance && (
                        <div className="variante-spec-item">
                          <span className="variante-spec-label">💪</span>
                          <span className="variante-spec-value">{variante.specifications.puissance} ch</span>
                        </div>
                      )}
                      {variante.specifications.acceleration_0_100 && (
                        <div className="variante-spec-item">
                          <span className="variante-spec-label">🚀</span>
                          <span className="variante-spec-value">0-100: {variante.specifications.acceleration_0_100}s</span>
                        </div>
                      )}
                      {variante.type_carrosserie && (
                        <div className="variante-spec-item">
                          <span className="variante-spec-label">🏎️</span>
                          <span className="variante-spec-value">{variante.type_carrosserie}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Prix */}
                  {variante.prix_base && (
                    <div className="variante-price">
                      <span className="variante-price-label">
                        {isNeuf ? 'À partir de' : 'Prix'}
                      </span>
                      <span className="variante-price-value">
                        {formatPrice(variante.prix_base)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="variante-cta">
                  {isNeuf ? 'Configurer →' : 'Voir les détails →'}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListeVariantes;

