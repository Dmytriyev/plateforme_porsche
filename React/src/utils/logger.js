// Logger client-side minimal: désactive les logs en production
const isProduction = import.meta.env && import.meta.env.MODE === "production";

export const debug = (...args) => {
  if (!isProduction && console && console.debug) console.debug(...args);
};

export const warn = (...args) => {
  if (!isProduction && console && console.warn) console.warn(...args);
};

export const error = (...args) => {
  if (!isProduction && console && console.error) console.error(...args);
};

export default { debug, warn, error };
