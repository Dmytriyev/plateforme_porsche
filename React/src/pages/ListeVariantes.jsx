import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { voitureService, modelPorscheService } from '../services';
import { Loading, Alert } from '../components/common';
import { formatPrice } from '../utils/format.js';
import { API_URL } from '../config/api.jsx';
import './ListeVariantes.css';

const ListeVariantes = () => {
  const { type, modeleId } = useParams();
  const navigate = useNavigate();

  const [modele, setModele] = useState(null);
  const [variantes, setVariantes] = useState([]);
  const [variantesFiltrees, setVariantesFiltrees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [filtres, setFiltres] = useState({
    carrosserie: [],
    boiteVitesse: [],
    transmission: [],
    puissanceMin: null,
    prixMax: null,
  });

  const [recherche, setRecherche] = useState('');
  const [expandedDescriptions, setExpandedDescriptions] = useState({});
  const [variantesComparees, setVariantesComparees] = useState([]);

  const isNeuf = type === 'neuve';

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (isMounted) {
        await fetchData();
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [type, modeleId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const modeleData = await voitureService.getVoitureById(modeleId);

      if (!modeleData || !modeleData.nom_model) {
        throw new Error(`Modèle introuvable pour l'ID: ${modeleId}`);
      }

      setModele(modeleData);

      if (isNeuf) {
        const variantesData = await modelPorscheService.getConfigurationsByVoiture(modeleId);

        const allVariantes = Array.isArray(variantesData) ? variantesData : [];

        const filteredVariantes = allVariantes.filter(variante => {
          const isNeuf = variante.voiture?.type_voiture === true;
          return isNeuf;
        });

        setVariantes(filteredVariantes);
        setVariantesFiltrees(filteredVariantes);
      } else {
        const allOccasions = await voitureService.getVoituresOccasion();

        if (!Array.isArray(allOccasions)) {
          console.error('Les occasions ne sont pas un tableau:', allOccasions);
          setVariantes([]);
          return;
        }

        const modeleNom = modeleData.nom_model;

        if (!modeleNom) {
          console.error('Nom du modèle non trouvé:', {
            modeleId,
            modeleData,
            message: 'Le modèle récupéré ne contient pas de nom_model. Vérifiez la structure des données.'
          });
          setVariantes([]);
          return;
        }

        const filteredOccasions = allOccasions.filter(occasion => {
          const occasionNomModel = occasion.nom_model || occasion.voiture_base?.nom_model;

          if (!occasionNomModel) {
            return false;
          }

          const matches = (
            occasionNomModel === modeleNom ||
            occasionNomModel.toLowerCase() === modeleNom.toLowerCase()
          );

          return matches;
        });

        setVariantes(filteredOccasions);
        setVariantesFiltrees(filteredOccasions);
      }
    } catch (err) {
      const errorMessage = err.message || 'Erreur lors du chargement des variantes';
      setError(errorMessage);
      console.error('Erreur dans fetchData:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVarianteClick = (variante) => {
    if (isNeuf) {
      navigate(`/configurateur/${variante.voiture?._id || modeleId}`);
    } else {
      navigate(`/occasion/${variante._id}`);
    }
  };

  const handleSelectModel = (variante, e) => {
    e.stopPropagation();
    if (isNeuf) {
      navigate(`/configurateur/${variante.voiture?._id || modeleId}`);
    } else {
      navigate(`/occasion/${variante._id}`);
    }
  };

  const handleCompare = (variante, e) => {
    e.stopPropagation();
    setVariantesComparees(prev => {
      const isSelected = prev.some(v => v._id === variante._id);
      if (isSelected) {
        return prev.filter(v => v._id !== variante._id);
      } else {
        return [...prev, variante].slice(0, 2); // Maximum 2 variantes à comparer
      }
    });
  };

  /**
   * Filtrer les variantes selon les critères sélectionnés
   * 
   * EXPLICATION POUR ÉTUDIANT:
   * ==========================
   * Cette fonction filtre les variantes en utilisant UNIQUEMENT les données
   * disponibles dans la base de données (carrosserie, transmission, puissance, prix, recherche)
   */
  useEffect(() => {
    if (variantes.length === 0) {
      setVariantesFiltrees([]);
      return;
    }

    let filtered = [...variantes];

    // Filtrer par recherche (nom du modèle)
    if (recherche.trim()) {
      const rechercheLower = recherche.toLowerCase();
      filtered = filtered.filter(v =>
        v.nom_model?.toLowerCase().includes(rechercheLower)
      );
    }

    // Filtrer par carrosserie
    if (filtres.carrosserie.length > 0) {
      filtered = filtered.filter(v =>
        filtres.carrosserie.includes(v.type_carrosserie)
      );
    }

    // Filtrer par boîte de vitesse (transmission)
    if (filtres.boiteVitesse.length > 0) {
      filtered = filtered.filter(v => {
        const trans = v.specifications?.transmission || '';
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
      filtered = filtered.filter(v =>
        (v.specifications?.puissance || 0) >= filtres.puissanceMin
      );
    }

    // Filtrer par prix maximum
    if (filtres.prixMax) {
      filtered = filtered.filter(v =>
        (v.prix_base || v.prix_calcule || 0) <= filtres.prixMax
      );
    }

    setVariantesFiltrees(filtered);
  }, [variantes, filtres, recherche]);

  const getFilterOptions = () => {
    const carrosseries = [...new Set(variantes.map(v => v.type_carrosserie).filter(Boolean))];
    const transmissions = new Set();
    const puissances = new Set();
    const prix = [];

    variantes.forEach(v => {
      const trans = v.specifications?.transmission || '';
      if (trans.includes('PDK') || trans.includes('Automatique')) {
        transmissions.add('Automatique');
      }
      if (trans.includes('Manuelle')) {
        transmissions.add('Manuelle');
      }

      if (v.specifications?.puissance) {
        puissances.add(v.specifications.puissance);
      }

      const prixVariante = v.prix_base || v.prix_calcule || 0;
      if (prixVariante > 0) {
        prix.push(prixVariante);
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
  };

  /**
   * Convertir la puissance en kW et PS
   * 
   * EXPLICATION POUR ÉTUDIANT:
   * ==========================
   * 1 PS (Pferdestärke) = 0.7355 kW
   * Donc pour convertir ch (chevaux) en kW et PS:
   * - kW = ch * 0.7355
   * - PS = ch (car 1 ch ≈ 1 PS)
   */
  const formatPower = (puissance) => {
    if (!puissance) return 'N/A';
    const kw = Math.round(puissance * 0.7355);
    return `${kw} kW / ${puissance} PS`;
  };

  /**
   * Formater la consommation et les émissions CO2
   */


  if (loading) {
    return <Loading fullScreen message="Chargement des variantes..." />;
  }

  if (error) {
    return (
      <div className="error-container">
        <Alert variant="error">{error}</Alert>
      </div>
    );
  }

  /**
   * Calculer les informations de consommation et CO2
   * 
   * EXPLICATION POUR ÉTUDIANT:
   * ==========================
   * Cette fonction calcule la consommation et les émissions CO2
   * en utilisant UNIQUEMENT les données disponibles dans la base
   */
  const getConsumptionInfo = (variante) => {
    const consommation = variante.specifications?.consommation || 0;
    if (consommation === 0) return null;

    // Calculer la gamme de consommation (±7% comme dans l'image)
    const consommationMin = consommation * 0.93;
    const consommationMax = consommation * 1.07;

    // Calculer les émissions CO2 (1L essence ≈ 23.2 g CO2/km)
    const co2Min = Math.round(consommationMin * 23.2);
    const co2Max = Math.round(consommationMax * 23.2);

    return {
      consommation: `${consommationMax.toFixed(1)} - ${consommationMin.toFixed(1)} l/100 km`,
      co2: `${co2Max} - ${co2Min} g/km`,
    };
  };

  /**
   * Déterminer le type de transmission depuis les spécifications
   */
  const getTransmissionType = (variante) => {
    const trans = variante.specifications?.transmission || '';
    if (trans.includes('PDK') || trans.includes('Automatique')) {
      return 'Automatique';
    }
    if (trans.includes('Manuelle')) {
      return 'Manuelle';
    }
    return 'Automatique'; // Par défaut
  };

  return (
    <div className="variantes-container-finder">
      <div className="variantes-layout-finder">
        {/* Sidebar gauche avec filtres */}
        {isNeuf && variantes.length > 0 && (
          <aside className="variantes-sidebar-finder">
            {/* Barre de recherche */}
            <div className="variantes-search-finder">
              <label className="variantes-search-label">Recherche</label>
              <div className="variantes-search-input-wrapper">
                <input
                  type="text"
                  placeholder="par exemple Turbo S, 4S, GT"
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
                <button className="variantes-compare-types-link">
                  Comparer les types de carrosserie
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </button>
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
                  onClick={() => {
                    handleResetFilter();
                    setRecherche('');
                  }}
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
              onClick={() => navigate('/choix-voiture')}
              className="variantes-back-link-finder"
            >
              Retour à la sélection des séries de modèles
            </button>
            <h1 className="variantes-title-finder">
              Quel est le modèle {modele?.nom_model} que vous souhaitez configurer ?
            </h1>
          </div>

          {/* Liste des variantes */}
          {variantes.length === 0 ? (
            <div className="variantes-empty-finder">
              <p>Aucune variante disponible pour ce modèle.</p>
            </div>
          ) : variantesFiltrees.length === 0 ? (
            <div className="variantes-empty-finder">
              <p>Aucune variante ne correspond aux filtres sélectionnés.</p>
              <button
                onClick={() => {
                  handleResetFilter();
                  setRecherche('');
                }}
                className="variantes-reset-filters-finder"
              >
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <div className="variantes-grid-finder">
              {variantesFiltrees.map((variante) => {
                // Récupérer la photo principale (une seule image)
                let photoPrincipale = null;

                if (isNeuf) {
                  if (variante.photo_porsche && Array.isArray(variante.photo_porsche) && variante.photo_porsche.length > 0) {
                    const validPhotos = variante.photo_porsche.filter(p => p && (p.name || p._id));
                    if (validPhotos.length > 0) {
                      photoPrincipale = validPhotos[0];
                    }
                  }
                } else {
                  if (variante.photo_voiture) {
                    if (Array.isArray(variante.photo_voiture) && variante.photo_voiture.length > 0) {
                      const validPhotos = variante.photo_voiture.filter(p => p && (p.name || p._id));
                      if (validPhotos.length > 0) {
                        photoPrincipale = validPhotos[0];
                      }
                    } else if (typeof variante.photo_voiture === 'object' && variante.photo_voiture.name) {
                      photoPrincipale = variante.photo_voiture;
                    }
                  }
                  if (!photoPrincipale && variante.voiture_base?.photo_voiture) {
                    if (Array.isArray(variante.voiture_base.photo_voiture) && variante.voiture_base.photo_voiture.length > 0) {
                      const validPhotos = variante.voiture_base.photo_voiture.filter(p => p && (p.name || p._id));
                      if (validPhotos.length > 0) {
                        photoPrincipale = validPhotos[0];
                      }
                    } else if (variante.voiture_base.photo_voiture && typeof variante.voiture_base.photo_voiture === 'object' && variante.voiture_base.photo_voiture.name) {
                      photoPrincipale = variante.voiture_base.photo_voiture;
                    }
                  }
                }

                const nomVariante = variante.nom_model || 'Modèle';
                const specifications = variante.specifications || {};
                const consommationInfo = getConsumptionInfo(variante);
                const transmissionType = getTransmissionType(variante);
                const isCompareSelected = variantesComparees.some(v => v._id === variante._id);

                return (
                  <article key={variante._id} className="variante-card-finder">
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
                          alt={nomVariante}
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
                          {nomVariante?.charAt(0) || '?'}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="variante-content-finder">
                      {/* Nom */}
                      <h3 className="variante-name-finder">
                        {nomVariante}
                      </h3>

                      {/* Prix */}
                      {(variante.prix_base || variante.prix_calcule) > 0 && (
                        <div className="variante-price-finder">
                          À partir de {formatPrice(variante.prix_base || variante.prix_calcule)} TTC
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
                        onClick={() => navigate(`/variante/${variante._id}`)}
                      >
                        Données techniques et équipement de série
                      </button>

                      {/* Actions */}
                      <div className="variante-actions-finder">
                        <button
                          className="variante-configure-btn-finder"
                          onClick={() => navigate(`/variante/${variante._id}`)}
                        >
                          Configurer
                        </button>
                        <label className="variante-compare-checkbox-finder">
                          <input
                            type="checkbox"
                            checked={isCompareSelected}
                            onChange={(e) => handleCompare(variante, e)}
                          />
                          <span>Comparer</span>
                        </label>
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
};

export default ListeVariantes;

