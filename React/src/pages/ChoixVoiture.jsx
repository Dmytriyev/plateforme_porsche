import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { voitureService } from '../services';
import { API_URL } from '../config/api.jsx';
import './ChoixVoiture.css';

/**
 * Page de Choix Initial: Neuf ou Occasion
 * Première étape du parcours client
 * 
 * EXPLICATION POUR ÉTUDIANT:
 * ==========================
 * Cette page permet à l'utilisateur de choisir entre :
 * - Voiture Neuve : Configuration personnalisée
 * - Voiture d'Occasion : Modèles certifiés disponibles
 * 
 * Chaque carte contient :
 * - Une image générale en haut (récupérée depuis l'API si disponible)
 * - Le titre ("Voiture Neuve" ou "Voiture d'Occasion")
 * - Une petite description
 * - Un bouton d'action (CTA)
 * 
 * Concepts utilisés:
 * - useState: Gère l'état des images récupérées
 * - useEffect: Charge les images au montage du composant
 * - API: Récupère les photos depuis la base de données
 */
const ChoixVoiture = () => {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);
  const [imageNeuve, setImageNeuve] = useState(null);
  const [imageOccasion, setImageOccasion] = useState(null);

  useEffect(() => {
    fetchImages();
  }, []);

  /**
   * Récupérer les images depuis l'API
   * 
   * EXPLICATION POUR ÉTUDIANT:
   * ==========================
   * Cette fonction charge les images depuis la base de données :
   * - Pour "Neuve" : Récupère la première voiture neuve avec photo
   * - Pour "Occasion" : Récupère la première occasion avec photo
   * 
   * Si aucune image n'est disponible, on utilise un placeholder.
   */
  const fetchImages = async () => {
    try {
      // Récupérer une image pour "Neuve"
      const voituresNeuves = await voitureService.getVoituresNeuves();
      if (Array.isArray(voituresNeuves) && voituresNeuves.length > 0) {
        const voitureNeuve = voituresNeuves.find(v => 
          v.photo_voiture && 
          Array.isArray(v.photo_voiture) && 
          v.photo_voiture.length > 0
        );
        if (voitureNeuve && voitureNeuve.photo_voiture[0]) {
          setImageNeuve(voitureNeuve.photo_voiture[0]);
        }
      }

      // Récupérer une image pour "Occasion"
      const voituresOccasions = await voitureService.getVoituresOccasion();
      if (Array.isArray(voituresOccasions) && voituresOccasions.length > 0) {
        const voitureOccasion = voituresOccasions.find(v => 
          v.photo_voiture && 
          Array.isArray(v.photo_voiture) && 
          v.photo_voiture.length > 0
        );
        if (voitureOccasion && voitureOccasion.photo_voiture[0]) {
          setImageOccasion(voitureOccasion.photo_voiture[0]);
        }
      }
    } catch (error) {
      // En cas d'erreur, on continue avec les placeholders
    }
  };

  const handleChoix = (type) => {
    navigate(`/catalogue/${type}`);
  };

  return (
    <div className="choix-container">
      <div className="choix-content">
        {/* En-tête */}
        <div className="choix-header">
          <h1 className="choix-title">Choisissez votre Porsche</h1>
          <p className="choix-subtitle">
            Configurez votre Porsche neuve ou découvrez nos modèles d'occasion certifiés
          </p>
        </div>

        {/* Cartes de choix */}
        <div className="choix-grid">
          {/* Voiture Neuve */}
          <button
            className={`choix-card ${hoveredCard === 'neuve' ? 'choix-card-hover' : ''}`}
            onClick={() => handleChoix('neuve')}
            onMouseEnter={() => setHoveredCard('neuve')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            {/* Image générale */}
            <div className="choix-card-image">
              {imageNeuve && imageNeuve.name ? (
                <img
                  src={imageNeuve.name?.startsWith('http')
                    ? imageNeuve.name
                    : imageNeuve.name?.startsWith('/')
                      ? `${API_URL}${imageNeuve.name}`
                      : `${API_URL}/${imageNeuve.name}`}
                  alt="Porsche Neuve"
                  className="choix-card-img"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    if (e.target.nextSibling) {
                      e.target.nextSibling.style.display = 'flex';
                    }
                  }}
                />
              ) : null}
              <div
                className="choix-card-image-placeholder"
                style={{ display: imageNeuve && imageNeuve.name ? 'none' : 'flex' }}
              >
                <span className="choix-card-image-text">Porsche Neuve</span>
              </div>
            </div>

            <h2 className="choix-card-title">Voiture Neuve</h2>
            <p className="choix-card-description">
              Configurez votre Porsche selon vos envies
            </p>
            <div className="choix-card-cta">
              Configurer ma Porsche →
            </div>
          </button>

          {/* Voiture d'Occasion */}
          <button
            className={`choix-card ${hoveredCard === 'occasion' ? 'choix-card-hover' : ''}`}
            onClick={() => handleChoix('occasion')}
            onMouseEnter={() => setHoveredCard('occasion')}
            onMouseLeave={() => setHoveredCard(null)}
          >
            {/* Image générale */}
            <div className="choix-card-image">
              {imageOccasion && imageOccasion.name ? (
                <img
                  src={imageOccasion.name?.startsWith('http')
                    ? imageOccasion.name
                    : imageOccasion.name?.startsWith('/')
                      ? `${API_URL}${imageOccasion.name}`
                      : `${API_URL}/${imageOccasion.name}`}
                  alt="Porsche Approved"
                  className="choix-card-img"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    if (e.target.nextSibling) {
                      e.target.nextSibling.style.display = 'flex';
                    }
                  }}
                />
              ) : null}
              <div
                className="choix-card-image-placeholder"
                style={{ display: imageOccasion && imageOccasion.name ? 'none' : 'flex' }}
              >
                <span className="choix-card-image-text">Porsche Approved</span>
              </div>
            </div>

            <h2 className="choix-card-title">Voiture d'Occasion</h2>
            <p className="choix-card-description">
              Découvrez nos Porsche certifiées disponibles immédiatement
            </p>
            <div className="choix-card-cta">
              Voir les occasions →
            </div>
          </button>
        </div>

        {/* Information complémentaire */}
        <div className="choix-info">
          <div className="choix-info-card">
            <h3>Notre engagement</h3>
            <p>Que vous choisissiez une Porsche neuve ou d'occasion, nous vous garantissons une expérience d'achat exceptionnelle et un service après-vente de qualité.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChoixVoiture;

