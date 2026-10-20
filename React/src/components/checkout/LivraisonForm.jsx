/**
 * LivraisonForm - Formulaire d'informations de livraison
 * Utilise les styles CSS existants (Checkout.css)
 */
import PropTypes from "prop-types";

const LivraisonForm = ({ livraisonInfo, onChange, disabled = false }) => {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange(name, value);
  };

  return (
    <div className="checkout-info-form">
      <div className="checkout-form-row">
        <div className="checkout-form-group">
          <label htmlFor="nom" className="checkout-form-label">
            Nom *
          </label>
          <input
            type="text"
            id="nom"
            name="nom"
            value={livraisonInfo.nom}
            onChange={handleChange}
            className="checkout-form-input"
            placeholder="Votre nom"
            required
            disabled={disabled}
          />
        </div>
        <div className="checkout-form-group">
          <label htmlFor="prenom" className="checkout-form-label">
            Prénom *
          </label>
          <input
            type="text"
            id="prenom"
            name="prenom"
            value={livraisonInfo.prenom}
            onChange={handleChange}
            className="checkout-form-input"
            placeholder="Votre prénom"
            required
            disabled={disabled}
          />
        </div>
      </div>

      <div className="checkout-form-row">
        <div className="checkout-form-group">
          <label htmlFor="email" className="checkout-form-label">
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={livraisonInfo.email}
            onChange={handleChange}
            className="checkout-form-input"
            placeholder="votre@email.com"
            required
            disabled={disabled}
          />
        </div>
        <div className="checkout-form-group">
          <label htmlFor="telephone" className="checkout-form-label">
            Téléphone *
          </label>
          <input
            type="tel"
            id="telephone"
            name="telephone"
            value={livraisonInfo.telephone}
            onChange={handleChange}
            className="checkout-form-input"
            placeholder="06 12 34 56 78"
            required
            disabled={disabled}
          />
        </div>
      </div>

      <div className="checkout-form-group">
        <label htmlFor="adresse" className="checkout-form-label">
          Adresse *
        </label>
        <input
          type="text"
          id="adresse"
          name="adresse"
          value={livraisonInfo.adresse}
          onChange={handleChange}
          className="checkout-form-input"
          placeholder="Numéro et nom de rue"
          required
          disabled={disabled}
        />
      </div>

      <div className="checkout-form-group">
        <label htmlFor="code_postal" className="checkout-form-label">
          Code postal *
        </label>
        <input
          type="text"
          id="code_postal"
          name="code_postal"
          value={livraisonInfo.code_postal}
          onChange={handleChange}
          className="checkout-form-input"
          placeholder="75001"
          required
          disabled={disabled}
        />
      </div>
    </div>
  );
};

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
