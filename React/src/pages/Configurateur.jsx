import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { modelPorscheService, personnalisationService } from '../services';
import { usePanier } from '../hooks/usePanier.jsx';
import { Loading, Button, Alert, Card } from '../components/common';
import { formatPrice } from '../utils/format.js';
import './Configurateur.css';

/**
 * Page Configurateur - Personnalisation d'une Porsche neuve
 */
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
  const [packages, setPackages] = useState([]);

  // Configuration sélectionnée
  const [config, setConfig] = useState({
    variante: null,
    couleur_exterieur: null,
    couleur_interieur: [],
    taille_jante: null,
    siege: null,
    package: null,
  });

  const [prixTotal, setPrixTotal] = useState(0);

  // Charger les options disponibles
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoading(true);
        setError('');

        // Charger les variantes disponibles pour ce modèle
        const variantesData = await modelPorscheService.getVariantesByModel(voitureId);
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
        setJantes(jantesData);
        setSieges(siegesData);
        setPackages(packagesData);

        // Sélectionner la première variante par défaut
        if (variantesData.length > 0) {
          setConfig((prev) => ({ ...prev, variante: variantesData[0] }));
        }
      } catch (err) {
        setError('Erreur lors du chargement des options');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (voitureId) {
      fetchOptions();
    }
  }, [voitureId]);

  // Calculer le prix total quand la configuration change
  useEffect(() => {
    let total = 0;

    if (config.variante) {
      total += config.variante.prix_base || 0;
    }

    if (config.couleur_exterieur) {
      total += config.couleur_exterieur.prix || 0;
    }

    if (config.couleur_interieur && config.couleur_interieur.length > 0) {
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
  }, [config]);

  const handleVarianteChange = (variante) => {
    // Rediriger vers la page de configuration complète
    navigate(`/configuration/${variante._id}`);
  };

  const handleCouleurExtChange = (couleur) => {
    setConfig({ ...config, couleur_exterieur: couleur });
  };

  const handleCouleurIntChange = (couleur) => {
    // Gérer sélection multiple
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

  const handleJanteChange = (jante) => {
    setConfig({ ...config, taille_jante: jante });
  };

  const handleSiegeChange = (siege) => {
    setConfig({ ...config, siege });
  };

  const handlePackageChange = (pkg) => {
    setConfig({ ...config, package: pkg });
  };

  const handleAddToCart = () => {
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

  return (
    <div className="configurateur-container">
      {success && <Alert type="success">{success}</Alert>}
      {error && !success && <Alert type="error">{error}</Alert>}

      <div className="configurateur-content">
        {/* En-tête */}
        <div className="configurateur-header">
          <div>
            <h1 className="configurateur-title">
              {config.variante?.voiture?.nom_model || 'Configurateur Porsche'}
            </h1>
            <p className="configurateur-subtitle">
              Personnalisez votre Porsche selon vos préférences
            </p>
          </div>

          {/* Prix total */}
          <div className="configurateur-price-summary">
            <p className="configurateur-price-label">Prix total T.T.C.</p>
            <p className="configurateur-price-amount">{formatPrice(prixTotal)}</p>
            <Button size="lg" onClick={handleAddToCart} fullWidth>
              Ajouter au panier
            </Button>
          </div>
        </div>

        {/* Visualisation */}
        <div className="configurateur-visual">
          {config.variante?.photo_porsche && config.variante.photo_porsche.length > 0 ? (
            <img
              src={`http://localhost:3000${config.variante.photo_porsche[0].name}`}
              alt={config.variante.nom_model}
              className="configurateur-visual-image"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : null}
          <div 
            className="configurateur-visual-placeholder"
            style={{ display: config.variante?.photo_porsche && config.variante.photo_porsche.length > 0 ? 'none' : 'flex' }}
          >
            <span className="configurateur-visual-letter">
              {config.variante?.nom_model?.charAt(0) || '?'}
            </span>
          </div>
          <p className="configurateur-visual-caption">
            {config.variante?.nom_model ? `${config.variante.voiture?.nom_model || ''} ${config.variante.nom_model}` : 'Sélectionnez une variante'}
          </p>
        </div>

        {/* Options de configuration */}
        <div className="configurateur-options">
          {/* Variante */}
          {variantes.length > 0 && (
            <div className="configurateur-section">
              <h2 className="configurateur-section-title">1. Choisissez votre variante</h2>
              <div className="configurateur-grid">
                {variantes.map((variante) => (
                  <Card
                    key={variante._id}
                    hover
                    onClick={() => handleVarianteChange(variante)}
                    className={`configurateur-option-card ${
                      config.variante?._id === variante._id ? 'configurateur-option-selected' : ''
                    }`}
                  >
                    <h3 className="configurateur-option-name">{variante.nom_model}</h3>
                    <p className="configurateur-option-desc">{variante.description}</p>
                    {variante.specifications && (
                      <div className="configurateur-option-specs">
                        <span>{variante.specifications.puissance} ch</span>
                        <span>•</span>
                        <span>0-100: {variante.specifications.acceleration_0_100}s</span>
                      </div>
                    )}
                    <p className="configurateur-option-price">{formatPrice(variante.prix_base)}</p>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Couleur extérieure */}
          {couleursExt.length > 0 && (
            <div className="configurateur-section">
              <h2 className="configurateur-section-title">2. Couleur extérieure</h2>
              <div className="configurateur-colors-grid">
                {couleursExt.map((couleur) => (
                  <button
                    key={couleur._id}
                    onClick={() => handleCouleurExtChange(couleur)}
                    className={`configurateur-color-option ${
                      config.couleur_exterieur?._id === couleur._id
                        ? 'configurateur-color-selected'
                        : ''
                    }`}
                    title={couleur.nom_couleur}
                  >
                    {couleur.photo_couleur ? (
                      <img
                        src={`http://localhost:3000${couleur.photo_couleur}`}
                        alt={couleur.nom_couleur}
                        className="configurateur-color-image"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                    ) : null}
                    <div
                      className="configurateur-color-swatch"
                      style={{ 
                        backgroundColor: couleur.code_hex || '#ccc',
                        display: couleur.photo_couleur ? 'none' : 'block'
                      }}
                    />
                    <span className="configurateur-color-name">{couleur.nom_couleur}</span>
                    {couleur.prix > 0 && (
                      <span className="configurateur-color-price">+{formatPrice(couleur.prix)}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Couleur intérieure */}
          {couleursInt.length > 0 && (
            <div className="configurateur-section">
              <h2 className="configurateur-section-title">3. Couleur intérieure</h2>
              <p className="configurateur-section-hint">Sélection multiple possible</p>
              <div className="configurateur-colors-grid">
                {couleursInt.map((couleur) => (
                  <button
                    key={couleur._id}
                    onClick={() => handleCouleurIntChange(couleur)}
                    className={`configurateur-color-option ${
                      config.couleur_interieur.some((c) => c._id === couleur._id)
                        ? 'configurateur-color-selected'
                        : ''
                    }`}
                    title={couleur.nom_couleur}
                  >
                    {couleur.photo_couleur ? (
                      <img
                        src={`http://localhost:3000${couleur.photo_couleur}`}
                        alt={couleur.nom_couleur}
                        className="configurateur-color-image"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'block';
                        }}
                      />
                    ) : null}
                    <div
                      className="configurateur-color-swatch"
                      style={{ 
                        backgroundColor: couleur.code_hex || '#ccc',
                        display: couleur.photo_couleur ? 'none' : 'block'
                      }}
                    />
                    <span className="configurateur-color-name">{couleur.nom_couleur}</span>
                    {couleur.prix > 0 && (
                      <span className="configurateur-color-price">+{formatPrice(couleur.prix)}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Jantes */}
          {jantes.length > 0 && (
            <div className="configurateur-section">
              <h2 className="configurateur-section-title">4. Jantes</h2>
              <div className="configurateur-grid">
                {jantes.map((jante) => (
                  <Card
                    key={jante._id}
                    hover
                    onClick={() => handleJanteChange(jante)}
                    className={`configurateur-option-card ${
                      config.taille_jante?._id === jante._id ? 'configurateur-option-selected' : ''
                    }`}
                  >
                    <h3 className="configurateur-option-name">{jante.taille_jante}"</h3>
                    {jante.couleur_jante && (
                      <p className="configurateur-option-desc">{jante.couleur_jante}</p>
                    )}
                    {jante.prix > 0 && (
                      <p className="configurateur-option-price">+{formatPrice(jante.prix)}</p>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Sièges */}
          {sieges.length > 0 && (
            <div className="configurateur-section">
              <h2 className="configurateur-section-title">5. Sièges</h2>
              <div className="configurateur-grid">
                {sieges.map((siege) => (
                  <Card
                    key={siege._id}
                    hover
                    onClick={() => handleSiegeChange(siege)}
                    className={`configurateur-option-card ${
                      config.siege?._id === siege._id ? 'configurateur-option-selected' : ''
                    }`}
                  >
                    <h3 className="configurateur-option-name">{siege.nom_siege}</h3>
                    {siege.prix > 0 && (
                      <p className="configurateur-option-price">+{formatPrice(siege.prix)}</p>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Packages */}
          {packages.length > 0 && (
            <div className="configurateur-section">
              <h2 className="configurateur-section-title">6. Packages</h2>
              <div className="configurateur-grid">
                {packages.map((pkg) => (
                  <Card
                    key={pkg._id}
                    hover
                    onClick={() => handlePackageChange(pkg)}
                    className={`configurateur-option-card ${
                      config.package?._id === pkg._id ? 'configurateur-option-selected' : ''
                    }`}
                  >
                    <h3 className="configurateur-option-name">{pkg.nom_package}</h3>
                    {pkg.description && (
                      <p className="configurateur-option-desc">{pkg.description}</p>
                    )}
                    {pkg.prix > 0 && (
                      <p className="configurateur-option-price">+{formatPrice(pkg.prix)}</p>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Résumé final */}
        <div className="configurateur-summary">
          <h2 className="configurateur-summary-title">Votre configuration</h2>
          <div className="configurateur-summary-content">
            <div className="configurateur-summary-item">
              <span>Variante</span>
              <span>{config.variante?.nom_model || 'Non sélectionné'}</span>
            </div>
            <div className="configurateur-summary-item">
              <span>Couleur extérieure</span>
              <span>{config.couleur_exterieur?.nom_couleur || 'Non sélectionné'}</span>
            </div>
            <div className="configurateur-summary-item">
              <span>Couleur intérieure</span>
              <span>
                {config.couleur_interieur.length > 0
                  ? config.couleur_interieur.map((c) => c.nom_couleur).join(', ')
                  : 'Non sélectionné'}
              </span>
            </div>
            <div className="configurateur-summary-item">
              <span>Jantes</span>
              <span>{config.taille_jante?.taille_jante ? `${config.taille_jante.taille_jante}"` : 'Non sélectionné'}</span>
            </div>
            <div className="configurateur-summary-item">
              <span>Sièges</span>
              <span>{config.siege?.nom_siege || 'Non sélectionné'}</span>
            </div>
            <div className="configurateur-summary-item">
              <span>Package</span>
              <span>{config.package?.nom_package || 'Non sélectionné'}</span>
            </div>
            <div className="configurateur-summary-item configurateur-summary-total">
              <span>Prix total T.T.C.</span>
              <span>{formatPrice(prixTotal)}</span>
            </div>
          </div>
          <Button size="lg" onClick={handleAddToCart} fullWidth>
            Ajouter au panier
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Configurateur;

