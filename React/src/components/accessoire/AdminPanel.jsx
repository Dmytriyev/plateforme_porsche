// Panneau d'administration pour la gestion des accessoires
import PropTypes from "prop-types";
// Composant AdminPanel
const AdminPanel = ({ onAddAccessoire }) => {
    return (
        // Section complémentaire pour les actions d'administration
        <aside className="accessoires-admin-box" role="complementary">
            <h2 className="accessoires-admin-title">Gestion des accessoires</h2>
            <div className="accessoires-admin-actions">
                {/* Bouton pour ajouter un accessoire */}
                <button
                    className="accessoires-admin-btn accessoires-admin-btn-add"
                    onClick={onAddAccessoire}
                    type="button"
                    aria-label="Ajouter un nouvel accessoire"
                >
                    <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                    >
                        <path
                            d="M10 4V16M4 10H16"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                        />
                    </svg>
                    Ajouter un accessoire
                </button>
            </div>
        </aside>
    );
};

// PropTypes pour le composant
AdminPanel.propTypes = {
    onAddAccessoire: PropTypes.func.isRequired,
};

export default AdminPanel;
