/**
 * Logger simple
 * - Wrapper minimal autour de console pour centraliser les niveaux de logs
 * - En production on peut remplacer par pino/winston sans changer l'API
 */
/**
 * Logger simple
 * - Wrapper minimal autour de console pour uniformiser les niveaux
 * - En production on peut remplacer par Winston/ pino pour log structuré
 */
const isProduction = process.env.NODE_ENV === "production";

const noop = () => {};

const logger = {
  info: noop,
  warn: noop,
  error: (...args) => console.error("[ERROR]", ...args),
};

export default logger;
