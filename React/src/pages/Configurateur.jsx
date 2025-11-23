import { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { modelPorscheService, personnalisationService, commandeService } from '../services';
import { AuthContext } from '../context/AuthContext.jsx';
import LoginPromptModal from '../components/modals/LoginPromptModal.jsx';
import ContactModal from '../components/modals/ContactModal.jsx';
import { Loading, Button } from '../components/common';
import { formatPrice } from '../utils/format.js';
import { API_URL } from '../config/api.js';
import '../css/Configurateur.css';
import '../css/components/Message.css';
import buildUrl from '../utils/buildUrl';

const Configurateur = () => {
  const { voitureId, varianteId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const { isAuthenticated } = useContext(AuthContext);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  //  État pour stocker le voitureId (peut être déduit de la variante)
  const [voitureIdActuel, setVoitureIdActuel] = useState(voitureId);

  // Données disponibles
  const [variantes, setVariantes] = useState([]);
  const [couleursExt, setCouleursExt] = useState([]);
  const [couleursInt, setCouleursInt] = useState([]);
  const [jantes, setJantes] = useState([]);
  const [sieges, setSieges] = useState([]);
  const [_packages, setPackages] = useState([]);
  const [packagesFiltres, setPackagesFiltres] = useState([]);

  // Configuration sélectionnée
  const [config, setConfig] = useState({
    variante: null,
    couleur_exterieur: null,
    couleur_interieur: null, // Changé en simple sélection
    taille_jante: null,
    siege: null,
    package: null,
  });

  const [prixTotal, setPrixTotal] = useState(0);
  const [acompte, setAcompte] = useState(0);
  const [ajoutEnCours, setAjoutEnCours] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  // États pour l'interface
  const [photoActive, setPhotoActive] = useState(0);
  const [sectionsOuvertes, setSectionsOuvertes] = useState({
    couleursExt: false,
    jantes: false,
    couleursInt: true, // Ouvert par défaut
    sieges: false,
    packages: true, //  Ouvert par défaut pour voir les packages
  });

  // Charger les options disponibles
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoading(true);
        setError('');


        let voitureIdActuel = voitureId;

        //  AMÉLIORATION: Si varianteId est fourni mais pas voitureId (cas edge)
        // Charger la variante pour obtenir le voitureId
        if (!voitureId && varianteId) {
          try {
            const varianteData = await modelPorscheService.getModelById(varianteId);

            if (varianteData?.voiture?._id || varianteData?.voiture) {
              // Gérer le cas où voiture est un ObjectId (string) ou un objet
              voitureIdActuel = typeof varianteData.voiture === 'string'
                ? varianteData.voiture
                : varianteData.voiture._id;


              //  IMPORTANT: Sauvegarder le voitureId dans le state pour l'utiliser ailleurs
              setVoitureIdActuel(voitureIdActuel);

              //  NE PAS faire navigate() ici - cela crée une boucle infinie !
              // On continue simplement avec le voitureIdActuel trouvé
            } else {
              throw new Error('VoitureId introuvable dans la variante');
            }
          } catch (err) {
            setError('Variante introuvable');
            setLoading(false);
            return;
          }
        } else if (voitureId) {
          setVoitureIdActuel(voitureId);
        }

        if (!voitureIdActuel) {
          setError('ID de voiture manquant');
          setLoading(false);
          return;
        }


        // Charger les variantes de la gamme (pour permettre de changer de variante)
        const responseData = await modelPorscheService.getConfigurationsByVoiture(voitureIdActuel);

        const variantesData = Array.isArray(responseData)
          ? responseData
          : (responseData?.configurations || []);

        if (import.meta.env.DEV) {
          console.log('[Configurateur] Variantes chargées:', {
            voitureId: voitureIdActuel,
            totalVariantes: variantesData.length,
            premiereVariante: variantesData[0]?.nom_model
          });
        }

        setVariantes(variantesData);

        // Charger les options de personnalisation
        const [couleursExtData, couleursIntData, jantesData, siegesData, packagesData] =
          await Promise.all([
            personnalisationService.getCouleursExterieur(),
            personnalisationService.getCouleursInterieur(),
            personnalisationService.getJantes(),
            personnalisationService.getSieges(),
            personnalisationService.getPackages(),
          ]);

        setCouleursExt(couleursExtData);
        setCouleursInt(couleursIntData);
        const jantesFiltrees = Array.isArray(jantesData)
          ? jantesData.filter(jante => {
            const taille = jante.taille_jante;
            // Exclure si taille = 16 (number) OU taille = "16" (string)
            return taille !== 16 && taille !== "16" && String(taille) !== "16";
          })
          : [];

        setJantes(jantesFiltrees);
        setSieges(siegesData);
        setPackages(packagesData);

        //  NOUVELLE LOGIQUE: Sélectionner la variante spécifique ou la première par défaut
        if (variantesData.length > 0) {
          let varianteSelectionnee = null;

          if (varianteId) {
            varianteSelectionnee = variantesData.find(v => v._id === varianteId);
          }

          // Fallback: sélectionner la première variante si varianteId non trouvé
          if (!varianteSelectionnee) {
            varianteSelectionnee = variantesData[0];
          }

          setConfig((prev) => ({ ...prev, variante: varianteSelectionnee }));
        }
      } catch (err) {
        if (import.meta.env.DEV) console.error('[Configurateur] Erreur chargement:', err);
        setError(err.message || 'Erreur lors du chargement des options');
      } finally {
        setLoading(false);
      }
    };

    if (voitureId || varianteId) {
      fetchOptions();
    } else {
      setLoading(false);
      setError('Paramètres manquants : voitureId ou varianteId requis');

      if (import.meta.env.DEV) console.error('[Configurateur] Paramètres manquants:', { voitureId, varianteId });
    }
  }, [voitureId, varianteId]);

  useEffect(() => {
    if (config.variante && _packages.length > 0) {
      const packagesFiltresParModele = filtrerPackagesParModele(_packages, config.variante);
      setPackagesFiltres(packagesFiltresParModele);

      if (config.package && !packagesFiltresParModele.find(p => p._id === config.package._id)) {
        setConfig(prev => ({ ...prev, package: null }));
      }
    } else {
      setPackagesFiltres([]);
    }
  }, [config.variante, _packages]);

  useEffect(() => {
    let total = 0;

    if (config.variante) {
      total += config.variante.prix_base || 0;
    }

    if (config.couleur_exterieur) {
      total += config.couleur_exterieur.prix || 0;
    }

    if (config.couleur_interieur) {
      total += config.couleur_interieur.prix || 0;
    }

    if (config.taille_jante) {
      total += config.taille_jante.prix || 0;
    }

    if (config.siege) {
      total += config.siege.prix || 0;
    }

    if (config.package) {
      total += config.package.prix || 0;
    }

    setPrixTotal(total);
    // Calcul de l'acompte (20% du prix total)
    setAcompte(Math.round(total * 0.2));
  }, [config]);

  // Fonction helper pour obtenir les photos de la variante
  const getPhotosVariante = useCallback(() => {
    return Array.isArray(config.variante?.photo_porsche) ? config.variante.photo_porsche : [];
  }, [config.variante]);

  const findPhotoIndexByCouleur = useCallback((couleur, type) => {
    if (!couleur?._id || !type) {
      if (import.meta.env.DEV) {
      }
      return null;
    }
    if (!['exterieur', 'interieur'].includes(type)) {
      if (import.meta.env.DEV) {
      }
      return null;
    }

    const photos = getPhotosVariante();
    if (!Array.isArray(photos) || photos.length === 0) {
      if (import.meta.env.DEV) {
      }
      return null;
    }

    if (import.meta.env.DEV) {
    }
    const visiblePhotosWithIndex = photos
      .map((photo, originalIndex) => ({ photo, originalIndex }))
      .filter(({ photo, originalIndex }) => {
        const id = photo._id || photo.id || '';
        const name = photo.name || '';
        return originalIndex >= 2 &&
          !(id === 'id_0' || id === 'id_1' ||
            name.includes('id_0') || name.includes('id_1'));
      });

    if (import.meta.env.DEV) {
    }

    // Chercher la photo correspondant à la couleur sélectionnée
    const fieldName = type === 'exterieur' ? 'couleur_exterieur' : 'couleur_interieur';
    const foundIndex = visiblePhotosWithIndex.findIndex(({ photo }) => {
      const photoCouleurId = photo[fieldName]?._id || photo[fieldName];

      if (import.meta.env.DEV) {
      }

      return photoCouleurId && photoCouleurId.toString() === couleur._id.toString();
    });

    if (import.meta.env.DEV) {
    }

    // Retourner l'index dans le tableau des photos visibles
    return foundIndex >= 0 ? foundIndex : null;
  }, [getPhotosVariante]);

  /**
   *  Handler pour changement de couleur extérieure
   * Applique le principe DRY (Don't Repeat Yourself)
   */
  const handleCouleurExtChange = useCallback((couleur) => {
    setConfig(prev => ({ ...prev, couleur_exterieur: couleur }));

    // Trouver et afficher la photo correspondante
    const photoIndex = findPhotoIndexByCouleur(couleur, 'exterieur');
    if (photoIndex !== null) {
      setPhotoActive(photoIndex);

      if (import.meta.env.DEV) {
      }
    }
  }, [findPhotoIndexByCouleur]);

  const handleCouleurIntChange = useCallback((couleur) => {
    setConfig(prev => ({ ...prev, couleur_interieur: couleur }));

    // Trouver et afficher la photo correspondante
    const photoIndex = findPhotoIndexByCouleur(couleur, 'interieur');
    if (photoIndex !== null) {
      setPhotoActive(photoIndex);

      if (import.meta.env.DEV) {
      }
    }
  }, [findPhotoIndexByCouleur]);

  const handleChangerModele = () => {
    //  Utiliser voitureIdActuel (state) qui peut être déduit de la variante
    const idVoiture = voitureIdActuel || voitureId;
    if (!idVoiture) {
      if (import.meta.env.DEV) {
      }
      navigate('/choix-voiture');
      return;
    }
    const typeVoiture = config.variante?.voiture?.type_voiture === false ? 'occasion' : 'neuve';
    const targetRoute = `/variantes/${typeVoiture}/${idVoiture}`;

    if (import.meta.env.DEV) {
    }

    navigate(targetRoute);
  };

  const toggleSection = (section) => setSectionsOuvertes((prev) => ({ ...prev, [section]: !prev[section] }));

  // Photos et filtrage: retirer complètement les photos avec id_0 / id_1 (indices 0 et 1)
  const photos = getPhotosVariante();
  const visiblePhotos = Array.isArray(photos)
    ? photos.filter((p, index) => {
      const id = p._id || p.id || '';
      const name = p.name || '';
      // Exclure les indices 0 et 1, ou les photos avec id_0/id_1 dans leur identifiant/nom
      return index >= 2 && !(id === 'id_0' || id === 'id_1' || name.includes('id_0') || name.includes('id_1'));
    })
    : [];

  // Veiller à ce que l'index actif reste valide quand la liste change
  useEffect(() => {
    setPhotoActive((prev) => (prev >= visiblePhotos.length ? 0 : prev));
  }, [visiblePhotos.length]);

  const filtrerPackagesParModele = (packages, variante) => {
    if (!variante || !Array.isArray(packages)) {
      if (import.meta.env.DEV) {
      }
      return [];
    }

    // Extraire et normaliser le nom du modèle de base
    const nomModel = (variante.nom_model || '').trim().toUpperCase();

    let modeleBase;
    if (nomModel.includes('GT3') || nomModel.includes('GT2') ||
      nomModel.includes('TURBO') || nomModel.includes('CARRERA') ||
      nomModel.includes('TARGA') || nomModel.includes('911')) {
      modeleBase = '911';
    }
    else if (nomModel.includes('CAYMAN') || nomModel.includes('GT4')) {
      // GT4 est une variante du Cayman
      modeleBase = 'CAYMAN';
    }
    else if (nomModel.includes('CAYENNE')) {
      modeleBase = 'CAYENNE';
    }
    else {
      modeleBase = nomModel.split(' ')[0];
    }

    const packagesFiltres = packages.filter(pkg => {
      const nomPackage = (pkg.nom_package || '').trim();

      //  Sport Chrono: disponible pour TOUS les modèles
      if (nomPackage.includes('Sport Chrono') || nomPackage.includes('sport chrono')) {
        return true;
      }

      //  Weissach: uniquement pour 911 et Cayman (performance sportive)
      if (nomPackage.includes('Weissach') || nomPackage.includes('weissach')) {
        // Liste blanche des modèles autorisés (Whitelist Security Pattern)
        const modelesAutorises = ['911', 'CAYMAN'];
        return modelesAutorises.includes(modeleBase);
      }
      return true;
    });

    return packagesFiltres;
  };

  const handleJanteChange = useCallback((jante) => {
    setConfig(prev => ({ ...prev, taille_jante: jante }));
  }, []);

  const handleSiegeChange = useCallback((siege) => {
    setConfig(prev => ({ ...prev, siege }));
  }, []);

  const _handlePackageChange = useCallback((pkg) => {
    setConfig(prev => ({ ...prev, package: pkg }));
  }, []);

  const handleAcheter = async () => {
    if (!isAuthenticated()) {
      setShowLoginPrompt(true);
      return;
    }
    if (!config.variante) {
      setError('Veuillez sélectionner une variante');
      return;
    }

    try {
      setAjoutEnCours(true);
      setError('');

      // Utiliser l'ID de la variante (model_porsche) sélectionnée
      const modelPorscheId = config.variante._id;

      // Ajouter la configuration au panier via l'API backend
      await commandeService.ajouterVoitureNeuveAuPanier(modelPorscheId);

      setSuccess('Configuration ajoutée au panier avec succès !');

      // Rediriger vers le panier après 1.5 secondes
      setTimeout(() => {
        navigate('/panier');
      }, 1500);
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'ajout au panier');
    } finally {
      setAjoutEnCours(false);
    }
  };

  if (loading) {
    return <Loading fullScreen message="Chargement du configurateur..." />;
  }

  if (error && variantes.length === 0) {
    return (
      <div className="error-container">
        <div className="message-box message-error">
          <p>{error}</p>
        </div>
        <Button onClick={() => navigate('/choix-voiture')}>Retour au catalogue</Button>
      </div>
    );
  }

  const nomModel = config.variante?.nom_model || config.variante?.voiture?.nom_model || '911 GT3';
  const annee = new Date().getFullYear() + 1; // Année du modèle

  return (
    <div className="configurateur-container">
      {success && (
        <div className="message-box message-success">
          <p>{success}</p>
        </div>
      )}
      {error && !success && (
        <div className="message-box message-error">
          <p>{error}</p>
        </div>
      )}

      {/* Header avec navigation et prix */}
      <header className="configurateur-top-header">
        <div className="configurateur-header-left">
          <button className="configurateur-header-link" onClick={handleChangerModele}>
            Changer de modèle
          </button>
        </div>

        <div className="configurateur-header-center">
          <img src="/Logo/Logo_Porsche.png" alt="Porsche" className="configurateur-header-logo" />
        </div>

        <div className="configurateur-header-right">
          <div className="configurateur-header-price-group">
            <div className="configurateur-header-price-item">
              <span className="configurateur-header-price-label">Prix de base</span>
              <span className="configurateur-header-price-total">{formatPrice(prixTotal)}</span>
              <button className="configurateur-header-info-icon" title="Informations">
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <div className="configurateur-main-content">

        {/* Zone de visualisation (gauche) */}
        <div className="configurateur-visual-area">
          <div className="configurateur-visual-main">
            {/* Image principale */}
            {visiblePhotos.length > 0 ? (
              <img
                src={buildUrl(visiblePhotos[photoActive]?.name)}
                alt={nomModel}
                className="configurateur-main-image"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div
              className="configurateur-visual-placeholder"
              style={{ display: visiblePhotos.length > 0 ? 'none' : 'flex' }}
            >
              <span className="configurateur-visual-letter">
                {nomModel?.charAt(0) || '?'}
              </span>
            </div>
          </div>

          {/* Miniatures */}
          {visiblePhotos.length > 1 && (
            <div className="configurateur-thumbnails">
              {visiblePhotos.map((photo, index) => (
                <button
                  key={photo._id || `photo-${index}`}
                  onClick={() => setPhotoActive(index)}
                  className={`configurateur-thumbnail ${photoActive === index ? 'configurateur-thumbnail-active' : ''}`}
                >
                  <img
                    src={buildUrl(photo.name)}
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

        {/* Panneau de configuration (droite) */}
        <div className="configurateur-options-panel">
          {/* En-tête du panneau */}
          <div className="configurateur-panel-header">
            <h2 className="configurateur-panel-title">Porsche {nomModel}</h2>
            <span className="configurateur-panel-year">{annee}</span>
          </div>

          {couleursExt.length > 0 && (
            <div className="configurateur-option-section">
              <button
                className="configurateur-option-section-header"
                onClick={() => toggleSection('couleursExt')}
              >
                <span className="configurateur-option-section-title">
                  Couleurs Extérieures
                </span>
                <svg
                  className={`configurateur-option-section-icon ${sectionsOuvertes.couleursExt ? 'open' : ''}`}
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {sectionsOuvertes.couleursExt && (
                <div className="configurateur-option-section-content">
                  <div className="configurateur-colors-list">
                    {couleursExt.map((couleur) => (
                      <button
                        key={couleur._id}
                        onClick={() => handleCouleurExtChange(couleur)}
                        className={`configurateur-color-item ${config.couleur_exterieur?._id === couleur._id ? 'selected' : ''
                          }`}
                      >
                        {couleur.photo_couleur ? (
                          <img
                            src={buildUrl(couleur.photo_couleur)}
                            alt={couleur.nom_couleur}
                            className="configurateur-color-item-image"
                          />
                        ) : (
                          <div
                            className="configurateur-color-item-swatch"
                            style={{ backgroundColor: couleur.code_hex || '#ccc' }}
                          />
                        )}
                        <div className="configurateur-color-item-info">
                          <span className="configurateur-color-item-name">{couleur.nom_couleur}</span>
                          {couleur.prix > 0 && (
                            <span className="configurateur-color-item-price">+{formatPrice(couleur.prix)}</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Section Jantes */}
          {jantes.length > 0 && (
            <div className="configurateur-option-section">
              <button
                className="configurateur-option-section-header"
                onClick={() => toggleSection('jantes')}
              >
                <span className="configurateur-option-section-title">
                  Jantes
                </span>
                <svg
                  className={`configurateur-option-section-icon ${sectionsOuvertes.jantes ? 'open' : ''}`}
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {sectionsOuvertes.jantes && (
                <div className="configurateur-option-section-content">
                  <div className="configurateur-jantes-list">
                    {jantes.map((jante) => {
                      // Gérer l'image de la jante
                      const imageJante = jante.photo_jante;
                      let imageUrl = null;

                      if (imageJante) {
                        if (typeof imageJante === 'string') {
                          imageUrl = imageJante.startsWith('http')
                            ? imageJante
                            : `${API_URL}${imageJante.startsWith('/') ? '' : '/'}${imageJante}`;
                        } else if (imageJante.name) {
                          imageUrl = imageJante.name.startsWith('http')
                            ? imageJante.name
                            : `${API_URL}${imageJante.name.startsWith('/') ? '' : '/'}${imageJante.name}`;
                        }
                      }

                      return (
                        <button
                          key={jante._id}
                          onClick={() => handleJanteChange(jante)}
                          className={`configurateur-jante-item ${config.taille_jante?._id === jante._id ? 'selected' : ''}`}
                        >
                          {imageUrl && (
                            <div className="configurateur-jante-image">
                              <img
                                src={imageUrl}
                                alt={`Jante ${jante.taille_jante}"`}
                              />
                            </div>
                          )}
                          <div className="configurateur-jante-info">
                            <span className="configurateur-jante-size">{jante.taille_jante}"</span>
                            {jante.prix > 0 && (
                              <span className="configurateur-jante-price">+{formatPrice(jante.prix)}</span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Section Couleurs Intérieures */}
          {couleursInt.length > 0 && (
            <div className="configurateur-option-section">
              <button
                className="configurateur-option-section-header"
                onClick={() => toggleSection('couleursInt')}
              >
                <span className="configurateur-option-section-title">
                  Couleurs Intérieures
                </span>
                <svg
                  className={`configurateur-option-section-icon ${sectionsOuvertes.couleursInt ? 'open' : ''}`}
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {sectionsOuvertes.couleursInt && (
                <div className="configurateur-option-section-content">
                  <div className="configurateur-colors-list">
                    {couleursInt.map((couleur) => (
                      <button
                        key={couleur._id}
                        onClick={() => handleCouleurIntChange(couleur)}
                        className={`configurateur-color-item ${config.couleur_interieur?._id === couleur._id ? 'selected' : ''}`}
                      >
                        {couleur.photo_couleur ? (
                          <img
                            src={buildUrl(couleur.photo_couleur)}
                            alt={couleur.nom_couleur}
                            className="configurateur-color-item-image"
                          />
                        ) : (
                          <div
                            className="configurateur-color-item-swatch"
                            style={{ backgroundColor: couleur.code_hex || '#ccc' }}
                          />
                        )}
                        <div className="configurateur-color-item-info">
                          <span className="configurateur-color-item-name">{couleur.nom_couleur}</span>
                          {couleur.prix > 0 && (
                            <span className="configurateur-color-item-price">+{formatPrice(couleur.prix)}</span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Section Sièges */}
          {sieges.length > 0 && (
            <div className="configurateur-option-section">
              <button
                className="configurateur-option-section-header"
                onClick={() => toggleSection('sieges')}
              >
                <span className="configurateur-option-section-title">
                  Sièges
                </span>
                <svg
                  className={`configurateur-option-section-icon ${sectionsOuvertes.sieges ? 'open' : ''}`}
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {sectionsOuvertes.sieges && (
                <div className="configurateur-option-section-content">
                  <div className="configurateur-sieges-list">
                    {sieges.map((siege) => {
                      // Gérer l'image du siège
                      const imageSiege = siege.photo_siege;
                      let imageUrl = null;

                      if (imageSiege) {
                        if (typeof imageSiege === 'string') {
                          imageUrl = imageSiege.startsWith('http')
                            ? imageSiege
                            : `${API_URL}${imageSiege.startsWith('/') ? '' : '/'}${imageSiege}`;
                        } else if (imageSiege.name) {
                          imageUrl = imageSiege.name.startsWith('http')
                            ? imageSiege.name
                            : `${API_URL}${imageSiege.name.startsWith('/') ? '' : '/'}${imageSiege.name}`;
                        }
                      }

                      return (
                        <button
                          key={siege._id}
                          onClick={() => handleSiegeChange(siege)}
                          className={`configurateur-siege-item ${config.siege?._id === siege._id ? 'selected' : ''}`}
                        >
                          {imageUrl && (
                            <div className="configurateur-siege-image">
                              <img
                                src={imageUrl}
                                alt={siege.nom_siege}
                              />
                            </div>
                          )}
                          <div className="configurateur-siege-info">
                            <span className="configurateur-siege-name">{siege.nom_siege}</span>
                            {siege.prix > 0 && (
                              <span className="configurateur-siege-price">+{formatPrice(siege.prix)}</span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/*  Section Packages - Affichage des packages filtrés selon le modèle */}
          {packagesFiltres.length > 0 && (
            <div className="configurateur-option-section">
              <button
                className="configurateur-option-section-header"
                onClick={() => toggleSection('packages')}
              >
                <span className="configurateur-option-section-title">
                  Packages
                </span>
                <svg
                  className={`configurateur-option-section-icon ${sectionsOuvertes.packages ? 'open' : ''}`}
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>
              {sectionsOuvertes.packages && (
                <div className="configurateur-option-section-content">
                  <div className="configurateur-packages-list">
                    {packagesFiltres.map((pkg) => {
                      // Gérer l'image du package
                      const imagePackage = pkg.photo_package;
                      let imageUrl = null;

                      if (imagePackage) {
                        if (typeof imagePackage === 'string') {
                          imageUrl = imagePackage.startsWith('http')
                            ? imagePackage
                            : buildUrl(imagePackage);
                        } else if (imagePackage.name) {
                          imageUrl = imagePackage.name.startsWith('http')
                            ? imagePackage.name
                            : buildUrl(imagePackage.name);
                        }
                      }

                      return (
                        <button
                          key={pkg._id}
                          onClick={() => _handlePackageChange(pkg)}
                          className={`configurateur-package-item ${config.package?._id === pkg._id ? 'selected' : ''}`}
                        >
                          <div className="configurateur-package-image">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={pkg.nom_package}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                            ) : null}
                            <div className="configurateur-package-placeholder" style={{ display: imageUrl ? 'none' : 'flex' }}>
                              <svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                                <path d="M2 17l10 5 10-5" />
                                <path d="M2 12l10 5 10-5" />
                              </svg>
                            </div>
                          </div>
                          <div className="configurateur-package-info">
                            <span className="configurateur-package-name">{pkg.nom_package}</span>
                            {pkg.description && (
                              <p className="configurateur-package-description">{pkg.description}</p>
                            )}
                            {pkg.prix > 0 && (
                              <span className="configurateur-package-price">+{formatPrice(pkg.prix)}</span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Boutons d'action en bas */}
          <div className="configurateur-actions">
            <div className="configurateur-actions-info">
              <div className="configurateur-acompte-info">
                <span className="configurateur-acompte-label">Acompte à régler maintenant :</span>
                <span className="configurateur-acompte-montant">{formatPrice(acompte)}</span>
              </div>
              <div className="configurateur-reste-info">
                <span className="configurateur-reste-label">À payer à la livraison :</span>
                <span className="configurateur-reste-montant">{formatPrice(prixTotal - acompte)}</span>
              </div>
            </div>
            <div className="configurateur-actions-buttons">
              <button
                className="configurateur-btn-contact"
                onClick={() => setShowContactModal(true)}
              >
                Nous contacter
              </button>
              <button
                className="configurateur-btn-acheter"
                onClick={handleAcheter}
                disabled={ajoutEnCours || !config.variante}
              >
                {ajoutEnCours ? 'Ajout en cours...' : 'Acheter'}
              </button>

              {showLoginPrompt && (
                <LoginPromptModal
                  onClose={() => setShowLoginPrompt(false)}
                  onLogin={() => navigate('/login', { state: { from: location.pathname } })}
                  initialPath={location.pathname}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de contact */}
      {showContactModal && (
        <ContactModal
          onClose={() => setShowContactModal(false)}
          vehiculeInfo={config.variante ? {
            nom_model: config.variante.nom_model,
            variante: config.variante.type_carrosserie,
            prix: formatPrice(prixTotal)
          } : null}
        />
      )}
    </div>
  );
};

export default Configurateur;

