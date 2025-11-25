/**
 * OccasionPage.jsx — Page des voitures d'occasion
 *
 * - Liste et filtres pour les annonces d'occasion.
 */

import { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import modelPorscheService from "../services/modelPorsche.service.js";
import voitureService from "../services/voiture.service.js";
import commandeService from "../services/commande.service.js";
import Loading from "../components/common/Loading.jsx";
import Button from "../components/common/Button.jsx";
import { formatPrice } from "../utils/helpers.js";
import buildUrl from "../utils/buildUrl";
import "../css/OccasionPage.css";
import "../css/ListeVariantes.css";
import "../css/CatalogueModeles.css";
import "../css/components/Message.css";
import { warn } from "../utils/logger.js";
import { AuthContext } from "../context/AuthContext.jsx";
import LoginPromptModal from "../components/modals/LoginPromptModal.jsx";
import ContactModal from "../components/modals/ContactModal.jsx";

// Page : affichage des annonces d'occasion (liste ou page modèle). Permet réservation (connexion requise pour réserver).
const OccasionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isStaff, user: _user } = useContext(AuthContext);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  const [isListeMode, setIsListeMode] = useState(false);
  const [modeleBase, setModeleBase] = useState(null);
  const [occasionsListe, setOccasionsListe] = useState([]);

  const [filtres, setFiltres] = useState({
    carrosserie: [],
    boiteVitesse: [],
    transmission: [],
    prixMax: null,
  });

  const [recherche, setRecherche] = useState("");
  const [occasionsFiltrees, setOccasionsFiltrees] = useState([]);

  const [pageData, setPageData] = useState(null);
  const [selectedImage, setSelectedImage] = useState(2); // Démarre à l'index 2 pour exclure photos 0 et 1

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [reservationEnCours, setReservationEnCours] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchPageData = async () => {
      setLoading(true);
      setError("");
      setIsListeMode(false);

      try {
        // cas sans id : rien à afficher (optionnel : fallback)
        if (!id) return;

        const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);

        // Helper pour afficher une liste d'occasions à partir d'un nom de modèle
        const loadOccasionsByNomModel = async (nomModel) => {
          try {
            const occasions = await voitureService.getVoituresOccasion(nomModel);
            if (Array.isArray(occasions) && occasions.length > 0) {
              if (isMounted) {
                setOccasionsListe(occasions);
                setOccasionsFiltrees(occasions);
              }
              return true;
            }

            const allOccasions = await modelPorscheService.getModelesOccasion();
            if (Array.isArray(allOccasions) && allOccasions.length > 0) {
              const found = allOccasions.filter((occasion) => {
                const occasionNomModel =
                  occasion.voiture?.nom_model || occasion.nom_model || occasion.voiture_base?.nom_model;
                return (
                  occasionNomModel === nomModel ||
                  (typeof occasionNomModel === 'string' && occasionNomModel.toLowerCase() === nomModel.toLowerCase())
                );
              });
              if (found.length > 0) {
                if (isMounted) {
                  setOccasionsListe(found);
                  setOccasionsFiltrees(found);
                }
                return true;
              }
            }

            if (isMounted) {
              setOccasionsListe([]);
              setOccasionsFiltrees([]);
            }
            return false;
          } catch (e) {
            if (isMounted) {
              setOccasionsListe([]);
              setOccasionsFiltrees([]);
            }
            warn("Erreur lors du chargement des occasions :", e);
            return false;
          }
        };

        if (isObjectId) {
          // Si l'ID ressemble à un model_porsche on essaie cet endpoint en priorité
          let pageLoaded = false;

          if (id.startsWith("69138c4") || id.startsWith("67") || id.startsWith("68")) {
            try {
              const data = await modelPorscheService.getOccasionPage(id);
              if (data && data.occasion) {
                if (isMounted) {
                  setIsListeMode(false);
                  setPageData(data);
                }
                pageLoaded = true;
              }
            } catch (e) {
              const status = e?.response?.status || e?.status;
              if (status !== 404 && status !== 400) warn("Erreur lors de la récupération de la page model_porsche :", e);
            }
          }

          if (!pageLoaded) {
            // Essayer de récupérer la voiture par id
            try {
              const voiture = await voitureService.getVoitureById(id);
              if (voiture && voiture.nom_model) {
                if (isMounted) {
                  setIsListeMode(true);
                  setModeleBase(voiture);
                }
                const handled = await loadOccasionsByNomModel(voiture.nom_model);
                if (handled) return;
              }
            } catch (e) {
              // Si la voiture n'existe pas, essayer en tant que model_porsche
              try {
                const data = await modelPorscheService.getOccasionPage(id);
                if (data && data.occasion) {
                  if (isMounted) {
                    setIsListeMode(false);
                    setPageData(data);
                  }
                  return;
                }
              } catch (errModel) {
                const status = errModel?.response?.status || errModel?.status;
                if (status !== 404 && status !== 400) warn("Erreur inattendue modelPorscheError:", errModel);
              }
            }
          }
        } else {
          // id est un nom de modèle
          try {
            const allVoitures = await voitureService.getAllVoitures();
            let voiture = null;
            if (Array.isArray(allVoitures)) {
              voiture = allVoitures.find((v) => v.nom_model === id || v.nom_model?.toLowerCase() === id.toLowerCase());
            } else if (allVoitures?.data && Array.isArray(allVoitures.data)) {
              voiture = allVoitures.data.find((v) => v.nom_model === id || v.nom_model?.toLowerCase() === id.toLowerCase());
            }

            if (voiture) {
              if (isMounted) {
                setIsListeMode(true);
                setModeleBase({ ...voiture, type_voiture: false });
              }
              const handled = await loadOccasionsByNomModel(voiture.nom_model || id);
              if (handled) return;
            }
          } catch (e) {
            warn("Erreur lors de la récupération générale des voitures :", e);
          }
        }
      } catch (err) {
        const errorMessage = err?.message || err?.response?.data?.message || "Erreur lors du chargement de la page";
        if (isMounted) setError(errorMessage);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchPageData();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleReservation = async () => {
    if (!isAuthenticated()) {
      setShowLoginPrompt(true);
      return;
    }

    try {
      setReservationEnCours(true);
      setError("");
      setSuccess("");

      // Date de réservation : aujourd'hui + 1 jour à 10h00
      const dateReservation = new Date();
      dateReservation.setDate(dateReservation.getDate() + 1);
      dateReservation.setHours(10, 0, 0, 0);

      const reservationData = {
        model_porsche: id,
        date_reservation: dateReservation.toISOString(),
      };

      await commandeService.createReservation(reservationData);

      setSuccess(
        "Réservation effectuée avec succès ! Redirection vers votre compte...",
      );

      // Rediriger vers mon compte après 2 secondes
      setTimeout(() => {
        navigate("/mon-compte");
      }, 2000);
    } catch (err) {
      setError(err.message || "Erreur lors de la réservation");
    } finally {
      setReservationEnCours(false);
    }
  };

  // Fonctions pour les filtres (similaires à ListeVariantes)
  const getFilterOptions = () => {
    const carrosseries = [
      ...new Set(occasionsListe.map((o) => o.type_carrosserie).filter(Boolean)),
    ];
    const transmissions = new Set();
    const prix = [];

    occasionsListe.forEach((o) => {
      const trans = o.specifications?.transmission || "";
      if (trans.includes("PDK") || trans.includes("Automatique")) {
        transmissions.add("Automatique");
      }
      if (trans.includes("Manuelle")) {
        transmissions.add("Manuelle");
      }

      const prixOccasion = o.prix_base || o.prix_base_variante || 0;
      if (prixOccasion > 0) {
        prix.push(prixOccasion);
      }
    });

    return {
      carrosseries: carrosseries.sort(),
      transmissions: Array.from(transmissions).sort(),
      prixMax: prix.length > 0 ? Math.max(...prix) : 0,
    };
  };

  const _filterOptions = getFilterOptions();

  const _handleFilterChange = (filterType, value) => {
    setFiltres((prev) => {
      const newFiltres = { ...prev };

      if (filterType === "carrosserie" || filterType === "boiteVitesse") {
        const current = newFiltres[filterType] || [];
        if (current.includes(value)) {
          newFiltres[filterType] = current.filter((v) => v !== value);
        } else {
          newFiltres[filterType] = [...current, value];
        }
      } else {
        newFiltres[filterType] = value;
      }

      return newFiltres;
    });
  };

  const _handleResetFilter = () => {
    setFiltres({
      carrosserie: [],
      boiteVitesse: [],
      transmission: [],
      prixMax: null,
    });
    setRecherche("");
  };
  useEffect(() => {
    if (occasionsListe.length === 0) {
      setOccasionsFiltrees([]);
      return;
    }

    let filtered = [...occasionsListe];
    if (recherche.trim()) {
      const rechercheLower = recherche.toLowerCase();
      filtered = filtered.filter((o) => {
        const nomVariante = o.nom_model || "";
        const nomModeleBase = modeleBase?.nom_model || "";
        const nomComplet =
          nomVariante && nomVariante !== nomModeleBase
            ? `${nomModeleBase} ${nomVariante}`.trim()
            : nomVariante || nomModeleBase;
        return nomComplet.toLowerCase().includes(rechercheLower);
      });
    }
    if (filtres.carrosserie.length > 0) {
      filtered = filtered.filter((o) =>
        filtres.carrosserie.includes(o.type_carrosserie),
      );
    }
    if (filtres.boiteVitesse.length > 0) {
      filtered = filtered.filter((o) => {
        const trans = o.specifications?.transmission || "";
        return filtres.boiteVitesse.some((bt) => {
          if (bt === "Automatique") {
            return trans.includes("PDK") || trans.includes("Automatique");
          }
          if (bt === "Manuelle") {
            return trans.includes("Manuelle");
          }
          return false;
        });
      });
    }
    if (filtres.prixMax) {
      filtered = filtered.filter(
        (o) => (o.prix_base || o.prix_base_variante || 0) <= filtres.prixMax,
      );
    }

    setOccasionsFiltrees(filtered);
  }, [occasionsListe, filtres, recherche, modeleBase]);

  const _getTransmissionType = (occasion) => {
    const trans = occasion.specifications?.transmission || "";
    if (trans.includes("PDK") || trans.includes("Automatique")) {
      return "Automatique";
    }
    if (trans.includes("Manuelle")) {
      return "Manuelle";
    }
    return "Automatique";
  };

  if (loading) {
    return <Loading fullScreen message="Chargement..." />;
  }

  if (error) {
    return (
      <div className="occasion-page-error">
        <div className="message-box message-error">
          <p>
            {error.includes("introuvable") || error.includes("404")
              ? "Cette voiture d'occasion n'est plus disponible ou n'existe pas."
              : error}
          </p>
        </div>
        <div style={{ marginTop: "1rem", display: "flex", gap: "1rem" }}>
          <Button onClick={() => navigate(-1)}>← Retour</Button>
          <Button onClick={() => navigate("/catalogue/occasion")}>
            Voir toutes les occasions
          </Button>
        </div>
      </div>
    );
  }

  if (isListeMode && modeleBase) {
    return (
      <div className="catalogue-modeles-container">
        <div className="catalogue-modeles-content">
          {/* Header */}
          <div className="catalogue-modeles-header">
            <button
              onClick={() => navigate("/catalogue/occasion")}
              className="catalogue-back-btn"
            >
              ← Retour au catalogue
            </button>
            <h1 className="catalogue-modeles-title">
              {modeleBase?.nom_model} d'occasion
            </h1>
            <p className="catalogue-modeles-subtitle">
              {occasionsFiltrees.length}{" "}
              {occasionsFiltrees.length > 1
                ? "véhicules disponibles"
                : "véhicule disponible"}
            </p>
          </div>

          {/* Liste des occasions */}
          {occasionsListe.length === 0 ? (
            <div className="catalogue-empty">
              <p>
                Aucune {modeleBase?.nom_model} d'occasion disponible pour le
                moment.
              </p>
            </div>
          ) : occasionsFiltrees.length === 0 ? (
            <div className="catalogue-empty">
              <p>Aucune occasion ne correspond aux filtres sélectionnés.</p>
            </div>
          ) : (
            <div className="catalogue-modeles-grid-occasion">
              {occasionsFiltrees.map((occasion) => {
                let photoPrincipale = null;

                // Priorité : photo_porsche[2] (première photo de la galerie, exclut index 0 et 1)
                if (
                  occasion.photo_porsche &&
                  Array.isArray(occasion.photo_porsche) &&
                  occasion.photo_porsche.length > 0
                ) {
                  const validPhotos = occasion.photo_porsche.filter(
                    (p) => p && (p.name || p._id),
                  );
                  if (validPhotos.length > 2) {
                    // Utiliser la photo à l'index 2 (première de la galerie)
                    photoPrincipale = validPhotos[2];
                  } else if (validPhotos.length > 0) {
                    // Fallback : dernière photo disponible
                    photoPrincipale = validPhotos[validPhotos.length - 1];
                  }
                } else if (
                  occasion.photo_voiture &&
                  Array.isArray(occasion.photo_voiture) &&
                  occasion.photo_voiture.length > 0
                ) {
                  const validPhotos = occasion.photo_voiture.filter(
                    (p) => p && (p.name || p._id),
                  );
                  if (validPhotos.length > 2) {
                    photoPrincipale = validPhotos[2];
                  } else if (validPhotos.length > 0) {
                    photoPrincipale = validPhotos[validPhotos.length - 1];
                  }
                } else if (occasion.voiture_base?.photo_voiture) {
                  if (
                    Array.isArray(occasion.voiture_base.photo_voiture) &&
                    occasion.voiture_base.photo_voiture.length > 0
                  ) {
                    const validPhotos =
                      occasion.voiture_base.photo_voiture.filter(
                        (p) => p && (p.name || p._id),
                      );
                    if (validPhotos.length > 2) {
                      photoPrincipale = validPhotos[2];
                    } else if (validPhotos.length > 0) {
                      photoPrincipale = validPhotos[validPhotos.length - 1];
                    }
                  } else if (
                    occasion.voiture_base.photo_voiture &&
                    typeof occasion.voiture_base.photo_voiture === "object" &&
                    occasion.voiture_base.photo_voiture.name
                  ) {
                    photoPrincipale = occasion.voiture_base.photo_voiture;
                  }
                }

                // Pour les occasions, nom_model contient la variante (Carrera S, GTS, Turbo, etc.)
                const nomVariante = occasion.nom_model || "";
                const nomModeleBase = modeleBase?.nom_model || "";
                const nomComplet =
                  nomVariante && nomVariante !== nomModeleBase
                    ? `${nomModeleBase} ${nomVariante}`.trim()
                    : nomVariante || nomModeleBase;

                // Construction de l'URL de la photo
                const photoUrl = photoPrincipale?.name?.startsWith("http")
                  ? photoPrincipale.name
                  : photoPrincipale?.name?.startsWith("/")
                    ? buildUrl(photoPrincipale.name)
                    : photoPrincipale?.name
                      ? buildUrl(photoPrincipale.name)
                      : null;

                return (
                  <div
                    key={occasion._id}
                    className="catalogue-modele-card-neuf-porsche"
                  >
                    {/* Titre */}
                    <h2 className="catalogue-modele-title-porsche">
                      {nomComplet}
                    </h2>

                    {/* Image */}
                    <div className="catalogue-modele-image-porsche">
                      {photoUrl ? (
                        <img
                          src={photoUrl}
                          alt={nomComplet}
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
                          {nomComplet?.charAt(0) || "?"}
                        </span>
                      </div>
                    </div>

                    {/* Prix */}
                    <div className="catalogue-modele-prix-porsche">
                      {(occasion.prix_base || occasion.prix_base_variante) >
                        0 ? (
                        <>
                          <span className="catalogue-prix-label">Prix TTC</span>
                          <span className="catalogue-prix-montant">
                            {formatPrice(
                              occasion.prix_base || occasion.prix_base_variante,
                            )}
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
                      onClick={() => navigate(`/occasion/${occasion._id}`)}
                    >
                      Voir les détails
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }
  if (!pageData || !pageData.occasion) {
    return (
      <div className="occasion-page-error">
        <div className="message-box message-warning">
          <p>Occasion non trouvée</p>
        </div>
        <Button onClick={() => navigate("/choix-voiture")}>
          Retour au choix
        </Button>
      </div>
    );
  }

  const {
    occasion,
    voiture_base: _voiture_base,
    specifications,
    options,
    photos,
    prix,
  } = pageData;

  const formatPower = (puissance) => {
    if (!puissance) return { ch: 0 };
    return { ch: puissance };
  };

  const powerInfo = formatPower(specifications?.puissance);
  const formatDateImmat = () => {
    if (!occasion.annee_production) return null;
    const date = new Date(occasion.annee_production);
    return date.toLocaleDateString("fr-FR", {
      month: "2-digit",
      year: "numeric",
    });
  };

  const dateImmat = formatDateImmat();
  const _annee = occasion.annee_production
    ? new Date(occasion.annee_production).getFullYear()
    : null;
  const kilometrage = occasion.kilometrage || occasion.kilometrage_actuel || 0;
  const proprietaire = occasion.nombre_proprietaires || 0;
  const _accidents = occasion.accidents || false;
  const couleurExt =
    occasion.couleur_exterieur?.nom_couleur ||
    options?.couleur_exterieur?.nom ||
    "Non spécifié";
  const couleurInt =
    occasion.couleur_interieur?.nom_couleur ||
    (options?.couleurs_interieur && options.couleurs_interieur.length > 0
      ? options.couleurs_interieur[0].nom
      : "Non spécifié");
  const carburant = occasion.carburant || specifications?.moteur || "Essence";
  const prixOccasion =
    prix?.prix_fixe || occasion.prix_base || occasion.prix_base_variante || 0;
  const disponibleDate = occasion.disponible_a_partir_de || null;
  const concessionnaire = occasion.concessionnaire || "Non spécifié";

  return (
    <div className="occasion-detail-container">
      {/* Barre noire supérieure avec bouton, logo et prix */}
      <header className="occasion-top-header">
        <div className="occasion-header-left">
          <button className="occasion-header-link" onClick={() => navigate(-1)}>
            ← Retour
          </button>
        </div>

        <div className="occasion-header-center">
          <img
            src="/Logo/Logo_Porsche.png"
            alt="Porsche"
            className="occasion-header-logo"
            onError={(e) => {
              try {
                e.currentTarget.src = "/Logo/Logo_red.svg.png";
              } catch (err) {
                // fallback silent
              }
            }}
          />
        </div>

        <div className="occasion-header-right">
          <div className="occasion-header-price-group">
            <div className="occasion-header-price-item">
              <span className="occasion-header-price-label">Prix TTC</span>
              <span className="occasion-header-price-total">
                {formatPrice(prixOccasion)}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Gallery - Grande image à gauche, grille 2x2 à droite (démarre à index 2) */}
      {photos && photos.length > 2 && (
        <>
          <div className="occasion-detail-gallery">
            {/* Grande image principale à gauche - affiche la photo sélectionnée */}
            <div className="occasion-detail-gallery-main">
              <img
                src={
                  photos[selectedImage]?.name?.startsWith("http")
                    ? photos[selectedImage].name
                    : photos[selectedImage]?.name?.startsWith("/")
                      ? buildUrl(photos[selectedImage].name)
                      : buildUrl(photos[selectedImage].name)
                }
                alt={occasion.nom_model}
                className="occasion-detail-main-image"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
            </div>
            {/* Grille 2x2 à droite (4 premières photos à partir de l'index 2) */}
            <div className="occasion-detail-gallery-grid">
              {photos.slice(2, 6).map((photo, index) => (
                <button
                  key={photo._id || `grid-photo-${index + 2}`}
                  onClick={() => setSelectedImage(index + 2)}
                  className={`occasion-detail-grid-thumbnail ${selectedImage === index + 2 ? "active" : ""}`}
                >
                  <img
                    src={
                      photo.name?.startsWith("http")
                        ? photo.name
                        : photo.name?.startsWith("/")
                          ? buildUrl(photo.name)
                          : buildUrl(photo.name)
                    }
                    alt={`Vue ${index + 3}`}
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </button>
              ))}
            </div>
          </div>

          {/* Grille continue en dessous (photos à partir de l'index 6) */}
          {photos.length > 6 && (
            <div className="occasion-detail-gallery-extended">
              {photos.slice(6).map((photo, index) => (
                <button
                  key={photo._id || `extended-photo-${index + 6}`}
                  onClick={() => setSelectedImage(index + 6)}
                  className={`occasion-detail-gallery-extended-item ${selectedImage === index + 6 ? "active" : ""}`}
                >
                  <img
                    src={
                      photo.name?.startsWith("http")
                        ? photo.name
                        : photo.name?.startsWith("/")
                          ? buildUrl(photo.name)
                          : buildUrl(photo.name)
                    }
                    alt={`Vue ${index + 7}`}
                    onError={(e) => {
                      e.target.style.display = "none";
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* Messages de succès et d'erreur */}
      {success && (
        <div className="message-success occasion-message">{success}</div>
      )}
      {error && <div className="message-error occasion-message">{error}</div>}

      {/* Main Content */}
      <div className="occasion-detail-content">
        {/* Left Column */}
        <div className="occasion-detail-left">
          {/* Title Section */}
          <div className="occasion-detail-title-section">
            <div className="occasion-detail-title-row">
              <h1 className="occasion-detail-title">
                Porsche {occasion.nom_model}
              </h1>
              <div className="occasion-detail-badge-approved">
                Porsche certifié
              </div>
            </div>
            {disponibleDate && (
              <div className="occasion-detail-availability">
                Disponible à partir de{" "}
                {new Date(disponibleDate)
                  .toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "numeric",
                    year: "numeric",
                  })
                  .replace(/\//g, "/")}
              </div>
            )}
          </div>

          {/* Specifications en grille 4 colonnes */}
          <div className="occasion-detail-specs-grid-four">
            {/* Teinte extérieure */}
            <div className="occasion-detail-spec-item">
              <span className="occasion-detail-spec-label">
                Teinte extérieure
              </span>
              <div className="occasion-detail-spec-value-group">
                <div
                  className="occasion-detail-color-swatch"
                  style={{ backgroundColor: "#000" }}
                />
                <span className="occasion-detail-spec-value">{couleurExt}</span>
              </div>
            </div>

            {/* Teintes intérieures */}
            <div className="occasion-detail-spec-item">
              <span className="occasion-detail-spec-label">
                Teintes intérieures & matière
              </span>
              <div className="occasion-detail-spec-value-group">
                <div
                  className="occasion-detail-color-swatch"
                  style={{ backgroundColor: "#000" }}
                />
                <span className="occasion-detail-spec-value">{couleurInt}</span>
              </div>
            </div>

            {/* Kilométrage */}
            {kilometrage > 0 && (
              <div className="occasion-detail-spec-item">
                <span className="occasion-detail-spec-label">Kilométrage</span>
                <span className="occasion-detail-spec-value">
                  {new Intl.NumberFormat("fr-FR").format(kilometrage)} km
                </span>
              </div>
            )}

            {/* 1ère immatriculation */}
            {dateImmat && (
              <div className="occasion-detail-spec-item">
                <span className="occasion-detail-spec-label">
                  1ère immatriculation
                </span>
                <span className="occasion-detail-spec-value">{dateImmat}</span>
              </div>
            )}

            {/* Propriétaires précédents */}
            {proprietaire > 0 && (
              <div className="occasion-detail-spec-item">
                <span className="occasion-detail-spec-label">
                  Propriétaire(s) préc.
                </span>
                <span className="occasion-detail-spec-value">
                  {proprietaire}
                </span>
              </div>
            )}

            {/* Moteur */}
            <div className="occasion-detail-spec-item">
              <span className="occasion-detail-spec-label">Moteur</span>
              <span className="occasion-detail-spec-value">{carburant}</span>
            </div>

            {/* Boîte de vitesse */}
            {specifications?.transmission &&
              specifications.transmission !== "N/A" && (
                <div className="occasion-detail-spec-item">
                  <span className="occasion-detail-spec-label">
                    Boîte de vitesse
                  </span>
                  <span className="occasion-detail-spec-value">
                    {specifications.transmission}
                  </span>
                </div>
              )}

            {/* Puissance */}
            {specifications?.puissance > 0 && (
              <div className="occasion-detail-spec-item">
                <span className="occasion-detail-spec-label">
                  Puissance de moteur
                </span>
                <span className="occasion-detail-spec-value">
                  {powerInfo.ch} ch
                </span>
              </div>
            )}

            {/* Accélération */}
            {specifications?.acceleration_0_100 > 0 && (
              <div className="occasion-detail-spec-item">
                <span className="occasion-detail-spec-label">
                  Accélération de 0 à 100 km/h{" "}
                  {specifications?.pack_sport_chrono
                    ? "avec le Pack Sport Chrono"
                    : ""}
                </span>
                <span className="occasion-detail-spec-value">
                  {specifications.acceleration_0_100} s
                </span>
              </div>
            )}

            {/* Concessionnaire */}
            <div className="occasion-detail-spec-item">
              <span className="occasion-detail-spec-label">
                Concessionnaire
              </span>
              <span className="occasion-detail-spec-value">
                {concessionnaire}
              </span>
            </div>
          </div>

          {/* Description */}
          <div className="occasion-detail-description">
            <h2 className="occasion-detail-description-title">
              Description du véhicule
            </h2>
            <p className="occasion-detail-description-text">
              {occasion.description || "VEHICULE EN COURS DE PREPARATION"}
            </p>
          </div>
        </div>

        {/* Right Column */}
        <div className="occasion-detail-right">
          {/* Price Section */}
          {prixOccasion > 0 && (
            <div className="occasion-detail-price-box">
              <div className="occasion-detail-price-main">
                <span className="occasion-detail-price-amount">
                  {formatPrice(prixOccasion)}
                </span>
              </div>

              <div className="occasion-detail-actions">
                <Button
                  variant="secondary"
                  onClick={() => setShowContactModal(true)}
                  className="occasion-detail-action-btn occasion-detail-action-btn-secondary"
                >
                  NOUS CONTACTER
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    handleReservation();
                  }}
                  disabled={reservationEnCours}
                  className="occasion-detail-action-btn occasion-detail-action-btn-primary"
                >
                  {reservationEnCours
                    ? "RÉSERVATION EN COURS..."
                    : "RÉSERVER EN LIGNE"}
                </Button>
              </div>
            </div>
          )}

          {/* Admin/Staff Actions */}
          {isStaff() && occasion && (
            <div className="occasion-detail-admin-box">
              <h3 className="occasion-detail-admin-title">
                Actions administrateur
              </h3>
              <div className="occasion-detail-admin-actions">
                <button
                  className="occasion-detail-admin-btn occasion-detail-admin-btn-add"
                  onClick={() => navigate("/occasion/ajouter")}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <line x1="12" y1="5" x2="12" y2="19" />
                    <line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Ajouter
                </button>
                <button
                  className="occasion-detail-admin-btn occasion-detail-admin-btn-edit"
                  onClick={() => navigate(`/occasion/${id}/modifier`)}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                  </svg>
                  Modifier
                </button>
                <button
                  className="occasion-detail-admin-btn occasion-detail-admin-btn-delete"
                  onClick={async () => {
                    if (
                      window.confirm(
                        "Êtes-vous sûr de vouloir supprimer cette voiture ? Cette action est irréversible.",
                      )
                    ) {
                      try {
                        await modelPorscheService.deleteModelPorsche(id);
                        setSuccess("Voiture supprimée avec succès");
                        setTimeout(() => navigate("/occasion"), 1500);
                      } catch (err) {
                        setError(
                          err.message || "Erreur lors de la suppression",
                        );
                      }
                    }
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  </svg>
                  Supprimer
                </button>
              </div>
            </div>
          )}

          {showLoginPrompt && (
            <LoginPromptModal
              onClose={() => setShowLoginPrompt(false)}
              onLogin={() =>
                navigate("/login", { state: { from: location.pathname } })
              }
              title="Connexion requise"
              message="Vous devez être connecté pour réserver ce véhicule. Connectez‑vous ou créez un compte pour continuer."
              primaryText="Se connecter / Créer un compte"
              secondaryText="Annuler"
            />
          )}

          {/* Dealer Info */}
          {occasion.concessionnaire && (
            <div className="occasion-detail-dealer">
              <h3 className="occasion-detail-dealer-title">
                {occasion.concessionnaire}
              </h3>
              {occasion.adresse && (
                <p className="occasion-detail-dealer-address">
                  {occasion.adresse}
                </p>
              )}
              {/* Lien vers le site du concessionnaire retiré */}
              {occasion.numero_vin && (
                <div className="occasion-detail-vehicle-number">
                  <span>Numéro du véhicule: {occasion.numero_vin}</span>
                  <button
                    className="occasion-detail-copy-btn"
                    onClick={() => {
                      navigator.clipboard.writeText(occasion.numero_vin);
                    }}
                    title="Copier"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modal de contact */}
      {showContactModal && (
        <ContactModal
          onClose={() => setShowContactModal(false)}
          vehiculeInfo={
            occasion
              ? {
                nom_model: occasion.nom_model,
                variante: occasion.type_carrosserie,
                prix: formatPrice(prixOccasion),
              }
              : null
          }
        />
      )}
    </div>
  );
};

export default OccasionPage;
