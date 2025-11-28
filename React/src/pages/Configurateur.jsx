// Configurateur de véhicule — sélectionner variante, options et calculer prix/acompte.
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

// en-tête réutilisable pour chaque groupe d'options, aria-expanded / aria-controls + type="button"
const OptionSection = ({ title, isOpen = false, onToggle = () => { }, children }) => {
  // Générer un ID unique pour aria-controls
  const id = useId();
  // ID du contenu associé
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
        {/* Bouton pour ouvrir/fermer la section */}
        <span className="configurateur-option-section-title">{title}</span>
        <svg className={`configurateur-option-section-icon ${isOpen ? "open" : ""}`} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
      </button>
      {/* Contenu de la section, affiché uniquement si ouverte */}
      {isOpen && (
        <div id={contentId} className="configurateur-option-section-content">
          {children}
        </div>
      )}
    </div>
  );
};

// rendu d'une couleur (extérieure ou intérieure)
const ColorItem = ({ couleur, selected, onSelect }) => (
  // Bouton pour sélectionner la couleur
  <button key={couleur._id} onClick={() => onSelect(couleur)} className={`configurateur-color-item ${selected ? "selected" : ""}`}>
    {/* si photo de la couleur disponible, afficher l'image */}
    {couleur.photo_couleur ? (
      <img src={buildUrl(couleur.photo_couleur)} alt={couleur.nom_couleur} className="configurateur-color-item-image" />
    ) : (
      // Sinon, afficher un swatch de couleur basé sur le code hexadécimal
      <div className="configurateur-color-item-swatch" style={{ backgroundColor: couleur.code_hex || "#ccc" }} />
    )}
    <div className="configurateur-color-item-info">
      <span className="configurateur-color-item-name">{couleur.nom_couleur}</span>
      {couleur.prix > 0 && <span className="configurateur-color-item-price">+{formatPrice(couleur.prix)}</span>}
    </div>
  </button>
);

// rendu d'une jante
const JanteItem = ({ jante, selected, onSelect }) => {
  // Construire l'URL de l'image de la jante
  const imageUrl = buildImageUrl(jante.photo_jante);
  return (
    // Bouton pour sélectionner la jante 
    <button key={jante._id} onClick={() => onSelect(jante)} className={`configurateur-jante-item ${selected ? "selected" : ""}`} aria-pressed={selected} aria-label={`Jante ${jante.taille_jante} pouces`}>
      {imageUrl && <div className="configurateur-jante-image"><img src={imageUrl} alt={`Jante ${jante.taille_jante}"`} /></div>}
      <div className="configurateur-jante-info"><span className="configurateur-jante-size">{jante.taille_jante}"</span>{jante.prix > 0 && <span className="configurateur-jante-price">+{formatPrice(jante.prix)}</span>}</div>
    </button>
  );
};

// rendu d'un siège
const SiegeItem = ({ siege, selected, onSelect }) => {
  const imageUrl = buildImageUrl(siege.photo_siege);
  return (
    // Bouton pour sélectionner le siège
    <button key={siege._id} onClick={() => onSelect(siege)} className={`configurateur-siege-item ${selected ? "selected" : ""}`} aria-pressed={selected} aria-label={`Sélectionner siège ${siege.nom_siege}`}>
      {imageUrl && <div className="configurateur-siege-image"><img src={imageUrl} alt={siege.nom_siege} /></div>}
      <div className="configurateur-siege-info"><span className="configurateur-siege-name">{siege.nom_siege}</span>{siege.prix > 0 && <span className="configurateur-siege-price">+{formatPrice(siege.prix)}</span>}</div>
    </button>
  );
};

// rendu d'un package
const PackageItem = ({ pkg, selected, onSelect }) => {
  const imageUrl = buildImageUrl(pkg.photo_package) || (typeof pkg.photo_package === 'string' ? buildUrl(pkg.photo_package) : null);
  return (
    // Bouton pour sélectionner le package
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
  // Hooks de navigation et localisation
  const navigate = useNavigate();
  // Localisation actuelle (URL, état, etc.)
  const location = useLocation();
  // Récupère la fonction d'auth depuis le contexte
  const { isAuthenticated } = useContext(AuthContext);
  // États d'UI généraux et données
  const [loading, setLoading] = useState(true);
  // messages d'erreur
  const [error, setError] = useState("");
  // messages d'erreur/succès
  const [success, setSuccess] = useState("");
  // Stocke le `voitureId` en cours — parfois déduit depuis la variante
  const [voitureIdActuel, setVoitureIdActuel] = useState(voitureId);

  // Données récupérées depuis l'API. Listes d'options et variantes
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

  // photo active et sections ouvertes dans le panneau
  const [photoActive, setPhotoActive] = useState(0);
  // sections ouvertes par défaut (couleurs intérieures et packages)
  const [sectionsOuvertes, setSectionsOuvertes] = useState({
    couleursExt: true,// ouvert par défaut
    jantes: false,
    couleursInt: false,
    sieges: false,
    packages: true, // ouvert par défaut
  });

  // si `voitureId`, `varianteId` change, on charge les variantes et toutes les options de personnalisation en parallèle.
  useEffect(() => {
    // Fonction asynchrone pour charger les options
    const fetchOptions = async () => {
      try {
        setLoading(true);
        setError("");
        // Réinitialiser les messages de succès  valeur locale pour la logique
        let voitureIdActuel = voitureId;

        // on a une varianteId sans voitureId, récupérer la variante pour en extraire le `voitureId` parent.
        if (!voitureId && varianteId) {
          try {
            // Récupérer la variante pour en extraire le `voitureId` parent
            const varianteData = await modelPorscheService.getModelById(varianteId);
            // Vérifier si la variante contient une référence à la voiture (soit objet complet, soit ID)
            if (varianteData?.voiture?._id || varianteData?.voiture) {
              // Extraire l'ID : si `voiture` est une string (ID simple), l'utiliser directementsinon, extraire l'_id de l'objet voiture populé par MongoDB (populate)
              voitureIdActuel = typeof varianteData.voiture === "string" ? varianteData.voiture : varianteData.voiture._id;
              // Stocker l'ID dans le state pour usage ultérieur (navigation, chargement des options, etc.)
              setVoitureIdActuel(voitureIdActuel);
            } else {
              throw new Error("VoitureId introuvable dans la variante");
            }
          } catch (err) {
            // varianteId invalide ou erreur API
            setError("Variante introuvable");
            setLoading(false);
            return;
          }
          // Mettre à jour le state avec le `voitureId` extrait
        } else if (voitureId) {
          setVoitureIdActuel(voitureId);
        }
        // si toujours pas de `voitureId` à ce stade, erreur critique
        if (!voitureIdActuel) {
          setError("ID de voiture manquant");
          setLoading(false);
          return;
        }

        // Récupérer les variantes/configurations pour la voiture
        const responseData = await modelPorscheService.getConfigurationsByVoiture(voitureIdActuel);
        // Supporte deux formats de réponse : tableau direct ou objet avec clé `configurations`
        const variantesData = Array.isArray(responseData) ? responseData : responseData?.configurations || [];
        // Mettre à jour les variantes dans le state
        setVariantes(variantesData);

        // Charger en parallèle les listes d'options (performances optimisées)
        const [couleursExtData, couleursIntData, jantesData, siegesData, packagesData] =
          // promesse de chargement des options de personnalisation
          await Promise.all([
            personnalisationService.getCouleursExterieur(),
            personnalisationService.getCouleursInterieur(),
            personnalisationService.getJantes(),
            personnalisationService.getSieges(),
            personnalisationService.getPackages(),
          ]);
        // Mettre à jour les états avec les données récupérées
        setCouleursExt(couleursExtData);
        setCouleursInt(couleursIntData);


        // Vérifier d'abord que jantesData est bien un tableau
        const jantesFiltrees = Array.isArray(jantesData)
          ? jantesData.filter((jante) => {
            // Récupérer la taille de la jante (peut être number ou string selon l'API)
            const taille = jante.taille_jante;
            // Exclure la taille 16 pouces sous toutes ses formes possibles
            // conversion: String(taille) !== "16" pour gérer les cas edge
            return taille !== 16 && taille !== "16" && String(taille) !== "16";
          })
          : []; // Si jantesData n'est pas un tableau, retourner un tableau vide

        setJantes(jantesFiltrees);
        setSieges(siegesData);
        setPackages(packagesData);

        // Sélection par défaut : choisir la variante demandée (varianteId) ou la première variante disponible
        if (variantesData.length > 0) {
          // Trouver la variante sélectionnée
          let varianteSelectionnee = null;
          // Si `varianteId` fourni, chercher la variante correspondante
          if (varianteId) varianteSelectionnee = variantesData.find((v) => v._id === varianteId);
          // Sinon, prendre la première variante disponible
          if (!varianteSelectionnee) varianteSelectionnee = variantesData[0];
          setConfig((prev) => ({ ...prev, variante: varianteSelectionnee }));
        }
      } catch (err) {
        // Erreur critique lors du chargement des options
        setError(err.message || "Erreur lors du chargement des options");
      } finally {
        setLoading(false);
      }
    };
    // si on a au moins un des deux paramètres, lancer le chargement
    if (voitureId || varianteId) fetchOptions();
    else {
      // Aucun paramètre fourni — arrêt du chargement et message d'erreur
      setLoading(false);
      setError("Paramètres manquants : voitureId ou varianteId requis");
    }
  }, [voitureId, varianteId]);

  // Met à jour `packagesFiltres` lorsque la variante ou la liste de packages change.
  useEffect(() => {
    // si on a une variante sélectionnée et des packages disponibles, filtrer les packages 
    if (config.variante && packages.length > 0) {
      // Appliquer le filtrage des packages selon la variante sélectionnée
      const packagesFiltresParModele = filtrerPackagesParModele(packages, config.variante);
      // Mettre à jour le state avec les packages filtrés
      setPackagesFiltres(packagesFiltresParModele);
      // Si le package sélectionné n'est plus valide pour la variante, on le retire
      if (config.package && !packagesFiltresParModele.find((p) => p._id === config.package._id)) {
        // Retirer le package invalide de la configuration
        setConfig((prev) => ({ ...prev, package: null }));
      }
    } else {
      setPackagesFiltres([]);
    }
  },
    // Dépendances : variante sélectionnée, liste complète des packages
    [config.variante, packages, config.package]);

  // Calculer le prix total et l'acompte chaque fois que la configuration change
  useEffect(() => {
    let total = 0;
    // Additionner les prix des éléments sélectionnés dans la configuratio. Vérifie l'existence avant d'accéder aux prix
    if (config.variante) total += config.variante.prix_base || 0;
    if (config.couleur_exterieur) total += config.couleur_exterieur.prix || 0;
    if (config.couleur_interieur) total += config.couleur_interieur.prix || 0;
    if (config.taille_jante) total += config.taille_jante.prix || 0;
    if (config.siege) total += config.siege.prix || 0;
    if (config.package) total += config.package.prix || 0;

    setPrixTotal(total);
    // Acompte simple : 10% arrondie au nombre entier le plus proche
    setAcompte(Math.round(total * 0.1));
  }, [config]);

  // Récupère le tableau de photos depuis la variante (si disponible)
  const getPhotosVariante = useCallback(() => (Array.isArray(config.variante?.photo_porsche) ? config.variante.photo_porsche : []), [config.variante]);

  // Trouve l'index d'une photo correspondant à une couleur extérieure/intérieure
  // On ignore les deux premières photos (indices 0 et 1) et les images marquées id_0/id_1
  const findPhotoIndexByCouleur = useCallback(
    (couleur, type) => {
      // si couleur ou type manquant, retourner null
      if (!couleur?._id || !type) {
        if (import.meta.env.DEV) debug("findPhotoIndexByCouleur: couleur ou type manquant");
        return null;
      }
      // si type invalide, retourner null
      if (!["exterieur", "interieur"].includes(type)) {
        if (import.meta.env.DEV) debug("findPhotoIndexByCouleur: type invalide", type);
        return null;
      }
      // Récupérer les photos de la variante 
      const photos = getPhotosVariante();
      // si pas de photos, retourner null
      if (!Array.isArray(photos) || photos.length === 0) {
        if (import.meta.env.DEV) debug("findPhotoIndexByCouleur: pas de photos disponibles");
        return null;
      }
      // Créer un tableau de photos visibles avec leurs indices d'origine
      // Mapper chaque photo avec son index original pour garder la trace des indices après filtrage
      const visiblePhotosWithIndex = photos
        .map((photo, originalIndex) => ({ photo, originalIndex }))
        // Filtrer pour ne garder que les photos "visibles" (ignorer indices 0 et 1 et id_0/id_1)
        .filter(({ photo, originalIndex }) => {
          // Extraire l'ID et le nom de la photo pour les vérifications
          const id = photo._id || photo.id || "";
          const name = photo.name || "";
          // 1. originalIndex >= 2 : Exclure les deux premières photos
          // 2. !(id === "id_0" || id === "id_1") : Exclure les photos avec IDs spéciaux
          // 3. !name.includes("id_0") && !name.includes("id_1") : Exclure les photos dont le nom contient ces marqueurs
          return originalIndex >= 2 && !(id === "id_0" || id === "id_1" || name.includes("id_0") || name.includes("id_1"));
        });

      // si debug, log la longueur du tableau filtré
      if (import.meta.env.DEV) debug("visiblePhotosWithIndex length:", visiblePhotosWithIndex.length);

      // Rechercher l'index de la photo correspondant à la couleur donnée
      const fieldName = type === "exterieur" ? "couleur_exterieur" : "couleur_interieur";
      // Trouver l'index dans le tableau filtré des photos visibles
      const foundIndex = visiblePhotosWithIndex.findIndex(({ photo }) => {
        // Extraire l'ID de la couleur associée à la photo
        const photoCouleurId = photo[fieldName]?._id || photo[fieldName];
        // si debug, log la vérification en cours
        if (import.meta.env.DEV) debug("findPhotoIndexByCouleur: check photoCouleurId", photoCouleurId);
        return photoCouleurId && photoCouleurId.toString() === couleur._id.toString();
      });
      // si debug, log l'index trouvé
      if (import.meta.env.DEV) debug("findPhotoIndexByCouleur: foundIndex", foundIndex);
      return foundIndex >= 0 ? foundIndex : null;
    },
    [getPhotosVariante],
  );

  // Handlers pour les changements de couleurs (exterieur/interieur)
  const handleCouleurExtChange = useCallback(
    (couleur) => {
      // Mettre à jour la configuration avec la couleur extérieure sélectionnée
      setConfig((prev) => ({ ...prev, couleur_exterieur: couleur }));
      // Trouver l'index de la photo correspondant à cette couleur extérieure
      const photoIndex = findPhotoIndexByCouleur(couleur, "exterieur");
      // Mettre à jour la photo active si un index valide est trouvé
      if (photoIndex !== null) setPhotoActive(photoIndex);
      // si debug, log l'index de la photo
      if (import.meta.env.DEV) debug("handleCouleurExtChange: photoIndex", photoIndex);
    },
    [findPhotoIndexByCouleur],
  );

  // Handler pour le changement de couleur intérieure
  const handleCouleurIntChange = useCallback(
    (couleur) => {
      // Mettre à jour la configuration avec la couleur intérieure sélectionnée
      setConfig((prev) => ({ ...prev, couleur_interieur: couleur }));
      // Trouver l'index de la photo correspondant à cette couleur intérieure
      const photoIndex = findPhotoIndexByCouleur(couleur, "interieur");
      // Mettre à jour la photo active si un index valide est trouvé
      if (photoIndex !== null) setPhotoActive(photoIndex);
      // si debug, log l'index de la photo
      if (import.meta.env.DEV) debug("handleCouleurIntChange: photoIndex", photoIndex);
    },
    [findPhotoIndexByCouleur],
  );

  // Navigation pour changer le modèle (retour à la liste des variantes)
  const handleChangerModele = () => {
    // Déterminer l'ID de la voiture à utiliser pour la navigation
    const idVoiture = voitureIdActuel || voitureId;
    // si pas d'idVoiture, naviguer vers le choix de voiture
    if (!idVoiture) {
      // si debug, log l'absence d'idVoiture
      if (import.meta.env.DEV) debug("handleChangerModele: idVoiture manquant");
      navigate("/choix-voiture");
      return;
    }

    // Déterminer le type de voiture (neuve/occasion) pour construire la route correcte
    const typeVoiture = config.variante?.voiture?.type_voiture === false ? "occasion" : "neuve";
    // Construire la route cible et naviguer vers elle
    const targetRoute = `/variantes/${typeVoiture}/${idVoiture}`;
    // si debug, log la route cible
    if (import.meta.env.DEV) debug("handleChangerModele: navigation vers", targetRoute);
    navigate(targetRoute);
  };

  // Basculer l'ouverture d'une section (couleurs, jantes, ...)
  const toggleSection = (section) => setSectionsOuvertes((prev) => ({ ...prev, [section]: !prev[section] }));

  // Filtrage des photos visibles pour la galerie principale (miniatures + affichage)
  // useMemo optimise le calcul en ne recalculant que si les photos de la variante changent
  const visiblePhotos = useMemo(() => {
    // Récupérer toutes les photos de la variante sélectionnée
    const photos = getPhotosVariante();
    // Vérifier que photos est bien un tableau, sinon retourner un tableau vide
    if (!Array.isArray(photos)) return [];

    // Filtrer les photos pour ne garder que celles affichables dans le configurateur
    return photos.filter((p, index) => {
      // Extraire les identifiants de la photo (plusieurs formats possibles selon l'API/DB)
      const id = p._id || p.id || "";
      const name = p.name || "";
      // - index >= 2 : Ignorer les 2 premières photos (indices 0 et 1, souvent réservées pour logo/placeholder)
      // - !(id === "id_0" || id === "id_1") : Exclure les photos avec ces IDs spéciaux
      // - !name.includes("id_0") && !name.includes("id_1") : Exclure si le nom contient ces marqueurs
      return index >= 2 && !(id === "id_0" || id === "id_1" || name.includes("id_0") || name.includes("id_1"));
    });
  }, [getPhotosVariante]); // recalculer uniquement si les photos de la variante changent

  // Veille à ce que `photoActive` soit toujours dans les bornes valides
  useEffect(() => {
    // si l'index actuel dépasse la longueur des photos visibles, le remettre à 0
    setPhotoActive((prev) => (prev >= visiblePhotos.length ? 0 : prev));
  }, [visiblePhotos.length]);

  // Référence pour stocker un timeout de redirection (nettoyage à la désactivation)
  const redirectRef = useRef(null);
  // Nettoyage du timeout lors de la désactivation du composant
  useEffect(() => () => { if (redirectRef.current) clearTimeout(redirectRef.current); }, []);

  // Filtrer les packages disponibles selon la variante sélectionnée
  const filtrerPackagesParModele = (packages, variante) => {
    // si variante ou packages invalides, retourner tableau vide
    if (!variante || !Array.isArray(packages)) {
      if (import.meta.env.DEV) debug("filtrerPackagesParModele: variante ou packages invalides");
      return [];
    }

    // Normaliser le nom du modèle pour appliquer des règles 
    const nomModel = (variante.nom_model || "").trim().toUpperCase();
    let modeleBase;
    // si le nom du modèle contient certains mots-clés, les regrouper sous un modèle de base
    if (nomModel.includes("GT3") || nomModel.includes("GT2") || nomModel.includes("TURBO") || nomModel.includes("CARRERA") || nomModel.includes("TARGA") || nomModel.includes("911")) modeleBase = "911";
    else if (nomModel.includes("CAYMAN") || nomModel.includes("GT4")) modeleBase = "CAYMAN";
    // sinnon si le nom du modèle contient "CAYENNE", le regrouper sous "CAYENNE"
    else if (nomModel.includes("CAYENNE")) modeleBase = "CAYENNE";
    // sinon prendre le premier mot comme modèle de base
    else modeleBase = nomModel.split(" ")[0];

    // Appliquer les règles de filtrage des packages selon le modèle de base
    const packagesFiltres = packages.filter((pkg) => {
      // Normaliser le nom du package pour les vérifications  
      const nomPackage = (pkg.nom_package || "").trim();
      // Sport Chrono disponible pour tous  les modèles
      if (nomPackage.includes("Sport Chrono") || nomPackage.includes("sport chrono")) return true;
      // Weissach réservé à certains modèles comme la 911 et le Cayman
      if (nomPackage.includes("Weissach") || nomPackage.includes("weissach")) {
        const modelesAutorises = ["911", "CAYMAN"];
        return modelesAutorises.includes(modeleBase);
      }
      return true;
    });

    return packagesFiltres;
  };

  // Handlers pour les changements de jante
  const handleJanteChange = useCallback((jante) => setConfig((prev) => ({ ...prev, taille_jante: jante })), []);
  // Sélectionne un siège
  const handleSiegeChange = useCallback((siege) => setConfig((prev) => ({ ...prev, siege })), []);
  // Sélectionne un package
  const _handlePackageChange = useCallback((pkg) => setConfig((prev) => ({ ...prev, package: pkg })), []);

  // Handler pour l'ajout de la configuration au panier
  const handleAcheter = async () => {
    // si pas authentifié, afficher le prompt de connexion
    if (!isAuthenticated()) { setShowLoginPrompt(true); return; }
    // Validation basique : vérifier qu'une variante est sélectionnée
    if (!config.variante) { setError("Veuillez sélectionner une variante"); return; }

    try {
      setAjoutEnCours(true);
      setError("");
      // Ajouter la configuration au panier via le service commande, id de la variante
      const modelPorscheId = config.variante._id;
      // Appel au service pour ajouter la voiture neuve au panier
      await commandeService.ajouterVoitureNeuveAuPanier(modelPorscheId);
      // Message de succès et redirection vers le panier après un court délai
      setSuccess("Configuration ajoutée au panier avec succès !");
      // Redirection vers la page panier après un délai
      redirectRef.current = setTimeout(() => navigate("/panier"), 1500);
    } catch (err) {
      setError(err.message || "Erreur lors de l'ajout au panier");
    } finally {
      setAjoutEnCours(false);
    }
  };
  // si en cours de chargement, afficher un écran de chargement
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

  // Nom et année affichés pour l'en-tête du configurateur
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
            // Logo Porsche avec fallback en cas d'erreur de chargement
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

      {/* Contenu visuel et panneau d'options */}
      <div className="configurateur-main-content">
        {/* Zone visuelle */}
        <div className="configurateur-visual-area">
          <div className="configurateur-visual-main">
            {/* image principale */}
            <ImageWithFallback
              src={visiblePhotos.length > 0 ? buildUrl(visiblePhotos[photoActive]?.name) : null}
              alt={nomModel}
              imgClass="configurateur-main-image"
              placeholder={<div className="configurateur-visual-placeholder"><span className="configurateur-visual-letter">{nomModel?.charAt(0) || "?"}</span></div>}
            />
          </div>

          {/* Miniatures - Galerie de navigation entre les vues */}
          {visiblePhotos.length > 1 && (
            // role="tablist" et aria-label pour améliorer l'accessibilité de la galerie
            <div className="configurateur-thumbnails" role="tablist" aria-label="Vues du véhicule">
              {visiblePhotos.map((photo, index) => {
                // Déterminer si la miniature est active
                const isActive = photoActive === index;
                // Construire l'URL de la photo
                const photoUrl = photo?.name ? buildUrl(photo.name) : null;

                // Chaque miniature est un bouton:
                // - key : identifiant unique (préférer _id, fallback sur index)
                // - aria-pressed : indique l'état actif aux lecteurs d'écran
                // - title : tooltip pour les utilisateurs souris
                // - className : applique le style visuel actif/inactif
                return (
                  <button
                    key={photo._id || `photo-${index}`}
                    onClick={() => setPhotoActive(index)}
                    aria-pressed={isActive}
                    title={`Voir la vue ${index + 1}`}
                    className={`configurateur-thumbnail ${isActive ? "configurateur-thumbnail-active" : ""}`}
                  >
                    {/* ImageWithFallback gère le chargement et le fallback si l'image échoue */}
                    <ImageWithFallback
                      src={photoUrl}
                      alt={`Vue ${index + 1}`}
                      placeholder={<div className="configurateur-thumb-missing" />}
                    />
                  </button>
                );
              })}
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
            // Section réductible pour les couleurs extérieures
            <OptionSection title="Couleurs Extérieures" isOpen={sectionsOuvertes.couleursExt} onToggle={() => toggleSection("couleursExt")}>
              <div className="configurateur-colors-list">
                {couleursExt.map((couleur) => (
                  // Rendu d'une couleur extérieure
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
            // Section réductible pour les jantes
            <OptionSection title="Jantes" isOpen={sectionsOuvertes.jantes} onToggle={() => toggleSection("jantes")}>
              <div className="configurateur-jantes-list">
                {jantes.map((jante) => (
                  // Rendu d'une jante
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
            // Section réductible pour les couleurs intérieures
            <OptionSection title="Couleurs Intérieures" isOpen={sectionsOuvertes.couleursInt} onToggle={() => toggleSection("couleursInt")}>
              <div className="configurateur-colors-list">
                {couleursInt.map((couleur) => (
                  // Rendu d'une couleur intérieure
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
            // Section réductible pour les sièges
            <OptionSection title="Sièges" isOpen={sectionsOuvertes.sieges} onToggle={() => toggleSection("sieges")}>
              <div className="configurateur-sieges-list">
                {sieges.map((siege) => (
                  // Rendu d'un siège
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
            // Section réductible pour les packages
            <OptionSection title="Packages" isOpen={sectionsOuvertes.packages} onToggle={() => toggleSection("packages")}>
              <div className="configurateur-packages-list">
                {packagesFiltres.map((pkg) => (
                  // Rendu d'un package
                  <PackageItem key={pkg._id} pkg={pkg} selected={config.package?._id === pkg._id} onSelect={_handlePackageChange} />
                ))}
              </div>
            </OptionSection>
          )}

          {/* acompte, reste à payer, contact et acheter */}
          <div className="configurateur-actions">
            <div className="configurateur-actions-info">
              <div className="configurateur-acompte-info"><span className="configurateur-acompte-label">Acompte à régler maintenant :</span><span className="configurateur-acompte-montant">{formatPrice(acompte)}</span></div>
              <div className="configurateur-reste-info"><span className="configurateur-reste-label">À payer à la livraison :</span><span className="configurateur-reste-montant">{formatPrice(prixTotal - acompte)}</span></div>
            </div>
            <div className="configurateur-actions-buttons">
              {/* Boutons pour contacter et acheter */}
              <button className="configurateur-btn-contact" onClick={() => setShowContactModal(true)}>Nous contacter</button>
              <button className="configurateur-btn-acheter" onClick={handleAcheter} disabled={ajoutEnCours || !config.variante}>{ajoutEnCours ? "Ajout en cours..." : "Acheter"}</button>
            </div>
          </div>
        </div>
      </div>

      {/*
        LoginPromptModal:
        - Affichée quand l'utilisateur tente une action nécessitant une authentification
        - onClose: fonction pour fermer la modal
        - onLogin: redirige vers la page de connexion; on passe l'état { from: location.pathname } pour revenir après connexion
        - initialPath: chemin initial pour référence
      */}
      {showLoginPrompt && (
        <LoginPromptModal
          onClose={() => setShowLoginPrompt(false)}
          onLogin={() => navigate("/login", { state: { from: location.pathname } })}
          initialPath={location.pathname}
        />
      )}

      {/*
        ContactModal:
        - Formulaire de contact/modal de demande d'information
        - onClose: ferme la modal 
        - vehiculeInfo: informations pré-remplies si une variante est sélectionnée 
        - Le composant reçoit `null` si aucune variante n'est sélectionnée.
      */}
      {showContactModal && (
        <ContactModal
          onClose={() => setShowContactModal(false)}
          vehiculeInfo={
            config.variante
              ? { nom_model: config.variante.nom_model, variante: config.variante.type_carrosserie, prix: formatPrice(prixTotal) }
              : null
          }
        />
      )}
    </div>
  );
};

export default Configurateur;
