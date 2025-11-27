// Configurateur de véhicule — sélectionner variante, options et calculer prix/acompte.
// Ce fichier contient la page principale du configurateur :
// - récupération des variantes et options
// - gestion des sélections utilisateur
// - calcul du prix total et de l'acompte
// - affichage des photos et des modales
import Button from "../components/common/Button.jsx"; // composant bouton générique
import buildUrl from "../utils/buildUrl"; // construit URL complètes pour les assets
import buildImageUrl from "../utils/buildImageUrl"; // wrapper pour images (CDN/local)
import ContactModal from "../components/modals/ContactModal.jsx"; // modal de contact
import commandeService from "../services/commande.service.js"; // service pour le panier / commandes
import Loading from "../components/common/Loading.jsx"; // écran de loading
import LoginPromptModal from "../components/modals/LoginPromptModal.jsx"; // modal invitant à se connecter
import ImageWithFallback from "../components/common/ImageWithFallback.jsx"; // image robuste avec fallback
import modelPorscheService from "../services/modelPorsche.service.js"; // service pour modèles/variantes
import personnalisationService from "../services/personnalisation.service.js"; // service options (couleurs, jantes, ...)
import { AuthContext } from "../context/AuthContext.jsx"; // contexte d'authentification
import { formatPrice } from "../utils/helpers.js"; // formatage des prix
import { debug } from "../utils/logger.js"; // logger pour dev
import { useState, useEffect, useContext, useCallback, useMemo, useRef, useId } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import "../css/components/Message.css"; // styles messages
import "../css/Configurateur.css"; // styles page configurateur

// OptionSection: en-tête réutilisable pour chaque groupe d'options
// Amélioration accessibilité : aria-expanded / aria-controls + type="button"
const OptionSection = ({ title, isOpen = false, onToggle = () => { }, children }) => {
  const id = useId();
  const contentId = `option-section-content-${id}`;

  return (
    <div className="configurateur-option-section">
      <button
        className="configurateur-option-section-header"
        onClick={onToggle}
        aria-expanded={isOpen}
        aria-controls={contentId}
        type="button"
      >
        <span className="configurateur-option-section-title">{title}</span>
        <svg className={`configurateur-option-section-icon ${isOpen ? "open" : ""}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
      </button>

      {isOpen && (
        <div id={contentId} className="configurateur-option-section-content">
          {children}
        </div>
      )}
    </div>
  );
};

// ColorItem: rendu d'une couleur (swatch ou image)
const ColorItem = ({ couleur, selected, onSelect }) => (
  <button key={couleur._id} onClick={() => onSelect(couleur)} className={`configurateur-color-item ${selected ? "selected" : ""}`}>
    {couleur.photo_couleur ? (
      <img src={buildUrl(couleur.photo_couleur)} alt={couleur.nom_couleur} className="configurateur-color-item-image" />
    ) : (
      <div className="configurateur-color-item-swatch" style={{ backgroundColor: couleur.code_hex || "#ccc" }} />
    )}
    <div className="configurateur-color-item-info">
      <span className="configurateur-color-item-name">{couleur.nom_couleur}</span>
      {couleur.prix > 0 && <span className="configurateur-color-item-price">+{formatPrice(couleur.prix)}</span>}
    </div>
  </button>
);

// JanteItem: rendu d'une jante
const JanteItem = ({ jante, selected, onSelect }) => {
  const imageUrl = buildImageUrl(jante.photo_jante);
  return (
    <button key={jante._id} onClick={() => onSelect(jante)} className={`configurateur-jante-item ${selected ? "selected" : ""}`} aria-pressed={selected} aria-label={`Jante ${jante.taille_jante} pouces`}>
      {imageUrl && <div className="configurateur-jante-image"><img src={imageUrl} alt={`Jante ${jante.taille_jante}"`} /></div>}
      <div className="configurateur-jante-info"><span className="configurateur-jante-size">{jante.taille_jante}"</span>{jante.prix > 0 && <span className="configurateur-jante-price">+{formatPrice(jante.prix)}</span>}</div>
    </button>
  );
};

// SiegeItem: rendu d'un siège
const SiegeItem = ({ siege, selected, onSelect }) => {
  const imageUrl = buildImageUrl(siege.photo_siege);
  return (
    <button key={siege._id} onClick={() => onSelect(siege)} className={`configurateur-siege-item ${selected ? "selected" : ""}`} aria-pressed={selected} aria-label={`Sélectionner siège ${siege.nom_siege}`}>
      {imageUrl && <div className="configurateur-siege-image"><img src={imageUrl} alt={siege.nom_siege} /></div>}
      <div className="configurateur-siege-info"><span className="configurateur-siege-name">{siege.nom_siege}</span>{siege.prix > 0 && <span className="configurateur-siege-price">+{formatPrice(siege.prix)}</span>}</div>
    </button>
  );
};

// PackageItem: rendu d'un package
const PackageItem = ({ pkg, selected, onSelect }) => {
  const imageUrl = buildImageUrl(pkg.photo_package) || (typeof pkg.photo_package === 'string' ? buildUrl(pkg.photo_package) : null);
  return (
    <button key={pkg._id} onClick={() => onSelect(pkg)} className={`configurateur-package-item ${selected ? "selected" : ""} ${imageUrl ? 'has-image' : ''}`} aria-pressed={selected} aria-label={`Sélectionner le package ${pkg.nom_package}`}>
      <div className="configurateur-package-image">{imageUrl ? <ImageWithFallback src={imageUrl} alt={pkg.nom_package} imgProps={{ style: { width: '100%', height: '100%', objectFit: 'cover' } }} placeholder={null} /> : <div className="configurateur-package-placeholder"><svg width="50" height="50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg></div>}</div>
      <div className="configurateur-package-info"><span className="configurateur-package-name">{pkg.nom_package}</span>{pkg.description && <p className="configurateur-package-description">{pkg.description}</p>}{pkg.prix > 0 && <span className="configurateur-package-price">+{formatPrice(pkg.prix)}</span>}</div>
    </button>
  );
};

// Composant principal du configurateur
const Configurateur = () => {
  // Paramètres d'URL : `voitureId` (optionnel) et `varianteId` (optionnel)
  const { voitureId, varianteId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // Récupère la fonction d'auth depuis le contexte
  const { isAuthenticated } = useContext(AuthContext);

  // États d'UI généraux
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Stocke le `voitureId` en cours — parfois déduit depuis la variante
  const [voitureIdActuel, setVoitureIdActuel] = useState(voitureId);

  // Données récupérées depuis l'API
  const [variantes, setVariantes] = useState([]);
  const [couleursExt, setCouleursExt] = useState([]);
  const [couleursInt, setCouleursInt] = useState([]);
  const [jantes, setJantes] = useState([]);
  const [sieges, setSieges] = useState([]);
  const [packages, setPackages] = useState([]);
  const [packagesFiltres, setPackagesFiltres] = useState([]);

  // Configuration sélectionnée par l'utilisateur
  const [config, setConfig] = useState({
    variante: null,
    couleur_exterieur: null,
    couleur_interieur: null, // sélection unique
    taille_jante: null,
    siege: null,
    package: null,
  });

  // Calculs financiers et états d'action
  const [prixTotal, setPrixTotal] = useState(0);
  const [acompte, setAcompte] = useState(0);
  const [ajoutEnCours, setAjoutEnCours] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);

  // UI : photo active et sections ouvertes dans le panneau
  const [photoActive, setPhotoActive] = useState(0);
  const [sectionsOuvertes, setSectionsOuvertes] = useState({
    couleursExt: false,
    jantes: false,
    couleursInt: true, // ouvert par défaut
    sieges: false,
    packages: true, // ouvert par défaut
  });

  // ------------------ Chargement des options et variantes ------------------
  // À l'initialisation (ou si `voitureId` / `varianteId` change), on charge
  // les variantes et toutes les options de personnalisation en parallèle.
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setLoading(true);
        setError("");

        let voitureIdActuel = voitureId; // valeur locale pour la logique

        // Cas edge : on a une varianteId sans voitureId => récupérer la variante
        // pour en extraire le `voitureId` parent.
        if (!voitureId && varianteId) {
          try {
            const varianteData = await modelPorscheService.getModelById(varianteId);

            if (varianteData?.voiture?._id || varianteData?.voiture) {
              voitureIdActuel = typeof varianteData.voiture === "string" ? varianteData.voiture : varianteData.voiture._id;
              setVoitureIdActuel(voitureIdActuel); // stocker pour la navigation
            } else {
              throw new Error("VoitureId introuvable dans la variante");
            }
          } catch (err) {
            setError("Variante introuvable");
            setLoading(false);
            return;
          }
        } else if (voitureId) {
          setVoitureIdActuel(voitureId);
        }

        if (!voitureIdActuel) {
          setError("ID de voiture manquant");
          setLoading(false);
          return;
        }

        // Récupérer les variantes/configurations pour la voiture
        const responseData = await modelPorscheService.getConfigurationsByVoiture(voitureIdActuel);
        const variantesData = Array.isArray(responseData) ? responseData : responseData?.configurations || [];
        setVariantes(variantesData);

        // Charger en parallèle les listes d'options (performances optimisées)
        const [couleursExtData, couleursIntData, jantesData, siegesData, packagesData] = await Promise.all([
          personnalisationService.getCouleursExterieur(),
          personnalisationService.getCouleursInterieur(),
          personnalisationService.getJantes(),
          personnalisationService.getSieges(),
          personnalisationService.getPackages(),
        ]);

        setCouleursExt(couleursExtData);
        setCouleursInt(couleursIntData);

        // Exemple de nettoyage : filtrer certaines tailles de jantes indésirables
        const jantesFiltrees = Array.isArray(jantesData)
          ? jantesData.filter((jante) => {
            const taille = jante.taille_jante;
            // Exclure la taille 16 quelle que soit sa représentation
            return taille !== 16 && taille !== "16" && String(taille) !== "16";
          })
          : [];

        setJantes(jantesFiltrees);
        setSieges(siegesData);
        setPackages(packagesData);

        // Sélection par défaut : choisir la variante demandée (varianteId)
        // ou la première variante disponible
        if (variantesData.length > 0) {
          let varianteSelectionnee = null;
          if (varianteId) varianteSelectionnee = variantesData.find((v) => v._id === varianteId);
          if (!varianteSelectionnee) varianteSelectionnee = variantesData[0];
          setConfig((prev) => ({ ...prev, variante: varianteSelectionnee }));
        }
      } catch (err) {
        setError(err.message || "Erreur lors du chargement des options");
      } finally {
        setLoading(false);
      }
    };

    if (voitureId || varianteId) fetchOptions();
    else {
      // Aucun paramètre fourni — arrêt du chargement et message d'erreur
      setLoading(false);
      setError("Paramètres manquants : voitureId ou varianteId requis");
    }
  }, [voitureId, varianteId]);

  // ------------------ Filtrage des packages selon la variante ------------------
  // Met à jour `packagesFiltres` lorsque la variante ou la liste de packages change.
  useEffect(() => {
    if (config.variante && packages.length > 0) {
      const packagesFiltresParModele = filtrerPackagesParModele(packages, config.variante);
      setPackagesFiltres(packagesFiltresParModele);

      // Si le package sélectionné n'est plus valide pour la variante, on le retire
      if (config.package && !packagesFiltresParModele.find((p) => p._id === config.package._id)) {
        setConfig((prev) => ({ ...prev, package: null }));
      }
    } else {
      setPackagesFiltres([]);
    }
  }, [config.variante, packages, config.package]);

  // ------------------ Calcul du prix total et de l'acompte ------------------
  useEffect(() => {
    let total = 0;
    if (config.variante) total += config.variante.prix_base || 0;
    if (config.couleur_exterieur) total += config.couleur_exterieur.prix || 0;
    if (config.couleur_interieur) total += config.couleur_interieur.prix || 0;
    if (config.taille_jante) total += config.taille_jante.prix || 0;
    if (config.siege) total += config.siege.prix || 0;
    if (config.package) total += config.package.prix || 0;

    setPrixTotal(total);
    // Acompte simple : 20% arrondi
    setAcompte(Math.round(total * 0.2));
  }, [config]);

  // ------------------ Photos : utilitaires et filtrage ------------------
  // Récupère le tableau de photos depuis la variante (si disponible)
  const getPhotosVariante = useCallback(() => (Array.isArray(config.variante?.photo_porsche) ? config.variante.photo_porsche : []), [config.variante]);

  // Trouve l'index d'une photo correspondant à une couleur extérieure/intérieure
  // On ignore les deux premières photos (indices 0 et 1) et les images marquées id_0/id_1
  const findPhotoIndexByCouleur = useCallback(
    (couleur, type) => {
      if (!couleur?._id || !type) {
        if (import.meta.env.DEV) debug("findPhotoIndexByCouleur: couleur ou type manquant");
        return null;
      }
      if (!["exterieur", "interieur"].includes(type)) {
        if (import.meta.env.DEV) debug("findPhotoIndexByCouleur: type invalide", type);
        return null;
      }

      const photos = getPhotosVariante();
      if (!Array.isArray(photos) || photos.length === 0) {
        if (import.meta.env.DEV) debug("findPhotoIndexByCouleur: pas de photos disponibles");
        return null;
      }

      const visiblePhotosWithIndex = photos
        .map((photo, originalIndex) => ({ photo, originalIndex }))
        .filter(({ photo, originalIndex }) => {
          const id = photo._id || photo.id || "";
          const name = photo.name || "";
          return originalIndex >= 2 && !(id === "id_0" || id === "id_1" || name.includes("id_0") || name.includes("id_1"));
        });

      if (import.meta.env.DEV) debug("visiblePhotosWithIndex length:", visiblePhotosWithIndex.length);

      const fieldName = type === "exterieur" ? "couleur_exterieur" : "couleur_interieur";
      const foundIndex = visiblePhotosWithIndex.findIndex(({ photo }) => {
        const photoCouleurId = photo[fieldName]?._id || photo[fieldName];
        if (import.meta.env.DEV) debug("findPhotoIndexByCouleur: check photoCouleurId", photoCouleurId);
        return photoCouleurId && photoCouleurId.toString() === couleur._id.toString();
      });

      if (import.meta.env.DEV) debug("findPhotoIndexByCouleur: foundIndex", foundIndex);
      return foundIndex >= 0 ? foundIndex : null;
    },
    [getPhotosVariante],
  );

  // Handlers pour les changements de couleurs (exterieur/interieur)
  const handleCouleurExtChange = useCallback(
    (couleur) => {
      setConfig((prev) => ({ ...prev, couleur_exterieur: couleur }));
      const photoIndex = findPhotoIndexByCouleur(couleur, "exterieur");
      if (photoIndex !== null) setPhotoActive(photoIndex);
      if (import.meta.env.DEV) debug("handleCouleurExtChange: photoIndex", photoIndex);
    },
    [findPhotoIndexByCouleur],
  );

  const handleCouleurIntChange = useCallback(
    (couleur) => {
      setConfig((prev) => ({ ...prev, couleur_interieur: couleur }));
      const photoIndex = findPhotoIndexByCouleur(couleur, "interieur");
      if (photoIndex !== null) setPhotoActive(photoIndex);
      if (import.meta.env.DEV) debug("handleCouleurIntChange: photoIndex", photoIndex);
    },
    [findPhotoIndexByCouleur],
  );

  // Navigation pour changer le modèle (retour à la liste des variantes)
  const handleChangerModele = () => {
    const idVoiture = voitureIdActuel || voitureId;
    if (!idVoiture) {
      if (import.meta.env.DEV) debug("handleChangerModele: idVoiture manquant");
      navigate("/choix-voiture");
      return;
    }
    const typeVoiture = config.variante?.voiture?.type_voiture === false ? "occasion" : "neuve";
    const targetRoute = `/variantes/${typeVoiture}/${idVoiture}`;
    if (import.meta.env.DEV) debug("handleChangerModele: navigation vers", targetRoute);
    navigate(targetRoute);
  };

  // Basculer l'ouverture d'une section (couleurs, jantes, ...)
  const toggleSection = (section) => setSectionsOuvertes((prev) => ({ ...prev, [section]: !prev[section] }));

  // Filtrage des photos visibles (exclut indices 0 et 1 et id_0/id_1)
  const visiblePhotos = useMemo(() => {
    const photos = getPhotosVariante();
    if (!Array.isArray(photos)) return [];
    return photos.filter((p, index) => {
      const id = p._id || p.id || "";
      const name = p.name || "";
      return index >= 2 && !(id === "id_0" || id === "id_1" || name.includes("id_0") || name.includes("id_1"));
    });
  }, [getPhotosVariante]);

  // Veille à ce que `photoActive` soit toujours dans les bornes valides
  useEffect(() => {
    setPhotoActive((prev) => (prev >= visiblePhotos.length ? 0 : prev));
  }, [visiblePhotos.length]);

  // Référence pour stocker un timeout de redirection (nettoyage à la désactivation)
  const redirectRef = useRef(null);
  useEffect(() => () => { if (redirectRef.current) clearTimeout(redirectRef.current); }, []);

  const filtrerPackagesParModele = (packages, variante) => {
    if (!variante || !Array.isArray(packages)) {
      if (import.meta.env.DEV) debug("filtrerPackagesParModele: variante ou packages invalides");
      return [];
    }

    // Normaliser le nom du modèle pour appliquer des règles
    const nomModel = (variante.nom_model || "").trim().toUpperCase();
    let modeleBase;
    if (nomModel.includes("GT3") || nomModel.includes("GT2") || nomModel.includes("TURBO") || nomModel.includes("CARRERA") || nomModel.includes("TARGA") || nomModel.includes("911")) modeleBase = "911";
    else if (nomModel.includes("CAYMAN") || nomModel.includes("GT4")) modeleBase = "CAYMAN";
    else if (nomModel.includes("CAYENNE")) modeleBase = "CAYENNE";
    else modeleBase = nomModel.split(" ")[0];

    const packagesFiltres = packages.filter((pkg) => {
      const nomPackage = (pkg.nom_package || "").trim();
      // Sport Chrono disponible pour tous
      if (nomPackage.includes("Sport Chrono") || nomPackage.includes("sport chrono")) return true;
      // Weissach réservé à certains modèles
      if (nomPackage.includes("Weissach") || nomPackage.includes("weissach")) {
        const modelesAutorises = ["911", "CAYMAN"];
        return modelesAutorises.includes(modeleBase);
      }
      return true;
    });

    return packagesFiltres;
  };

  // Handlers simples pour jantes, sièges et packages
  const handleJanteChange = useCallback((jante) => setConfig((prev) => ({ ...prev, taille_jante: jante })), []);
  const handleSiegeChange = useCallback((siege) => setConfig((prev) => ({ ...prev, siege })), []);
  const _handlePackageChange = useCallback((pkg) => setConfig((prev) => ({ ...prev, package: pkg })), []);

  const handleAcheter = async () => {
    if (!isAuthenticated()) { setShowLoginPrompt(true); return; }
    if (!config.variante) { setError("Veuillez sélectionner une variante"); return; }

    try {
      setAjoutEnCours(true);
      setError("");
      const modelPorscheId = config.variante._id; // id de la variante
      await commandeService.ajouterVoitureNeuveAuPanier(modelPorscheId);
      setSuccess("Configuration ajoutée au panier avec succès !");
      redirectRef.current = setTimeout(() => navigate("/panier"), 1500);
    } catch (err) {
      setError(err.message || "Erreur lors de l'ajout au panier");
    } finally {
      setAjoutEnCours(false);
    }
  };

  if (loading) return <Loading fullScreen message="Chargement du configurateur..." />;

  // Si erreur critique et pas de variantes : proposer un retour au catalogue
  if (error && variantes.length === 0) {
    return (
      <div className="error-container">
        <div className="message-box message-error"><p>{error}</p></div>
        <Button onClick={() => navigate("/choix-voiture")}>Retour au catalogue</Button>
      </div>
    );
  }

  // Nom et année affichés pour l'en-tête
  const nomModel = config.variante?.nom_model || config.variante?.voiture?.nom_model || "911 GT3";
  const annee = new Date().getFullYear() + 1; // année commerciale du modèle

  return (
    <div className="configurateur-container">
      {/* Messages */}
      {success && <div className="message-box message-success"><p>{success}</p></div>}
      {error && !success && <div className="message-box message-error"><p>{error}</p></div>}

      {/* Header avec navigation et affichage du prix courant */}
      <header className="configurateur-top-header">
        <div className="configurateur-header-left">
          <button className="configurateur-header-link" onClick={handleChangerModele}>Changer de modèle</button>
        </div>

        <div className="configurateur-header-center">
          <ImageWithFallback
            src={'/Logo/Logo_Porsche.png'}
            alt="Porsche"
            imgClass="configurateur-header-logo"
            imgProps={{ onError: (e) => { try { e.currentTarget.src = "/Logo/Logo_red.svg.png"; } catch (err) { } } }}
            placeholder={null}
          />
        </div>

        <div className="configurateur-header-right">
          <div className="configurateur-header-price-group">
            <div className="configurateur-header-price-item">
              <span className="configurateur-header-price-label">Prix de base</span>
              <span className="configurateur-header-price-total">{formatPrice(prixTotal)}</span>
              <button className="configurateur-header-info-icon" title="Informations" />
            </div>
          </div>
        </div>
      </header>

      {/* Contenu principal: visuel (gauche) + panneau d'options (droite) */}
      <div className="configurateur-main-content">
        {/* Zone visuelle */}
        <div className="configurateur-visual-area">
          <div className="configurateur-visual-main">
            <ImageWithFallback
              src={visiblePhotos.length > 0 ? buildUrl(visiblePhotos[photoActive]?.name) : null}
              alt={nomModel}
              imgClass="configurateur-main-image"
              placeholder={<div className="configurateur-visual-placeholder"><span className="configurateur-visual-letter">{nomModel?.charAt(0) || "?"}</span></div>}
            />
          </div>

          {/* Miniatures */}
          {visiblePhotos.length > 1 && (
            <div className="configurateur-thumbnails">
              {visiblePhotos.map((photo, index) => (
                <button key={photo._id || `photo-${index}`} onClick={() => setPhotoActive(index)} className={`configurateur-thumbnail ${photoActive === index ? "configurateur-thumbnail-active" : ""}`}>
                  <ImageWithFallback src={photo && photo.name ? buildUrl(photo.name) : null} alt={`Vue ${index + 1}`} imgProps={{ style: { width: '100%', height: 'auto' } }} placeholder={<div className="configurateur-thumb-missing" />} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Panneau d'options */}
        <div className="configurateur-options-panel">
          <div className="configurateur-panel-header">
            <h2 className="configurateur-panel-title">Porsche {nomModel}</h2>
            <span className="configurateur-panel-year">{annee}</span>
          </div>

          {/* Couleurs extérieures */}
          {couleursExt.length > 0 && (
            <OptionSection title="Couleurs Extérieures" isOpen={sectionsOuvertes.couleursExt} onToggle={() => toggleSection("couleursExt")}>
              <div className="configurateur-colors-list">
                {couleursExt.map((couleur) => (
                  <ColorItem
                    key={couleur._id}
                    couleur={couleur}
                    selected={config.couleur_exterieur?._id === couleur._id}
                    onSelect={handleCouleurExtChange}
                  />
                ))}
              </div>
            </OptionSection>
          )}

          {/* Jantes */}
          {jantes.length > 0 && (
            <OptionSection title="Jantes" isOpen={sectionsOuvertes.jantes} onToggle={() => toggleSection("jantes")}>
              <div className="configurateur-jantes-list">
                {jantes.map((jante) => (
                  <JanteItem
                    key={jante._id}
                    jante={jante}
                    selected={config.taille_jante?._id === jante._id}
                    onSelect={handleJanteChange}
                  />
                ))}
              </div>
            </OptionSection>
          )}

          {/* Couleurs intérieures */}
          {couleursInt.length > 0 && (
            <OptionSection title="Couleurs Intérieures" isOpen={sectionsOuvertes.couleursInt} onToggle={() => toggleSection("couleursInt")}>
              <div className="configurateur-colors-list">
                {couleursInt.map((couleur) => (
                  <ColorItem
                    key={couleur._id}
                    couleur={couleur}
                    selected={config.couleur_interieur?._id === couleur._id}
                    onSelect={handleCouleurIntChange}
                  />
                ))}
              </div>
            </OptionSection>
          )}

          {/* Sièges */}
          {sieges.length > 0 && (
            <OptionSection title="Sièges" isOpen={sectionsOuvertes.sieges} onToggle={() => toggleSection("sieges")}>
              <div className="configurateur-sieges-list">
                {sieges.map((siege) => (
                  <SiegeItem
                    key={siege._id}
                    siege={siege}
                    selected={config.siege?._id === siege._id}
                    onSelect={handleSiegeChange}
                  />
                ))}
              </div>
            </OptionSection>
          )}

          {/* Packages filtrés selon le modèle */}
          {packagesFiltres.length > 0 && (
            <OptionSection title="Packages" isOpen={sectionsOuvertes.packages} onToggle={() => toggleSection("packages")}>
              <div className="configurateur-packages-list">
                {packagesFiltres.map((pkg) => (
                  <PackageItem key={pkg._id} pkg={pkg} selected={config.package?._id === pkg._id} onSelect={_handlePackageChange} />
                ))}
              </div>
            </OptionSection>
          )}

          {/* Bas: acompte, reste à payer, contact et acheter */}
          <div className="configurateur-actions">
            <div className="configurateur-actions-info">
              <div className="configurateur-acompte-info"><span className="configurateur-acompte-label">Acompte à régler maintenant :</span><span className="configurateur-acompte-montant">{formatPrice(acompte)}</span></div>
              <div className="configurateur-reste-info"><span className="configurateur-reste-label">À payer à la livraison :</span><span className="configurateur-reste-montant">{formatPrice(prixTotal - acompte)}</span></div>
            </div>
            <div className="configurateur-actions-buttons">
              <button className="configurateur-btn-contact" onClick={() => setShowContactModal(true)}>Nous contacter</button>
              <button className="configurateur-btn-acheter" onClick={handleAcheter} disabled={ajoutEnCours || !config.variante}>{ajoutEnCours ? "Ajout en cours..." : "Acheter"}</button>
            </div>
          </div>
        </div>
      </div>

      {/* Modales: login prompt et formulaire contact */}
      {showLoginPrompt && <LoginPromptModal onClose={() => setShowLoginPrompt(false)} onLogin={() => navigate("/login", { state: { from: location.pathname } })} initialPath={location.pathname} />}

      {showContactModal && (
        <ContactModal onClose={() => setShowContactModal(false)} vehiculeInfo={config.variante ? { nom_model: config.variante.nom_model, variante: config.variante.type_carrosserie, prix: formatPrice(prixTotal) } : null} />
      )}
    </div>
  );
};

export default Configurateur;
