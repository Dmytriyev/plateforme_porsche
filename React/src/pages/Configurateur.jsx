import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { modelPorscheService, personnalisationService } from '../services';
import { usePanier } from '../hooks/usePanier.jsx';
import { Loading, Button, Alert } from '../components/common';
import ContactButton from '../components/ContactButton.jsx';
import { formatPrice, formatPriceMonthly } from '../utils/format.js';
import './Configurateur.css';
import { API_URL } from '../config/api.jsx';
import buildUrl from '../utils/buildUrl';

const Configurateur = () => {
  const { voitureId } = useParams();
  const navigate = useNavigate();
  const { ajouterArticle } = usePanier();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Données disponibles
  const [variantes, setVariantes] = useState([]);
  const [couleursExt, setCouleursExt] = useState([]);
  const [couleursInt, setCouleursInt] = useState([]);
  const [jantes, setJantes] = useState([]);
  const [sieges, setSieges] = useState([]);
  const [_packages, setPackages] = useState([]);

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
  const [prixMensuel, setPrixMensuel] = useState(0);

  // États pour l'interface
  const [photoActive, setPhotoActive] = useState(0);
  const [sectionsOuvertes, setSectionsOuvertes] = useState({
    couleursExt: false,
    jantes: false,
    couleursInt: true, // Ouvert par défaut
    sieges: false,
    packages: false,
  });
  const [recherche, setRecherche] = useState('');

  // Charger les options disponibles
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoading(true);
        setError('');

        const variantesData = await modelPorscheService.getConfigurationsByVoiture(voitureId);
        setVariantes(Array.isArray(variantesData) ? variantesData : []);

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

        // Sélectionner la première variante par défaut
        if (variantesData.length > 0) {
          setConfig((prev) => ({ ...prev, variante: variantesData[0] }));
        }
      } catch (err) {
        setError('Erreur lors du chargement des options');
      } finally {
        setLoading(false);
      }
    };

    if (voitureId) {
      fetchOptions();
    }
  }, [voitureId]);

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
    // Calcul du prix mensuel (exemple : 80 mois à 0%)
    // Éviter la division par zéro
    setPrixMensuel(total > 0 ? total / 80 : 0);
  }, [config]);

  const _handleVarianteChange = (variante) => navigate(`/configuration/${variante._id}`);

  const handleCouleurExtChange = (couleur) => {
    setConfig({ ...config, couleur_exterieur: couleur });
  };

  const handleCouleurIntChange = (couleur) => {
    setConfig({ ...config, couleur_interieur: couleur });
  };

  const toggleSection = (section) => setSectionsOuvertes((prev) => ({ ...prev, [section]: !prev[section] }));

  const getPhotosVariante = () => (Array.isArray(config.variante?.photo_porsche) ? config.variante.photo_porsche : []);

  const handleJanteChange = (jante) => {
    setConfig({ ...config, taille_jante: jante });
  };

  const handleSiegeChange = (siege) => {
    setConfig({ ...config, siege });
  };

  const _handlePackageChange = (pkg) => {
    setConfig({ ...config, package: pkg });
  };

  const _handleAddToCart = () => {
    if (!config.variante) {
      setError('Veuillez sélectionner une variante');
      return;
    }

    // Ajouter la configuration au panier
    ajouterArticle({
      id: `config-${Date.now()}`,
      nom: `${config.variante.nom_model} - Configuration personnalisée`,
      prix: prixTotal,
      type: 'configuration',
      quantite: 1,
      configuration: config,
    });

    setSuccess('Configuration ajoutée au panier !');
    setTimeout(() => {
      navigate('/panier');
    }, 1500);
  };

  if (loading) {
    return <Loading fullScreen message="Chargement du configurateur..." />;
  }

  if (error && variantes.length === 0) {
    return (
      <div className="error-container">
        <Alert type="error">{error}</Alert>
        <Button onClick={() => navigate('/voitures')}>Retour au catalogue</Button>
      </div>
    );
  }

  const photos = getPhotosVariante();
  const nomModel = config.variante?.nom_model || config.variante?.voiture?.nom_model || '911 GT3';
  const annee = new Date().getFullYear() + 1; // Année du modèle

  return (
    <div className="configurateur-container">
      {success && <Alert type="success">{success}</Alert>}
      {error && !success && <Alert type="error">{error}</Alert>}

      {/* Header avec navigation et prix */}
      <header className="configurateur-top-header">
        <div className="configurateur-header-left">
          <button className="configurateur-header-link" onClick={() => navigate('/voitures')}>
            Changer de modèle
          </button>
          <button className="configurateur-header-link" onClick={() => { }}>
            Sauvegarder
          </button>
          <button className="configurateur-header-link" onClick={() => { }}>
            Créer un code Porsche
          </button>
        </div>

        <div className="configurateur-header-center">
          <div className="configurateur-header-price-group">
            <div className="configurateur-header-price-item">
              <span className="configurateur-header-price-amount">
                {formatPriceMonthly(prixMensuel)} /mois
              </span>
              <button className="configurateur-header-info-icon" title="Informations">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M8 6V8M8 10H8.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <button className="configurateur-header-link-small">Calculer la mensualité</button>
          </div>

          <div className="configurateur-header-price-group">
            <div className="configurateur-header-price-item">
              <span className="configurateur-header-price-total">{formatPrice(prixTotal)}</span>
              <button className="configurateur-header-info-icon" title="Informations">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M8 6V8M8 10H8.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <span className="configurateur-header-price-label">incluant TVA</span>
          </div>
        </div>

        <div className="configurateur-header-right">
          <Button variant="outline" onClick={() => { }}>
            Aperçu
          </Button>
          <ContactButton
            vehiculeId={config.variante?._id}
            typeVehicule="neuf"
            variant="primary"
          />
        </div>
      </header>

      {/* Contenu principal */}
      <div className="configurateur-main-content">

        {/* Zone de visualisation (gauche) */}
        <div className="configurateur-visual-area">
          <div className="configurateur-visual-main">
            {/* Bouton plein écran */}
            <button className="configurateur-fullscreen-btn" title="Plein écran">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
              </svg>
            </button>

            {/* Image principale */}
            {photos.length > 0 ? (
              <img
                src={buildUrl(photos[photoActive]?.name)}
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
              style={{ display: photos.length > 0 ? 'none' : 'flex' }}
            >
              <span className="configurateur-visual-letter">
                {nomModel?.charAt(0) || '?'}
              </span>
            </div>

            {/* Bouton vue 360° */}
            <button className="configurateur-360-btn">
              Ouvrir la vue à 360
            </button>
          </div>

          {/* Contrôles au-dessus des miniatures */}
          <div className="configurateur-visual-controls">
            <button className="configurateur-control-btn" title="Photos">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </button>
            <button className="configurateur-control-btn" title="Vue nuit">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            </button>
            <button className="configurateur-control-btn" title="Caméra">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="13" r="4" />
              </svg>
            </button>
          </div>

          {/* Miniatures */}
          {photos.length > 1 && (
            <div className="configurateur-thumbnails">
              {photos.map((photo, index) => (
                <button
                  key={index}
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
            <h2 className="configurateur-panel-title">{nomModel}</h2>
            <span className="configurateur-panel-year">{annee}</span>
          </div>

          <a href="#" className="configurateur-panel-link">
            Données techniques et équipement de série
          </a>

          {/* Barre de recherche */}
          <div className="configurateur-search">
            <svg className="configurateur-search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              name="config_recherche"
              id="config-recherche"
              type="text"
              placeholder="Recherche d'options d'équipement"
              value={recherche}
              onChange={(e) => setRecherche(e.target.value)}
              className="configurateur-search-input"
            />
          </div>

          {/* Section Couleurs Extérieures */}
          {couleursExt.length > 0 && (
            <div className="configurateur-option-section">
              <button
                className="configurateur-option-section-header"
                onClick={() => toggleSection('couleursExt')}
              >
                <span className="configurateur-option-section-title">
                  Couleurs Extérieures <span className="configurateur-option-count">1</span>
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
                  Jantes <span className="configurateur-option-count">1</span>
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
                    {jantes.map((jante) => (
                      <button
                        key={jante._id}
                        onClick={() => handleJanteChange(jante)}
                        className={`configurateur-jante-item ${config.taille_jante?._id === jante._id ? 'selected' : ''
                          }`}
                      >
                        <span className="configurateur-jante-size">{jante.taille_jante}"</span>
                        {jante.prix > 0 && (
                          <span className="configurateur-jante-price">+{formatPrice(jante.prix)}</span>
                        )}
                      </button>
                    ))}
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
                  {/* Standard */}
                  <div className="configurateur-interior-standard">
                    <div className="configurateur-interior-standard-header">
                      <span className="configurateur-interior-standard-label">Standard</span>
                      <span className="configurateur-interior-standard-price">0,00 €</span>
                      <button className="configurateur-header-info-icon" title="Informations">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                          <path d="M8 6V8M8 10H8.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                        </svg>
                      </button>
                    </div>
                    <p className="configurateur-interior-standard-desc">
                      Intérieur en cuir / Race-Tex Noir et en couleur contrastante Argent GT
                    </p>
                    <div className="configurateur-interior-standard-swatch">
                      <div className="configurateur-interior-swatch-item"></div>
                    </div>
                  </div>

                  {/* Cuir */}
                  <div className="configurateur-interior-leather">
                    <span className="configurateur-interior-category">Cuir</span>
                    <div className="configurateur-interior-swatches">
                      {couleursInt.map((couleur) => (
                        <button
                          key={couleur._id}
                          onClick={() => handleCouleurIntChange(couleur)}
                          className={`configurateur-interior-swatch-item ${config.couleur_interieur?._id === couleur._id ? 'selected' : ''
                            }`}
                          title={couleur.nom_couleur}
                        >
                          {couleur.photo_couleur ? (
                            <img
                              src={buildUrl(couleur.photo_couleur)}
                              alt={couleur.nom_couleur}
                            />
                          ) : (
                            <div
                              style={{ backgroundColor: couleur.code_hex || '#ccc' }}
                            />
                          )}
                        </button>
                      ))}
                    </div>
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
                    {sieges.map((siege) => (
                      <button
                        key={siege._id}
                        onClick={() => handleSiegeChange(siege)}
                        className={`configurateur-siege-item ${config.siege?._id === siege._id ? 'selected' : ''
                          }`}
                      >
                        <span className="configurateur-siege-name">{siege.nom_siege}</span>
                        {siege.prix > 0 && (
                          <span className="configurateur-siege-price">+{formatPrice(siege.prix)}</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Configurateur;

