/**
 * usePackageFilter - Hook pour filtrer les packages selon le modèle de voiture
 *
 * Logique métier isolée (SOLID - Single Responsibility)
 *
 * @param {Array} packages - Liste complète des packages
 * @param {Object} variante - Variante de voiture sélectionnée
 * @returns {Array} - Packages filtrés pour le modèle
 */
import { useMemo } from "react";
import { debug } from "../utils/logger";

/**
 * Filtre les packages selon le modèle de voiture
 * - Sport Chrono : disponible pour tous les modèles
 * - Weissach : réservé aux 911 et Cayman
 */
const filtrerPackagesParModele = (packages, variante) => {
  if (!variante || !Array.isArray(packages)) {
    if (import.meta.env.DEV) {
      debug("filtrerPackagesParModele: variante ou packages invalides");
    }
    return [];
  }

  // Normalisation du nom du modèle
  const nomModel = (variante.nom_model || "").trim().toUpperCase();

  // Détermination du modèle de base
  let modeleBase;
  if (
    nomModel.includes("GT3") ||
    nomModel.includes("GT2") ||
    nomModel.includes("TURBO") ||
    nomModel.includes("CARRERA") ||
    nomModel.includes("TARGA") ||
    nomModel.includes("911")
  ) {
    modeleBase = "911";
  } else if (nomModel.includes("CAYMAN") || nomModel.includes("GT4")) {
    modeleBase = "CAYMAN";
  } else if (nomModel.includes("CAYENNE")) {
    modeleBase = "CAYENNE";
  } else {
    modeleBase = nomModel.split(" ")[0];
  }

  // Filtrage des packages
  return packages.filter((pkg) => {
    const nomPackage = (pkg.nom_package || "").trim().toLowerCase();

    // Sport Chrono : tous les modèles
    if (nomPackage.includes("sport chrono")) {
      return true;
    }

    // Weissach : 911 et Cayman uniquement
    if (nomPackage.includes("weissach")) {
      const modelesAutorises = ["911", "CAYMAN"];
      return modelesAutorises.includes(modeleBase);
    }

    // Autres packages : tous autorisés par défaut
    return true;
  });
};

const usePackageFilter = (packages, variante) => {
  const packagesFiltres = useMemo(
    () => filtrerPackagesParModele(packages, variante),
    [packages, variante]
  );

  return packagesFiltres;
};

export default usePackageFilter;
