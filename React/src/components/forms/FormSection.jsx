/**
 * FormSection - Section de formulaire avec titre
 * 
 * Composant de présentation pour grouper les champs
 */
import PropTypes from "prop-types";

const FormSection = ({ title, children }) => {
    return (
        <section className="ajouter-accessoire-section">
            <h2 className="ajouter-accessoire-section-title">{title}</h2>
            {children}
        </section>
    );
};

FormSection.propTypes = {
    title: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
};

export default FormSection;
