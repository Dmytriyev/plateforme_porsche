// choix entre voiture neuve ou d'occasion; redirige vers catalogue/ configurateur.
import "../css/CatalogueModeles.css";
import "../css/ChoixVoiture.css";
import ImageWithFallback from "../components/common/ImageWithFallback.jsx";
import { useNavigate } from "react-router-dom";

// Page : choix entre voiture neuve ou d'occasion; redirige vers catalogue/ configurateur.
const ChoixVoiture = () => {
  const navigate = useNavigate();
  const imageOld = "/Image/old.jpg";
  const imageNew = "/Image/new.jpg";
  const handleConfigurer = () => {
    navigate("/catalogue/neuve");
  };

  const handleReserver = () => {
    navigate("/catalogue/occasion");
  };

  const imageNeuveUrl = imageNew;
  const imageOccasionUrl = imageOld;

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
              <ImageWithFallback
                src={imageNeuveUrl}
                alt="Porsche Neuve"
                imgClass="catalogue-modele-img-porsche"
                placeholder={
                  <div className="catalogue-modele-placeholder-porsche">
                    <span className="catalogue-modele-letter-porsche">N</span>
                  </div>
                }
              />
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
              <ImageWithFallback
                src={imageOccasionUrl}
                alt="Porsche Occasion"
                imgClass="catalogue-modele-img-porsche"
                placeholder={
                  <div className="catalogue-modele-placeholder-porsche">
                    <span className="catalogue-modele-letter-porsche">O</span>
                  </div>
                }
              />
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
