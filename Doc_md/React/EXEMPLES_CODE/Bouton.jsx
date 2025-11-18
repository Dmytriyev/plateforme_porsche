// composants/communs/Bouton/Bouton.jsx
// Composant bouton réutilisable avec différentes variantes

import './Bouton.css';

/**
 * Composant Bouton réutilisable
 * 
 * @param {string} texte - Texte du bouton
 * @param {function} onClick - Fonction appelée au clic
 * @param {string} type - Type du bouton (button, submit, reset)
 * @param {string} variante - Style du bouton (primaire, secondaire, danger)
 * @param {string} taille - Taille du bouton (petit, moyen, grand)
 * @param {boolean} desactive - Désactiver le bouton
 * @param {boolean} pleineLargeur - Bouton pleine largeur
 * @param {string} icone - Classe icône (optionnel)
 * @param {boolean} chargement - Afficher un loader
 * 
 * @example
 * <Bouton 
 *   texte="Enregistrer" 
 *   onClick={handleClick}
 *   variante="primaire"
 * />
 */
export default function Bouton({
  texte,
  onClick,
  type = 'button',
  variante = 'primaire',
  taille = 'moyen',
  desactive = false,
  pleineLargeur = false,
  icone = null,
  chargement = false,
  ...autresProps
}) {
  // Classes CSS dynamiques
  const classes = [
    'bouton',
    `bouton--${variante}`,
    `bouton--${taille}`,
    pleineLargeur && 'bouton--pleine-largeur',
    chargement && 'bouton--chargement',
  ].filter(Boolean).join(' ');

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={desactive || chargement}
      {...autresProps}
    >
      {chargement && <span className="bouton__loader"></span>}
      {icone && !chargement && <span className={`bouton__icone ${icone}`}></span>}
      <span className="bouton__texte">{texte}</span>
    </button>
  );
}

