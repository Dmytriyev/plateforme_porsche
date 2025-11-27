/**
 * pages/Home.jsx — Page d'accueil; sections promos et liens rapides.
 *
 * - Montre l'usage d'un service (`voitureService`) pour récupérer des données
 *   et de `useEffect` pour déclencher la récupération au montage.
 * - Exemple pratique : filtrage et affichage conditionnel (loading / empty / data).
 */

import "../css/CatalogueModeles.css";
import "../css/Home.css";
import voitureService from "../services/voiture.service.js";
import buildUrl from "../utils/buildUrl";
import ImageWithFallback from "../components/common/ImageWithFallback.jsx";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

// Page d'accueil : sections promos, modèles mis en avant et navigation vers catalogues.
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
        <div className="home-hero-content max-w-7xl mx-auto px-4 py-12 flex flex-col md:flex-row items-center gap-8">
          <div className="home-hero-image-container w-full md:w-1/2">
            <figure className="rounded-lg overflow-hidden shadow-xl">
              <img
                src="/Image/Porsche_GT3_GT4_RS_4.jpg"
                alt="Porsche GT3 GT4 RS"
                loading="lazy"
                className="w-full h-56 sm:h-72 md:h-96 object-cover"
              />
              <figcaption className="sr-only">Porsche GT3 GT4 RS</figcaption>
            </figure>
          </div>

          <div className="home-hero-text w-full md:w-1/2 text-center md:text-left">
            <h1 className="home-hero-title text-3xl sm:text-4xl lg:text-5xl font-semibold">
              Votre voyage Porsche commence ici.
            </h1>
            <p className="home-hero-slogan mt-4 text-sm sm:text-base text-gray-600">
              Découvrez l'excellence automobile. Choisissez votre expérience
              Porsche.
            </p>
            <div className="home-hero-buttons mt-6 flex flex-col sm:flex-row items-center md:items-start justify-center md:justify-start gap-3">
              <Link
                to="/catalogue/neuve"
                className="home-hero-btn home-hero-btn-primary px-6 py-2 rounded"
              >
                Voitures Neuves
              </Link>
              <Link
                to="/catalogue/occasion"
                className="home-hero-btn home-hero-btn-secondary px-6 py-2 rounded"
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
                    <ImageWithFallback
                      src={photoPrincipale && photoPrincipale.name ? buildUrl(photoPrincipale.name) : null}
                      alt={`Porsche ${modele.nom_model}`}
                      imgClass="catalogue-modele-img-porsche"
                      placeholder={
                        <div className="catalogue-modele-placeholder-porsche">
                          <span className="catalogue-modele-letter-porsche">
                            {modele.nom_model?.charAt(0) || "?"}
                          </span>
                        </div>
                      }
                    />
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
        <div className="home-approved-container max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 items-stretch gap-6">
          <div className="home-approved-image order-1 md:order-1 h-64 md:h-auto overflow-hidden">
            <img
              src="/Image/old-new-avabt.jpg"
              alt="Porsche Approved - véhicules certifiés"
              loading="lazy"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="home-approved-content order-2 md:order-2 flex flex-col justify-between p-6">
            <div>
              <h2 className="home-approved-title">
                Véhicules d'occasion
                <br />
                Porsche Certifié.
              </h2>
              <p className="home-approved-text">
                Une Porsche reste une Porsche. Nos véhicules d'occasion Porsche
                certifiés sont vecteurs d'émotion, comme au premier jour. Ils
                témoignent de la passion avec laquelle nous les avons contrôlés
                sur 111 points. Ils font battre votre cœur, car nous avons mis
                tout le nôtre dans leur préparation. Et votre sérénité est assurée
                grâce à notre garantie Porsche Certifié.
              </p>
            </div>

            <div className="home-approved-actions mt-6 md:mt-0">
              <Link to="/porsche-approved" className="home-approved-btn">
                En savoir plus
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
