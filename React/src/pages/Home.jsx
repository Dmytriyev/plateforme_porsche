import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { voitureService } from '../services';
import { API_URL } from '../config/api.jsx';
import buildUrl from '../utils/buildUrl';
import { formatPrice } from '../utils/format.js';
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

      const data = Array.isArray(response) ? response : [];

      const modelesAffiches = data.filter(v =>
        ['911', 'Cayman', 'Cayenne'].includes(v.nom_model)
      );

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
      setModeles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleModeleClick = (modele) => {
    // Rediriger vers la liste des variantes de ce modèle (neuves)
    navigate(`/variantes/neuve/${modele._id}`);
  };

  /**
   * Fonction pour obtenir les informations spécifiques d'un modèle
   * 
   * EXPLICATION POUR ÉTUDIANT:
   * ==========================
   * Cette fonction retourne les informations formatées pour chaque modèle
   * en utilisant UNIQUEMENT les données disponibles dans la base de données
   * 
   * Les données enrichies du backend contiennent :
   * - prix_depuis : prix minimum depuis les variantes
   * - carrosseries_disponibles : liste des carrosseries disponibles
   * - transmissions_disponibles : liste des transmissions disponibles
   * - description : description du modèle
   * - photo_voiture : photos du modèle
   */
  const getModeleInfo = (modele) => {
    // Descriptions par défaut (utilisées si description non disponible)
    const descriptions = {
      '911': 'L\'icône de génération en génération.',
      '718': 'La sportive deux places au moteur central arrière.',
      'Cayman': 'La sportive deux places au moteur central arrière.',
      'Cayenne': 'Le SUV à l\'ADN sportif et familial.',
    };

    // Nombre de places par modèle (données statiques car non disponibles dans la base)
    const seats = {
      '911': '2+2',
      '718': '2',
      'Cayman': '2',
      'Cayenne': '5',
    };

    // Utiliser les données enrichies du backend si disponibles
    return {
      description: modele.description || descriptions[modele.nom_model] || 'Découvrez ce modèle emblématique',
      bodyTypes: modele.carrosseries_disponibles || [],
      seats: seats[modele.nom_model] || '2',
      transmissions: modele.transmissions_disponibles || [],
      prixDepuis: modele.prix_depuis || 0,
      fuelType: 'Essence', // Par défaut, toutes les Porsche sont essence
    };
  };

  return (
    <div className="home-container-porsche">
      {/* Hero Section avec slogan et boutons */}
      <section className="home-hero-section">
        <div className="home-hero-content">
          <div className="home-hero-image-container">
            {/* Image hero - utiliser une image de Porsche si disponible */}
            <div className="home-hero-image">
              <div className="home-hero-placeholder">
                <span className="home-hero-logo">PORSCHE</span>
              </div>
            </div>
          </div>
          <div className="home-hero-text">
            <h1 className="home-hero-title">Votre voyage Porsche commence ici.</h1>
            <p className="home-hero-slogan">
              Découvrez l'excellence automobile. Choisissez votre expérience Porsche.
            </p>
            <div className="home-hero-buttons">
              <Link to="/catalogue/neuve" className="home-hero-btn home-hero-btn-primary">
                Voitures Neuves
              </Link>
              <Link to="/catalogue/occasion" className="home-hero-btn home-hero-btn-secondary">
                Voitures d'Occasion
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Modèles à choisir: 911, 718, Cayenne */}
      <section className="models-section-porsche">
        <div className="models-header-porsche">
          <h2 className="section-title-porsche">Sélectionner une gamme</h2>
        </div>

        {loading ? (
          <div className="models-loading">Chargement des modèles...</div>
        ) : modeles.length === 0 ? (
          <div className="models-empty">
            <p>Aucun modèle disponible pour le moment</p>
          </div>
        ) : (
          <div className="models-grid-porsche">
            {modeles.map((modele) => {
              const modeleInfo = getModeleInfo(modele);

              // Récupérer la photo principale (une seule image)
              let photoPrincipale = null;
              if (modele.photo_voiture && Array.isArray(modele.photo_voiture) && modele.photo_voiture.length > 0) {
                const validPhotos = modele.photo_voiture.filter(p => p && (p.name || p._id));
                if (validPhotos.length > 0) {
                  photoPrincipale = validPhotos[0];
                }
              }

              return (
                <article
                  key={modele._id}
                  className="model-card-porsche"
                >
                  {/* Image unique */}
                  <div className="model-image-porsche">
                    {photoPrincipale && photoPrincipale.name ? (
                      <img
                        src={buildUrl(photoPrincipale.name)}
                        alt={`Porsche ${modele.nom_model}`}
                        className="model-image-photo-porsche"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          if (e.target.nextSibling) {
                            e.target.nextSibling.style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <div
                      className="model-placeholder-porsche"
                      style={{ display: photoPrincipale && photoPrincipale.name ? 'none' : 'flex' }}
                    >
                      <span className="model-letter-porsche">
                        {modele.nom_model?.charAt(0) || '?'}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="model-content-porsche">
                    {/* Header avec nom et badge */}
                    <div className="model-header-porsche">
                      <h2 className="model-name-porsche">
                        {modele.nom_model}
                      </h2>
                      <span className="model-fuel-badge-porsche">
                        {modeleInfo.fuelType}
                      </span>
                    </div>

                    {/* Description */}
                    <p className="model-description-porsche">
                      {modeleInfo.description}
                    </p>

                    {/* Prix */}
                    {modeleInfo.prixDepuis > 0 && (
                      <div className="model-price-porsche">
                        À partir de {formatPrice(modeleInfo.prixDepuis)} TTC
                      </div>
                    )}

                    {/* Spécifications */}
                    <div className="model-specs-porsche">
                      {modeleInfo.bodyTypes.length > 0 && (
                        <div className="model-spec-item-porsche">
                          <span className="model-spec-label-porsche">Carrosserie</span>
                          <span className="model-spec-value-porsche">
                            {modeleInfo.bodyTypes.join(', ')}
                          </span>
                        </div>
                      )}
                      {/* Sièges supprimés */}
                      {modeleInfo.transmissions.length > 0 && (
                        <div className="model-spec-item-porsche">
                          <span className="model-spec-label-porsche">Boîte de vitesse</span>
                          <span className="model-spec-value-porsche">
                            {modeleInfo.transmissions.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Bouton CTA */}
                    <button
                      className="model-cta-porsche"
                      onClick={() => handleModeleClick(modele)}
                    >
                      Configurer {modele.nom_model}
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* Section Accessoires */}
      <section className="home-accessoires-section">
        <div className="home-accessoires-content">
          <div className="home-accessoires-text">
            <h2 className="home-accessoires-title">Découvrez la boutique Porsche Lifestyle</h2>
            <p className="home-accessoires-description">
              Personnalisez votre expérience avec notre collection exclusive d'accessoires premium.
              Du lifestyle aux pièces de performance, découvrez tout ce qui fait l'excellence Porsche.
            </p>
            <div className="home-accessoires-buttons">
              <Link to="/accessoires" className="home-accessoires-btn">
                Aller à la boutique en ligne
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section Porsche Approved */}
      <section className="home-approved-section">
        <div className="home-approved-container">
          {/* Image à gauche */}
          <div className="home-approved-image">
            <div className="home-approved-image-placeholder">
              <span className="home-approved-image-text">Porsche Approved</span>
            </div>
          </div>

          {/* Contenu à droite */}
          <div className="home-approved-content">
            <h2 className="home-approved-title">
              Véhicules d'occasion<br />
              Porsche Approved.
            </h2>
            <p className="home-approved-text">
              Une Porsche reste une Porsche. Nos véhicules d'occasion Porsche Approved sont vecteurs d'émotion, comme au premier jour. Ils témoignent de la passion avec laquelle nous les avons contrôlés sur 111 points. Ils font battre votre cœur, car nous avons mis tout le nôtre dans leur préparation. Et votre sérénité est assurée grâce à notre garantie Porsche Approved.
            </p>
            <Link to="/occasion" className="home-approved-btn">
              En savoir plus
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
