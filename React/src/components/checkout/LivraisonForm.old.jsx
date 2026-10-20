// Composant formulaire de livraison
import PropTypes from "prop-types";
// Formulaire de saisie des informations de livraison
const LivraisonForm = ({ livraisonInfo, onChange, disabled = false }) => {
    const handleChange = (e) => {
        // Gestion changement champ
        const { name, value } = e.target;
        onChange(name, value);
    };

    return (
        <fieldset
            className="space-y-6"
            disabled={disabled}
            aria-label="Informations de livraison"
        >
            <legend className="text-2xl font-bold text-gray-900 mb-6">
                Informations de livraison
            </legend>

            {/* Nom et Prénom */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label
                        htmlFor="nom"
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        Nom <span className="text-red-600" aria-label="requis">*</span>
                    </label>
                    <input
                        type="text"
                        id="nom"
                        name="nom"
                        value={livraisonInfo.nom}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                        placeholder="Dupont"
                        required
                        aria-required="true"
                        disabled={disabled}
                    />
                </div>

                <div>
                    <label
                        htmlFor="prenom"
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        Prénom <span className="text-red-600" aria-label="requis">*</span>
                    </label>
                    <input
                        type="text"
                        id="prenom"
                        name="prenom"
                        value={livraisonInfo.prenom}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                        placeholder="Jean"
                        required
                        aria-required="true"
                        disabled={disabled}
                    />
                </div>
            </div>

            {/* Email et Téléphone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label
                        htmlFor="email"
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        Email <span className="text-red-600" aria-label="requis">*</span>
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={livraisonInfo.email}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                        placeholder="jean.dupont@example.com"
                        required
                        aria-required="true"
                        disabled={disabled}
                    />
                </div>

                <div>
                    <label
                        htmlFor="telephone"
                        className="block text-sm font-medium text-gray-700 mb-2"
                    >
                        Téléphone <span className="text-red-600" aria-label="requis">*</span>
                    </label>
                    <input
                        type="tel"
                        id="telephone"
                        name="telephone"
                        value={livraisonInfo.telephone}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                        placeholder="06 12 34 56 78"
                        required
                        aria-required="true"
                        disabled={disabled}
                    />
                </div>
            </div>

            {/* Adresse */}
            <div>
                <label
                    htmlFor="adresse"
                    className="block text-sm font-medium text-gray-700 mb-2"
                >
                    Adresse complète <span className="text-red-600" aria-label="requis">*</span>
                </label>
                <input
                    type="text"
                    id="adresse"
                    name="adresse"
                    value={livraisonInfo.adresse}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="123 Avenue des Champs-Élysées"
                    required
                    aria-required="true"
                    disabled={disabled}
                />
            </div>

            {/* Code Postal */}
            <div>
                <label
                    htmlFor="code_postal"
                    className="block text-sm font-medium text-gray-700 mb-2"
                >
                    Code postal <span className="text-red-600" aria-label="requis">*</span>
                </label>
                <input
                    type="text"
                    id="code_postal"
                    name="code_postal"
                    value={livraisonInfo.code_postal}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="75008"
                    required
                    aria-required="true"
                    maxLength="5"
                    pattern="[0-9]{5}"
                    disabled={disabled}
                />
                <p className="mt-1 text-sm text-gray-500">
                    5 chiffres requis
                </p>
            </div>
        </fieldset>
    );
};
// livraison champs PropTypes
LivraisonForm.propTypes = {
    livraisonInfo: PropTypes.shape({
        nom: PropTypes.string.isRequired,
        prenom: PropTypes.string.isRequired,
        email: PropTypes.string.isRequired,
        telephone: PropTypes.string.isRequired,
        adresse: PropTypes.string.isRequired,
        code_postal: PropTypes.string.isRequired,
    }).isRequired,
    onChange: PropTypes.func.isRequired,
    disabled: PropTypes.bool,
};

export default LivraisonForm;
