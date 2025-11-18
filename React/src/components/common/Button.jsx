import './Button.css';

/**
 * Composant Button - Bouton réutilisable avec CSS dédié
 * 
 * Props:
 * - children: Contenu du bouton
 * - variant: 'primary' | 'secondary' | 'danger' | 'outline'
 * - size: 'sm' | 'md' | 'lg'
 * - onClick: Fonction au clic
 * - disabled: Désactivé
 * - fullWidth: Largeur complète
 * - type: 'button' | 'submit' | 'reset'
 * - className: Classes CSS supplémentaires
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  fullWidth = false,
  type = 'button',
  className = '',
  ...props
}) => {
  const classes = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    fullWidth && 'btn-full',
    className
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
