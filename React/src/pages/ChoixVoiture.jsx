import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { voitureService } from '../services';
import buildUrl from '../utils/buildUrl';
import './ChoixVoiture.css';

const ChoixVoiture = () => {
  const navigate = useNavigate();
  const [imageNeuve, setImageNeuve] = useState(null);
  const [imageOccasion, setImageOccasion] = useState(null);
  // Récupère des images exemples pour les cartes "Neuve" et "Occasion"
  async function fetchImages() {
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


  useEffect(() => {
    const t = setTimeout(() => {
      fetchImages();
    }, 0);
    return () => clearTimeout(t);
  }, []);

  const handleConfigurer = () => {
    navigate('/catalogue/neuve');
  };

  const handleReserver = () => {
    navigate('/catalogue/occasion');
  };

  const getImageUrl = (photo) => {
    if (!photo || !photo.name) return null;
    return buildUrl(photo.name);
  };

  const imageNeuveUrl = getImageUrl(imageNeuve);
  const imageOccasionUrl = getImageUrl(imageOccasion);

  return (
    <div className="choix-container">
      <div className="choix-content">
        {/* En-tête */}
        <div className="choix-header">
          <h1 className="choix-title">Choisissez votre Porsche</h1>
        </div>

        {/* Cartes */}
        <div className="choix-grid-porsche">
          {/* Carte Voiture Neuve */}
          <div className="choix-card-porsche">
            {/* Titre */}
            <h2 className="choix-card-title-porsche">
              Voiture Neuve
            </h2>

            {/* Image */}
            <div className="choix-card-image-porsche">
              {imageNeuveUrl ? (
                <img
                  src={imageNeuveUrl}
                  alt="Porsche Neuve"
                  className="choix-card-img-porsche"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    if (e.target.nextSibling) {
                      e.target.nextSibling.style.display = 'flex';
                    }
                  }}
                />
              ) : null}
              <div
                className="choix-card-image-placeholder-porsche"
                style={{ display: imageNeuveUrl ? 'none' : 'flex' }}
              >
                <span className="choix-card-image-letter-porsche">N</span>
              </div>
            </div>

            {/* Bouton */}
            <button
              className="choix-card-btn-porsche"
              onClick={handleConfigurer}
            >
              Configurer
            </button>
          </div>

          {/* Carte Voiture Occasion */}
          <div className="choix-card-porsche">
            {/* Titre */}
            <h2 className="choix-card-title-porsche">
              Voiture Occasion
            </h2>

            {/* Image */}
            <div className="choix-card-image-porsche">
              {imageOccasionUrl ? (
                <img
                  src={imageOccasionUrl}
                  alt="Porsche Occasion"
                  className="choix-card-img-porsche"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    if (e.target.nextSibling) {
                      e.target.nextSibling.style.display = 'flex';
                    }
                  }}
                />
              ) : null}
              <div
                className="choix-card-image-placeholder-porsche"
                style={{ display: imageOccasionUrl ? 'none' : 'flex' }}
              >
                <span className="choix-card-image-letter-porsche">O</span>
              </div>
            </div>

            {/* Bouton */}
            <button
              className="choix-card-btn-porsche"
              onClick={handleReserver}
            >
              Réserver
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChoixVoiture;

