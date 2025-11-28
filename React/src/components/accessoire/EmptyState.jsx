/**
 * EmptyState - État vide pour liste d'accessoires
 * 
 * Composant réutilisable pour afficher un message quand aucun résultat
 */
import PropTypes from "prop-types";

const EmptyState = ({ message = "Aucun accessoire disponible pour le moment." }) => {
    return (
        <div className="accessoires-empty" role="status">
            <svg
                className="accessoires-empty-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
            </svg>
            <p className="accessoires-empty-text">{message}</p>
        </div>
    );
};

EmptyState.propTypes = {
    message: PropTypes.string,
};

export default EmptyState;
