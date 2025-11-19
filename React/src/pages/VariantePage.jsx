import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { modelPorscheService, voitureService } from '../services';
import { Loading, Alert, Button } from '../components/common';
import { formatPrice } from '../utils/format.js';
import './VariantePage.css';

/**
 * Page explicative complète d'une variante model_porsche (GTS, GT3, GT4RS, etc.)
 * Design inspiré de la page officielle Porsche: https://www.porsche.com/france/models/911/911-gt3-models/911-gt3/
 * Affiche toutes les informations, photos, options et prix
 * 
 * EXPLICATION POUR ÉTUDIANT:
 * ==========================
 * Cette page s'affiche APRÈS la sélection d'une variante dans ListeVariantes
 * et AVANT la configuration. Elle présente la variante avec ses performances,
 * ses caractéristiques et permet de naviguer vers la configuration.
 */
const VariantePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [carrosseriesNav, setCarrosseriesNav] = useState([]);
  const [selectedCarrosserie, setSelectedCarrosserie] = useState('');

  useEffect(() => {
    const fetchPageData = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await modelPorscheService.getVariantePage(id);
        setPageData(data);
        
        // Récupérer les carrosseries disponibles pour ce modèle de base
        if (data.voiture_base?._id) {
          try {
            const voitureData = await voitureService.getVoiturePage(data.voiture_base._id);
            if (voitureData?.statistiques?.carrosseries_disponibles) {
              const carrosseries = voitureData.statistiques.carrosseries_disponibles;
              setCarrosseriesNav(carrosseries);
              // Définir la carrosserie actuelle comme sélectionnée
              if (data.variante?.type_carrosserie) {
                setSelectedCarrosserie(data.variante.type_carrosserie);
              }
            }
          } catch (err) {
            // Erreur silencieuse pour les carrosseries
          }
        }
      } catch (err) {
        setError(err.message || 'Erreur lors du chargement de la page');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchPageData();
    }
  }, [id]);

  if (loading) {
    return <Loading fullScreen message="Chargement de la variante..." />;
  }

  if (error) {
    return (
      <div className="variante-page-error">
        <Alert type="error">{error}</Alert>
        <Button onClick={() => navigate('/choix-voiture')}>
          Retour au choix
        </Button>
      </div>
    );
  }

  if (!pageData || !pageData.variante) {
    return (
      <div className="variante-page-error">
        <Alert type="warning">Variante non trouvée</Alert>
        <Button onClick={() => navigate('/choix-voiture')}>
          Retour au choix
        </Button>
      </div>
    );
  }

  const { variante, voiture_base, specifications, options, photos, prix, type } = pageData;
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

  /**
   * Convertir la puissance en kW
   * 
   * EXPLICATION POUR ÉTUDIANT:
   * ==========================
   * 1 PS (Pferdestärke) = 0.7355 kW
   * Donc pour convertir ch (chevaux) en kW:
   * kW = ch * 0.7355
   */
  const formatPower = (puissance) => {
    if (!puissance) return { ch: 0, kw: 0 };
    const kw = Math.round(puissance * 0.7355);
    return { ch: puissance, kw };
  };

  const powerInfo = formatPower(specifications?.puissance);

  /**
   * Navigation vers la configuration
   */
  const handleConfigurer = () => {
    if (type === 'neuf' && voiture_base?._id) {
      navigate(`/configurateur/${voiture_base._id}`);
    }
  };

  /**
   * Navigation vers le changement de modèle
   */
  const handleChangerModele = () => {
    if (voiture_base?._id) {
      navigate(`/variantes/neuve/${voiture_base._id}`);
    } else {
      navigate('/choix-voiture');
    }
  };

  /**
   * Navigation vers l'achat de voitures neuves et d'occasion
   */
  const handleAcheter = () => {
    navigate('/occasion');
  };

  /**
   * Récupérer la photo principale et la photo secondaire
   */
  const photoPrincipale = photos && photos.length > 0 ? photos[0] : null;
  const photoSecondaire = photos && photos.length > 1 ? photos[1] : null;

  return (
    <div className="variante-page-container-porsche">
      {/* Navigation Top */}
      <nav className="variante-nav-top-porsche">
        <div className="variante-nav-top-left">
          <span className="variante-nav-model-name">{variante.nom_model}</span>
          <button 
            className="variante-nav-change-model"
            onClick={handleChangerModele}
          >
            Changer de modèle
          </button>
        </div>
        <div className="variante-nav-top-right">
          <button 
            className="variante-nav-link"
            onClick={handleConfigurer}
          >
            Configurer
          </button>
          <button 
            className="variante-nav-link"
            onClick={handleAcheter}
          >
            Acheter des voitures neuves et d'occasion
          </button>
          <button className="variante-nav-link">Comparer</button>
        </div>
      </nav>

      {/* Hero Section avec image principale */}
      <section className="variante-hero-porsche">
        {photoPrincipale && (
          <div className="variante-hero-image-porsche">
            <img
              src={photoPrincipale.name?.startsWith('http')
                ? photoPrincipale.name
                : photoPrincipale.name?.startsWith('/')
                  ? `${API_URL}${photoPrincipale.name}`
                  : `${API_URL}/${photoPrincipale.name}`}
              alt={variante.nom_model}
              className="variante-hero-img-porsche"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}
        
        {/* Navigation Carrosserie */}
        {carrosseriesNav.length > 0 && (
          <nav className="variante-carrosserie-nav-porsche">
            {carrosseriesNav.map((carrosserie) => (
              <button
                key={carrosserie}
                className={`variante-carrosserie-nav-item-porsche ${
                  selectedCarrosserie === carrosserie ? 'active' : ''
                }`}
                onClick={() => setSelectedCarrosserie(carrosserie)}
              >
                {carrosserie}
              </button>
            ))}
          </nav>
        )}

        {/* Informations variante */}
        <div className="variante-info-header-porsche">
          <h1 className="variante-name-porsche">{variante.nom_model}</h1>
          <span className="variante-fuel-badge-porsche">Essence</span>
          {prix && (prix.prix_base_variante || prix.prix_total) > 0 && (
            <div className="variante-price-porsche">
              à partir de {formatPrice(prix.prix_base_variante || prix.prix_total)} TTC Prix client conseillé
            </div>
          )}
        </div>
      </section>

      {/* Contenu principal avec layout 2 colonnes */}
      <div className="variante-content-layout-porsche">
        {/* Colonne gauche: Performances */}
        <div className="variante-left-column-porsche">
          {specifications && (
            <div className="variante-performances-porsche">
              {specifications.acceleration_0_100 > 0 && (
                <div className="variante-performance-item-porsche">
                  <div className="variante-performance-value-porsche">
                    {specifications.acceleration_0_100} s
                  </div>
                  <div className="variante-performance-label-porsche">
                    Accélération de 0 à 100 km/h
                  </div>
                </div>
              )}
              {specifications.puissance > 0 && (
                <div className="variante-performance-item-porsche">
                  <div className="variante-performance-value-porsche">
                    {powerInfo.kw} kW / {powerInfo.ch} ch
                  </div>
                  <div className="variante-performance-label-porsche">
                    Puissance (kW)/Puissance (ch)
                  </div>
                </div>
              )}
              {specifications.vitesse_max > 0 && (
                <div className="variante-performance-item-porsche">
                  <div className="variante-performance-value-porsche">
                    {specifications.vitesse_max} km/h
                  </div>
                  <div className="variante-performance-label-porsche">
                    Vitesse maximale sur circuit
                  </div>
                </div>
              )}
            </div>
          )}
          
          <button className="variante-technical-details-btn-porsche">
            Tous les détails techniques
          </button>
        </div>

        {/* Colonne droite: Image secondaire */}
        {photoSecondaire && (
          <div className="variante-right-column-porsche">
            <div className="variante-secondary-image-porsche">
              <img
                src={photoSecondaire.name?.startsWith('http')
                  ? photoSecondaire.name
                  : photoSecondaire.name?.startsWith('/')
                    ? `${API_URL}${photoSecondaire.name}`
                    : `${API_URL}/${photoSecondaire.name}`}
                alt={`${variante.nom_model} - Vue secondaire`}
                className="variante-secondary-img-porsche"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Section Description */}
      {variante.description && (
        <section className="variante-description-section-porsche">
          <h2 className="variante-description-title-porsche">Icône éternelle.</h2>
          <p className="variante-description-text-porsche">
            {variante.description}
          </p>
        </section>
      )}

      {/* Boutons d'action en bas */}
      <div className="variante-actions-bottom-porsche">
        <button 
          className="variante-action-btn-porsche variante-action-btn-black"
          onClick={handleChangerModele}
        >
          Changer de modèle
        </button>
        <button 
          className="variante-action-btn-porsche variante-action-btn-white"
          onClick={handleConfigurer}
        >
          Configurer
        </button>
        <button 
          className="variante-action-btn-porsche variante-action-btn-white"
          onClick={handleAcheter}
        >
          Acheter des voitures neuves et d'occasion
        </button>
      </div>
    </div>
  );
};

export default VariantePage;

