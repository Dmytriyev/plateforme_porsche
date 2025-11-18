import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { voitureService } from '../services';
import './Home.css';

/**
 * Page d'accueil - Affiche 911, Cayman, Cayenne avec photos réelles
 */
const Home = () => {
  const navigate = useNavigate();
  const [modeles, setModeles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchModeles();
  }, []);

  const fetchModeles = async () => {
    try {
      setLoading(true);
      const data = await voitureService.getAllVoitures();
      
      // Filtrer pour avoir uniquement 911, Cayman, Cayenne (neuves)
      const modelesAffiches = data.filter(v => 
        v.type_voiture === true && 
        ['911', 'Cayman', 'Cayenne'].includes(v.nom_model)
      );
      
      // Garder un seul exemplaire de chaque modèle (le premier trouvé)
      const uniqueModeles = [];
      const nomsVus = new Set();
      
      modelesAffiches.forEach(voiture => {
        if (!nomsVus.has(voiture.nom_model)) {
          nomsVus.add(voiture.nom_model);
          uniqueModeles.push(voiture);
        }
      });
      
      setModeles(uniqueModeles);
    } catch (error) {
      console.error('Erreur chargement modèles:', error);
      // Afficher un message d'erreur à l'utilisateur
      setModeles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleModeleClick = (modele) => {
    // Rediriger vers la liste des variantes de ce modèle (neuves)
    navigate(`/variantes/neuve/${modele._id}`);
  };

  const getModelDescription = (nomModel) => {
    const descriptions = {
      '911': 'L\'icône intemporelle de Porsche',
      'Cayman': 'La voiture de sport biplace à moteur central',
      'Cayenne': 'Le SUV sportif de luxe'
    };
    return descriptions[nomModel] || 'Découvrez ce modèle emblématique';
  };

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Bienvenue chez Porsche</h1>
          <p className="hero-subtitle">
            Découvrez l'excellence automobile. Configurez votre Porsche ou explorez notre sélection d'accessoires premium.
          </p>
          <div className="hero-cta">
            <Link to="/choix-voiture" className="cta-button cta-primary">
              Nos Voitures
            </Link>
            <Link to="/accessoires" className="cta-button cta-secondary">
              Accessoires
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Models */}
      <section className="featured-section">
        <h2 className="section-title">Modèles Vedettes</h2>
        {loading ? (
          <div className="models-loading">Chargement des modèles...</div>
        ) : (
          <div className="models-grid">
            {modeles.map((modele) => (
              <button
                key={modele._id}
                onClick={() => handleModeleClick(modele)}
                className="model-card"
              >
                <div className="model-image">
                  {modele.photo_voiture && modele.photo_voiture.length > 0 ? (
                    <img
                      src={`http://localhost:3000${modele.photo_voiture[0].name}`}
                      alt={`Porsche ${modele.nom_model}`}
                      className="model-photo"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className="model-placeholder"
                    style={{ display: modele.photo_voiture && modele.photo_voiture.length > 0 ? 'none' : 'flex' }}
                  >
                    {modele.nom_model}
                  </div>
                </div>
                <div className="model-info">
                  <h3 className="model-name">Porsche {modele.nom_model}</h3>
                  <p className="model-description">
                    {modele.description || getModelDescription(modele.nom_model)}
                  </p>
                  <span className="model-link">
                    Découvrir →
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Services Section */}
      <section className="services-section">
        <div className="services-grid">
          <Link to="/catalogue/neuve" className="service-card service-card-link">
            <div className="service-icon">🚗</div>
            <h3 className="service-title">Voitures Neuves</h3>
            <p className="service-description">
              Créez votre Porsche sur mesure avec notre configurateur en ligne
            </p>
          </Link>

          <Link to="/accessoires" className="service-card service-card-link">
            <div className="service-icon">🛍️</div>
            <h3 className="service-title">Accessoires</h3>
            <p className="service-description">
              Découvrez notre gamme d'accessoires Porsche authentiques
            </p>
          </Link>

          <Link to="/catalogue/occasion" className="service-card service-card-link">
            <div className="service-icon">💼</div>
            <h3 className="service-title">Voitures d'Occasion</h3>
            <p className="service-description">
              Explorez notre sélection de Porsche d'occasion certifiées
            </p>
          </Link>
        </div>
      </section>

      {/* Call to Action Final */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">Prêt à commencer votre aventure Porsche ?</h2>
          <p className="cta-text">
            Configurez votre véhicule de rêve ou découvrez notre sélection d'occasions certifiées
          </p>
          <div className="cta-buttons">
            <Link to="/choix-voiture" className="cta-button cta-primary">
              Commencer la configuration
            </Link>
            <Link to="/accessoires" className="cta-button cta-secondary">
              Voir les accessoires
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
