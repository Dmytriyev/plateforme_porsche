// Helper to normalize API responses and errors for services
export function extractData(response) {
  if (!response) return null;
  const d = response.data;
  if (d === undefined) return null;
  // Prefer `.data` when present (standard API envelope), otherwise return the object itself
  if (d && d.data !== undefined) return d.data;
  return d;
}

export function extractArray(response) {
  if (!response) {
    return [];
  }
  
  // Cas 1: response.data est directement un tableau
  if (response.data && Array.isArray(response.data)) {
    return response.data;
  }
  
  // Cas 2: Format standardisé sendSuccess { success: true, data: [...], message: "..." }
  if (response.data && response.data.data !== undefined) {
    if (Array.isArray(response.data.data)) {
      return response.data.data;
    }
    // Si data.data est un objet avec une propriété voitures/accesoires/etc.
    if (typeof response.data.data === 'object' && !Array.isArray(response.data.data)) {
      const arrayKeys = ['voitures', 'accesoires', 'data', 'items', 'results'];
      for (const key of arrayKeys) {
        if (response.data.data[key] && Array.isArray(response.data.data[key])) {
          return response.data.data[key];
        }
      }
    }
  }
  
  // Cas 3: Utiliser extractData pour extraire les données
  const data = extractData(response);
  
  // Si data est déjà un tableau, le retourner directement
  if (Array.isArray(data)) {
    return data;
  }
  
  // Cas 4: Si data est un objet, chercher des propriétés communes qui contiennent des tableaux
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const arrayKeys = ['data', 'voitures', 'accesoires', 'objets', 'items', 'results'];
    for (const key of arrayKeys) {
      if (data[key] && Array.isArray(data[key])) {
        return data[key];
      }
    }
  }
  
  return [];
}

export function handleServiceError(error) {
  // normalize thrown value for callers
  const payload = error?.response?.data || error;
  throw payload;
}

export default {
  extractData,
  extractArray,
  handleServiceError,
};
