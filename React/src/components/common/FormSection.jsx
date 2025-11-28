/**
 * Composant réutilisable pour les sections du formulaire
 * Encapsule un groupe de champs avec un titre
 */
import PropTypes from "prop-types";

const FormSection = ({ title, children }) => {
    return (
        <div className="modifier-accessoire-section">
            <h2 className="modifier-accessoire-section-title">{title}</h2>
            {children}
        </div>
    );
};

FormSection.propTypes = {
    title: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
};

export default FormSection;
