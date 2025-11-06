// des constantes globales utilisées dans plusieurs modules
import { PORSCHE_MODELS } from "./model_porsche.constants.js";
export { PORSCHE_MODELS };

// Message d'erreur
export const INVALID_MODEL_MESSAGE = (value) =>
  `"${value}" n'est pas un modèle Porsche valide. Choisissez parmi: ${PORSCHE_MODELS.join(
    ", "
  )}`;

// liste d'options pour React/Frontend
export const PORSCHE_MODELS_OPTIONS = PORSCHE_MODELS.map((model) => ({
  value: model,
  label: model,
}));
