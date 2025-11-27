// Utility to select the best photo for a variante
export default function selectPhotoForVariante(variante = {}, isNeuf = false) {
  const chooseFrom = (arr) => {
    if (!Array.isArray(arr)) return null;
    const valid = arr.filter((p) => p && (p.name || p._id));
    if (valid.length > 2) return valid[2];
    if (valid.length > 0) return valid[valid.length - 1];
    return null;
  };

  if (isNeuf) {
    return chooseFrom(variante.photo_porsche || []);
  }

  return (
    chooseFrom(variante.photo_porsche || []) ||
    chooseFrom(
      Array.isArray(variante.photo_voiture)
        ? variante.photo_voiture
        : variante.photo_voiture
        ? [variante.photo_voiture]
        : []
    ) ||
    chooseFrom(variante.voiture?.photo_voiture || []) ||
    chooseFrom(variante.voiture_base?.photo_voiture || []) ||
    null
  );
}
