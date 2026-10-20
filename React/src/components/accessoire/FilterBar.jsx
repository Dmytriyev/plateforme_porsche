// Composant FilterBar pour filtrer les accessoires par type
import PropTypes from "prop-types";
// Barre de filtres pour les accessoires
const FilterBar = ({ types, activeType, onFilterChange }) => {
    if (types.length <= 1) return null;
    // Fonction pour obtenir le label affiché
    const getLabel = (type) => {
        // Labels personnalisés
        if (type === "tous") return "Tous les produits";
        if (type === "Porsche Design") return "Porsche Design portes-clés";
        return type.charAt(0).toUpperCase() + type.slice(1);
    };

    return (
        <nav
            className="accessoires-filtres"
            role="tablist"
            aria-label="Filtrer les accessoires par type"
        >
            {/* Boutons de filtre */}
            {types.map((type) => {
                const isActive = activeType === type;

                return (
                    <button
                        key={type}
                        className={`accessoires-filtre-btn ${isActive ? "active" : ""}`}
                        onClick={() => onFilterChange(type)}
                        role="tab"
                        aria-selected={isActive}
                        aria-controls="accessoires-grid"
                        type="button"
                    >
                        {getLabel(type)}
                    </button>
                );
            })}
        </nav>
    );
};
// PropTypes pour le composant
FilterBar.propTypes = {
    types: PropTypes.arrayOf(PropTypes.string).isRequired,
    activeType: PropTypes.string.isRequired,
    onFilterChange: PropTypes.func.isRequired,
};

export default FilterBar;
