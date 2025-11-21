/**
 * Constantes globales de l'application
 * Réexporte les constantes principales pour un accès centralisé
 */
import { PORSCHE_MODELS } from "./model_porsche.constants.js";

export { PORSCHE_MODELS };

/**
 * Message d'erreur pour un modèle invalide
 */
export const INVALID_MODEL_MESSAGE = (value) =>
  `"${value}" n'est pas un modèle Porsche valide. Choisissez parmi: ${PORSCHE_MODELS.join(
    ", "
  )}`;

/**
 * Options des modèles Porsche pour les formulaires frontend
 */
export const PORSCHE_MODELS_OPTIONS = PORSCHE_MODELS.map((model) => ({
  value: model,
  label: model,
}));
