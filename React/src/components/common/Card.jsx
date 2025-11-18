/**
 * Composant Card - Carte réutilisable
 * 
 * Props:
 * - children: Contenu de la carte
 * - className: Classes supplémentaires
 * - padding: Taille du padding ('sm' | 'md' | 'lg')
 * - hover: Effet hover
 * - onClick: Fonction au clic
 */
const Card = ({
  children,
  className = '',
  padding = 'md',
  hover = false,
  onClick,
  ...props
}) => {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const hoverClasses = hover
    ? 'hover:shadow-2xl hover:-translate-y-1 cursor-pointer transition-all duration-300'
    : '';

  const classes = `bg-white rounded-lg shadow-lg ${paddingClasses[padding]} ${hoverClasses} ${className}`;

  return (
    <div className={classes} onClick={onClick} {...props}>
      {children}
    </div>
  );
};

export default Card;

