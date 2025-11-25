/**
 * pages/Home.jsx — Page d'accueil; sections promos et liens rapides.
 *
 * - Montre l'usage d'un service (`voitureService`) pour récupérer des données
 *   et de `useEffect` pour déclencher la récupération au montage.
 * - Exemple pratique : filtrage et affichage conditionnel (loading / empty / data).
 */

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import voitureService from "../services/voiture.service.js";
import buildUrl from "../utils/buildUrl";
import "../css/CatalogueModeles.css";
import "../css/Home.css";

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
      const response = await voitureService.getAllVoitures();
      const data = Array.isArray(response) ? response : [];

      const filtered = data.filter((v) =>
        ["911", "Cayman", "Cayenne"].includes(v.nom_model),
      );
      const uniqueModeles = [
        ...new Map(filtered.map((v) => [v.nom_model, v])).values(),
      ];

      setModeles(uniqueModeles);
    } catch (error) {
      setModeles([]);
    } finally {
      setLoading(false);
    }
  };

  const handleModeleClick = (modele) =>
    navigate(`/variantes/neuve/${modele._id}`);

  const DESCRIPTIONS = {
    911: "L'icône de génération en génération.",
    718: "La sportive deux places au moteur central arrière.",
    Cayman: "La sportive deux places au moteur central arrière.",
    Cayenne: "Le SUV à l'ADN sportif et familial.",
  };

  const getModeleInfo = (modele) => ({
    description:
      modele.description ||
      DESCRIPTIONS[modele.nom_model] ||
      "Découvrez ce modèle emblématique",
  });

  return (
    <div className="home-container-porsche">
      <section className="home-hero-section">
        <div className="home-hero-content">
          <div className="home-hero-image-container">
            <div className="home-hero-image">
              <div className="home-hero-placeholder">
                <span className="home-hero-logo">PORSCHE</span>
              </div>
            </div>
          </div>
          <div className="home-hero-text">
            <h1 className="home-hero-title">
              Votre voyage Porsche commence ici.
            </h1>
            <p className="home-hero-slogan">
              Découvrez l'excellence automobile. Choisissez votre expérience
              Porsche.
            </p>
            <div className="home-hero-buttons">
              <Link
                to="/catalogue/neuve"
                className="home-hero-btn home-hero-btn-primary"
              >
                Voitures Neuves
              </Link>
              <Link
                to="/catalogue/occasion"
                className="home-hero-btn home-hero-btn-secondary"
              >
                Voitures d'Occasion
              </Link>
            </div>
          </div>
        </div>
      </section>

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
              const photos = modele.photo_voiture?.filter((p) => p?.name) || [];
              const photoPrincipale =
                photos.length > 1 ? photos[1] : photos[0] || null;

              return (
                <article
                  key={modele._id}
                  className="catalogue-modele-card-neuf-porsche"
                >
                  <h2 className="catalogue-modele-title-porsche">
                    {modele.nom_model}
                  </h2>

                  <div className="catalogue-modele-image-porsche">
                    {photoPrincipale && photoPrincipale.name ? (
                      <img
                        src={buildUrl(photoPrincipale.name)}
                        alt={`Porsche ${modele.nom_model}`}
                        className="catalogue-modele-img-porsche"
                        onError={(e) => {
                          e.target.style.display = "none";
                          if (e.target.nextSibling) {
                            e.target.nextSibling.style.display = "flex";
                          }
                        }}
                      />
                    ) : null}
                    <div
                      className="catalogue-modele-placeholder-porsche"
                      style={{
                        display:
                          photoPrincipale && photoPrincipale.name
                            ? "none"
                            : "flex",
                      }}
                    >
                      <span className="catalogue-modele-letter-porsche">
                        {modele.nom_model?.charAt(0) || "?"}
                      </span>
                    </div>
                  </div>

                  <div className="home-model-info">
                    <p className="home-model-description">
                      {modeleInfo.description}
                    </p>
                  </div>

                  <button
                    className="catalogue-modele-btn-porsche"
                    onClick={() => handleModeleClick(modele)}
                  >
                    Configurer {modele.nom_model}
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </section>

      <section className="home-accessoires-section">
        <div className="home-accessoires-content">
          <div className="home-accessoires-text">
            <h2 className="home-accessoires-title">
              Découvrez la boutique Porsche Lifestyle
            </h2>
            <p className="home-accessoires-description">
              Personnalisez votre expérience avec notre collection exclusive
              d'accessoires premium. Du lifestyle aux pièces de performance,
              découvrez tout ce qui fait l'excellence Porsche.
            </p>
            <div className="home-accessoires-buttons">
              <Link to="/accessoires" className="home-accessoires-btn">
                Aller à la boutique en ligne
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="home-approved-section">
        <div className="home-approved-container">
          <div className="home-approved-image">
            <div className="home-approved-image-placeholder">
              <span className="home-approved-image-text">Porsche Approved</span>
            </div>
          </div>

          <div className="home-approved-content">
            <h2 className="home-approved-title">
              Véhicules d'occasion
              <br />
              Porsche Approved.
            </h2>
            <p className="home-approved-text">
              Une Porsche reste une Porsche. Nos véhicules d'occasion Porsche
              Approved sont vecteurs d'émotion, comme au premier jour. Ils
              témoignent de la passion avec laquelle nous les avons contrôlés
              sur 111 points. Ils font battre votre cœur, car nous avons mis
              tout le nôtre dans leur préparation. Et votre sérénité est assurée
              grâce à notre garantie Porsche Approved.
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
