import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { modelPorscheService, voitureService } from '../services';
import { Loading, Alert, Button } from '../components/common';
import { formatPrice } from '../utils/format.js';
import { API_URL } from '../config/api.jsx';
import './OccasionPage.css';

const OccasionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const DEFAULT_911_ID = '69138c2941b320fe9e335b11';

  const [isListeMode, setIsListeMode] = useState(false);
  const [modeleBase, setModeleBase] = useState(null);
  const [occasionsListe, setOccasionsListe] = useState([]);

  const [filtresOuverts, setFiltresOuverts] = useState({
    modeles: true,
    versions: false,
    generation: false,
    carrosserie: true,
    motorisation: false,
    equipement: false,
    teinteExt: false,
    couleurInt: false,
    prix: false,
    disponibilite: false,
    kilometrage: false,
  });

  const [filtres, setFiltres] = useState({
    modele: '',
    carrosserie: [],
  });

  const toggleFiltre = (filtre) => {
    setFiltresOuverts((prev) => ({
      ...prev,
      [filtre]: !prev[filtre],
    }));
  };

  const [pageData, setPageData] = useState(null);
  const [selectedImage, setSelectedImage] = useState(0);

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
          try {
            const voiture = await voitureService.getVoitureById(DEFAULT_911_ID);

            if (voiture && voiture.type_voiture === false) {
              if (isMounted) {
                setIsListeMode(true);
                setModeleBase(voiture);
              }

              const occasionsFiltrees = await voitureService.getVoituresOccasion(voiture.nom_model);

              if (!Array.isArray(occasionsFiltrees)) {
                console.error('Les occasions ne sont pas un tableau:', occasionsFiltrees);
                if (isMounted) {
                  setOccasionsListe([]);
                }
                return;
              }

              if (isMounted) {
                setOccasionsListe(occasionsFiltrees);
              }
              return;
            }
          } catch (error) {
            console.error('Erreur récupération 911 par défaut:', error);
            throw new Error("Impossible de charger les 911 d'occasion");
          }
        }

        const isValidObjectId = (id) => {
          return /^[0-9a-fA-F]{24}$/.test(id);
        };

        if (isValidObjectId(id)) {
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
            const status = modelPorscheError?.response?.status
              || modelPorscheError?.status
              || (modelPorscheError?.isExpected ? 404 : undefined);
            const message = modelPorscheError?.response?.data?.message
              || modelPorscheError?.message
              || '';

            const is404 = status === 404
              || modelPorscheError?.isExpected === true
              || message.toLowerCase().includes('introuvable');

            const is400 = status === 400
              || message.toLowerCase().includes('invalide');

            if (!is404 && !is400) {
              console.error('Erreur lors de la récupération de l\'occasion spécifique:', {
                id,
                status: status || 'unknown',
                message
              });
            }
          }

          try {
            const voiture = await voitureService.getVoitureById(id);

            if (voiture && voiture.nom_model) {
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
                    }
                    return;
                  }
                }

                if (isMounted) {
                  setOccasionsListe([]);
                }
                return;

              } catch (error) {
                console.error('Erreur lors de la récupération des occasions:', error);
                if (isMounted) {
                  setOccasionsListe([]);
                }
                return;
              }
            }
          } catch (voitureError) {
            const status = voitureError?.response?.status || voitureError?.status;
            const message = voitureError?.response?.data?.message || voitureError?.message || '';
            const is400 = status === 400 || message.toLowerCase().includes('invalide');
            
            if (!is400) {
              console.error('Erreur récupération voiture de base:', voitureError);
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
                    }
                    return;
                  }
                }

                if (isMounted) {
                  setOccasionsListe([]);
                }
                return;

              } catch (error) {
                console.error('Erreur lors de la récupération des occasions:', error);
                if (isMounted) {
                  setOccasionsListe([]);
                }
                return;
              }
            }
          } catch (error) {
            console.error('Erreur lors de la récupération de la voiture par nom:', error);
          }
        }

        throw new Error("Voiture d'occasion introuvable");
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
    navigate(`/mes-reservations?occasion=${id}`);
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
      <div className="occasion-liste-container">
        <div className="occasion-liste-layout">
          <aside className="occasion-liste-sidebar">
            <h2 className="occasion-liste-sidebar-title">Filtres</h2>

            <div className="occasion-liste-filter-section">
              <button
                className="occasion-liste-filter-header"
                onClick={() => toggleFiltre('modeles')}
              >
                <span>Modèles</span>
                <svg
                  className={`occasion-liste-filter-icon ${filtresOuverts.modeles ? 'open' : ''}`}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {filtresOuverts.modeles && (
                <div className="occasion-liste-filter-content">
                  <select className="occasion-liste-filter-select">
                    <option>911 (25+)</option>
                    <option>Cayenne (15+)</option>
                    <option>Macan (10+)</option>
                  </select>
                </div>
              )}
            </div>

            {/* Versions */}
            <div className="occasion-liste-filter-section">
              <button
                className="occasion-liste-filter-header"
                onClick={() => toggleFiltre('versions')}
              >
                <span>Versions</span>
                <svg
                  className={`occasion-liste-filter-icon ${filtresOuverts.versions ? 'open' : ''}`}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
            </div>

            {/* Génération */}
            <div className="occasion-liste-filter-section">
              <button
                className="occasion-liste-filter-header"
                onClick={() => toggleFiltre('generation')}
              >
                <span>Génération</span>
                <svg
                  className={`occasion-liste-filter-icon ${filtresOuverts.generation ? 'open' : ''}`}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
            </div>

            {/* Carrosserie */}
            <div className="occasion-liste-filter-section">
              <button
                className="occasion-liste-filter-header"
                onClick={() => toggleFiltre('carrosserie')}
              >
                <span>Carrosserie</span>
                <svg
                  className={`occasion-liste-filter-icon ${filtresOuverts.carrosserie ? 'open' : ''}`}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {filtresOuverts.carrosserie && (
                <div className="occasion-liste-filter-content">
                  <label className="occasion-liste-filter-checkbox">
                    <input type="checkbox" />
                    <span>Coupé (25+)</span>
                  </label>
                  <label className="occasion-liste-filter-checkbox">
                    <input type="checkbox" />
                    <span>Cabriolet (25+)</span>
                  </label>
                  <label className="occasion-liste-filter-checkbox">
                    <input type="checkbox" />
                    <span>Targa (25+)</span>
                  </label>
                  <label className="occasion-liste-filter-checkbox">
                    <input type="checkbox" />
                    <span>Speedster (5)</span>
                  </label>
                </div>
              )}
            </div>

            {/* Motorisation et Boîte de vitesse */}
            <div className="occasion-liste-filter-section">
              <button
                className="occasion-liste-filter-header"
                onClick={() => toggleFiltre('motorisation')}
              >
                <span>Motorisation et Boîte de vitesse</span>
                <svg
                  className={`occasion-liste-filter-icon ${filtresOuverts.motorisation ? 'open' : ''}`}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
            </div>

            {/* Équipement */}
            <div className="occasion-liste-filter-section">
              <button
                className="occasion-liste-filter-header"
                onClick={() => toggleFiltre('equipement')}
              >
                <span>Équipement</span>
                <svg
                  className={`occasion-liste-filter-icon ${filtresOuverts.equipement ? 'open' : ''}`}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
            </div>

            {/* Teinte extérieure */}
            <div className="occasion-liste-filter-section">
              <button
                className="occasion-liste-filter-header"
                onClick={() => toggleFiltre('teinteExt')}
              >
                <span>Teinte extérieure</span>
                <svg
                  className={`occasion-liste-filter-icon ${filtresOuverts.teinteExt ? 'open' : ''}`}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
            </div>

            {/* Couleur intérieure */}
            <div className="occasion-liste-filter-section">
              <button
                className="occasion-liste-filter-header"
                onClick={() => toggleFiltre('couleurInt')}
              >
                <span>Couleur intérieure</span>
                <svg
                  className={`occasion-liste-filter-icon ${filtresOuverts.couleurInt ? 'open' : ''}`}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
            </div>

            {/* Prix */}
            <div className="occasion-liste-filter-section">
              <button
                className="occasion-liste-filter-header"
                onClick={() => toggleFiltre('prix')}
              >
                <span>Prix</span>
                <svg
                  className={`occasion-liste-filter-icon ${filtresOuverts.prix ? 'open' : ''}`}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
            </div>

            {/* Disponibilité */}
            <div className="occasion-liste-filter-section">
              <button
                className="occasion-liste-filter-header"
                onClick={() => toggleFiltre('disponibilite')}
              >
                <span>Disponibilité</span>
                <svg
                  className={`occasion-liste-filter-icon ${filtresOuverts.disponibilite ? 'open' : ''}`}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
            </div>

            {/* Kilométrage */}
            <div className="occasion-liste-filter-section">
              <button
                className="occasion-liste-filter-header"
                onClick={() => toggleFiltre('kilometrage')}
              >
                <span>Kilométrage</span>
                <svg
                  className={`occasion-liste-filter-icon ${filtresOuverts.kilometrage ? 'open' : ''}`}
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
            </div>
          </aside>

          {/* Zone principale (droite) */}
          <main className="occasion-liste-main">
            {/* Liste des occasions */}
            {occasionsListe.length === 0 ? (
              <div className="occasion-liste-empty">
                <Alert type="info">
                  Aucune {modeleBase.nom_model} d'occasion disponible pour le moment.
                </Alert>
              </div>
            ) : (
              <div className="occasion-liste-cards">
                {occasionsListe.map((occasion) => {
                  let photoPrincipale = null;

                  if (occasion.photo_porsche && Array.isArray(occasion.photo_porsche) && occasion.photo_porsche.length > 0) {
                    photoPrincipale = occasion.photo_porsche[0];
                  }
                  else if (occasion.photo_voiture && Array.isArray(occasion.photo_voiture) && occasion.photo_voiture.length > 0) {
                    photoPrincipale = occasion.photo_voiture[0];
                  }
                  else if (occasion.voiture_base?.photo_voiture) {
                    if (Array.isArray(occasion.voiture_base.photo_voiture) && occasion.voiture_base.photo_voiture.length > 0) {
                      photoPrincipale = occasion.voiture_base.photo_voiture[0];
                    } else if (occasion.voiture_base.photo_voiture && typeof occasion.voiture_base.photo_voiture === 'object' && occasion.voiture_base.photo_voiture.name) {
                      photoPrincipale = occasion.voiture_base.photo_voiture;
                    }
                  }
                  else if (occasion.voiture?.photo_voiture) {
                    if (Array.isArray(occasion.voiture.photo_voiture) && occasion.voiture.photo_voiture.length > 0) {
                      photoPrincipale = occasion.voiture.photo_voiture[0];
                    } else if (occasion.voiture.photo_voiture && typeof occasion.voiture.photo_voiture === 'object' && occasion.voiture.photo_voiture.name) {
                      photoPrincipale = occasion.voiture.photo_voiture;
                    }
                  }

                  let toutesPhotos = [];
                  if (occasion.photo_porsche && Array.isArray(occasion.photo_porsche)) {
                    toutesPhotos = occasion.photo_porsche;
                  } else if (occasion.photo_voiture && Array.isArray(occasion.photo_voiture)) {
                    toutesPhotos = occasion.photo_voiture;
                  }
                  const nomComplet = occasion.nom_model || modeleBase.nom_model;
                  const generation = occasion.generation || '';
                  const annee = occasion.annee_production
                    ? new Date(occasion.annee_production).getFullYear()
                    : '';
                  const dateImmat = occasion.date_premiere_immatriculation
                    ? new Date(occasion.date_premiere_immatriculation).toLocaleDateString('fr-FR', { month: '2-digit', year: 'numeric' })
                    : '';
                  const kilometrage = occasion.kilometrage || occasion.kilometrage_actuel || 0;
                  const proprietaire = occasion.nombre_proprietaires || 0;
                  const accidents = occasion.accidents || false;
                  const puissance = occasion.specifications?.puissance || 0;
                  const puissanceKw = Math.round(puissance * 0.7355);
                  const transmission = occasion.specifications?.transmission || '';
                  const boiteVitesse = occasion.specifications?.boite_vitesse || '';
                  const couleurExt = occasion.couleur_exterieur?.nom_couleur || 'Non spécifié';
                  const couleurInt = occasion.couleur_interieur?.nom_couleur || 'Non spécifié';
                  const carburant = occasion.carburant || 'Essence';
                  const prixOccasion = occasion.prix_base || occasion.prix_base_variante || 0;
                  const centre = occasion.centre_porsche || occasion.concessionnaire || 'Centre Porsche';

                  return (
                    <article key={occasion._id} className="occasion-card">
                      {/* Badge Porsche Approved */}
                      <div className="occasion-card-badge">
                        Véhicule d'occasion Porsche Approved
                      </div>

                      {/* Galerie photos */}
                      <div className="occasion-card-gallery">
                        <div className="occasion-card-main-image">
                          {photoPrincipale && photoPrincipale.name ? (
                            <img
                              src={photoPrincipale.name.startsWith('http')
                                ? photoPrincipale.name
                                : photoPrincipale.name.startsWith('/')
                                  ? `${API_URL}${photoPrincipale.name}`
                                  : `${API_URL}/${photoPrincipale.name}`}
                              alt={nomComplet}
                              className="occasion-card-image"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                if (e.target.nextSibling) {
                                  e.target.nextSibling.style.display = 'flex';
                                }
                              }}
                            />
                          ) : null}
                          <div
                            className="occasion-card-placeholder"
                            style={{ display: photoPrincipale && photoPrincipale.name ? 'none' : 'flex' }}
                          >
                            <span className="occasion-card-letter">
                              {nomComplet?.charAt(0) || '?'}
                            </span>
                          </div>

                          {/* Badges Vidéo/Son */}
                          <div className="occasion-card-media-badges">
                            <span className="occasion-card-media-badge">Vidéo</span>
                            {occasion.hasSound && (
                              <span className="occasion-card-media-badge">Son</span>
                            )}
                          </div>
                        </div>

                        {/* Miniatures */}
                        {toutesPhotos.length > 1 && (
                          <div className="occasion-card-thumbnails">
                            {toutesPhotos.slice(0, 3).map((photo, index) => (
                              <img
                                key={index}
                                src={photo.name?.startsWith('http')
                                  ? photo.name
                                  : photo.name?.startsWith('/')
                                    ? `${API_URL}${photo.name}`
                                    : `${API_URL}/${photo.name}`}
                                alt={`Vue ${index + 1}`}
                                className="occasion-card-thumbnail"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Informations */}
                      <div className="occasion-card-content">
                        <h2 className="occasion-card-title">
                          {nomComplet} {generation && `(${generation})`}
                        </h2>

                        {/* Spécifications */}
                        <div className="occasion-card-specs">
                          <div className="occasion-card-spec-item">
                            <span className="occasion-card-spec-label">Couleur extérieure:</span>
                            <span className="occasion-card-spec-value">{couleurExt}</span>
                          </div>
                          <div className="occasion-card-spec-item">
                            <span className="occasion-card-spec-label">Couleur intérieure:</span>
                            <span className="occasion-card-spec-value">{couleurInt}</span>
                          </div>
                          <div className="occasion-card-spec-item">
                            <span className="occasion-card-spec-label">Carburant:</span>
                            <span className="occasion-card-spec-value">{carburant}</span>
                          </div>
                          <div className="occasion-card-spec-item">
                            <span className="occasion-card-spec-label">Kilométrage:</span>
                            <span className="occasion-card-spec-value">{new Intl.NumberFormat('fr-FR').format(kilometrage)} km</span>
                          </div>
                          <div className="occasion-card-spec-item">
                            <span className="occasion-card-spec-label">Première immatriculation:</span>
                            <span className="occasion-card-spec-value">{dateImmat}</span>
                          </div>
                          <div className="occasion-card-spec-item">
                            <span className="occasion-card-spec-label">Propriétaires précédents:</span>
                            <span className="occasion-card-spec-value">{proprietaire} {proprietaire > 1 ? 'propriétaires' : 'propriétaire'}</span>
                          </div>
                          <div className="occasion-card-spec-item">
                            <span className="occasion-card-spec-label">Accidents:</span>
                            <span className="occasion-card-spec-value">{accidents ? 'Oui' : 'Pas d\'accidents'}</span>
                          </div>
                          <div className="occasion-card-spec-item">
                            <span className="occasion-card-spec-label">Puissance:</span>
                            <span className="occasion-card-spec-value">{puissance} ch / {puissanceKw} kW</span>
                          </div>
                          <div className="occasion-card-spec-item">
                            <span className="occasion-card-spec-label">Transmission:</span>
                            <span className="occasion-card-spec-value">{transmission || 'Non spécifié'}</span>
                          </div>
                          <div className="occasion-card-spec-item">
                            <span className="occasion-card-spec-label">Boîte de vitesse:</span>
                            <span className="occasion-card-spec-value">{boiteVitesse || 'Non spécifié'}</span>
                          </div>
                        </div>

                        {/* Prix */}
                        <div className="occasion-card-price">
                          <span className="occasion-card-price-amount">
                            {formatPrice(prixOccasion)}
                          </span>
                          <span className="occasion-card-price-label">TVA non-déductible</span>
                        </div>

                        {/* Financement */}
                        <div className="occasion-card-financing">
                          <span>Personnaliser votre financement:</span>
                          <button className="occasion-card-financing-link">Financement</button>
                        </div>

                        {/* Actions */}
                        <div className="occasion-card-actions">
                          <Button
                            variant="primary"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/occasion/${occasion._id}`);
                            }}
                            className="occasion-card-details-btn"
                          >
                            Détails du véhicule
                          </Button>
                          <button
                            className="occasion-card-save-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                            }}
                            title="Enregistrer"
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                              <polyline points="17 21 17 13 7 13 7 21" />
                              <polyline points="7 3 7 8 15 8" />
                            </svg>
                          </button>
                        </div>

                        {/* Localisation */}
                        <div className="occasion-card-location">
                          {centre}
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    );
  }

  if (!pageData || !pageData.occasion) {
    return (
      <div className="occasion-page-error">
        <Alert type="warning">Occasion non trouvée</Alert>
        <Button onClick={() => navigate('/choix-voiture')}>
          Retour au choix
        </Button>
      </div>
    );
  }

  const { occasion, voiture_base, specifications, options, photos, prix } = pageData;

  const formatPower = (puissance) => {
    if (!puissance) return { ch: 0, kw: 0 };
    const kw = Math.round(puissance * 0.7355);
    return { ch: puissance, kw };
  };

  const powerInfo = formatPower(specifications?.puissance);
  const formatDateImmat = () => {
    if (!occasion.annee_production) return null;
    const date = new Date(occasion.annee_production);
    return date.toLocaleDateString('fr-FR', { month: '2-digit', year: 'numeric' });
  };

  const dateImmat = formatDateImmat();
  const annee = occasion.annee_production ? new Date(occasion.annee_production).getFullYear() : null;

  return (
    <div className="occasion-detail-container">
      {/* Header Navigation */}
      <div className="occasion-detail-nav">
        <button
          className="occasion-detail-nav-back"
          onClick={() => navigate('/catalogue/occasion')}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Retour
        </button>
        <div className="occasion-detail-nav-buttons">
          <button className="occasion-detail-nav-btn">
            Vidéo
          </button>
          <button className="occasion-detail-nav-btn">
            {photos?.length || 0} Images
          </button>
        </div>
        {occasion.concessionnaire && (
          <div className="occasion-detail-nav-center">
            {occasion.concessionnaire}
          </div>
        )}
      </div>

      {/* Main Gallery */}
      {photos && photos.length > 0 && (
        <div className="occasion-detail-gallery">
          <div className="occasion-detail-gallery-main">
            <img
              src={photos[selectedImage]?.name?.startsWith('http')
                ? photos[selectedImage].name
                : photos[selectedImage]?.name?.startsWith('/')
                  ? `${API_URL}${photos[selectedImage].name}`
                  : `${API_URL}/${photos[selectedImage].name}`}
              alt={occasion.nom_model}
              className="occasion-detail-main-image"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <button className="occasion-detail-gallery-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <line x1="9" y1="3" x2="9" y2="21" />
                <line x1="15" y1="3" x2="15" y2="21" />
                <line x1="3" y1="9" x2="21" y2="9" />
                <line x1="3" y1="15" x2="21" y2="15" />
              </svg>
              Ouvrir la galerie
            </button>
          </div>
          {photos.length > 1 && (
            <div className="occasion-detail-gallery-thumbnails">
              {photos.slice(0, 4).map((photo, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`occasion-detail-thumbnail ${selectedImage === index ? 'active' : ''
                    }`}
                >
                  <img
                    src={photo.name?.startsWith('http')
                      ? photo.name
                      : photo.name?.startsWith('/')
                        ? `${API_URL}${photo.name}`
                        : `${API_URL}/${photo.name}`}
                    alt={`Vue ${index + 1}`}
                    onError={(e) => {
                      e.target.style.display = 'none';
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Main Content */}
      <div className="occasion-detail-content">
        {/* Left Column */}
        <div className="occasion-detail-left">
          {/* Title Section */}
          <div className="occasion-detail-title-section">
            <h1 className="occasion-detail-title">
              {occasion.nom_model} {annee && `(${annee})`}
            </h1>
            <div className="occasion-detail-badge">
              Véhicule d'occasion Porsche Approved
            </div>
            {occasion.disponible && (
              <div className="occasion-detail-availability">
                Disponible
              </div>
            )}
          </div>

          {/* Specifications */}
          <div className="occasion-detail-specs">
            {options?.couleur_exterieur && (
              <div className="occasion-detail-spec-item">
                <span className="occasion-detail-spec-label">Teinte extérieure:</span>
                <div className="occasion-detail-spec-value-group">
                  <span className="occasion-detail-spec-value">{options.couleur_exterieur.nom}</span>
                  {options.couleur_exterieur.photo && (
                    <div
                      className="occasion-detail-color-swatch"
                      style={{ backgroundColor: '#000' }}
                    />
                  )}
                </div>
              </div>
            )}

            {options?.couleurs_interieur && options.couleurs_interieur.length > 0 && (
              <div className="occasion-detail-spec-item">
                <span className="occasion-detail-spec-label">Teintes intérieures & matière:</span>
                <div className="occasion-detail-spec-value-group">
                  <span className="occasion-detail-spec-value">
                    {options.couleurs_interieur.map(c => c.nom).join(', ')}
                  </span>
                  {options.couleurs_interieur[0]?.photo && (
                    <div
                      className="occasion-detail-color-swatch"
                      style={{ backgroundColor: '#000' }}
                    />
                  )}
                </div>
              </div>
            )}

            {dateImmat && (
              <div className="occasion-detail-spec-item">
                <span className="occasion-detail-spec-label">1ère immatriculation:</span>
                <span className="occasion-detail-spec-value">{dateImmat}</span>
              </div>
            )}

            {specifications?.transmission && specifications.transmission !== 'N/A' && (
              <div className="occasion-detail-spec-item">
                <span className="occasion-detail-spec-label">Boîte de vitesse:</span>
                <span className="occasion-detail-spec-value">{specifications.transmission}</span>
              </div>
            )}

            {specifications?.moteur && specifications.moteur !== 'N/A' && (
              <div className="occasion-detail-spec-item">
                <span className="occasion-detail-spec-label">Moteur:</span>
                <span className="occasion-detail-spec-value">{specifications.moteur}</span>
              </div>
            )}

            {specifications?.transmission && specifications.transmission !== 'N/A' && (
              <div className="occasion-detail-spec-item">
                <span className="occasion-detail-spec-label">Transmission:</span>
                <span className="occasion-detail-spec-value">Propulsion</span>
              </div>
            )}

            {specifications?.acceleration_0_100 > 0 && (
              <div className="occasion-detail-spec-item">
                <span className="occasion-detail-spec-label">Accélération de 0 à 100 km/h:</span>
                <span className="occasion-detail-spec-value">{specifications.acceleration_0_100} s</span>
              </div>
            )}

            {specifications?.puissance > 0 && (
              <div className="occasion-detail-spec-item">
                <span className="occasion-detail-spec-label">Puissance maximale du moteur à combustion:</span>
                <span className="occasion-detail-spec-value">{powerInfo.ch} ch / {powerInfo.kw} kW</span>
              </div>
            )}
          </div>

          {/* Description */}
          {occasion.description && (
            <div className="occasion-detail-description">
              <h2 className="occasion-detail-description-title">Description du véhicule</h2>
              <p className="occasion-detail-description-text">{occasion.description}</p>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="occasion-detail-right">
          {/* Price Section */}
          {prix && prix.prix_fixe > 0 && (
            <div className="occasion-detail-price-box">
              <div className="occasion-detail-price">
                <span className="occasion-detail-price-amount">
                  {formatPrice(prix.prix_fixe)}
                </span>
                <span className="occasion-detail-price-label">TVA non-déductible</span>
              </div>

              <div className="occasion-detail-financing">
                <span>Personnaliser votre financement:</span>
                <button className="occasion-detail-financing-link">Financement</button>
              </div>

              <div className="occasion-detail-actions">
                <Button
                  variant="primary"
                  onClick={() => {
                  }}
                  className="occasion-detail-action-btn"
                >
                  Contacter le vendeur
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                  }}
                  className="occasion-detail-action-btn"
                >
                  Réserver en ligne
                </Button>
                <button
                  className="occasion-detail-save-btn"
                  onClick={() => {
                  }}
                  title="Enregistrer"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                    <polyline points="17 21 17 13 7 13 7 21" />
                    <polyline points="7 3 7 8 15 8" />
                  </svg>
                  Enregistrer
                </button>
              </div>
            </div>
          )}

          {/* Dealer Info */}
          {occasion.concessionnaire && (
            <div className="occasion-detail-dealer">
              <h3 className="occasion-detail-dealer-title">{occasion.concessionnaire}</h3>
              <button className="occasion-detail-dealer-link">
                Aller sur le site du concessionnaire
              </button>
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
