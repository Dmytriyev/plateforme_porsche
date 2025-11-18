import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ChoixVoiture.css';

/**
 * Page de Choix Initial: Neuf ou Occasion
 * Première étape du parcours client
 */
const ChoixVoiture = () => {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);

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
            <div className="choix-card-icon">✨</div>
            <h2 className="choix-card-title">Voiture Neuve</h2>
            <p className="choix-card-description">
              Configurez votre Porsche selon vos envies
            </p>
            <ul className="choix-card-features">
              <li>🎨 Personnalisation complète</li>
              <li>⚙️ Choix des options</li>
              <li>🎯 Configuration sur mesure</li>
              <li>🚗 Derniers modèles disponibles</li>
            </ul>
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
            <div className="choix-card-icon">🔄</div>
            <h2 className="choix-card-title">Voiture d'Occasion</h2>
            <p className="choix-card-description">
              Découvrez nos Porsche certifiées disponibles immédiatement
            </p>
            <ul className="choix-card-features">
              <li>✅ Porsche Approved</li>
              <li>📋 Historique complet</li>
              <li>🛡️ Garantie constructeur</li>
              <li>🚀 Disponibilité immédiate</li>
            </ul>
            <div className="choix-card-cta">
              Voir les occasions →
            </div>
          </button>
        </div>

        {/* Information complémentaire */}
        <div className="choix-info">
          <div className="choix-info-card">
            <h3>🎯 Notre engagement</h3>
            <p>Que vous choisissiez une Porsche neuve ou d'occasion, nous vous garantissons une expérience d'achat exceptionnelle et un service après-vente de qualité.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChoixVoiture;

