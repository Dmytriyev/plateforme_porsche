import './Input.css';

/**
 * Composant Input - Champ de saisie avec CSS dédié
 * 
 * Props:
 * - label: Label du champ
 * - type: Type d'input
 * - name: Nom du champ
 * - value: Valeur
 * - onChange: Fonction de changement
 * - placeholder: Placeholder
 * - error: Message d'erreur
 * - required: Champ obligatoire
 * - disabled: Désactivé
 * - className: Classes supplémentaires
 */
const Input = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder = '',
  error = '',
  required = false,
  disabled = false,
  className = '',
  ...props
}) => {
  const inputClasses = [
    'input-field',
    error && 'error',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="input-container">
      {label && (
        <label htmlFor={name} className="input-label">
          {label}
          {required && <span className="required">*</span>}
        </label>
      )}
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={inputClasses}
        {...props}
      />
      {error && <p className="input-error-message">{error}</p>}
    </div>
  );
};

export default Input;
