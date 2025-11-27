// affiche les variantes d'un modèle (neuf/occasion)
import Loading from "../components/common/Loading.jsx";
import { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "../css/CatalogueModeles.css";
import "../css/components/Message.css";
import "../css/ListeVariantes.css";
import selectPhotoForVariante from "../utils/selectPhotoForVariante";
import VarianteCard from "../components/VarianteCard.jsx";
import useVariantes from "../hooks/useVariantes";

// Page : affiche les variantes d'un modèle (neuf/occasion). Nécessite `modeleId` param.
const ListeVariantes = () => {
  const { type, modeleId } = useParams();
  const navigate = useNavigate();

  const [variantesFiltrees, setVariantesFiltrees] = useState([]);

  const [filtres, setFiltres] = useState({
    carrosserie: [],
    puissanceMin: null,
    prixMax: null,
  });
  const [triActif, setTriActif] = useState("prix-asc");

  const isNeuf = type === "neuve";

  const { modele, variantes, loading, error, refetch } = useVariantes(modeleId, isNeuf);

  // Data fetching is handled by the `useVariantes` hook.

  const _handleVarianteClick = useCallback((variante) => {
    const voitureId = variante?.voiture?._id ?? modele?._id ?? modeleId;
    if (isNeuf) {
      navigate(`/configurateur/${voitureId}/${variante._id}`);
    } else {
      navigate(`/occasion/${variante._id}`);
    }
  }, [isNeuf, modele, modeleId, navigate]);

  const _handleSelectModel = useCallback((variante) => {
    const voitureId = variante?.voiture?._id ?? modele?._id ?? modeleId;
    if (isNeuf) {
      navigate(`/configurateur/${voitureId}/${variante._id}`);
    } else {
      navigate(`/occasion/${variante._id}`);
    }
  }, [isNeuf, modele, modeleId, navigate]);

  useEffect(() => {
    if (variantes.length === 0) {
      setVariantesFiltrees([]);
      return;
    }

    let filtered = [...variantes];
    if (filtres.carrosserie.length > 0) {
      filtered = filtered.filter((v) =>
        filtres.carrosserie.includes(v.type_carrosserie),
      );
    }
    if (filtres.puissanceMin) {
      filtered = filtered.filter(
        (v) => (v.specifications?.puissance || 0) >= filtres.puissanceMin,
      );
    }
    if (filtres.prixMax) {
      filtered = filtered.filter(
        (v) => (v.prix_base || v.prix_calcule || 0) <= filtres.prixMax,
      );
    }

    // Appliquer le tri
    if (triActif === "prix-asc") {
      filtered.sort(
        (a, b) =>
          (a.prix_base || a.prix_calcule || 0) -
          (b.prix_base || b.prix_calcule || 0),
      );
    } else if (triActif === "prix-desc") {
      filtered.sort(
        (a, b) =>
          (b.prix_base || b.prix_calcule || 0) -
          (a.prix_base || a.prix_calcule || 0),
      );
    } else if (triActif === "nom-asc") {
      filtered.sort((a, b) =>
        (a.nom_model || "").localeCompare(b.nom_model || ""),
      );
    } else if (triActif === "nom-desc") {
      filtered.sort((a, b) =>
        (b.nom_model || "").localeCompare(a.nom_model || ""),
      );
    } else if (triActif === "carrosserie") {
      filtered.sort((a, b) =>
        (a.type_carrosserie || "").localeCompare(b.type_carrosserie || ""),
      );
    }

    setVariantesFiltrees(filtered);
  }, [variantes, filtres, triActif]);

  const filterOptions = useMemo(() => {
    const carrosseries = [
      ...new Set(variantes.map((v) => v.type_carrosserie).filter(Boolean)),
    ].sort();

    const puissancesSet = new Set();
    const prix = [];

    variantes.forEach((v) => {
      if (v.specifications?.puissance) {
        puissancesSet.add(v.specifications.puissance);
      }
      const prixVariante = v.prix_base || v.prix_calcule || 0;
      if (prixVariante > 0) prix.push(prixVariante);
    });

    return {
      carrosseries,
      puissances: Array.from(puissancesSet).sort((a, b) => a - b),
      prixMax: prix.length > 0 ? Math.max(...prix) : 0,
    };
  }, [variantes]);

  const handleFilterChange = useCallback((filterType, value) => {
    setFiltres((prev) => {
      const newFiltres = { ...prev };
      if (filterType === "carrosserie") {
        const current = newFiltres[filterType] || [];
        if (current.includes(value)) newFiltres[filterType] = current.filter((v) => v !== value);
        else newFiltres[filterType] = [...current, value];
      } else {
        newFiltres[filterType] = value;
      }
      return newFiltres;
    });
  }, []);

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
                <h3 className="variantes-filter-section-title-finder">
                  Carrosserie
                </h3>
                <div className="variantes-filter-options-finder">
                  {filterOptions.carrosseries.map((carrosserie) => (
                    <label
                      key={carrosserie}
                      className="variantes-filter-checkbox-finder"
                    >
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
                // compute main photo via helper and annotate variante with photoPrincipale
                const photoPrincipale = selectPhotoForVariante(variante, isNeuf);
                const varianteWithPhoto = { ...variante, photoPrincipale };

                return (
                  <VarianteCard
                    key={variante._id}
                    variante={varianteWithPhoto}
                    isNeuf={isNeuf}
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
