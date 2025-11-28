/**
 * Composant bouton de retour réutilisable
 * Permet de naviguer vers une page précédente
 */
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";

const BackButton = ({ to, label = "Retour", className = "" }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        if (to) {
            navigate(to);
        } else {
            navigate(-1);
        }
    };

    return (
        <button
            className={`modifier-accessoire-back ${className}`.trim()}
            onClick={handleClick}
            type="button"
        >
            <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M12 16L6 10L12 4"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
            {label}
        </button>
    );
};

BackButton.propTypes = {
    to: PropTypes.string,
    label: PropTypes.string,
    className: PropTypes.string,
};

export default BackButton;
