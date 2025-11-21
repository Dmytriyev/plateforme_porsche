import { useNavigate } from 'react-router-dom';
import '../css/ChoixVoiture.css';

const ChoixVoiture = () => {
  const navigate = useNavigate();
  const imageStatic = '/Logo/Logo_porsche_black.jpg';

  const handleConfigurer = () => {
    navigate('/catalogue/neuve');
  };

  const handleReserver = () => {
    navigate('/catalogue/occasion');
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
          <div className="choix-card-porsche">
            <h2 className="choix-card-title-porsche">
              Voiture Neuve
            </h2>

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

            <button
              className="choix-card-btn-porsche"
              onClick={handleConfigurer}
            >
              Configurer
            </button>
          </div>

          <div className="choix-card-porsche">
            <h2 className="choix-card-title-porsche">
              Voiture Occasion
            </h2>

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

