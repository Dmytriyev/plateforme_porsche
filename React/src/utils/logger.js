const isProduction = import.meta.env && import.meta.env.MODE === "production";
// Logger minimal qui désactive les logs en production
export const debug = (...args) => {
  if (!isProduction && console && console.debug) console.debug(...args);
};
// Logger minimal qui désactive les warnings en production
export const warn = (...args) => {
  if (!isProduction && console && console.warn) console.warn(...args);
};
// Logger minimal qui désactive les erreurs en production
export const error = (...args) => {
  if (!isProduction && console && console.error) console.error(...args);
};

export default { debug, warn, error };
