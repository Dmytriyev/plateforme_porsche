/**
 * OptionSection - Composant réutilisable pour les sections accordéon
 * Respecte les standards d'accessibilité WCAG 2.1 (aria-expanded, aria-controls)
 * 
 * @param {string} title - Titre de la section
 * @param {boolean} isOpen - État d'ouverture
 * @param {function} onToggle - Callback lors du clic
 * @param {ReactNode} children - Contenu de la section
 */
import { useId } from "react";
import PropTypes from "prop-types";

const OptionSection = ({ title, isOpen = false, onToggle, children }) => {
    const id = useId();
    const contentId = `option-section-content-${id}`;

    return (
        <section className="configurateur-option-section" aria-labelledby={`section-title-${id}`}>
            <button
                id={`section-title-${id}`}
                className="configurateur-option-section-header"
                onClick={onToggle}
                aria-expanded={isOpen}
                aria-controls={contentId}
                type="button"
            >
                <span className="configurateur-option-section-title">{title}</span>
                <svg
                    className={`configurateur-option-section-icon ${isOpen ? "open" : ""}`}
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                >
                    <path d="M6 9l6 6 6-6" />
                </svg>
            </button>

            {isOpen && (
                <div id={contentId} className="configurateur-option-section-content" role="region">
                    {children}
                </div>
            )}
        </section>
    );
};

OptionSection.propTypes = {
    title: PropTypes.string.isRequired,
    isOpen: PropTypes.bool,
    onToggle: PropTypes.func.isRequired,
    children: PropTypes.node.isRequired,
};

export default OptionSection;
