import { Link } from 'react-router-dom';
import { Button, Card } from '../components/common';
import './Home.css';

/**
 * Page d'accueil
 */
const Home = () => {
  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            Votre voyage Porsche commence ici
          </h1>
          <p className="hero-subtitle">
            Découvrez notre collection exclusive de voitures neuves et d'occasion
          </p>
          <div className="hero-buttons">
            <Link to="/voitures">
              <Button size="lg">Explorer les voitures</Button>
            </Link>
            <Link to="/accessoires">
              <Button variant="outline" size="lg">
                Voir les accessoires
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Section Modèles populaires */}
      <section className="section section-white">
        <div className="section-container">
          <h2 className="section-title">Modèles emblématiques</h2>
          
          <div className="models-grid">
            {/* 911 */}
            <Card hover padding="lg">
              <div className="model-content">
                <h3 className="model-title">911</h3>
                <p className="model-description">
                  Voiture de sport biplace à moteur central.
                </p>
                <p className="model-fuel">Essence</p>
                <Link to="/voitures?modele=911">
                  <Button>Configurer votre 911</Button>
                </Link>
              </div>
            </Card>

            {/* Taycan */}
            <Card hover padding="lg">
              <div className="model-content">
                <h3 className="model-title">Taycan</h3>
                <p className="model-description">
                  L'expression pure d'une voiture de sport électrique.
                </p>
                <p className="model-fuel">Électrique</p>
                <Link to="/voitures?modele=taycan">
                  <Button>Configurer votre Taycan</Button>
                </Link>
              </div>
            </Card>

            {/* Panamera */}
            <Card hover padding="lg">
              <div className="model-content">
                <h3 className="model-title">Panamera</h3>
                <p className="model-description">
                  La voiture de sport au design élégant et à la praticité quotidienne.
                </p>
                <p className="model-fuel">Essence • Hybride</p>
                <Link to="/voitures?modele=panamera">
                  <Button>Configurer votre Panamera</Button>
                </Link>
              </div>
            </Card>

            {/* 718 */}
            <Card hover padding="lg">
              <div className="model-content">
                <h3 className="model-title">718</h3>
                <p className="model-description">
                  La voiture de sport biplace à moteur central pour deux.
                </p>
                <p className="model-fuel">Essence</p>
                <Link to="/voitures?modele=718">
                  <Button>Configurer votre 718</Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Section Voitures d'occasion */}
      <section className="section section-gray">
        <div className="section-container center-content">
          <h2 className="section-title">Porsche d'occasion</h2>
          <p className="section-subtitle">
            Découvrez notre sélection de Porsche d'occasion certifiées, 
            alliant performance exceptionnelle et fiabilité garantie.
          </p>
          <Link to="/voitures?type=occasion">
            <Button size="lg">Voir les voitures d'occasion</Button>
          </Link>
        </div>
      </section>

      {/* Section Accessoires */}
      <section className="section section-black">
        <div className="section-container center-content">
          <h2 className="section-title">Accessoires Porsche</h2>
          <p className="section-subtitle">
            Personnalisez votre expérience Porsche avec notre collection 
            d'accessoires premium et d'articles lifestyle.
          </p>
          <Link to="/accessoires">
            <Button variant="outline" size="lg">
              Découvrir les accessoires
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
