// Détail variante: images, options, disponibilité, configuration/achat selon type (neuf/occasion)
import Button from "../components/common/Button.jsx";
import buildUrl from "../utils/buildUrl";
import Loading from "../components/common/Loading.jsx";
import modelPorscheService from "../services/modelPorsche.service.js";
import voitureService from "../services/voiture.service.js";
import { formatPrice } from "../utils/helpers.js";
import { warn } from "../utils/logger.js";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ImageWithFallback from "../components/common/ImageWithFallback.jsx";
import "../css/components/Message.css";
import "../css/VariantePage.css";

// détail d'une variante (images, options, disponibilité). Permet configuration/achat selon type.
const VariantePage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pageData, setPageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [carrosseriesNav, setCarrosseriesNav] = useState([]);
  const [selectedCarrosserie, setSelectedCarrosserie] = useState("");

  // Récupération des données de la page variante au chargement et à chaque changement d'id de variante 
  useEffect(() => {
    const fetchPageData = async () => {
      try {
        setLoading(true);
        setError("");
        // Récupérer les données de la variante
        const data = await modelPorscheService.getVariantePage(id);
        setPageData(data);

        // Récupérer les carrosseries disponibles pour ce modèle de base
        if (data.voiture_base?._id) {
          try {
            // Récupérer les données de la voiture de base pour obtenir les carrosseries disponibles
            const voitureData = await voitureService.getVoiturePage(
              data.voiture_base._id,
            );
            // Mettre à jour la navigation des carrosseries
            if (voitureData?.statistiques?.carrosseries_disponibles) {
              const carrosseries =
                voitureData.statistiques.carrosseries_disponibles;
              setCarrosseriesNav(carrosseries);
              // Définir la carrosserie actuelle comme sélectionnée
              if (data.variante?.type_carrosserie) {
                setSelectedCarrosserie(data.variante.type_carrosserie);
              }
            }
          } catch (err) {
            warn("Erreur lors de la récupération des données voiture pour la variante :", err);
          }
        }
      } catch (err) {
        setError(err.message || "Erreur lors du chargement de la page");
      } finally {
        setLoading(false);
      }
    };
    // Lancer la récupération des données si l'id est présent
    if (id) {
      fetchPageData();
    }
  }, [id]);
  // Affichage des états de chargement, d'erreur ou du contenu principal
  if (loading) {
    return <Loading fullScreen message="Chargement de la variante..." />;
  }
  // Afficher un message d'erreur si la récupération des données a échoué
  if (error) {
    return (
      <div className="variante-page-error">
        <div className="message-box message-error">
          <p>{error}</p>
        </div>
        <Button onClick={() => navigate("/choix-voiture")}>
          Retour au choix
        </Button>
      </div>
    );
  }
  // Afficher un message si la variante n'a pas été trouvée
  if (!pageData || !pageData.variante) {
    return (
      <div className="variante-page-error">
        <div className="message-box message-warning">
          <p>Variante non trouvée</p>
        </div>
        <Button onClick={() => navigate("/choix-voiture")}>
          Retour au choix
        </Button>
      </div>
    );
  }
  // Extraire les données nécessaires de la page variante 
  const {
    variante,
    voiture_base,
    specifications,
    options: _options,
    photos,
    prix,
    type,
  } = pageData;

  // Gérer la navigation vers le configurateur ou d'autres actions  
  const handleConfigurer = () => {
    // Naviguer vers le configurateur si la variante est neuve et les données sont disponibles
    if (type === "neuf" && variante?._id && voiture_base?._id) {
      const targetUrl = `/configurateur/${voiture_base._id}/${variante._id}`;
      navigate(targetUrl);
    } else {
      setError("Impossible de configurer cette variante. Données manquantes.");
    }
  };

  // Gérer le changement de modèle  
  const handleChangerModele = () => {
    // Naviguer vers la page de choix de voiture ou vers la voiture de base si disponible
    if (voiture_base?._id) {
      navigate(`/variantes/neuve/${voiture_base._id}`);
    } else {
      navigate("/choix-voiture");
    }
  };
  // Gérer l'achat de voitures neuves et d'occasion
  const handleAcheter = () => {
    navigate("/occasion");
  };

  // Récupérer la photo principale et la photo secondaire
  const photoPrincipale = photos && photos.length > 0 ? photos[0] : null;
  const photoSecondaire = photos && photos.length > 1 ? photos[1] : null;
  // Rendu du composant VariantePage avec le style Porsche
  return (
    <div className="variante-page-container-porsche">
      {/* Navigation en haut */}
      <nav className="variante-nav-top-porsche">
        {/* section navigation gauche */}
        <div className="variante-nav-top-left">
          <span className="variante-nav-model-name">{variante.nom_model}</span>
          <button
            className="variante-nav-change-model"
            onClick={handleChangerModele}
          >
            CHANGER DE MODÈLE
          </button>
        </div>
        {/* section navigation droite */}
        <div className="variante-nav-top-right">
          <button
            className="variante-nav-link variante-btn-configurer"
            onClick={handleConfigurer}
          >
            CONFIGURER
          </button>
          {type !== "neuf" && (
            <button
              className="variante-nav-link variante-btn-acheter"
              onClick={handleAcheter}
            >
              ACHETER DES VOITURES NEUVES ET D'OCCASION
            </button>
          )}
          {type !== "neuf" && (
            <button className="variante-nav-link variante-btn-comparer">
              COMPARER
            </button>
          )}
        </div>
      </nav>
      {/* Section Hero avec image principale et infos */}
      <section className="variante-hero-porsche">
        {photoPrincipale && (
          <div className="variante-hero-image-porsche">
            <ImageWithFallback
              src={photoPrincipale && photoPrincipale.name ? buildUrl(photoPrincipale.name) : null}
              alt={variante.nom_model}
              imgClass="variante-hero-img-porsche"
              placeholder={<div className="variante-hero-missing" />}
            />
          </div>
        )}

        {/* Navigation Carrosserie */}
        {carrosseriesNav.length > 0 && (
          <nav className="variante-carrosserie-nav-porsche">
            {carrosseriesNav.map((carrosserie) => (
              <button
                key={carrosserie}
                className={`variante-carrosserie-nav-item-porsche ${selectedCarrosserie === carrosserie ? "active" : ""}`}
                onClick={() => setSelectedCarrosserie(carrosserie)}
              >
                {carrosserie}
              </button>
            ))}
          </nav>
        )}

        {/* Informations variante */}
        <div className="variante-info-header-porsche">
          <h1 className="variante-name-porsche">
            Porsche {variante.nom_model}
          </h1>
          {prix && (prix.prix_base_variante || prix.prix_total) > 0 && (
            <div className="variante-price-porsche">
              à partir de{" "}
              {formatPrice(prix.prix_base_variante || prix.prix_total)} TTC
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
                    Vitesse maximale
                  </div>
                </div>
              )}
            </div>
          )}
          {/* section détails techniques */}
          {type !== "neuf" && (
            <button className="variante-technical-details-btn-porsche">
              TOUS LES DÉTAILS TECHNIQUES
            </button>
          )}
        </div>

        {/* Colonne droite: Image secondaire */}
        {photoSecondaire && (
          <div className="variante-right-column-porsche">
            <div className="variante-secondary-image-porsche">
              <ImageWithFallback
                src={photoSecondaire && photoSecondaire.name ? buildUrl(photoSecondaire.name) : null}
                alt={`${variante.nom_model} - Vue secondaire`}
                imgClass="variante-secondary-img-porsche"
                placeholder={<div className="variante-secondary-missing" />}
              />
            </div>
          </div>
        )}
      </div>

      {/* Section Description */}
      {variante.description && (
        <section className="variante-description-section-porsche">
          <h2 className="variante-description-title-porsche">
            Icône éternelle.
          </h2>
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
        {type !== "neuf" && (
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
