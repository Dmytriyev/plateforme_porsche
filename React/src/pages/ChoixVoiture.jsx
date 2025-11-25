/**
 * pages/ChoixVoiture.jsx — Page simple pour choisir 'neuve' ou 'occasion'.
 *
 * Notes pédagogiques :
 * - Montre une page minimale qui gère uniquement la navigation (séparation UI/logic).
 * - Utile pour apprendre quand extraire logique vers des services/hooks.
 *
 * @file pages/ChoixVoiture.jsx
 */

import { useNavigate } from "react-router-dom";
import "../css/CatalogueModeles.css";
import "../css/ChoixVoiture.css";

const ChoixVoiture = () => {
  const navigate = useNavigate();
  const imageStatic = "/Logo/Logo_porsche_black.jpg";

  const handleConfigurer = () => {
    navigate("/catalogue/neuve");
  };

  const handleReserver = () => {
    navigate("/catalogue/occasion");
  };

  const imageNeuveUrl = imageStatic;
  const imageOccasionUrl = imageStatic;

  return (
    <div className="choix-container">
      <div className="choix-content">
        <div className="choix-header">
          <h1 className="choix-title">Choisissez votre Porsche</h1>
        </div>

        <div className="choix-grid-porsche">
          <div className="catalogue-modele-card-neuf-porsche">
            <h2 className="catalogue-modele-title-porsche">Voiture Neuve</h2>

            <div className="catalogue-modele-image-porsche">
              {imageNeuveUrl ? (
                <img
                  src={imageNeuveUrl}
                  alt="Porsche Neuve"
                  className="catalogue-modele-img-porsche"
                  onError={(e) => {
                    e.target.style.display = "none";
                    if (e.target.nextSibling) {
                      e.target.nextSibling.style.display = "flex";
                    }
                  }}
                />
              ) : null}
              <div
                className="catalogue-modele-placeholder-porsche"
                style={{ display: imageNeuveUrl ? "none" : "flex" }}
              >
                <span className="catalogue-modele-letter-porsche">N</span>
              </div>
            </div>

            {/* Bouton */}
            <button
              className="catalogue-modele-btn-porsche"
              onClick={handleConfigurer}
            >
              Configurer
            </button>
          </div>

          <div className="catalogue-modele-card-neuf-porsche">
            <h2 className="catalogue-modele-title-porsche">
              Voiture d'Occasion
            </h2>

            <div className="catalogue-modele-image-porsche">
              {imageOccasionUrl ? (
                <img
                  src={imageOccasionUrl}
                  alt="Porsche Occasion"
                  className="catalogue-modele-img-porsche"
                  onError={(e) => {
                    e.target.style.display = "none";
                    if (e.target.nextSibling) {
                      e.target.nextSibling.style.display = "flex";
                    }
                  }}
                />
              ) : null}
              <div
                className="catalogue-modele-placeholder-porsche"
                style={{ display: imageOccasionUrl ? "none" : "flex" }}
              >
                <span className="catalogue-modele-letter-porsche">O</span>
              </div>
            </div>

            {/* Bouton */}
            <button
              className="catalogue-modele-btn-porsche"
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
