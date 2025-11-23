import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { modelPorscheService, voitureService } from '../services';
import { Loading, Button } from '../components/common';
import { formatPrice } from '../utils/format.js';
import '../css/VariantePage.css';
import '../css/components/Message.css';
import { API_URL } from '../config/api.js';
import buildUrl from '../utils/buildUrl';

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
          }
        }
      } catch (err) {
        setError(err.message || 'Erreur lors du chargement de la page');
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
        <div className="message-box message-error">
          <p>{error}</p>
        </div>
        <Button onClick={() => navigate('/choix-voiture')}>
          Retour au choix
        </Button>
      </div>
    );
  }

  if (!pageData || !pageData.variante) {
    return (
      <div className="variante-page-error">
        <div className="message-box message-warning">
          <p>Variante non trouvée</p>
        </div>
        <Button onClick={() => navigate('/choix-voiture')}>
          Retour au choix
        </Button>
      </div>
    );
  }

  const { variante, voiture_base, specifications, options: _options, photos, prix, type } = pageData;

  const handleConfigurer = () => {
    if (type === 'neuf' && variante?._id && voiture_base?._id) {
      const targetUrl = `/configurateur/${voiture_base._id}/${variante._id}`;

      if (import.meta.env.DEV) {
        console.log('[VariantePage] Navigation vers configurateur:', {
          voitureId: voiture_base._id,
          varianteId: variante._id,
          url: targetUrl
        });
      }

      navigate(targetUrl);
    } else {
      if (import.meta.env.DEV) {
        console.error('[VariantePage] Données manquantes pour configurer:', {
          type,
          varianteId: variante?._id,
          voitureId: voiture_base?._id
        });
      }
      setError('Impossible de configurer cette variante. Données manquantes.');
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
            CHANGER DE MODÈLE
          </button>
        </div>
        <div className="variante-nav-top-right">
          <button
            className="variante-nav-link variante-btn-configurer"
            onClick={handleConfigurer}
          >
            CONFIGURER
          </button>
          {type !== 'neuf' && (
            <button
              className="variante-nav-link variante-btn-acheter"
              onClick={handleAcheter}
            >
              ACHETER DES VOITURES NEUVES ET D'OCCASION
            </button>
          )}
          {type !== 'neuf' && (
            <button className="variante-nav-link variante-btn-comparer">COMPARER</button>
          )}
        </div>
      </nav>

      {/* Hero Section avec image principale */}
      <section className="variante-hero-porsche">
        {photoPrincipale && (
          <div className="variante-hero-image-porsche">
            <img
              src={buildUrl(photoPrincipale.name)}
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
                className={`variante-carrosserie-nav-item-porsche ${selectedCarrosserie === carrosserie ? 'active' : ''}`}
                onClick={() => setSelectedCarrosserie(carrosserie)}
              >
                {carrosserie}
              </button>
            ))}
          </nav>

        )}

        {/* Informations variante */}
        <div className="variante-info-header-porsche">
          <h1 className="variante-name-porsche">Porsche {variante.nom_model}</h1>
          {prix && (prix.prix_base_variante || prix.prix_total) > 0 && (
            <div className="variante-price-porsche">
              à partir de {formatPrice(prix.prix_base_variante || prix.prix_total)} TTC
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
                    {specifications.puissance} ch
                  </div>
                  <div className="variante-performance-label-porsche">
                    Puissance
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

          {type !== 'neuf' && (
            <button className="variante-technical-details-btn-porsche">
              TOUS LES DÉTAILS TECHNIQUES
            </button>
          )}
        </div>

        {/* Colonne droite: Image secondaire */}
        {photoSecondaire && (
          <div className="variante-right-column-porsche">
            <div className="variante-secondary-image-porsche">
              <img
                src={buildUrl(photoSecondaire.name)}
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
          className="variante-action-btn-porsche variante-action-btn-white"
          onClick={handleChangerModele}
        >
          CHANGER DE MODÈLE
        </button>
        <button
          className="variante-action-btn-porsche variante-action-btn-black"
          onClick={handleConfigurer}
        >
          CONFIGURER
        </button>
        {type !== 'neuf' && (
          <button
            className="variante-action-btn-porsche variante-action-btn-white"
            onClick={handleAcheter}
          >
            ACHETER DES VOITURES NEUVES ET D'OCCASION
          </button>
        )}
      </div>
    </div>
  );
};

export default VariantePage;

