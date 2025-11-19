import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { modelPorscheService, voitureService } from '../services';
import { Loading, Alert, Button } from '../components/common';
import ContactButton from '../components/ContactButton.jsx';
import { formatPrice } from '../utils/format.js';
import { API_URL } from '../config/api.jsx';
import './OccasionPage.css';
import './ListeVariantes.css';

const OccasionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isListeMode, setIsListeMode] = useState(false);
  const [modeleBase, setModeleBase] = useState(null);
  const [occasionsListe, setOccasionsListe] = useState([]);

  const [filtres, setFiltres] = useState({
    carrosserie: [],
    boiteVitesse: [],
    transmission: [],
    puissanceMin: null,
    prixMax: null,
  });

  const [recherche, setRecherche] = useState('');
  const [occasionsFiltrees, setOccasionsFiltrees] = useState([]);

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
          } catch (voitureError) {
            const status = voitureError?.response?.status || voitureError?.status;
            const message = voitureError?.response?.data?.message || voitureError?.message || '';
            const is400 = status === 400 || message.toLowerCase().includes('invalide');
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

  // Fonctions pour les filtres (similaires à ListeVariantes)
  const getFilterOptions = () => {
    const carrosseries = [...new Set(occasionsListe.map(o => o.type_carrosserie).filter(Boolean))];
    const transmissions = new Set();
    const puissances = new Set();
    const prix = [];

    occasionsListe.forEach(o => {
      const trans = o.specifications?.transmission || '';
      if (trans.includes('PDK') || trans.includes('Automatique')) {
        transmissions.add('Automatique');
      }
      if (trans.includes('Manuelle')) {
        transmissions.add('Manuelle');
      }

      if (o.specifications?.puissance) {
        puissances.add(o.specifications.puissance);
      }

      const prixOccasion = o.prix_base || o.prix_base_variante || 0;
      if (prixOccasion > 0) {
        prix.push(prixOccasion);
      }
    });

    return {
      carrosseries: carrosseries.sort(),
      transmissions: Array.from(transmissions).sort(),
      puissances: Array.from(puissances).sort((a, b) => a - b),
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
      puissanceMin: null,
      prixMax: null,
    });
    setRecherche('');
  };

  // Filtrer les occasions selon les critères sélectionnés
  useEffect(() => {
    if (occasionsListe.length === 0) {
      setOccasionsFiltrees([]);
      return;
    }

    let filtered = [...occasionsListe];

    // Filtrer par recherche (nom du modèle)
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

    // Filtrer par carrosserie
    if (filtres.carrosserie.length > 0) {
      filtered = filtered.filter(o =>
        filtres.carrosserie.includes(o.type_carrosserie)
      );
    }

    // Filtrer par boîte de vitesse (transmission)
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

    // Filtrer par puissance minimale
    if (filtres.puissanceMin) {
      filtered = filtered.filter(o =>
        (o.specifications?.puissance || 0) >= filtres.puissanceMin
      );
    }

    // Filtrer par prix maximum
    if (filtres.prixMax) {
      filtered = filtered.filter(o =>
        (o.prix_base || o.prix_base_variante || 0) <= filtres.prixMax
      );
    }

    setOccasionsFiltrees(filtered);
  }, [occasionsListe, filtres, recherche, modeleBase]);

  const getConsumptionInfo = (occasion) => {
    const consommation = occasion.specifications?.consommation || 0;
    if (consommation === 0) return null;

    const consommationMin = consommation * 0.93;
    const consommationMax = consommation * 1.07;

    const co2Min = Math.round(consommationMin * 23.2);
    const co2Max = Math.round(consommationMax * 23.2);

    return {
      consommation: `${consommationMax.toFixed(1)} - ${consommationMin.toFixed(1)} l/100 km`,
      co2: `${co2Max} - ${co2Min} g/km`,
    };
  };

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
      <div className="variantes-container-finder">
        <div className="variantes-layout-finder">
          {/* Sidebar gauche avec filtres */}
          {occasionsListe.length > 0 && (
            <aside className="variantes-sidebar-finder">
              {/* Barre de recherche */}
              <div className="variantes-search-finder">
                <label className="variantes-search-label">Recherche</label>
                <div className="variantes-search-input-wrapper">
                  <input
                    type="text"
                    placeholder="par exemple Carrera S, GTS, Turbo"
                    value={recherche}
                    onChange={(e) => setRecherche(e.target.value)}
                    className="variantes-search-input"
                  />
                  <button
                    className="variantes-search-clear"
                    onClick={() => setRecherche('')}
                    style={{ display: recherche ? 'block' : 'none' }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Filtre Carrosserie */}
              {filterOptions.carrosseries.length > 0 && (
                <div className="variantes-filter-section-finder">
                  <h3 className="variantes-filter-section-title-finder">Carrosserie</h3>
                  <div className="variantes-filter-options-finder">
                    {filterOptions.carrosseries.map(carrosserie => (
                      <label key={carrosserie} className="variantes-filter-checkbox-finder">
                        <input
                          type="checkbox"
                          checked={filtres.carrosserie.includes(carrosserie)}
                          onChange={() => handleFilterChange('carrosserie', carrosserie)}
                        />
                        <span>{carrosserie}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Filtre Boîte de vitesse */}
              {filterOptions.transmissions.length > 0 && (
                <div className="variantes-filter-section-finder">
                  <h3 className="variantes-filter-section-title-finder">Boîte de vitesse</h3>
                  <div className="variantes-filter-options-finder">
                    {filterOptions.transmissions.map(trans => (
                      <label key={trans} className="variantes-filter-checkbox-finder">
                        <input
                          type="checkbox"
                          checked={filtres.boiteVitesse.includes(trans)}
                          onChange={() => handleFilterChange('boiteVitesse', trans)}
                        />
                        <span>{trans}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Bouton réinitialiser */}
              {(filtres.carrosserie.length > 0 ||
                filtres.boiteVitesse.length > 0 ||
                filtres.puissanceMin ||
                filtres.prixMax ||
                recherche) && (
                  <button
                    onClick={handleResetFilter}
                    className="variantes-reset-filters-finder"
                  >
                    Réinitialiser tous les filtres
                  </button>
                )}
            </aside>
          )}

          {/* Zone principale */}
          <div className="variantes-main-finder">
            {/* Header */}
            <div className="variantes-header-finder">
              <button
                onClick={() => navigate('/catalogue/occasion')}
                className="variantes-back-link-finder"
              >
                Retour au catalogue d'occasion
              </button>
              <h1 className="variantes-title-finder">
                Quel modèle {modeleBase?.nom_model} d'occasion vous intéresse ?
              </h1>
            </div>

            {/* Liste des occasions */}
            {occasionsListe.length === 0 ? (
              <div className="variantes-empty-finder">
                <p>Aucune {modeleBase?.nom_model} d'occasion disponible pour le moment.</p>
              </div>
            ) : occasionsFiltrees.length === 0 ? (
              <div className="variantes-empty-finder">
                <p>Aucune occasion ne correspond aux filtres sélectionnés.</p>
                <button
                  onClick={handleResetFilter}
                  className="variantes-reset-filters-finder"
                >
                  Réinitialiser les filtres
                </button>
              </div>
            ) : (
              <div className="variantes-grid-finder">
                {occasionsFiltrees.map((occasion) => {
                  let photoPrincipale = null;

                  if (occasion.photo_porsche && Array.isArray(occasion.photo_porsche) && occasion.photo_porsche.length > 0) {
                    const validPhotos = occasion.photo_porsche.filter(p => p && (p.name || p._id));
                    if (validPhotos.length > 0) {
                      photoPrincipale = validPhotos[0];
                    }
                  } else if (occasion.photo_voiture && Array.isArray(occasion.photo_voiture) && occasion.photo_voiture.length > 0) {
                    const validPhotos = occasion.photo_voiture.filter(p => p && (p.name || p._id));
                    if (validPhotos.length > 0) {
                      photoPrincipale = validPhotos[0];
                    }
                  } else if (occasion.voiture_base?.photo_voiture) {
                    if (Array.isArray(occasion.voiture_base.photo_voiture) && occasion.voiture_base.photo_voiture.length > 0) {
                      const validPhotos = occasion.voiture_base.photo_voiture.filter(p => p && (p.name || p._id));
                      if (validPhotos.length > 0) {
                        photoPrincipale = validPhotos[0];
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

                  const specifications = occasion.specifications || {};
                  const consommationInfo = getConsumptionInfo(occasion);
                  const transmissionType = getTransmissionType(occasion);

                  return (
                    <article key={occasion._id} className="variante-card-finder">
                      {/* Badge Essence */}
                      <span className="variante-fuel-badge-finder">Essence</span>

                      {/* Image unique */}
                      <div className="variante-image-finder">
                        {photoPrincipale && photoPrincipale.name ? (
                          <img
                            src={photoPrincipale.name?.startsWith('http')
                              ? photoPrincipale.name
                              : photoPrincipale.name?.startsWith('/')
                                ? `${API_URL}${photoPrincipale.name}`
                                : `${API_URL}/${photoPrincipale.name}`}
                            alt={nomComplet}
                            className="variante-image-photo-finder"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              if (e.target.nextSibling) {
                                e.target.nextSibling.style.display = 'flex';
                              }
                            }}
                          />
                        ) : null}
                        <div
                          className="variante-placeholder-finder"
                          style={{ display: photoPrincipale && photoPrincipale.name ? 'none' : 'flex' }}
                        >
                          <span className="variante-letter-finder">
                            {nomComplet?.charAt(0) || '?'}
                          </span>
                        </div>
                      </div>

                      {/* Content */}
                      <div className="variante-content-finder">
                        {/* Nom */}
                        <h3 className="variante-name-finder">
                          {nomComplet}
                        </h3>

                        {/* Prix */}
                        {(occasion.prix_base || occasion.prix_base_variante) > 0 && (
                          <div className="variante-price-finder">
                            {formatPrice(occasion.prix_base || occasion.prix_base_variante)} TTC
                          </div>
                        )}

                        {/* Spécifications de performance */}
                        <div className="variante-performances-finder">
                          {specifications.puissance > 0 && (
                            <div className="variante-performance-item-finder">
                              <div className="variante-performance-value-finder">
                                {specifications.puissance} ch
                              </div>
                              <div className="variante-performance-label-finder">
                                Puissance (ch)
                              </div>
                            </div>
                          )}
                          {specifications.acceleration_0_100 > 0 && (
                            <div className="variante-performance-item-finder">
                              <div className="variante-performance-value-finder">
                                {specifications.acceleration_0_100} s
                              </div>
                              <div className="variante-performance-label-finder">
                                Accélération de 0 à 100 km/h
                              </div>
                            </div>
                          )}
                          {specifications.vitesse_max > 0 && (
                            <div className="variante-performance-item-finder">
                              <div className="variante-performance-value-finder">
                                {specifications.vitesse_max} km/h
                              </div>
                              <div className="variante-performance-label-finder">
                                Vitesse maximale sur circuit
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Détails consommation */}
                        {consommationInfo && (
                          <div className="variante-consumption-details-finder">
                            {transmissionType} • Propulsion • Consommation combinée (l/100 km)(gamme): {consommationInfo.consommation}; Emissions de CO2 combinée (g/km)(gamme): {consommationInfo.co2}*
                          </div>
                        )}

                        {/* Lien données techniques */}
                        <button
                          className="variante-technical-link-finder"
                          onClick={() => navigate(`/occasion/${occasion._id}`)}
                        >
                          Données techniques et équipement de série
                        </button>

                        {/* Actions - Pas de bouton Configurer pour les occasions */}
                        <div className="variante-actions-finder">
                          <button
                            className="variante-configure-btn-finder"
                            onClick={() => navigate(`/occasion/${occasion._id}`)}
                          >
                            Voir les détails
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
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
  
  // Calculer la génération (991 I, 992, etc.) à partir de l'année
  const getGeneration = () => {
    if (!annee) return '';
    // Simplification : 991 I pour 2012-2019, 992 pour 2020+
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
      {/* Header Navigation - Barre grise avec Vidéo/Images à gauche et concessionnaire au centre */}
      <div className="occasion-detail-nav-bar">
        <div className="occasion-detail-nav-left">
          <button className="occasion-detail-nav-back-btn" onClick={() => navigate(-1)}>
            ← Retour
          </button>
          <div className="occasion-detail-nav-media-buttons">
            <button className="occasion-detail-media-btn">
              Vidéo
            </button>
            <button className="occasion-detail-media-btn">
              {photos?.length || 0} Images
            </button>
          </div>
        </div>
        {occasion.concessionnaire && (
          <div className="occasion-detail-nav-center">
            {occasion.concessionnaire}
          </div>
        )}
      </div>

      {/* Main Gallery - Grande image à gauche, grille 2x2 à droite */}
      {photos && photos.length > 0 && (
        <div className="occasion-detail-gallery">
          {/* Grande image principale à gauche */}
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
          {/* Grille 2x2 à droite */}
          {photos.length > 1 && (
            <div className="occasion-detail-gallery-grid">
              {photos.slice(0, 4).map((photo, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`occasion-detail-grid-thumbnail ${selectedImage === index ? 'active' : ''}`}
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

              <div className="occasion-detail-financing">
                <span>Personnaliser votre financement:</span>
                <button className="occasion-detail-financing-link">Financement</button>
              </div>

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
                <button
                  className="occasion-detail-save-btn"
                  onClick={() => {
                    // TODO: Implémenter sauvegarde
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
              {occasion.adresse && (
                <p className="occasion-detail-dealer-address">{occasion.adresse}</p>
              )}
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
