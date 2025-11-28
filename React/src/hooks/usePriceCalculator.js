/**
 * usePriceCalculator - Hook pour calculer le prix total et l'acompte
 *
 * Principe SOLID : Responsabilité unique (calculs financiers)
 *
 * @param {Object} config - Configuration sélectionnée par l'utilisateur
 * @returns {Object} - Prix total et acompte (20%)
 */
import { useMemo } from "react";

const TAUX_ACOMPTE = 0.2; // 20%

const usePriceCalculator = (config) => {
  const prixTotal = useMemo(() => {
    let total = 0;

    // Prix de base de la variante
    if (config.variante) {
      total += config.variante.prix_base || 0;
    }

    // Options supplémentaires
    if (config.couleur_exterieur) {
      total += config.couleur_exterieur.prix || 0;
    }

    if (config.couleur_interieur) {
      total += config.couleur_interieur.prix || 0;
    }

    if (config.taille_jante) {
      total += config.taille_jante.prix || 0;
    }

    if (config.siege) {
      total += config.siege.prix || 0;
    }

    if (config.package) {
      total += config.package.prix || 0;
    }

    return total;
  }, [config]);

  const acompte = useMemo(() => {
    return Math.round(prixTotal * TAUX_ACOMPTE);
  }, [prixTotal]);

  return {
    prixTotal,
    acompte,
    resteAPayer: prixTotal - acompte,
  };
};

export default usePriceCalculator;
