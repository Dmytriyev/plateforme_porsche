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
      
      // OPTIMISÉ: Utiliser l'endpoint dédié pour voitures neuves
      // Backend: GET /voiture/neuve
      const response = await voitureService.getVoituresNeuves();
      
      // Vérifier que la réponse est bien un tableau
      const data = Array.isArray(response) ? response : [];
      
      console.log('Données reçues:', data);
      
      // Filtrer pour avoir uniquement 911, Cayman, Cayenne
      const modelesAffiches = data.filter(v => 
        ['911', 'Cayman', 'Cayenne'].includes(v.nom_model)
      );
      
      console.log('Modèles filtrés:', modelesAffiches);
      
      // Garder un seul exemplaire de chaque modèle (le premier trouvé)
      const uniqueModeles = [];
      const nomsVus = new Set();
      
      modelesAffiches.forEach(voiture => {
        if (!nomsVus.has(voiture.nom_model)) {
          nomsVus.add(voiture.nom_model);
          uniqueModeles.push(voiture);
        }
      });
      
      console.log('Modèles uniques:', uniqueModeles);
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
      {/* Hero Section avec choix Neuf/Occasion */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Bienvenue chez Porsche</h1>
          <p className="hero-subtitle">
            Découvrez l'excellence automobile. Choisissez votre expérience Porsche.
          </p>
          
                {/* Choix Neuf/Occasion */}
                <div className="hero-choice">
                  <Link to="/catalogue/neuve" className="choice-card choice-card-new">
                    <h2 className="choice-title">Voitures Neuves</h2>
                    <p className="choice-description">
                      Configurez votre Porsche sur mesure avec toutes les options disponibles
                    </p>
                    <span className="choice-cta">Configurer →</span>
                  </Link>

                  <Link to="/catalogue/occasion" className="choice-card choice-card-used">
                    <h2 className="choice-title">Voitures d'Occasion</h2>
                    <p className="choice-description">
                      Découvrez notre sélection de Porsche d'occasion certifiées
                    </p>
                    <span className="choice-cta">Découvrir →</span>
                  </Link>
                </div>
        </div>
      </section>

      {/* Modèles à choisir: 911, Cayman, Cayenne */}
      <section className="models-section">
        <div className="models-header">
          <h2 className="section-title">Choisissez Votre Modèle</h2>
          <p className="section-subtitle">911 • Cayman • Cayenne</p>
        </div>
        
        {loading ? (
          <div className="models-loading">Chargement des modèles...</div>
        ) : modeles.length === 0 ? (
          <div className="models-empty">
            <p>Aucun modèle disponible pour le moment</p>
          </div>
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
                    Voir les variantes →
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Section Accessoires */}
      <section className="accessoires-section">
        <div className="accessoires-content">
          <div className="accessoires-text">
            <h2 className="accessoires-title">Accessoires Porsche</h2>
            <p className="accessoires-description">
              Personnalisez votre expérience avec notre collection exclusive d'accessoires premium. 
              Du lifestyle aux pièces de performance, découvrez tout ce qui fait l'excellence Porsche.
            </p>
            <Link to="/accessoires" className="accessoires-button">
              Découvrir les Accessoires →
            </Link>
          </div>
          <div className="accessoires-visual">
            <div className="accessoires-categories">
              <span className="accessoires-tag">Porte-clés</span>
              <span className="accessoires-tag">Casquettes</span>
              <span className="accessoires-tag">Décoration</span>
              <span className="accessoires-tag">Vêtements</span>
              <span className="accessoires-tag">Bagages</span>
              <span className="accessoires-tag">Miniatures</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
