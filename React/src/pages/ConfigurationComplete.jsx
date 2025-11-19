import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { modelPorscheService, personnalisationService } from '../services';
import { usePanier } from '../hooks/usePanier.jsx';
import { Loading, Button, Alert } from '../components/common';
import { formatPrice } from '../utils/format.js';
import './ConfigurationComplete.css';

/**
 * Page de Configuration Complète pour Voitures Neuves
 * Affiche photos, informations détaillées et options de personnalisation
 */
const ConfigurationComplete = () => {
  const { varianteId } = useParams();
  const navigate = useNavigate();
  const { ajouterArticle } = usePanier();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [etapeActive, setEtapeActive] = useState(1);

  // Données de la variante
  const [variante, setVariante] = useState(null);
  const [photoActive, setPhotoActive] = useState(0);

  // Options disponibles
  const [couleursExt, setCouleursExt] = useState([]);
  const [couleursInt, setCouleursInt] = useState([]);
  const [jantes, setJantes] = useState([]);
  const [sieges, setSieges] = useState([]);
  const [packages, setPackages] = useState([]);

  // Configuration sélectionnée
  const [config, setConfig] = useState({
    couleur_exterieur: null,
    couleur_interieur: [],
    taille_jante: null,
    siege: null,
    package: null,
  });

  const [prixTotal, setPrixTotal] = useState(0);

  // Charger la variante et les options
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        // Charger la variante
        const varianteData = await modelPorscheService.getModelById(varianteId);
        setVariante(varianteData);

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
        setJantes(jantesData);
        setSieges(siegesData);
        setPackages(packagesData);
      } catch (err) {
        setError(err.message || 'Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    if (varianteId) {
      fetchData();
    }
  }, [varianteId]);

  // Calculer le prix total
  useEffect(() => {
    if (!variante) return;

    let total = variante.prix_base || 0;

    if (config.couleur_exterieur) {
      total += config.couleur_exterieur.prix || 0;
    }

    if (config.couleur_interieur.length > 0) {
      total += config.couleur_interieur.reduce((sum, c) => sum + (c.prix || 0), 0);
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
  }, [config, variante]);

  const handleCouleurExtChange = (couleur) => {
    setConfig({ ...config, couleur_exterieur: couleur });
  };

  const handleCouleurIntChange = (couleur) => {
    const isSelected = config.couleur_interieur.some((c) => c._id === couleur._id);
    if (isSelected) {
      setConfig({
        ...config,
        couleur_interieur: config.couleur_interieur.filter((c) => c._id !== couleur._id),
      });
    } else {
      setConfig({
        ...config,
        couleur_interieur: [...config.couleur_interieur, couleur],
      });
    }
  };

  const handleAddToCart = () => {
    if (!variante) {
      setError('Données de configuration manquantes');
      return;
    }

    ajouterArticle({
      id: `config-${Date.now()}`,
      nom: `${variante.voiture?.nom_model || ''} ${variante.nom_model} - Configuration personnalisée`,
      prix: prixTotal,
      type: 'configuration',
      quantite: 1,
      configuration: {
        variante: variante,
        ...config,
      },
    });

    setSuccess('Configuration ajoutée au panier !');
    setTimeout(() => {
      navigate('/panier');
    }, 1500);
  };

  const etapes = [
    { num: 1, titre: 'Couleur extérieure' },
    { num: 2, titre: 'Couleur intérieure' },
    { num: 3, titre: 'Jantes' },
    { num: 4, titre: 'Sièges' },
    { num: 5, titre: 'Packages' },
    { num: 6, titre: 'Résumé' },
  ];

  if (loading) {
    return <Loading fullScreen message="Chargement de la configuration..." />;
  }

  if (error && !variante) {
    return (
      <div className="error-container">
        <Alert variant="error">{error}</Alert>
        <Button onClick={() => navigate('/voitures')}>Retour au catalogue</Button>
      </div>
    );
  }

  return (
    <div className="config-complete-container">
      {success && <Alert variant="success">{success}</Alert>}
      {error && !success && <Alert variant="error">{error}</Alert>}

      {/* En-tête avec infos variante */}
      <div className="config-header">
        <div className="config-header-content">
          <div className="config-header-info">
            <h1 className="config-title">
              {variante?.voiture?.nom_model || ''} {variante?.nom_model || ''}
            </h1>
            <p className="config-subtitle">{variante?.description || ''}</p>

            {/* Spécifications */}
            {variante?.specifications && (
              <div className="config-specs">
                <div className="config-spec-item">
                  <span className="config-spec-label">Puissance</span>
                  <span className="config-spec-value">{variante.specifications.puissance} ch</span>
                </div>
                <div className="config-spec-item">
                  <span className="config-spec-label">0-100 km/h</span>
                  <span className="config-spec-value">{variante.specifications.acceleration_0_100} s</span>
                </div>
                <div className="config-spec-item">
                  <span className="config-spec-label">Transmission</span>
                  <span className="config-spec-value">{variante.specifications.transmission || 'PDK'}</span>
                </div>
                {variante.specifications.vitesse_max && (
                  <div className="config-spec-item">
                    <span className="config-spec-label">Vitesse max</span>
                    <span className="config-spec-value">{variante.specifications.vitesse_max} km/h</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Prix */}
          <div className="config-header-price">
            <p className="config-price-label">Prix à partir de</p>
            <p className="config-price-base">{formatPrice(variante?.prix_base || 0)}</p>
            <div className="config-price-divider"></div>
            <p className="config-price-label">Votre configuration</p>
            <p className="config-price-total">{formatPrice(prixTotal)}</p>
          </div>
        </div>
      </div>

      {/* Galerie photos */}
      <div className="config-gallery">
        <div className="config-gallery-main">
          {variante?.photo_porsche && variante.photo_porsche.length > 0 ? (
            <img
              src={`http://localhost:3000${variante.photo_porsche[photoActive].name}`}
              alt={variante.photo_porsche[photoActive].alt || variante.nom_model}
              className="config-gallery-image"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div
            className="config-gallery-placeholder"
            style={{ display: variante?.photo_porsche && variante.photo_porsche.length > 0 ? 'none' : 'flex' }}
          >
            <span className="config-gallery-letter">
              {variante?.nom_model?.charAt(0) || '?'}
            </span>
          </div>
        </div>

        {/* Miniatures */}
        {variante?.photo_porsche && variante.photo_porsche.length > 1 && (
          <div className="config-gallery-thumbs">
            {variante.photo_porsche.map((photo, index) => (
              <button
                key={index}
                onClick={() => setPhotoActive(index)}
                className={`config-gallery-thumb ${photoActive === index ? 'config-gallery-thumb-active' : ''}`}
              >
                <img
                  src={`http://localhost:3000${photo.name}`}
                  alt={photo.alt || `Photo ${index + 1}`}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Navigation étapes */}
      <div className="config-steps-nav">
        {etapes.map((etape) => (
          <button
            key={etape.num}
            onClick={() => setEtapeActive(etape.num)}
            className={`config-step-btn ${etapeActive === etape.num ? 'config-step-active' : ''}`}
          >
            <span className="config-step-num">{etape.num}</span>
            <span className="config-step-titre">{etape.titre}</span>
          </button>
        ))}
      </div>

      {/* Contenu des étapes */}
      <div className="config-steps-content">
        {/* Étape 1: Couleur extérieure */}
        {etapeActive === 1 && (
          <div className="config-step">
            <h2 className="config-step-title">Choisissez votre couleur extérieure</h2>
            <div className="config-colors-grid">
              {couleursExt.map((couleur) => (
                <button
                  key={couleur._id}
                  onClick={() => handleCouleurExtChange(couleur)}
                  className={`config-color-card ${config.couleur_exterieur?._id === couleur._id ? 'config-color-selected' : ''
                    }`}
                >
                  {couleur.photo_couleur ? (
                    <img
                      src={`http://localhost:3000${couleur.photo_couleur}`}
                      alt={couleur.nom_couleur}
                      className="config-color-image"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                  ) : null}
                  <div
                    className="config-color-swatch"
                    style={{
                      backgroundColor: couleur.code_hex || '#ccc',
                      display: couleur.photo_couleur ? 'none' : 'block'
                    }}
                  />
                  <div className="config-color-info">
                    <span className="config-color-name">{couleur.nom_couleur}</span>
                    {couleur.prix > 0 && (
                      <span className="config-color-price">+{formatPrice(couleur.prix)}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Étape 2: Couleur intérieure */}
        {etapeActive === 2 && (
          <div className="config-step">
            <h2 className="config-step-title">🪑 Choisissez votre couleur intérieure</h2>
            <p className="config-step-hint">Sélection multiple possible</p>
            <div className="config-colors-grid">
              {couleursInt.map((couleur) => (
                <button
                  key={couleur._id}
                  onClick={() => handleCouleurIntChange(couleur)}
                  className={`config-color-card ${config.couleur_interieur.some((c) => c._id === couleur._id) ? 'config-color-selected' : ''
                    }`}
                >
                  {couleur.photo_couleur ? (
                    <img
                      src={`http://localhost:3000${couleur.photo_couleur}`}
                      alt={couleur.nom_couleur}
                      className="config-color-image"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'block';
                      }}
                    />
                  ) : null}
                  <div
                    className="config-color-swatch"
                    style={{
                      backgroundColor: couleur.code_hex || '#ccc',
                      display: couleur.photo_couleur ? 'none' : 'block'
                    }}
                  />
                  <div className="config-color-info">
                    <span className="config-color-name">{couleur.nom_couleur}</span>
                    {couleur.prix > 0 && (
                      <span className="config-color-price">+{formatPrice(couleur.prix)}</span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Étape 3: Jantes */}
        {etapeActive === 3 && (
          <div className="config-step">
            <h2 className="config-step-title">Choisissez vos jantes</h2>
            <div className="config-options-grid">
              {jantes.map((jante) => (
                <button
                  key={jante._id}
                  onClick={() => setConfig({ ...config, taille_jante: jante })}
                  className={`config-option-card ${config.taille_jante?._id === jante._id ? 'config-option-selected' : ''
                    }`}
                >
                  <h3 className="config-option-name">{jante.taille_jante}"</h3>
                  {jante.couleur_jante && (
                    <p className="config-option-desc">{jante.couleur_jante}</p>
                  )}
                  {jante.prix > 0 && (
                    <p className="config-option-price">+{formatPrice(jante.prix)}</p>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Étape 4: Sièges */}
        {etapeActive === 4 && (
          <div className="config-step">
            <h2 className="config-step-title">Choisissez vos sièges</h2>
            <div className="config-options-grid">
              {sieges.map((siege) => (
                <button
                  key={siege._id}
                  onClick={() => setConfig({ ...config, siege })}
                  className={`config-option-card ${config.siege?._id === siege._id ? 'config-option-selected' : ''
                    }`}
                >
                  <h3 className="config-option-name">{siege.nom_siege}</h3>
                  {siege.prix > 0 && (
                    <p className="config-option-price">+{formatPrice(siege.prix)}</p>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Étape 5: Packages */}
        {etapeActive === 5 && (
          <div className="config-step">
            <h2 className="config-step-title">Choisissez vos packages</h2>
            <div className="config-options-grid">
              {packages.map((pkg) => (
                <button
                  key={pkg._id}
                  onClick={() => setConfig({ ...config, package: pkg })}
                  className={`config-option-card ${config.package?._id === pkg._id ? 'config-option-selected' : ''
                    }`}
                >
                  <h3 className="config-option-name">{pkg.nom_package}</h3>
                  {pkg.description && (
                    <p className="config-option-desc">{pkg.description}</p>
                  )}
                  {pkg.prix > 0 && (
                    <p className="config-option-price">+{formatPrice(pkg.prix)}</p>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Étape 6: Résumé */}
        {etapeActive === 6 && (
          <div className="config-step">
            <h2 className="config-step-title">Résumé de votre configuration</h2>
            <div className="config-summary-grid">
              <div className="config-summary-card">
                <h3>Variante</h3>
                <p>{variante?.voiture?.nom_model} {variante?.nom_model}</p>
                <p className="config-summary-price">{formatPrice(variante?.prix_base || 0)}</p>
              </div>

              {config.couleur_exterieur && (
                <div className="config-summary-card">
                  <h3>Couleur extérieure</h3>
                  <p>{config.couleur_exterieur.nom_couleur}</p>
                  {config.couleur_exterieur.prix > 0 && (
                    <p className="config-summary-price">+{formatPrice(config.couleur_exterieur.prix)}</p>
                  )}
                </div>
              )}

              {config.couleur_interieur.length > 0 && (
                <div className="config-summary-card">
                  <h3>Couleur intérieure</h3>
                  <p>{config.couleur_interieur.map(c => c.nom_couleur).join(', ')}</p>
                  <p className="config-summary-price">
                    +{formatPrice(config.couleur_interieur.reduce((sum, c) => sum + (c.prix || 0), 0))}
                  </p>
                </div>
              )}

              {config.taille_jante && (
                <div className="config-summary-card">
                  <h3>Jantes</h3>
                  <p>{config.taille_jante.taille_jante}" {config.taille_jante.couleur_jante || ''}</p>
                  {config.taille_jante.prix > 0 && (
                    <p className="config-summary-price">+{formatPrice(config.taille_jante.prix)}</p>
                  )}
                </div>
              )}

              {config.siege && (
                <div className="config-summary-card">
                  <h3>Sièges</h3>
                  <p>{config.siege.nom_siege}</p>
                  {config.siege.prix > 0 && (
                    <p className="config-summary-price">+{formatPrice(config.siege.prix)}</p>
                  )}
                </div>
              )}

              {config.package && (
                <div className="config-summary-card">
                  <h3>Package</h3>
                  <p>{config.package.nom_package}</p>
                  {config.package.prix > 0 && (
                    <p className="config-summary-price">+{formatPrice(config.package.prix)}</p>
                  )}
                </div>
              )}

              <div className="config-summary-card config-summary-total">
                <h3>Prix total T.T.C.</h3>
                <p className="config-summary-price-total">{formatPrice(prixTotal)}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Boutons navigation */}
      <div className="config-actions">
        {etapeActive > 1 && (
          <Button variant="outline" onClick={() => setEtapeActive(etapeActive - 1)} size="lg">
            ← Étape précédente
          </Button>
        )}
        {etapeActive < 6 ? (
          <Button onClick={() => setEtapeActive(etapeActive + 1)} size="lg">
            Étape suivante →
          </Button>
        ) : (
          <Button onClick={handleAddToCart} size="lg">
            Ajouter au panier - {formatPrice(prixTotal)}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ConfigurationComplete;

