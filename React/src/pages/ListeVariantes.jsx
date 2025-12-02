// affiche les variantes d'un modèle (neuf/occasion)
import selectPhotoForVariante from "../utils/selectPhotoForVariante";
import Loading from "../components/common/Loading.jsx";
import useVariantes from "../hooks/useVariantes";
import VarianteCard from "../components/VarianteCard.jsx";
import { useState, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../css/CatalogueModeles.css";
import "../css/components/Message.css";
import "../css/ListeVariantes.css";

// Page : affiche les variantes d'un modèle (neuf/occasion)
const ListeVariantes = () => {
  // Récupération des paramètres d'URL
  const { type, modeleId } = useParams();
  const navigate = useNavigate();
  // Variantes filtrées : calculées plus bas après avoir déclaré les états
  // États pour les filtres et le tri
  const [filtres, setFiltres] = useState({
    carrosserie: [],
    puissanceMin: null,
    prixMax: null,
  });
  // État pour le tri actif ("prix-asc", "prix-desc", "nom-asc", "nom-desc", "carrosserie")
  const [triActif, setTriActif] = useState("prix-asc");
  // Détermine si on affiche les variantes neuves ou d'occasion
  const isNeuf = type === "neuve";
  // Utilisation du hook personnalisé pour récupérer les variantes
  const { modele, variantes, loading, error } = useVariantes(modeleId, isNeuf);
  // Data fetching is handled by the `useVariantes` hook.
  const _handleVarianteClick = useCallback((variante) => {
    // Redirige vers la page détail de la variante (neuf) ou d'occasion
    if (isNeuf) {
      // Pour les voitures neuves, rediriger vers la page détail de variante
      navigate(`/variante/${variante._id}`);
    } else {
      // Pour les voitures d'occasion, rediriger vers la page occasion
      navigate(`/occasion/${variante._id}`);
    }
  }, [isNeuf, navigate]);

  // Gestion de la sélection d'une variante
  const _handleSelectModel = useCallback((variante) => {
    // Redirige vers la page détail de la variante (neuf) ou d'occasion
    if (isNeuf) {
      // Pour les voitures neuves, rediriger vers la page détail de variante
      navigate(`/variante/${variante._id}`);
    } else {
      // Pour les voitures d'occasion, rediriger vers la page occasion
      navigate(`/occasion/${variante._id}`);
    }
  }, [isNeuf, navigate]);

  // Variantes filtrées calculées à la volée avec useMemo
  const variantesFiltrees = useMemo(() => {
    if (!variantes || variantes.length === 0) return [];
    // Appliquer les filtres  
    let filtered = [...variantes];
    // Filtrage par carrosserie si défini dans les filtres  
    if (filtres.carrosserie && filtres.carrosserie.length > 0) {
      // filtrer les variantes dont le type_carrosserie est dans la liste des carrosseries sélectionnées
      filtered = filtered.filter((v) =>
        filtres.carrosserie.includes(v.type_carrosserie),
      );
    }
    // Filtrage par puissance minimale si défini dans les filtres
    if (filtres.puissanceMin) {
      filtered = filtered.filter(
        (v) => (v.specifications?.puissance || 0) >= filtres.puissanceMin,
      );
    }
    // Filtrage par prix maximum si défini dans les filtres
    if (filtres.prixMax) {
      filtered = filtered.filter(
        (v) => (v.prix_base || v.prix_calcule || 0) <= filtres.prixMax,
      );
    }
    // si le tri est défini, trier les résultats
    if (triActif === "prix-asc") {
      filtered.sort(
        (a, b) =>
          (a.prix_base || a.prix_calcule || 0) -
          (b.prix_base || b.prix_calcule || 0),
      );
      // tri par prix décroissant
    } else if (triActif === "prix-desc") {
      filtered.sort(
        (a, b) =>
          (b.prix_base || b.prix_calcule || 0) -
          (a.prix_base || a.prix_calcule || 0),
      );
      // tri par nom A-Z
    } else if (triActif === "nom-asc") {
      filtered.sort((a, b) =>
        (a.nom_model || "").localeCompare(b.nom_model || ""),
      );
      // tri par nom Z-A
    } else if (triActif === "nom-desc") {
      filtered.sort((a, b) =>
        (b.nom_model || "").localeCompare(a.nom_model || ""),
      );
      // tri par type de carrosserie
    } else if (triActif === "carrosserie") {
      filtered.sort((a, b) =>
        (a.type_carrosserie || "").localeCompare(b.type_carrosserie || ""),
      );
    }

    return filtered;
  }, [variantes, filtres, triActif]);

  // Options de filtres calculées à partir des variantes disponibles
  const filterOptions = useMemo(() => {
    // Carrosseries disponibles
    const carrosseries = [
      ...new Set(variantes.map((v) => v.type_carrosserie).filter(Boolean)),
    ].sort();

    // Puissances et prix max
    const puissancesSet = new Set();
    const prix = [];
    // Parcours des variantes pour extraire les puissances et prix
    variantes.forEach((v) => {
      // si la variante a une puissance, on l'ajoute à l'ensemble
      if (v.specifications?.puissance) {
        puissancesSet.add(v.specifications.puissance);
      }
      // on récupère le prix de la variante et on l'ajoute au tableau des prix s'il est > 0
      const prixVariante = v.prix_base || v.prix_calcule || 0;
      // si le prix est supérieur à 0, on l'ajoute au tableau des prix
      if (prixVariante > 0) prix.push(prixVariante);
    });

    return {
      carrosseries,
      puissances: Array.from(puissancesSet).sort((a, b) => a - b),
      prixMax: prix.length > 0 ? Math.max(...prix) : 0,
    };
  }, [variantes]);
  // Gestion des changements de filtres
  const handleFilterChange = useCallback((filterType, value) => {
    // Met à jour les filtres en fonction du type de filtre et de la valeur sélectionnée
    setFiltres((prev) => {
      // copie des filtres précédents
      const newFiltres = { ...prev };
      // si le filtre est de type "carrosserie", on gère une liste de valeurs
      if (filterType === "carrosserie") {
        const current = newFiltres[filterType] || [];
        // si la valeur est déjà dans la liste, on la retire, sinon on l'ajoute
        if (current.includes(value)) newFiltres[filterType] = current.filter((v) => v !== value);
        // sinon on l'ajoute à la liste des valeurs du filtre
        else newFiltres[filterType] = [...current, value];
      } else {
        // pour les autres types de filtres, on remplace simplement la valeur
        newFiltres[filterType] = value;
      }
      return newFiltres;
    });
  }, []);

  // Réinitialisation des filtres à leurs valeurs par défaut
  const handleResetFilter = () => {
    setFiltres({
      carrosserie: [],
      puissanceMin: null,
      prixMax: null,
    });
  };

  // Affichage des états de chargement et d'erreur 
  if (loading) {
    return <Loading fullScreen message="Chargement des variantes..." />;
  }
  // Affichage du message d'erreur s'il y en a une  
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
                <h3 className="variantes-filter-section-title-finder">
                  Carrosserie
                </h3>
                {/* Filtre des options de carrosserie */}
                <div className="variantes-filter-options-finder">
                  {filterOptions.carrosseries.map((carrosserie) => (
                    <label
                      key={carrosserie}
                      className="variantes-filter-checkbox-finder"
                    >
                      {/* Checkbox for carrosserie filter */}
                      <input
                        type="checkbox"
                        name="carrosserie"
                        id={`carrosserie-${carrosserie.replace(/\s+/g, "-").toLowerCase()}`}
                        value={carrosserie}
                        checked={filtres.carrosserie.includes(carrosserie)}
                        onChange={() =>
                          handleFilterChange("carrosserie", carrosserie)
                        }
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
              onClick={() => navigate("/choix-voiture")}
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
                <div className="variantes-sort-label-finder">Trier par:</div>
                <div className="variantes-count-finder">
                  {variantesFiltrees.length} résultat
                  {variantesFiltrees.length > 1 ? "s" : ""}
                </div>
              </div>
              <div className="variantes-sort-options-finder">
                {/* Boutons de tri */}
                <button
                  className={`variantes-sort-btn-finder ${triActif === "prix-asc" ? "active" : ""}`}
                  onClick={() => setTriActif("prix-asc")}
                >
                  Prix croissant
                </button>
                <button
                  className={`variantes-sort-btn-finder ${triActif === "prix-desc" ? "active" : ""}`}
                  onClick={() => setTriActif("prix-desc")}
                >
                  Prix décroissant
                </button>
                <button
                  className={`variantes-sort-btn-finder ${triActif === "nom-asc" ? "active" : ""}`}
                  onClick={() => setTriActif("nom-asc")}
                >
                  Modèle A-Z
                </button>
                <button
                  className={`variantes-sort-btn-finder ${triActif === "nom-desc" ? "active" : ""}`}
                  onClick={() => setTriActif("nom-desc")}
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
            // si aucune variante ne correspond aux filtres sélectionnés
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
            // sinon on affiche les variantes filtrées
          ) : (
            <div className="catalogue-modeles-grid-occasion">
              {variantesFiltrees.map((variante) => {
                // compute main photo via helper and annotate variante with photoPrincipale
                const photoPrincipale = selectPhotoForVariante(variante, isNeuf);
                // création d'une nouvelle variante avec la photo principale
                const varianteWithPhoto = { ...variante, photoPrincipale };

                return (
                  <VarianteCard
                    key={variante._id}
                    // props de la variante avec photo principale
                    variante={varianteWithPhoto}
                    isNeuf={isNeuf}
                    // handlers pour le clic et la sélection
                    onClick={() => _handleVarianteClick(variante)}
                    onSelect={() => _handleSelectModel(variante)}
                  />
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
