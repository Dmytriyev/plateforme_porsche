/**
 * pages/CatalogueModeles.jsx — Liste des modèles Porsche; récupère via `modelPorsche.service`.
 *
 * @file pages/CatalogueModeles.jsx
 */

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import voitureService from "../services/voiture.service.js";
import modelPorscheService from "../services/modelPorsche.service.js";
import Loading from "../components/common/Loading.jsx";
import { formatPrice } from "../utils/helpers.js";
import { API_URL } from "../config/api.js";
import "../css/CatalogueModeles.css";
import "../css/components/Message.css";
import { warn } from "../utils/logger.js";

// Page : catalogue des modèles (neuf / occasion) — regroupe et présente modèles et statistiques.
const CatalogueModeles = () => {
  const { type } = useParams(); // 'neuve' ou 'occasion'
  const navigate = useNavigate();
  const [modeles, setModeles] = useState([]); // Pour les neuves: modèles groupés | Pour occasions: toutes les occasions
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isNeuf = type === "neuve";

  useEffect(() => {
    let isMounted = true;
    let abortController = new AbortController();

    const fetchModeles = async () => {
      try {
        setLoading(true);
        setError("");

        // OPTIMISÉ: Utiliser l'endpoint dédié du backend au lieu de filtrer côté client
        // Backend: GET /voiture/neuve ou GET /voiture/occasion
        const response = isNeuf
          ? await voitureService.getVoituresNeuves()
          : await voitureService.getVoituresOccasion();

        // Vérifier que le composant est toujours monté avant de mettre à jour l'état
        if (!isMounted) return;

        let data = Array.isArray(response) ? response : [];

        if (isNeuf) {
          // Pour les neuves: grouper par nom_model et calculer le prix minimum
          const modelesGroupes = {};

          data.forEach((voiture) => {
            const nomModel = voiture.nom_model;
            if (!nomModel) return;

            if (!modelesGroupes[nomModel]) {
              modelesGroupes[nomModel] = {
                nom_model: nomModel,
                photo_voiture: voiture.photo_voiture || [],
                prix_base: voiture.prix_base || 0,
                _id: voiture._id,
                type_voiture: voiture.type_voiture,
              };
            }

            // Mettre à jour le prix minimum depuis la voiture de base
            const prix = voiture.prix_base || 0;
            if (
              prix > 0 &&
              (modelesGroupes[nomModel].prix_base === 0 ||
                prix < modelesGroupes[nomModel].prix_base)
            ) {
              modelesGroupes[nomModel].prix_base = prix;
            }

            // Récupérer la première photo disponible
            if (
              modelesGroupes[nomModel].photo_voiture.length === 0 &&
              voiture.photo_voiture &&
              voiture.photo_voiture.length > 0
            ) {
              modelesGroupes[nomModel].photo_voiture = voiture.photo_voiture;
            }
          });

          const uniqueModeles = Object.values(modelesGroupes);

          // Récupérer les prix depuis les variantes/configurations pour chaque modèle
          const modelesAvecPrix = await Promise.all(
            uniqueModeles.map(async (modele) => {
              try {
                // Toujours chercher dans les variantes pour avoir le prix le plus bas
                const variantes =
                  await modelPorscheService.getConfigurationsByVoiture(
                    modele._id,
                  );

                if (Array.isArray(variantes) && variantes.length > 0) {
                  const variantesNeuves = variantes.filter(
                    (v) =>
                      v.voiture?.type_voiture === true ||
                      v.voiture?.type_voiture === "neuve" ||
                      v.voiture?.type_voiture === "true",
                  );

                  // Extraire tous les prix valides
                  const prixVariantes = variantesNeuves
                    .map((v) => v.prix_base || v.prix_calcule || 0)
                    .filter((p) => p > 0);

                  if (prixVariantes.length > 0) {
                    const prixMin = Math.min(...prixVariantes);
                    modele.prix_base = prixMin;
                  }
                }
              } catch (error) {
                // Journaliser l'erreur pour faciliter le debug sans casser l'UI
                warn("Erreur lors de la récupération des variantes :", error);
              }
              return modele;
            }),
          );

          if (isMounted) setModeles(modelesAvecPrix);
        } else {
          const modelesGroupes = {};

          data.forEach((occasion) => {
            // Pour les occasions, utiliser le nom du modèle de BASE (911, Cayman, Cayenne)
            // et non le nom de la variante (GT4 RS, Carrera S, etc.)
            const nomModel =
              occasion.voiture_base?.nom_model || occasion.nom_model || "";

            if (!nomModel) return;

            if (!modelesGroupes[nomModel]) {
              modelesGroupes[nomModel] = {
                nom_model: nomModel,
                occasions: [],
                photo_voiture: [],
                description: "",
                voiture_base: null,
              };
            }

            // Ajouter l'occasion au groupe
            modelesGroupes[nomModel].occasions.push(occasion);

            // Récupérer les photos du modèle de base (priorité à voiture_base)
            if (
              occasion.voiture_base?.photo_voiture &&
              modelesGroupes[nomModel].photo_voiture.length === 0
            ) {
              if (Array.isArray(occasion.voiture_base.photo_voiture)) {
                modelesGroupes[nomModel].photo_voiture =
                  occasion.voiture_base.photo_voiture.filter(
                    (p) => p && (p.name || p._id),
                  );
              } else if (
                typeof occasion.voiture_base.photo_voiture === "object" &&
                occasion.voiture_base.photo_voiture.name
              ) {
                modelesGroupes[nomModel].photo_voiture = [
                  occasion.voiture_base.photo_voiture,
                ];
              }
            }

            // Récupérer la description du modèle de base
            if (
              !modelesGroupes[nomModel].description &&
              occasion.voiture_base?.description
            ) {
              modelesGroupes[nomModel].description =
                occasion.voiture_base.description;
            }

            // Garder la référence au modèle de base
            if (
              !modelesGroupes[nomModel].voiture_base &&
              occasion.voiture_base
            ) {
              modelesGroupes[nomModel].voiture_base = occasion.voiture_base;
            }
          });

          // Convertir l'objet en tableau et calculer les statistiques
          const modelesFormates = Object.values(modelesGroupes).map(
            (groupe) => {
              // Calculer le prix minimum
              const prixListe = groupe.occasions
                .map((occ) => occ.prix_base_variante || occ.prix_base || 0)
                .filter((p) => p > 0);
              const prixMin = prixListe.length > 0 ? Math.min(...prixListe) : 0;

              // Extraire les carrosseries uniques
              const carrosseries = [
                ...new Set(
                  groupe.occasions
                    .map((occ) => occ.type_carrosserie)
                    .filter(Boolean),
                ),
              ];

              // Extraire les transmissions uniques
              const transmissions = new Set();
              groupe.occasions.forEach((occ) => {
                const trans = occ.specifications?.transmission || "";
                if (trans.includes("PDK") || trans.includes("Automatique")) {
                  transmissions.add("Automatique");
                }
                if (trans.includes("Manuelle")) {
                  transmissions.add("Manuelle");
                }
              });

              return {
                _id: groupe.voiture_base?._id || groupe.nom_model, // ID du modèle de base
                nom_model: groupe.nom_model,
                description:
                  groupe.description ||
                  `Porsche ${groupe.nom_model} d'occasion certifiée.`,
                photo_voiture: groupe.photo_voiture,
                type_voiture: false,
                nombre_occasions: groupe.occasions.length,
                prix_depuis: prixMin,
                carrosseries_disponibles: carrosseries,
                transmissions_disponibles: Array.from(transmissions),
              };
            },
          );

          const ordreModeles = ["911", "Cayman", "Cayenne"];
          modelesFormates.sort((a, b) => {
            const indexA = ordreModeles.indexOf(a.nom_model);
            const indexB = ordreModeles.indexOf(b.nom_model);
            return (
              (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB)
            );
          });

          if (isMounted) setModeles(modelesFormates);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || "Erreur lors du chargement des modèles");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchModeles();

    // Cleanup function pour annuler la requête si le composant est démonté
    return () => {
      isMounted = false;
      abortController.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]); // type seul suffit car isNeuf est calculé à partir de type

  /**
   * Gestion du clic sur une carte
   *
   * EXPLICATION POUR ÉTUDIANT:
   * ==========================
   * - Pour les NEUVES: On va vers la liste des variantes du modèle
   * - Pour les OCCASIONS: On va vers la liste des occasions de ce modèle (comme pour les neuves)
   */
  const handleModeleClick = (modele) => {
    if (isNeuf) {
      // Pour les neuves: rediriger vers la liste des variantes de ce modèle
      navigate(`/variantes/${type}/${modele._id}`);
    } else {
      // Pour les occasions: rediriger vers la liste des occasions de ce modèle
      // L'ID utilisé est celui du modèle de base (voiture)
      navigate(`/occasion/${modele._id}`);
    }
  };

  if (loading) {
    return <Loading fullScreen message="Chargement des modèles..." />;
  }

  if (error) {
    return (
      <div className="error-container">
        <div className="message-box message-error">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="catalogue-modeles-container">
      <div className="catalogue-modeles-content">
        {/* En-tête */}
        <div className="catalogue-modeles-header">
          <button
            onClick={() => navigate("/choix-voiture")}
            className="catalogue-back-btn"
          >
            ← Retour au choix
          </button>
          <h1 className="catalogue-modeles-title">
            {isNeuf ? "Porsche Neuves" : "Porsche d'Occasion"}
          </h1>
          <p className="catalogue-modeles-subtitle">
            {isNeuf
              ? "Choisissez votre modèle à configurer"
              : "Choisissez votre modèle"}
          </p>
        </div>

        {/* Liste des modèles */}
        {modeles.length === 0 ? (
          <div className="catalogue-empty">
            <p>
              Aucun modèle {isNeuf ? "neuf" : "d'occasion"} disponible pour le
              moment.
            </p>
          </div>
        ) : (
          <div
            className={`catalogue-modeles-grid ${isNeuf ? "catalogue-modeles-grid-neuf" : "catalogue-modeles-grid-occasion"}`}
          >
            {modeles.map((modele) => {
              if (isNeuf) {
                // Pour les neuves: cartes simplifiées avec seulement titre, image, prix et bouton
                const photoPrincipale =
                  modele.photo_voiture &&
                    Array.isArray(modele.photo_voiture) &&
                    modele.photo_voiture.length > 2
                    ? modele.photo_voiture[2]
                    : modele.photo_voiture &&
                      Array.isArray(modele.photo_voiture) &&
                      modele.photo_voiture.length > 0
                      ? modele.photo_voiture[modele.photo_voiture.length - 1]
                      : null;
                const photoUrl = photoPrincipale?.name?.startsWith("http")
                  ? photoPrincipale.name
                  : photoPrincipale?.name?.startsWith("/")
                    ? `${API_URL}${photoPrincipale.name}`
                    : photoPrincipale?.name
                      ? `${API_URL}/${photoPrincipale.name}`
                      : null;

                return (
                  <div
                    key={modele._id}
                    className="catalogue-modele-card-neuf-porsche"
                  >
                    {/* Titre */}
                    <h2 className="catalogue-modele-title-porsche">
                      {modele.nom_model}
                    </h2>

                    {/* Image */}
                    <div className="catalogue-modele-image-porsche">
                      {photoUrl ? (
                        <img
                          src={photoUrl}
                          alt={photoPrincipale?.alt || modele.nom_model}
                          className="catalogue-modele-img-porsche"
                          onError={(e) => {
                            try {
                              if (e.target.dataset.fallback) {
                                e.target.style.display = "none";
                                if (e.target.nextSibling)
                                  e.target.nextSibling.style.display = "flex";
                                return;
                              }
                              e.target.dataset.fallback = "1";
                              e.target.src = "/Logo/Logo_porsche_black.jpg";
                            } catch (err) {
                              e.target.style.display = "none";
                              if (e.target.nextSibling) {
                                e.target.nextSibling.style.display = "flex";
                              }
                            }
                          }}
                        />
                      ) : null}
                      <div
                        className="catalogue-modele-placeholder-porsche"
                        style={{ display: photoUrl ? "none" : "flex" }}
                      >
                        <span className="catalogue-modele-letter-porsche">
                          {modele.nom_model?.charAt(0) || "?"}
                        </span>
                      </div>
                    </div>

                    {/* Prix - Affiché entre l'image et le bouton */}
                    <div className="catalogue-modele-prix-porsche">
                      {modele.prix_base > 0 ? (
                        <>
                          <span className="catalogue-prix-label">
                            Prix à partir de
                          </span>
                          <span className="catalogue-prix-montant">
                            {formatPrice(modele.prix_base)}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="catalogue-prix-label">Prix</span>
                          <span className="catalogue-prix-montant">
                            Sur demande
                          </span>
                        </>
                      )}
                    </div>

                    {/* Bouton */}
                    <button
                      className="catalogue-modele-btn-porsche"
                      onClick={() => handleModeleClick(modele)}
                    >
                      Configurer {modele.nom_model}
                    </button>
                  </div>
                );
              } else {
                // Pour les occasions: EXACTEMENT le même style que les neuves
                const photoPrincipale =
                  modele.photo_voiture &&
                    Array.isArray(modele.photo_voiture) &&
                    modele.photo_voiture.length > 2
                    ? modele.photo_voiture[2]
                    : modele.photo_voiture &&
                      Array.isArray(modele.photo_voiture) &&
                      modele.photo_voiture.length > 0
                      ? modele.photo_voiture[modele.photo_voiture.length - 1]
                      : null;
                const photoUrl = photoPrincipale?.name?.startsWith("http")
                  ? photoPrincipale.name
                  : photoPrincipale?.name?.startsWith("/")
                    ? `${API_URL}${photoPrincipale.name}`
                    : photoPrincipale?.name
                      ? `${API_URL}/${photoPrincipale.name}`
                      : null;

                return (
                  <div
                    key={modele._id}
                    className="catalogue-modele-card-neuf-porsche"
                  >
                    {/* Titre */}
                    <h2 className="catalogue-modele-title-porsche">
                      {modele.nom_model}
                    </h2>

                    {/* Image */}
                    <div className="catalogue-modele-image-porsche">
                      {photoUrl ? (
                        <img
                          src={photoUrl}
                          alt={photoPrincipale?.alt || modele.nom_model}
                          className="catalogue-modele-img-porsche"
                          onError={(e) => {
                            try {
                              if (e.target.dataset.fallback) {
                                e.target.style.display = "none";
                                if (e.target.nextSibling)
                                  e.target.nextSibling.style.display = "flex";
                                return;
                              }
                              e.target.dataset.fallback = "1";
                              e.target.src = "/Logo/Logo_porsche_black.jpg";
                            } catch (err) {
                              e.target.style.display = "none";
                              if (e.target.nextSibling) {
                                e.target.nextSibling.style.display = "flex";
                              }
                            }
                          }}
                        />
                      ) : null}
                      <div
                        className="catalogue-modele-placeholder-porsche"
                        style={{ display: photoUrl ? "none" : "flex" }}
                      >
                        <span className="catalogue-modele-letter-porsche">
                          {modele.nom_model?.charAt(0) || "?"}
                        </span>
                      </div>
                    </div>

                    {/* Prix */}
                    <div className="catalogue-modele-prix-porsche">
                      {modele.prix_depuis > 0 ? (
                        <>
                          <span className="catalogue-prix-label">
                            Prix à partir de
                          </span>
                          <span className="catalogue-prix-montant">
                            {formatPrice(modele.prix_depuis)}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="catalogue-prix-label">Prix</span>
                          <span className="catalogue-prix-montant">
                            Sur demande
                          </span>
                        </>
                      )}
                    </div>

                    {/* Bouton */}
                    <button
                      className="catalogue-modele-btn-porsche"
                      onClick={() => handleModeleClick(modele)}
                    >
                      Voir {modele.nom_model}
                    </button>
                  </div>
                );
              }
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CatalogueModeles;
