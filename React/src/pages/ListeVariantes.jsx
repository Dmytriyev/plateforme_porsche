import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import voitureService from '../services/voiture.service.js';
import modelPorscheService from '../services/modelPorsche.service.js';
import Loading from '../components/common/Loading.jsx';
import { formatPrice } from '../utils/helpers.js';
import { API_URL } from '../config/api.js';
import buildUrl from '../utils/buildUrl';
import '../css/ListeVariantes.css';
import '../css/CatalogueModeles.css';
import '../css/components/Message.css';

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
    puissanceMin: null,
    prixMax: null,
  });
  const [triActif, setTriActif] = useState('prix-asc'); // 'prix-asc', 'prix-desc', 'nom-asc', 'nom-desc', 'carrosserie'

  const isNeuf = type === 'neuve';

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        const isObjectId = /^[0-9a-fA-F]{24}$/.test(modeleId);

        let modeleData;

        if (isObjectId) {
          modeleData = await voitureService.getVoitureById(modeleId);
        } else {
          const allVoitures = await voitureService.getAllVoitures();
          modeleData = allVoitures.find(v =>
            v.nom_model === modeleId ||
            v.nom_model?.toLowerCase() === modeleId.toLowerCase()
          );
        }

        if (!modeleData || !modeleData.nom_model) {
          const errorMsg = isObjectId
            ? `Modèle introuvable pour l'ID: ${modeleId}`
            : `Modèle "${modeleId}" introuvable. Vérifiez que ce modèle existe dans la base de données.`;
          throw new Error(errorMsg);
        }

        setModele(modeleData);

        const variantesData = await modelPorscheService.getConfigurationsByVoiture(
          isObjectId ? modeleId : modeleData._id
        );

        const allVariantes = Array.isArray(variantesData) ? variantesData : [];

        if (isNeuf) {
          // Pour les voitures neuves: afficher toutes les variantes sans filtrage
          // car le backend retourne déjà les configurations associées à la voiture
          if (allVariantes.length === 0 && modeleData) {
            // Si aucune configuration n'existe, créer une variante virtuelle
            const virtualVariante = {
              _id: modeleData._id,
              nom_model: modeleData.nom_model,
              description: modeleData.description,
              voiture: modeleData,
              photo_voiture: modeleData.photo_voiture || [],
              photo_porsche: [],
              type_carrosserie: 'N/A',
              prix_base: 0,
              specifications: {
                puissance: 0,
                acceleration_0_100: 0,
                vitesse_max: 0,
                transmission: 'N/A',
                consommation: 0
              },
              disponible: false,
              message: 'Configurations non disponibles - Contactez le concessionnaire',
            };
            setVariantes([virtualVariante]);
            setVariantesFiltrees([virtualVariante]);
          } else {
            setVariantes(allVariantes);
            setVariantesFiltrees(allVariantes);
          }
        } else {
          const filteredOccasions = allVariantes.filter(variante => {
            const typeVoiture = variante.voiture?.type_voiture;
            // Gérer booléen, chaîne "occasion", "false", ou undefined
            return typeVoiture === false || typeVoiture === 'occasion' || typeVoiture === 'false';
          });
          let occasionsToDisplay = filteredOccasions;

          if (filteredOccasions.length === 0 && modeleData.type_voiture === false) {
            const virtualOccasion = {
              _id: modeleData._id,
              nom_model: modeleData.nom_model,
              description: modeleData.description,
              voiture: modeleData,
              photo_voiture: modeleData.photo_voiture || [],
              photo_porsche: [],
              type_carrosserie: 'N/A',
              prix_base: 0,
              specifications: { puissance: 0, acceleration_0_100: 0, vitesse_max: 0, transmission: 'N/A', consommation: 0 },
              disponible: true,
              message: 'Variantes détaillées non disponibles - Contactez le concessionnaire',
            };
            occasionsToDisplay = [virtualOccasion];
          }

          if (import.meta.env.DEV) {
          }

          setVariantes(occasionsToDisplay);
          setVariantesFiltrees(occasionsToDisplay);
        }
      } catch (err) {
        const errorMessage = err.message || 'Erreur lors du chargement des variantes';
        setError(errorMessage);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, [modeleId, isNeuf]);

  const _handleVarianteClick = (variante) => {
    if (isNeuf) {
      //  CORRECTION: Passer l'ID de la variante spécifique
      const voitureId = variante.voiture?._id || modeleId;
      navigate(`/configurateur/${voitureId}/${variante._id}`);
    } else {
      navigate(`/occasion/${variante._id}`);
    }
  };

  const _handleSelectModel = (variante, e) => {
    e.stopPropagation();
    if (isNeuf) {
      //  CORRECTION: Passer l'ID de la variante spécifique
      const voitureId = variante.voiture?._id || modeleId;
      navigate(`/configurateur/${voitureId}/${variante._id}`);
    } else {
      navigate(`/occasion/${variante._id}`);
    }
  };

  useEffect(() => {
    if (variantes.length === 0) {
      setVariantesFiltrees([]);
      return;
    }

    let filtered = [...variantes];
    if (filtres.carrosserie.length > 0) {
      filtered = filtered.filter(v =>
        filtres.carrosserie.includes(v.type_carrosserie)
      );
    }
    if (filtres.puissanceMin) {
      filtered = filtered.filter(v =>
        (v.specifications?.puissance || 0) >= filtres.puissanceMin
      );
    }
    if (filtres.prixMax) {
      filtered = filtered.filter(v =>
        (v.prix_base || v.prix_calcule || 0) <= filtres.prixMax
      );
    }

    // Appliquer le tri
    if (triActif === 'prix-asc') {
      filtered.sort((a, b) => (a.prix_base || a.prix_calcule || 0) - (b.prix_base || b.prix_calcule || 0));
    } else if (triActif === 'prix-desc') {
      filtered.sort((a, b) => (b.prix_base || b.prix_calcule || 0) - (a.prix_base || a.prix_calcule || 0));
    } else if (triActif === 'nom-asc') {
      filtered.sort((a, b) => (a.nom_model || '').localeCompare(b.nom_model || ''));
    } else if (triActif === 'nom-desc') {
      filtered.sort((a, b) => (b.nom_model || '').localeCompare(a.nom_model || ''));
    } else if (triActif === 'carrosserie') {
      filtered.sort((a, b) => (a.type_carrosserie || '').localeCompare(b.type_carrosserie || ''));
    }

    setVariantesFiltrees(filtered);
  }, [variantes, filtres, triActif]);

  const getFilterOptions = () => {
    const carrosseries = [...new Set(variantes.map(v => v.type_carrosserie).filter(Boolean))];
    const puissances = new Set();
    const prix = [];

    variantes.forEach(v => {
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
      puissances: Array.from(puissances).sort((a, b) => a - b),
      prixMax: prix.length > 0 ? Math.max(...prix) : 0,
    };
  };

  const filterOptions = getFilterOptions();

  const handleFilterChange = (filterType, value) => {
    setFiltres(prev => {
      const newFiltres = { ...prev };

      if (filterType === 'carrosserie') {
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
      puissanceMin: null,
      prixMax: null,
    });
  };

  if (loading) {
    return <Loading fullScreen message="Chargement des variantes..." />;
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
    <div className="variantes-container-finder">
      <div className="variantes-layout-finder">
        {/* Sidebar gauche avec filtres */}
        {variantes.length > 0 && (
          <aside className="variantes-sidebar-finder">
            {/* Filtre Carrosserie */}
            {filterOptions.carrosseries.length > 0 && (
              <div className="variantes-filter-section-finder">
                <h3 className="variantes-filter-section-title-finder">Carrosserie</h3>
                <div className="variantes-filter-options-finder">
                  {filterOptions.carrosseries.map(carrosserie => (
                    <label key={carrosserie} className="variantes-filter-checkbox-finder">
                      <input
                        type="checkbox"
                        name="carrosserie"
                        id={`carrosserie-${carrosserie.replace(/\s+/g, '-').toLowerCase()}`}
                        value={carrosserie}
                        checked={filtres.carrosserie.includes(carrosserie)}
                        onChange={() => handleFilterChange('carrosserie', carrosserie)}
                      />
                      <span>{carrosserie}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Bouton réinitialiser */}
            {(filtres.carrosserie.length > 0 ||
              filtres.puissanceMin ||
              filtres.prixMax) && (
                <button
                  onClick={() => {
                    handleResetFilter();
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
              {isNeuf
                ? `Quel est le modèle ${modele?.nom_model} que vous souhaitez configurer ?`
                : `Choisissez votre ${modele?.nom_model} d'occasion`}
            </h1>
          </div>

          {/* Barre de tri */}
          {variantesFiltrees.length > 0 && (
            <div className="variantes-sort-bar-finder">
              <div className="variantes-sort-info-finder">
                <div className="variantes-sort-label-finder">
                  Trier par:
                </div>
                <div className="variantes-count-finder">
                  {variantesFiltrees.length} résultat{variantesFiltrees.length > 1 ? 's' : ''}
                </div>
              </div>
              <div className="variantes-sort-options-finder">
                <button
                  className={`variantes-sort-btn-finder ${triActif === 'prix-asc' ? 'active' : ''}`}
                  onClick={() => setTriActif('prix-asc')}
                >
                  Prix croissant
                </button>
                <button
                  className={`variantes-sort-btn-finder ${triActif === 'prix-desc' ? 'active' : ''}`}
                  onClick={() => setTriActif('prix-desc')}
                >
                  Prix décroissant
                </button>
                <button
                  className={`variantes-sort-btn-finder ${triActif === 'nom-asc' ? 'active' : ''}`}
                  onClick={() => setTriActif('nom-asc')}
                >
                  Modèle A-Z
                </button>
                <button
                  className={`variantes-sort-btn-finder ${triActif === 'nom-desc' ? 'active' : ''}`}
                  onClick={() => setTriActif('nom-desc')}
                >
                  Modèle Z-A
                </button>
              </div>
            </div>
          )}

          {/* Liste des variantes */}
          {variantes.length === 0 ? (
            <div className="catalogue-empty">
              <p>Aucune variante disponible pour ce modèle.</p>
            </div>
          ) : variantesFiltrees.length === 0 ? (
            <div className="catalogue-empty">
              <p>Aucune variante ne correspond aux filtres sélectionnés.</p>
              <button
                onClick={() => {
                  handleResetFilter();
                }}
                className="variantes-reset-filters-finder"
              >
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <div className="catalogue-modeles-grid-occasion">
              {variantesFiltrees.map((variante) => {
                // Récupérer la photo principale (une seule image)
                let photoPrincipale = null;

                if (isNeuf) {
                  if (variante.photo_porsche && Array.isArray(variante.photo_porsche) && variante.photo_porsche.length > 0) {
                    const validPhotos = variante.photo_porsche.filter(p => p && (p.name || p._id));
                    if (validPhotos.length > 2) {
                      // Utiliser la photo à l'index 2 (première de la galerie, exclut index 0 et 1)
                      photoPrincipale = validPhotos[2];
                    } else if (validPhotos.length > 0) {
                      // Fallback : dernière photo disponible
                      photoPrincipale = validPhotos[validPhotos.length - 1];
                    }
                  }
                } else {
                  // Pour les occasions: chercher les photos dans plusieurs sources
                  // 1. Essayer photo_porsche (photos spécifiques à cette occasion)
                  if (variante.photo_porsche && Array.isArray(variante.photo_porsche) && variante.photo_porsche.length > 0) {
                    const validPhotos = variante.photo_porsche.filter(p => p && (p.name || p._id));
                    if (validPhotos.length > 2) {
                      // Utiliser la photo à l'index 2 (première de la galerie, exclut index 0 et 1)
                      photoPrincipale = validPhotos[2];
                    } else if (validPhotos.length > 0) {
                      // Fallback : dernière photo disponible
                      photoPrincipale = validPhotos[validPhotos.length - 1];
                    }
                  }

                  // 2. Essayer photo_voiture (photos de l'occasion elle-même)
                  if (!photoPrincipale && variante.photo_voiture) {
                    if (Array.isArray(variante.photo_voiture) && variante.photo_voiture.length > 0) {
                      const validPhotos = variante.photo_voiture.filter(p => p && (p.name || p._id));
                      if (validPhotos.length > 2) {
                        photoPrincipale = validPhotos[2];
                      } else if (validPhotos.length > 0) {
                        photoPrincipale = validPhotos[validPhotos.length - 1];
                      }
                    } else if (typeof variante.photo_voiture === 'object' && variante.photo_voiture.name) {
                      photoPrincipale = variante.photo_voiture;
                    }
                  }

                  // 3. Essayer voiture.photo_voiture (photos du modèle de base)
                  if (!photoPrincipale && variante.voiture?.photo_voiture) {
                    if (Array.isArray(variante.voiture.photo_voiture) && variante.voiture.photo_voiture.length > 0) {
                      const validPhotos = variante.voiture.photo_voiture.filter(p => p && (p.name || p._id));
                      if (validPhotos.length > 2) {
                        photoPrincipale = validPhotos[2];
                      } else if (validPhotos.length > 0) {
                        photoPrincipale = validPhotos[validPhotos.length - 1];
                      }
                    } else if (typeof variante.voiture.photo_voiture === 'object' && variante.voiture.photo_voiture.name) {
                      photoPrincipale = variante.voiture.photo_voiture;
                    }
                  }

                  // 4. Fallback: voiture_base.photo_voiture (pour compatibilité avec l'ancien format)
                  if (!photoPrincipale && variante.voiture_base?.photo_voiture) {
                    if (Array.isArray(variante.voiture_base.photo_voiture) && variante.voiture_base.photo_voiture.length > 0) {
                      const validPhotos = variante.voiture_base.photo_voiture.filter(p => p && (p.name || p._id));
                      if (validPhotos.length > 2) {
                        photoPrincipale = validPhotos[2];
                      } else if (validPhotos.length > 0) {
                        photoPrincipale = validPhotos[validPhotos.length - 1];
                      }
                    } else if (typeof variante.voiture_base.photo_voiture === 'object' && variante.voiture_base.photo_voiture.name) {
                      photoPrincipale = variante.voiture_base.photo_voiture;
                    }
                  }
                }

                const nomVariante = variante.nom_model || 'Modèle';
                const specifications = variante.specifications || {};

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
                    key={variante._id}
                    className="catalogue-modele-card-neuf-porsche"
                  >
                    {/* Titre */}
                    <h2 className="catalogue-modele-title-porsche">
                      {nomVariante}
                    </h2>

                    {/* Image */}
                    <div className="catalogue-modele-image-porsche">
                      {photoUrl ? (
                        <img
                          src={photoUrl}
                          alt={nomVariante}
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
                          {nomVariante?.charAt(0) || '?'}
                        </span>
                      </div>
                    </div>

                    {/* Prix */}
                    <div className="catalogue-modele-prix-porsche">
                      {(variante.prix_base || variante.prix_calcule) > 0 ? (
                        <>
                          <span className="catalogue-prix-label">Prix à partir de</span>
                          <span className="catalogue-prix-montant">
                            {formatPrice(variante.prix_base || variante.prix_calcule)}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="catalogue-prix-label">Prix</span>
                          <span className="catalogue-prix-montant">Sur demande</span>
                        </>
                      )}
                    </div>

                    {/* Message pour variantes virtuelles */}
                    {variante.message && (
                      <div style={{
                        padding: '10px',
                        marginTop: '10px',
                        backgroundColor: '#f0f0f0',
                        borderRadius: '4px',
                        fontSize: '0.9em',
                        textAlign: 'center',
                        color: '#666'
                      }}>
                        {variante.message}
                      </div>
                    )}

                    {/* Bouton */}
                    <button
                      className="catalogue-modele-btn-porsche"
                      onClick={() => navigate(isNeuf ? `/variante/${variante._id}` : `/occasion/${variante._id}`)}
                      disabled={variante.disponible === false}
                      style={variante.disponible === false ? {
                        opacity: 0.6,
                        cursor: 'not-allowed'
                      } : {}}
                    >
                      {isNeuf ? 'Configurer' : 'Voir les détails'}
                    </button>
                  </div>
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

