// Utilitaires pour le catalogue de voitures
import { API_URL } from "../config/api";
// Génère l'URL complète d'une photo
export const getPhotoUrl = (photo) => {
  if (!photo?.name) return null;
  if (photo.name.startsWith("http")) {
    return photo.name;
  }
  if (photo.name.startsWith("/")) {
    return `${API_URL}${photo.name}`;
  }
  return `${API_URL}/${photo.name}`;
};
// Récupère la photo principale d'une liste de photos
export const getPhotoPrincipale = (photos) => {
  if (!Array.isArray(photos) || photos.length === 0) {
    return null;
  }
  // Priorité à la 3ème photo (index 2)
  if (photos.length > 2) {
    return photos[2];
  }
  // Sinon dernière photo
  return photos[photos.length - 1];
};

// Groupe les voitures neuves par modèle
export const grouperVoituresNeuves = (voitures) => {
  const modelesGroupes = {};
  // Regroupement des voitures par nom de modèle
  voitures.forEach((voiture) => {
    const nomModel = voiture.nom_model;
    if (!nomModel) return;
    // Initialisation du groupe si inexistant
    if (!modelesGroupes[nomModel]) {
      // Création du groupe modèle
      modelesGroupes[nomModel] = {
        nom_model: nomModel,
        photo_voiture: voiture.photo_voiture || [],
        prix_base: voiture.prix_base || 0,
        _id: voiture._id,
        type_voiture: voiture.type_voiture,
      };
    }
    // Prix minimum
    const prix = voiture.prix_base || 0;
    if (
      prix > 0 &&
      (modelesGroupes[nomModel].prix_base === 0 ||
        prix < modelesGroupes[nomModel].prix_base)
    ) {
      modelesGroupes[nomModel].prix_base = prix;
    }

    // Première photo disponible
    if (
      modelesGroupes[nomModel].photo_voiture.length === 0 &&
      voiture.photo_voiture?.length > 0
    ) {
      // Ajouter la photo de la voiture
      modelesGroupes[nomModel].photo_voiture = voiture.photo_voiture;
    }
  });

  return Object.values(modelesGroupes);
};
// Groupe les occasions par modèle
export const grouperOccasions = (occasions) => {
  const modelesGroupes = {};
  // Regroupement des occasions par nom de modèle
  occasions.forEach((occasion) => {
    const nomModel =
      occasion.voiture_base?.nom_model || occasion.nom_model || "";

    if (!nomModel) return;
    // Initialisation du groupe si inexistant
    if (!modelesGroupes[nomModel]) {
      modelesGroupes[nomModel] = {
        nom_model: nomModel,
        occasions: [],
        photo_voiture: [],
        description: "",
        voiture_base: null,
      };
    }
    // Ajout de l'occasion au groupe
    modelesGroupes[nomModel].occasions.push(occasion);
    // Photos du modèle de base
    if (
      // Ajouter les photos si absentes
      occasion.voiture_base?.photo_voiture &&
      modelesGroupes[nomModel].photo_voiture.length === 0
    ) {
      // Vérification du format des photos
      if (Array.isArray(occasion.voiture_base.photo_voiture)) {
        // Format tableau de photos
        modelesGroupes[nomModel].photo_voiture =
          occasion.voiture_base.photo_voiture.filter(
            (p) => p && (p.name || p._id)
          );
      } else if (
        // Format unique de photo
        typeof occasion.voiture_base.photo_voiture === "object" &&
        occasion.voiture_base.photo_voiture.name
      ) {
        modelesGroupes[nomModel].photo_voiture = [
          occasion.voiture_base.photo_voiture,
        ];
      }
    }
    // Description
    if (
      // Ajouter la description si absente
      !modelesGroupes[nomModel].description &&
      occasion.voiture_base?.description
    ) {
      modelesGroupes[nomModel].description = occasion.voiture_base.description;
    }
    // Référence modèle de base
    if (!modelesGroupes[nomModel].voiture_base && occasion.voiture_base) {
      modelesGroupes[nomModel].voiture_base = occasion.voiture_base;
    }
  });
  // Convertir en tableau avec statistiques
  return Object.values(modelesGroupes).map((groupe) => {
    // Calcul du prix minimum parmi les occasions
    const prixListe = groupe.occasions
      // Extraction des prix valides
      .map((occ) => occ.prix_base_variante || occ.prix_base || 0)
      .filter((p) => p > 0);
    const prixMin = prixListe.length > 0 ? Math.min(...prixListe) : 0;
    // Préparation de l'objet modèle final
    const carrosseries = [
      ...new Set(
        groupe.occasions.map((occ) => occ.type_carrosserie).filter(Boolean)
      ),
    ];
    // Préparation des transmissions disponibles
    const transmissions = new Set();
    // Parcours des occasions pour extraire les types de transmission
    groupe.occasions.forEach((occ) => {
      // Extraction du type de transmission
      const trans = occ.specifications?.transmission || "";
      //   Ajout au Set pour éviter les doublons
      if (trans.includes("PDK") || trans.includes("Automatique")) {
        transmissions.add("Automatique");
      }
      //   Ajout au Set pour éviter les doublons
      if (trans.includes("Manuelle")) {
        transmissions.add("Manuelle");
      }
    });

    return {
      // Informations du modèle
      _id: groupe.voiture_base?._id || groupe.nom_model,
      nom_model: groupe.nom_model,
      description:
        groupe.description ||
        `Porsche ${groupe.nom_model} d'occasion certifiée.`,
      photo_voiture: groupe.photo_voiture,
      type_voiture: false,
      nombre_occasions: groupe.occasions.length,
      prix_depuis: prixMin,
      carrosseries_disponibles: carrosseries,
      transmissions_disponibles: Array.from(transmissions),
    };
  });
};

// Trie les modèles selon un ordre prédéfini
export const trierModeles = (modeles) => {
  const ordreModeles = ["911", "Cayman", "Cayenne"];
  // Tri personnalisé selon l'ordre défini
  return [...modeles].sort((a, b) => {
    const indexA = ordreModeles.indexOf(a.nom_model);
    const indexB = ordreModeles.indexOf(b.nom_model);
    return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
  });
};
