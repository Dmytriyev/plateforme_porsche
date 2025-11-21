import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { modelPorscheService, voitureService } from '../services';
import { Loading, Alert, Button } from '../components/common';
import ContactButton from '../components/ContactButton.jsx';
import { formatPrice } from '../utils/format.js';
import buildUrl from '../utils/buildUrl';
import '../css/OccasionPage.css';
import '../css/ListeVariantes.css';
import '../css/CatalogueModeles.css';
import { AuthContext } from '../context/AuthContext.jsx';
import LoginPromptModal from '../components/modals/LoginPromptModal.jsx';

const OccasionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useContext(AuthContext);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  const [isListeMode, setIsListeMode] = useState(false);
  const [modeleBase, setModeleBase] = useState(null);
  const [occasionsListe, setOccasionsListe] = useState([]);

  const [filtres, setFiltres] = useState({
    carrosserie: [],
    boiteVitesse: [],
    transmission: [],
    prixMax: null,
  });

  const [recherche, setRecherche] = useState('');
  const [occasionsFiltrees, setOccasionsFiltrees] = useState([]);

  const [pageData, setPageData] = useState(null);
  const [selectedImage, setSelectedImage] = useState(2); // Démarre à l'index 2 pour exclure photos 0 et 1

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;

    const fetchPageData = async () => {
      try {
        setLoading(true);
        setError('');
        setIsListeMode(false);

        if (!id) {
          const DEFAULT_911_ID = null;
          if (DEFAULT_911_ID) {
            try {
              const voiture = await voitureService.getVoitureById(DEFAULT_911_ID);

              if (voiture && voiture.type_voiture === false) {
                if (isMounted) {
                  setIsListeMode(true);
                  setModeleBase(voiture);
                }

                const occasionsFiltrees = await voitureService.getVoituresOccasion(voiture.nom_model);

                if (!Array.isArray(occasionsFiltrees)) {
                  if (isMounted) {
                    setOccasionsListe([]);
                    setOccasionsFiltrees([]);
                  }
                  return;
                }

                if (isMounted) {
                  setOccasionsListe(occasionsFiltrees);
                  setOccasionsFiltrees(occasionsFiltrees);
                }
                return;
              }
            } catch (error) {
            }
          }
        }

        const isValidObjectId = (id) => {
          return /^[0-9a-fA-F]{24}$/.test(id);
        };

        if (isValidObjectId(id)) {
          // Stratégie optimisée avec heuristique basée sur le pattern d'ID
          // Les IDs model_porsche commencent souvent par 69138c4, les voiture par 69138c2
          // Note: Le navigateur affichera toujours un log 404 pour les mauvaises tentatives

          let pageLoaded = false;

          // Essayer model_porsche en premier si l'ID commence par certains patterns
          if (id.startsWith('69138c4') || id.startsWith('67') || id.startsWith('68')) {
            try {
              const data = await modelPorscheService.getOccasionPage(id);
              if (data && data.occasion) {
                if (isMounted) {
                  setIsListeMode(false);
                  setPageData(data);
                }
                pageLoaded = true;
              }
            } catch (modelPorscheError) {
              // Erreur silencieuse, on essaiera voiture ensuite
              const status = modelPorscheError?.response?.status || modelPorscheError?.status;
              if (status !== 404 && status !== 400) {
              }
            }
          }
          if (!pageLoaded) {
            const voiture = await voitureService.getVoitureById(id);

            if (voiture && voiture.nom_model) {
              // C'est une voiture de base, afficher la liste des occasions
              try {
                const modeleBaseOccasion = {
                  ...voiture,
                  type_voiture: false,
                  description: voiture.description || `Porsche ${voiture.nom_model} d'occasion certifiée.`
                };

                if (isMounted) {
                  setIsListeMode(true);
                  setModeleBase(modeleBaseOccasion);
                }

                const nomModel = voiture.nom_model;

                try {
                  const occasionsFiltrees = await voitureService.getVoituresOccasion(nomModel);

                  if (Array.isArray(occasionsFiltrees) && occasionsFiltrees.length > 0) {
                    if (isMounted) {
                      setOccasionsListe(occasionsFiltrees);
                      setOccasionsFiltrees(occasionsFiltrees);
                    }
                    return;
                  }

                  const allOccasions = await modelPorscheService.getModelesOccasion();

                  if (Array.isArray(allOccasions) && allOccasions.length > 0) {
                    const occasionsFiltrees2 = allOccasions.filter(occasion => {
                      const occasionNomModel = occasion.voiture?.nom_model
                        || occasion.nom_model
                        || occasion.voiture_base?.nom_model;

                      if (!occasionNomModel) {
                        return false;
                      }

                      return occasionNomModel === nomModel
                        || occasionNomModel.toLowerCase() === nomModel.toLowerCase();
                    });

                    if (occasionsFiltrees2.length > 0) {
                      if (isMounted) {
                        setOccasionsListe(occasionsFiltrees2);
                        setOccasionsFiltrees(occasionsFiltrees2);
                      }
                      return;
                    }
                  }

                  if (isMounted) {
                    setOccasionsListe([]);
                    setOccasionsFiltrees([]);
                  }
                  return;

                } catch (error) {
                  if (isMounted) {
                    setOccasionsListe([]);
                    setOccasionsFiltrees([]);
                  }
                  return;
                }
              } catch (occasionError) {
              }
            } else if (!pageLoaded) {
              // Pas une voiture de base, essayer comme model_porsche (si pas déjà tenté)
              try {
                const data = await modelPorscheService.getOccasionPage(id);
                if (data && data.occasion) {
                  if (isMounted) {
                    setIsListeMode(false);
                    setPageData(data);
                  }
                  return;
                }
              } catch (modelPorscheError) {
                // Gérer silencieusement les erreurs 404/400
                const status = modelPorscheError?.response?.status || modelPorscheError?.status;
                if (status !== 404 && status !== 400) {
                }
              }
            }
          }
        } else {
          const nomModel = id;

          try {
            const allVoitures = await voitureService.getAllVoitures();
            let voiture = null;

            if (Array.isArray(allVoitures)) {
              voiture = allVoitures.find(v =>
                v.nom_model === nomModel || v.nom_model?.toLowerCase() === nomModel.toLowerCase()
              );
            } else if (allVoitures?.data && Array.isArray(allVoitures.data)) {
              voiture = allVoitures.data.find(v =>
                v.nom_model === nomModel || v.nom_model?.toLowerCase() === nomModel.toLowerCase()
              );
            }

            if (voiture) {
              const modeleBaseOccasion = {
                ...voiture,
                type_voiture: false,
                description: voiture.description || `Porsche ${voiture.nom_model} d'occasion certifiée.`
              };

              if (isMounted) {
                setIsListeMode(true);
                setModeleBase(modeleBaseOccasion);
              }

              try {
                const occasionsFiltrees = await voitureService.getVoituresOccasion(nomModel);

                if (Array.isArray(occasionsFiltrees) && occasionsFiltrees.length > 0) {
                  if (isMounted) {
                    setOccasionsListe(occasionsFiltrees);
                    setOccasionsFiltrees(occasionsFiltrees);
                  }
                  return;
                }

                const allOccasions = await modelPorscheService.getModelesOccasion();

                if (Array.isArray(allOccasions) && allOccasions.length > 0) {
                  const occasionsFiltrees2 = allOccasions.filter(occasion => {
                    const occasionNomModel = occasion.voiture?.nom_model
                      || occasion.nom_model
                      || occasion.voiture_base?.nom_model;

                    if (!occasionNomModel) {
                      return false;
                    }

                    return occasionNomModel === nomModel
                      || occasionNomModel.toLowerCase() === nomModel.toLowerCase();
                  });

                  if (occasionsFiltrees2.length > 0) {
                    if (isMounted) {
                      setOccasionsListe(occasionsFiltrees2);
                      setOccasionsFiltrees(occasionsFiltrees2);
                    }
                    return;
                  }
                }

                if (isMounted) {
                  setOccasionsListe([]);
                  setOccasionsFiltrees([]);
                }
                return;

              } catch (error) {
                if (isMounted) {
                  setOccasionsListe([]);
                  setOccasionsFiltrees([]);
                }
                return;
              }
            }
          } catch (error) {
          }
        }
      } catch (err) {
        const errorMessage = err.message || err.response?.data?.message || 'Erreur lors du chargement de la page';
        if (isMounted) {
          setError(errorMessage);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPageData();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleReservation = () => {
    if (!isAuthenticated()) {
      setShowLoginPrompt(true);
      return;
    }

    navigate(`/mes-reservations?occasion=${id}`);
  };

  // Fonctions pour les filtres (similaires à ListeVariantes)
  const getFilterOptions = () => {
    const carrosseries = [...new Set(occasionsListe.map(o => o.type_carrosserie).filter(Boolean))];
    const transmissions = new Set();
    const prix = [];

    occasionsListe.forEach(o => {
      const trans = o.specifications?.transmission || '';
      if (trans.includes('PDK') || trans.includes('Automatique')) {
        transmissions.add('Automatique');
      }
      if (trans.includes('Manuelle')) {
        transmissions.add('Manuelle');
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

  const filterOptions = getFilterOptions();

  const handleFilterChange = (filterType, value) => {
    setFiltres(prev => {
      const newFiltres = { ...prev };

      if (filterType === 'carrosserie' || filterType === 'boiteVitesse') {
        const current = newFiltres[filterType] || [];
        if (current.includes(value)) {
          newFiltres[filterType] = current.filter(v => v !== value);
        } else {
          newFiltres[filterType] = [...current, value];
        }
      } else {
        newFiltres[filterType] = value;
      }

      return newFiltres;
    });
  };

  const handleResetFilter = () => {
    setFiltres({
      carrosserie: [],
      boiteVitesse: [],
      transmission: [],
      prixMax: null,
    });
    setRecherche('');
  };
  useEffect(() => {
    if (occasionsListe.length === 0) {
      setOccasionsFiltrees([]);
      return;
    }

    let filtered = [...occasionsListe];
    if (recherche.trim()) {
      const rechercheLower = recherche.toLowerCase();
      filtered = filtered.filter(o => {
        const nomVariante = o.nom_model || '';
        const nomModeleBase = modeleBase?.nom_model || '';
        const nomComplet = nomVariante && nomVariante !== nomModeleBase
          ? `${nomModeleBase} ${nomVariante}`.trim()
          : nomVariante || nomModeleBase;
        return nomComplet.toLowerCase().includes(rechercheLower);
      });
    }
    if (filtres.carrosserie.length > 0) {
      filtered = filtered.filter(o =>
        filtres.carrosserie.includes(o.type_carrosserie)
      );
    }
    if (filtres.boiteVitesse.length > 0) {
      filtered = filtered.filter(o => {
        const trans = o.specifications?.transmission || '';
        return filtres.boiteVitesse.some(bt => {
          if (bt === 'Automatique') {
            return trans.includes('PDK') || trans.includes('Automatique');
          }
          if (bt === 'Manuelle') {
            return trans.includes('Manuelle');
          }
          return false;
        });
      });
    }
    if (filtres.prixMax) {
      filtered = filtered.filter(o =>
        (o.prix_base || o.prix_base_variante || 0) <= filtres.prixMax
      );
    }

    setOccasionsFiltrees(filtered);
  }, [occasionsListe, filtres, recherche, modeleBase]);

  const getTransmissionType = (occasion) => {
    const trans = occasion.specifications?.transmission || '';
    if (trans.includes('PDK') || trans.includes('Automatique')) {
      return 'Automatique';
    }
    if (trans.includes('Manuelle')) {
      return 'Manuelle';
    }
    return 'Automatique';
  };

  if (loading) {
    return <Loading fullScreen message="Chargement..." />;
  }

  if (error) {
    return (
      <div className="occasion-page-error">
        <Alert type="error">
          {error.includes("introuvable") || error.includes("404")
            ? "Cette voiture d'occasion n'est plus disponible ou n'existe pas."
            : error}
        </Alert>
        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
          <Button onClick={() => navigate(-1)}>
            ← Retour
          </Button>
          <Button onClick={() => navigate('/catalogue/occasion')}>
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
              onClick={() => navigate('/catalogue/occasion')}
              className="catalogue-back-btn"
            >
              ← Retour au catalogue
            </button>
            <h1 className="catalogue-modeles-title">
              {modeleBase?.nom_model} d'occasion
            </h1>
            <p className="catalogue-modeles-subtitle">
              {occasionsFiltrees.length} {occasionsFiltrees.length > 1 ? 'véhicules disponibles' : 'véhicule disponible'}
            </p>
          </div>

          {/* Liste des occasions */}
          {occasionsListe.length === 0 ? (
            <div className="catalogue-empty">
              <p>Aucune {modeleBase?.nom_model} d'occasion disponible pour le moment.</p>
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
                if (occasion.photo_porsche && Array.isArray(occasion.photo_porsche) && occasion.photo_porsche.length > 0) {
                  const validPhotos = occasion.photo_porsche.filter(p => p && (p.name || p._id));
                  if (validPhotos.length > 2) {
                    // Utiliser la photo à l'index 2 (première de la galerie)
                    photoPrincipale = validPhotos[2];
                  } else if (validPhotos.length > 0) {
                    // Fallback : dernière photo disponible
                    photoPrincipale = validPhotos[validPhotos.length - 1];
                  }
                } else if (occasion.photo_voiture && Array.isArray(occasion.photo_voiture) && occasion.photo_voiture.length > 0) {
                  const validPhotos = occasion.photo_voiture.filter(p => p && (p.name || p._id));
                  if (validPhotos.length > 2) {
                    photoPrincipale = validPhotos[2];
                  } else if (validPhotos.length > 0) {
                    photoPrincipale = validPhotos[validPhotos.length - 1];
                  }
                } else if (occasion.voiture_base?.photo_voiture) {
                  if (Array.isArray(occasion.voiture_base.photo_voiture) && occasion.voiture_base.photo_voiture.length > 0) {
                    const validPhotos = occasion.voiture_base.photo_voiture.filter(p => p && (p.name || p._id));
                    if (validPhotos.length > 2) {
                      photoPrincipale = validPhotos[2];
                    } else if (validPhotos.length > 0) {
                      photoPrincipale = validPhotos[validPhotos.length - 1];
                    }
                  } else if (occasion.voiture_base.photo_voiture && typeof occasion.voiture_base.photo_voiture === 'object' && occasion.voiture_base.photo_voiture.name) {
                    photoPrincipale = occasion.voiture_base.photo_voiture;
                  }
                }

                // Pour les occasions, nom_model contient la variante (Carrera S, GTS, Turbo, etc.)
                const nomVariante = occasion.nom_model || '';
                const nomModeleBase = modeleBase?.nom_model || '';
                const nomComplet = nomVariante && nomVariante !== nomModeleBase
                  ? `${nomModeleBase} ${nomVariante}`.trim()
                  : nomVariante || nomModeleBase;

                // Construction de l'URL de la photo
                const photoUrl = photoPrincipale?.name?.startsWith('http')
                  ? photoPrincipale.name
                  : photoPrincipale?.name?.startsWith('/')
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
                                e.target.style.display = 'none';
                                if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                                return;
                              }
                              e.target.dataset.fallback = '1';
                              e.target.src = '/Logo/Logo_porsche_black.jpg';
                            } catch (err) {
                              e.target.style.display = 'none';
                              if (e.target.nextSibling) {
                                e.target.nextSibling.style.display = 'flex';
                              }
                            }
                          }}
                        />
                      ) : null}
                      <div
                        className="catalogue-modele-placeholder-porsche"
                        style={{ display: photoUrl ? 'none' : 'flex' }}
                      >
                        <span className="catalogue-modele-letter-porsche">
                          {nomComplet?.charAt(0) || '?'}
                        </span>
                      </div>
                    </div>

                    {/* Prix */}
                    <div className="catalogue-modele-prix-porsche">
                      {(occasion.prix_base || occasion.prix_base_variante) > 0 ? (
                        <>
                          <span className="catalogue-prix-label">Prix à partir de</span>
                          <span className="catalogue-prix-montant">
                            {formatPrice(occasion.prix_base || occasion.prix_base_variante)}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="catalogue-prix-label">Prix</span>
                          <span className="catalogue-prix-montant">Sur demande</span>
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
  } if (!pageData || !pageData.occasion) {
    return (
      <div className="occasion-page-error">
        <Alert type="warning">Occasion non trouvée</Alert>
        <Button onClick={() => navigate('/choix-voiture')}>
          Retour au choix
        </Button>
      </div>
    );
  }

  const { occasion, voiture_base: _voiture_base, specifications, options, photos, prix } = pageData;

  const formatPower = (puissance) => {
    if (!puissance) return { ch: 0 };
    return { ch: puissance, };
  };

  const powerInfo = formatPower(specifications?.puissance);
  const formatDateImmat = () => {
    if (!occasion.annee_production) return null;
    const date = new Date(occasion.annee_production);
    return date.toLocaleDateString('fr-FR', { month: '2-digit', year: 'numeric' });
  };

  const dateImmat = formatDateImmat();
  const annee = occasion.annee_production ? new Date(occasion.annee_production).getFullYear() : null;

  // Calculer la génération (991 I, 992, etc.) à partir de l'année
  const getGeneration = () => {
    if (!annee) return '';
    if (annee >= 2012 && annee < 2020) return '991 I';
    if (annee >= 2020) return '992';
    return '';
  };

  const generation = getGeneration();
  const kilometrage = occasion.kilometrage || occasion.kilometrage_actuel || 0;
  const proprietaire = occasion.nombre_proprietaires || 0;
  const accidents = occasion.accidents || false;
  const couleurExt = occasion.couleur_exterieur?.nom_couleur || options?.couleur_exterieur?.nom || 'Non spécifié';
  const couleurInt = occasion.couleur_interieur?.nom_couleur || (options?.couleurs_interieur && options.couleurs_interieur.length > 0 ? options.couleurs_interieur[0].nom : 'Non spécifié');
  const carburant = occasion.carburant || specifications?.moteur || 'Essence';
  const prixOccasion = prix?.prix_fixe || occasion.prix_base || occasion.prix_base_variante || 0;
  const disponibleDate = occasion.disponible_a_partir_de || null;

  return (
    <div className="occasion-detail-container">
      {/* Header Navigation - Barre grise avec bouton retour et concessionnaire */}
      <div className="occasion-detail-nav-bar">
        <div className="occasion-detail-nav-left">
          <button className="occasion-detail-nav-back-btn" onClick={() => navigate(-1)}>
            ← Retour
          </button>
        </div>
        {occasion.concessionnaire && (
          <div className="occasion-detail-nav-center">
            {occasion.concessionnaire}
          </div>
        )}
      </div>

      {/* Main Gallery - Grande image à gauche, grille 2x2 à droite (exclut photos index 0 et 1) */}
      {photos && photos.length > 2 && (
        <>
          <div className="occasion-detail-gallery">
            {/* Grande image principale à gauche - affiche la photo sélectionnée */}
            <div className="occasion-detail-gallery-main">
              <img
                src={photos[selectedImage]?.name?.startsWith('http')
                  ? photos[selectedImage].name
                  : photos[selectedImage]?.name?.startsWith('/')
                    ? buildUrl(photos[selectedImage].name)
                    : buildUrl(photos[selectedImage].name)}
                alt={occasion.nom_model}
                className="occasion-detail-main-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </div>
            {/* Grille 2x2 à droite (photos index 3-6) */}
            {photos.length > 3 && (
              <div className="occasion-detail-gallery-grid">
                {photos.slice(3, 7).map((photo, index) => (
                  <button
                    key={index + 3}
                    onClick={() => setSelectedImage(index + 3)}
                    className={`occasion-detail-grid-thumbnail ${selectedImage === index + 3 ? 'active' : ''}`}
                  >
                    <img
                      src={photo.name?.startsWith('http')
                        ? photo.name
                        : photo.name?.startsWith('/')
                          ? buildUrl(photo.name)
                          : buildUrl(photo.name)}
                      alt={`Vue ${index + 4}`}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Grille continue en dessous (photos à partir de l'index 7) */}
          {photos.length > 7 && (
            <div className="occasion-detail-gallery-extended">
              {photos.slice(7).map((photo, index) => (
                <button
                  key={index + 7}
                  onClick={() => setSelectedImage(index + 7)}
                  className={`occasion-detail-gallery-extended-item ${selectedImage === index + 7 ? 'active' : ''}`}
                >
                  <img
                    src={photo.name?.startsWith('http')
                      ? photo.name
                      : photo.name?.startsWith('/')
                        ? buildUrl(photo.name)
                        : buildUrl(photo.name)}
                    alt={`Vue ${index + 8}`}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </>
      )}

      {/* Main Content */}
      <div className="occasion-detail-content">
        {/* Left Column */}
        <div className="occasion-detail-left">
          {/* Title Section */}
          <div className="occasion-detail-title-section">
            <h1 className="occasion-detail-title">
              {occasion.nom_model} {generation && `(${generation})`}
            </h1>
            <div className="occasion-detail-badges">
              <div className="occasion-detail-badge">
                Véhicule d'occasion Porsche Approved
              </div>
              {disponibleDate && (
                <div className="occasion-detail-availability">
                  Disponible à partir de {new Date(disponibleDate).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                </div>
              )}
            </div>
          </div>

          {/* Specifications en deux colonnes */}
          <div className="occasion-detail-specs-grid">
            {/* Colonne gauche */}
            <div className="occasion-detail-specs-column">
              {/* Teinte extérieure */}
              <div className="occasion-detail-spec-item">
                <span className="occasion-detail-spec-label">Teinte extérieure</span>
                <div className="occasion-detail-spec-value-group">
                  <div
                    className="occasion-detail-color-swatch"
                    style={{ backgroundColor: '#000' }}
                  />
                  <span className="occasion-detail-spec-value">{couleurExt}</span>
                </div>
              </div>

              {/* Kilométrage */}
              {kilometrage > 0 && (
                <div className="occasion-detail-spec-item">
                  <span className="occasion-detail-spec-label">Kilométrage</span>
                  <span className="occasion-detail-spec-value">{new Intl.NumberFormat('fr-FR').format(kilometrage)} km</span>
                </div>
              )}

              {/* Historique des dommages */}
              <div className="occasion-detail-spec-item">
                <span className="occasion-detail-spec-label">Historique des dommages</span>
                <span className="occasion-detail-spec-value">
                  {accidents ? 'Dommages signalés' : "Aucun dommage ou accident n'a été signalé"}
                </span>
              </div>

              {/* Boîte de vitesse */}
              {specifications?.transmission && specifications.transmission !== 'N/A' && (
                <div className="occasion-detail-spec-item">
                  <span className="occasion-detail-spec-label">Boîte de vitesse</span>
                  <span className="occasion-detail-spec-value">{specifications.transmission}</span>
                </div>
              )}

              {/* Accélération */}
              {specifications?.acceleration_0_100 > 0 && (
                <div className="occasion-detail-spec-item">
                  <span className="occasion-detail-spec-label">Accélération de 0 à 100 km/h {specifications?.pack_sport_chrono ? 'avec le Pack Sport Chrono' : ''}</span>
                  <span className="occasion-detail-spec-value">{specifications.acceleration_0_100} s</span>
                </div>
              )}
            </div>

            {/* Colonne droite */}
            <div className="occasion-detail-specs-column">
              {/* Teintes intérieures */}
              <div className="occasion-detail-spec-item">
                <span className="occasion-detail-spec-label">Teintes intérieures & matière</span>
                <div className="occasion-detail-spec-value-group">
                  <div
                    className="occasion-detail-color-swatch"
                    style={{ backgroundColor: '#000' }}
                  />
                  <span className="occasion-detail-spec-value">{couleurInt}</span>
                </div>
              </div>

              {/* 1ère immatriculation */}
              {dateImmat && (
                <div className="occasion-detail-spec-item">
                  <span className="occasion-detail-spec-label">1ère immatriculation</span>
                  <span className="occasion-detail-spec-value">{dateImmat}</span>
                </div>
              )}

              {/* Propriétaires précédents */}
              {proprietaire > 0 && (
                <div className="occasion-detail-spec-item">
                  <span className="occasion-detail-spec-label">Propriétaire(s) préc.</span>
                  <span className="occasion-detail-spec-value">{proprietaire}</span>
                </div>
              )}

              {/* Garantie Porsche Approved */}
              <div className="occasion-detail-spec-item">
                <span className="occasion-detail-spec-label">Garantie Porsche Approved</span>
                <span className="occasion-detail-spec-value">12 mois</span>
              </div>

              {/* Moteur */}
              <div className="occasion-detail-spec-item">
                <span className="occasion-detail-spec-label">Moteur</span>
                <span className="occasion-detail-spec-value">{carburant}</span>
              </div>

              {/* Transmission */}
              <div className="occasion-detail-spec-item">
                <span className="occasion-detail-spec-label">Transmission</span>
                <span className="occasion-detail-spec-value">Propulsion</span>
              </div>

              {/* Puissance */}
              {specifications?.puissance > 0 && (
                <div className="occasion-detail-spec-item">
                  <span className="occasion-detail-spec-label">Puissance maximale du moteur à combustion</span>
                  <span className="occasion-detail-spec-value">{powerInfo.ch} ch / {powerInfo.kw} kW</span>
                </div>
              )}
            </div>
          </div>

          {/* Section État et historique */}
          <div className="occasion-detail-state-history">
            <h2 className="occasion-detail-section-title">État et historique</h2>

            {/* Cartes de vérification */}
            <div className="occasion-detail-verification-cards">
              <div className="occasion-detail-verification-card">
                <div className="occasion-detail-verification-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <div className="occasion-detail-verification-content">
                  <h3 className="occasion-detail-verification-title">Contrôle technique et mécanique</h3>
                  <p className="occasion-detail-verification-desc">Selon les normes rigoureuses de Porsche</p>
                </div>
                <button className="occasion-detail-info-icon" title="Plus d'informations">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                </button>
              </div>

              <div className="occasion-detail-verification-card">
                <div className="occasion-detail-verification-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <div className="occasion-detail-verification-content">
                  <h3 className="occasion-detail-verification-title">Remise à neuf esthétique</h3>
                  <p className="occasion-detail-verification-desc">Selon les normes de rénovation de Porsche</p>
                </div>
                <button className="occasion-detail-info-icon" title="Plus d'informations">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Liste détaillée */}
            <div className="occasion-detail-history-list">
              <div className="occasion-detail-history-item">
                <span className="occasion-detail-history-label">État</span>
                <div className="occasion-detail-history-value-group">
                  <span className="occasion-detail-history-value">Véhicule d'occasion Porsche Approved</span>
                  <p className="occasion-detail-history-desc">Véhicule de qualité certifiée, avec un historique complet et des pièces d'origine.</p>
                </div>
              </div>

              {kilometrage > 0 && (
                <div className="occasion-detail-history-item">
                  <span className="occasion-detail-history-label">Kilométrage</span>
                  <span className="occasion-detail-history-value">{new Intl.NumberFormat('fr-FR').format(kilometrage)} km</span>
                </div>
              )}

              {dateImmat && (
                <div className="occasion-detail-history-item">
                  <span className="occasion-detail-history-label">1ère immatriculation</span>
                  <span className="occasion-detail-history-value">{dateImmat}</span>
                </div>
              )}

              {proprietaire > 0 && (
                <div className="occasion-detail-history-item">
                  <span className="occasion-detail-history-label">Propriétaire(s) préc.</span>
                  <span className="occasion-detail-history-value">{proprietaire}</span>
                </div>
              )}

              <div className="occasion-detail-history-item">
                <span className="occasion-detail-history-label">Historique de Service</span>
                <span className="occasion-detail-history-value">Oui, tous les services sont effectués au Centre Porsche</span>
              </div>

              {occasion.derniere_maintenance && (
                <div className="occasion-detail-history-item">
                  <span className="occasion-detail-history-label">Dernière maintenance</span>
                  <span className="occasion-detail-history-value">
                    {new Date(occasion.derniere_maintenance.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    {' '}avec {new Intl.NumberFormat('fr-FR').format(occasion.derniere_maintenance.kilometrage)} km {occasion.derniere_maintenance.centre || ''}
                  </span>
                </div>
              )}

              <div className="occasion-detail-history-item">
                <span className="occasion-detail-history-label">Historique des dommages</span>
                <span className="occasion-detail-history-value">
                  {accidents ? 'Dommages signalés' : "Aucun dommage ou accident n'a été signalé"}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="occasion-detail-description">
            <h2 className="occasion-detail-description-title">Description du véhicule</h2>
            <p className="occasion-detail-description-text">
              {occasion.description || 'VEHICULE EN COURS DE PREPARATION'}
            </p>
          </div>
        </div>

        {/* Right Column */}
        <div className="occasion-detail-right">
          {/* Price Section */}
          {prixOccasion > 0 && (
            <div className="occasion-detail-price-box">
              <div className="occasion-detail-price">
                <span className="occasion-detail-price-amount">
                  {formatPrice(prixOccasion)}
                </span>
                <span className="occasion-detail-price-label">TVA non-déductible</span>
              </div>

              {/* Financement retiré */}

              <div className="occasion-detail-actions">
                <ContactButton
                  vehiculeId={pageData?._id}
                  typeVehicule="occasion"
                  variant="primary"
                />
                <Button
                  variant="outline"
                  onClick={() => {
                    handleReservation();
                  }}
                  className="occasion-detail-action-btn occasion-detail-action-btn-outline"
                >
                  Réserver en ligne
                </Button>
              </div>
            </div>
          )}

          {showLoginPrompt && (
            <LoginPromptModal
              onClose={() => setShowLoginPrompt(false)}
              onLogin={() => navigate('/login', { state: { from: location.pathname } })}
              title="Connexion requise"
              message="Vous devez être connecté pour réserver ce véhicule. Connectez‑vous ou créez un compte pour continuer."
              primaryText="Se connecter / Créer un compte"
              secondaryText="Annuler"
            />
          )}

          {/* Dealer Info */}
          {occasion.concessionnaire && (
            <div className="occasion-detail-dealer">
              <h3 className="occasion-detail-dealer-title">{occasion.concessionnaire}</h3>
              {occasion.adresse && (
                <p className="occasion-detail-dealer-address">{occasion.adresse}</p>
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
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
    </div>
  );
};

export default OccasionPage;
