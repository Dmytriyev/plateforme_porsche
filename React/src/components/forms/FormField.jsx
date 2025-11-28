// Composant réutilisable pour les champs de formulaire
// Gère les types d'input courants : text, number, email, select, textarea
import PropTypes from "prop-types";
// Composant FormField
const FormField = ({
    label,
    name,
    type = "text",
    value,
    onChange,
    required = false,
    placeholder = "",
    options = [],
    error = "",
    inputProps = {},
}) => {
    // Génération des IDs pour l'accessibilité
    const inputId = `form-field-${name}`;
    // Génération de l'ID pour le message d'erreur
    const errorId = `${inputId}-error`;
    // Propriétés communes pour les éléments d'entrée
    const commonProps = {
        id: inputId,
        name,
        value,
        onChange,
        required,
        "aria-required": required,
        "aria-invalid": !!error,
        "aria-describedby": error ? errorId : undefined,
        ...inputProps,
    };
    // Fonction pour rendre le bon type d'input (retours précoces pour lisibilité)
    const renderInput = () => {
        // Rendu pour le textarea
        if (type === "textarea") {
            return (
                <textarea
                    {...commonProps}
                    className="ajouter-accessoire-textarea"
                    placeholder={placeholder}
                    rows={inputProps.rows || 4}
                />
            );
        }
        // Rendu pour le select
        if (type === "select") {
            return (
                <select {...commonProps} className="ajouter-accessoire-select">
                    <option value="">{placeholder || "Sélectionner..."}</option>
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            );
        }
        // Par défaut : input standard (text, number, email, etc.)
        return (
            <input
                {...commonProps}
                type={type}
                className="ajouter-accessoire-input"
                placeholder={placeholder}
            />
        );
    };
    return (
        <div className="ajouter-accessoire-field">
            <label htmlFor={inputId} className="ajouter-accessoire-label">
                {label}
                {required && <span className="required" aria-label="requis"> *</span>}
            </label>
            {/* Champ de formulaire */}
            {renderInput()}
            {error && (
                <span id={errorId} className="field-error" role="alert">
                    {error}
                </span>
            )}
        </div>
    );
};
// PropTypes pour le composant
FormField.propTypes = {
    label: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.oneOf(["text", "number", "email", "tel", "select", "textarea"]),
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onChange: PropTypes.func.isRequired,
    required: PropTypes.bool,
    placeholder: PropTypes.string,
    options: PropTypes.arrayOf(
        // Options pour le select
        PropTypes.shape({
            value: PropTypes.string.isRequired,
            label: PropTypes.string.isRequired,
        })
    ),
    error: PropTypes.string,
    inputProps: PropTypes.object,
};

export default FormField;
