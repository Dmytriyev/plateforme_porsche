import Voiture from "../models/voiture.model.js";
import voitureValidation from "../validations/voiture.validation.js";
import Photo from "../models/photo_voiture.model.js";
import {
  sendSuccess,
  sendError,
  sendNotFound,
  sendValidationError,
} from "../utils/responses.js";

const createVoiture = async (req, res) => {
  try {
    const { body } = req;
    // Vérifier que le corps de la requête n'est pas vide
    if (!body || Object.keys(body).length === 0) {
      return sendValidationError(res, "Pas de données dans la requête");
    }
    const { error } = voitureValidation(body).voitureCreate;
    if (error) {
      return sendValidationError(res, error.details[0].message);
    }
    // Vérifier que les photos existent
    if (body.photo_voiture && Array.isArray(body.photo_voiture)) {
      for (let photoId of body.photo_voiture) {
        const photo = await Photo.findById(photoId);
        if (!photo) {
          return sendNotFound(res, `La photo ${photoId} n'existe pas`);
        }
      }
    }
    const voiture = new Voiture(body);
    const newVoiture = await voiture.save();

    const populatedVoiture = await Voiture.findById(newVoiture._id).populate(
      "photo_voiture",
      "name alt"
    );
    return sendSuccess(
      res,
      { voiture: populatedVoiture },
      "Gamme de voiture créée avec succès",
      201
    );
  } catch (error) {
    return sendError(res, "Erreur serveur", 500, error);
  }
};
/**
 * Récupérer toutes les gammes de voitures (public)
 * Ex: 911, Cayenne, Cayman, Panamera
 */
const getAllVoitures = async (req, res) => {
  try {
    const voitures = await Voiture.find()
      .populate("photo_voiture", "name alt")
      .sort({ createdAt: -1 }) // Trier par date de création décroissante
      .lean(); // Retourne des plain JS objects au lieu d'instances de documents (plus léger)
    return sendSuccess(res, voitures);
  } catch (error) {
    return sendError(res, "Erreur serveur", 500, error);
  }
};

const getVoitureById = async (req, res) => {
  try {
    const voiture = await Voiture.findById(req.params.id)
      .populate("photo_voiture", "name alt")
      .lean();
    if (!voiture) {
      return sendNotFound(res, "Gamme de voiture introuvable");
    }
    return sendSuccess(res, voiture);
  } catch (error) {
    return sendError(res, "Erreur serveur", 500, error);
  }
};

const updateVoiture = async (req, res) => {
  try {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
      return sendValidationError(res, "Pas de données dans la requête");
    }

    const { error } = voitureValidation(body).voitureUpdate;
    if (error) {
      return sendValidationError(res, error.details[0].message);
    }
    // Vérifier que la gamme existe
    const voitureExist = await Voiture.findById(req.params.id);
    if (!voitureExist) {
      return sendNotFound(res, "Gamme de voiture introuvable");
    }

    // C'est une manière d'isoler le champ d'images des autres données pour le traiter
    const { photo_voiture, ...otherData } = body;
    let updateQuery = otherData;

    // Vérifier que les photos existent avant de les ajouter
    if (
      photo_voiture &&
      Array.isArray(photo_voiture) &&
      photo_voiture.length > 0
    ) {
      for (let photoId of photo_voiture) {
        const photo = await Photo.findById(photoId);
        if (!photo) {
          return sendNotFound(res, `La photo ${photoId} n'existe pas`);
        }
      }
      // Ajouter les nouvelles photos sans dupliquer les existantes
      updateQuery = {
        ...otherData,
        $addToSet: { photo_voiture: { $each: photo_voiture } },
      };
    }
    // Mettre à jour la voiture avec les nouvelles données
    const updatedVoiture = await Voiture.findByIdAndUpdate(
      req.params.id,
      updateQuery,
      { new: true }
    ).populate("photo_voiture", "name alt");

    if (!updatedVoiture) {
      return sendNotFound(res, "Gamme de voiture introuvable");
    }
    return sendSuccess(
      res,
      { voiture: updatedVoiture },
      "Gamme de voiture mise à jour avec succès"
    );
  } catch (error) {
    return sendError(res, "Erreur serveur", 500, error);
  }
};
/**
 * Supprimer une gamme de voiture (admin)
 * ATTENTION: Supprimera toutes les variantes MODEL_PORSCHE associées
 */
const deleteVoiture = async (req, res) => {
  try {
    const voiture = await Voiture.findByIdAndDelete(req.params.id);
    if (!voiture) {
      return sendNotFound(res, "Gamme de voiture introuvable");
    }
    return sendSuccess(res, null, "Gamme de voiture supprimée avec succès");
  } catch (error) {
    return sendError(res, "Erreur serveur", 500, error);
  }
};

const addImages = async (req, res) => {
  try {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
      return sendValidationError(res, "Pas de données dans la requête");
    }

    const { error } = voitureValidation(body).voitureAddOrRemoveImage;
    if (error) {
      return sendValidationError(res, error.details[0].message);
    }

    // Vérifier que la gamme existe
    const voiture = await Voiture.findById(req.params.id);
    if (!voiture) {
      return sendNotFound(
        res,
        `La gamme de voiture ${req.params.id} n'existe pas`
      );
    }

    // Vérifier que les photos existent
    for (let photo_voitureId of body.photo_voiture) {
      const photo_voiture = await Photo.findById(photo_voitureId);
      if (!photo_voiture) {
        return sendNotFound(res, `La photo ${photo_voitureId} n'existe pas`);
      }
    }

    // $addToSet évite les doublons
    const updatedVoiture = await Voiture.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { photo_voiture: { $each: body.photo_voiture } } },
      { new: true }
    ).populate("photo_voiture", "name alt");

    return sendSuccess(
      res,
      { voiture: updatedVoiture },
      "Photos ajoutées avec succès"
    );
  } catch (error) {
    return sendError(res, "Erreur serveur", 500, error);
  }
};

const removeImages = async (req, res) => {
  try {
    const { body } = req;
    if (!body || Object.keys(body).length === 0) {
      return sendValidationError(res, "Pas de données dans la requête");
    }

    const { error } = voitureValidation(body).voitureAddOrRemoveImage;
    if (error) {
      return sendValidationError(res, error.details[0].message);
    }

    const voiture = await Voiture.findById(req.params.id);
    if (!voiture) {
      return sendNotFound(
        res,
        `La gamme de voiture ${req.params.id} n'existe pas`
      );
    }

    // Vérifier que les photos existent
    for (let photo_voitureId of body.photo_voiture) {
      const photo_voiture = await Photo.findById(photo_voitureId);
      if (!photo_voiture) {
        return sendNotFound(res, `La photo ${photo_voitureId} n'existe pas`);
      }
    }
    // Supprimer les photos spécifiées de la voiture
    const updatedVoiture = await Voiture.findByIdAndUpdate(
      req.params.id,
      { $pull: { photo_voiture: { $in: body.photo_voiture } } },
      { new: true }
    ).populate("photo_voiture", "name alt");

    return sendSuccess(
      res,
      { voiture: updatedVoiture },
      "Photos supprimées avec succès"
    );
  } catch (error) {
    return sendError(res, "Erreur serveur", 500, error);
  }
};
/**
 * Récupérer toutes les VARIANTES d'une GAMME (public)
 * Ex: Toutes les variantes de la gamme 911 (Carrera, GTS, Turbo)
 */
const getModelsPorscheByVoiture = async (req, res) => {
  try {
    const voiture = await Voiture.findById(req.params.id);
    if (!voiture) {
      return sendNotFound(res, "Gamme de voiture introuvable");
    }

    // Import dynamique pour éviter les dépendances circulaires
    const Model_porsche = (await import("../models/model_porsche.model.js"))
      .default;

    const models_porsche = await Model_porsche.find({ voiture: req.params.id })
      .populate("photo_porsche", "name alt")
      .populate("couleur_exterieur", "nom_couleur photo_couleur prix")
      .populate("couleur_interieur", "nom_couleur photo_couleur prix")
      .populate("taille_jante", "taille_jante couleur_jante photo_jante prix")
      .populate("package", "nom_package prix")
      .populate("siege", "nom_siege prix")
      .sort({ prix_base: 1 }); // Trier par prix croissant

    return sendSuccess(res, {
      gamme: {
        _id: voiture._id,
        nom_model: voiture.nom_model,
        type_voiture: voiture.type_voiture,
        description: voiture.description,
      },
      variantes: models_porsche,
      count: models_porsche.length,
    });
  } catch (error) {
    return sendError(res, "Erreur serveur", 500, error);
  }
};

const getVoituresNeuves = async (req, res) => {
  try {
    const Model_porsche = (await import("../models/model_porsche.model.js"))
      .default;

    // 1. Récupérer voitures neuves avec photos
    const voitures = await Voiture.find({ type_voiture: true })
      .populate("photo_voiture", "name alt")
      .lean();

    if (!voitures || voitures.length === 0) {
      return sendSuccess(res, { voitures: [], count: 0 });
    }

    // Récupérer variantes disponibles (optimisation: query unique)
    const voitureIds = voitures.map((v) => v._id);
    const variantes = await Model_porsche.find({
      voiture: { $in: voitureIds },
      disponible: true,
    })
      .select("voiture prix_base type_carrosserie specifications")
      .lean();

    // 3. Grouper variantes par voiture_id
    const variantesMap = {};
    variantes.forEach((v) => {
      const id = v.voiture._id.toString();
      if (!variantesMap[id]) variantesMap[id] = [];
      variantesMap[id].push(v);
    });

    // 4. Enrichir chaque voiture avec données agrégées
    const voituresEnrichies = voitures
      .map((voiture) => {
        const vars = variantesMap[voiture._id.toString()];
        if (!vars || vars.length === 0) return null;

        // Extraction carburant depuis moteur
        const carburants = new Set();
        vars.forEach((v) => {
          const moteur = (v.specifications?.moteur || "").toLowerCase();
          if (moteur.includes("électrique") || moteur.includes("electric"))
            carburants.add("Électrique");
          else if (moteur.includes("hybride") || moteur.includes("hybrid"))
            carburants.add("Hybride");
          else if (
            moteur.includes("essence") ||
            moteur.includes("turbo") ||
            moteur.includes("flat")
          )
            carburants.add("Essence");
        });

        // Extraction carrosseries (Coupé, Cabriolet, Targa, SUV)
        const carrosseries = [
          ...new Set(vars.map((v) => v.type_carrosserie).filter(Boolean)),
        ];

        // Extraction transmissions
        const transmissions = new Set();
        vars.forEach((v) => {
          const trans = v.specifications?.transmission || "";
          if (trans.includes("PDK")) transmissions.add("Automatique");
          if (trans.includes("Manuelle")) transmissions.add("Manuelle");
        });

        // Calcul prix minimal (prix_depuis) - utilise prix_base de chaque VARIANTE
        const prixListe = vars
          .map((v) => v.prix_base || 0)
          .filter((p) => p > 0);
        const prixMin = prixListe.length > 0 ? Math.min(...prixListe) : 0;

        // Validation minimale
        if (carrosseries.length === 0 || prixMin === 0) return null;

        return {
          _id: voiture._id,
          nom_model: voiture.nom_model,
          description: voiture.description,
          photo_voiture: voiture.photo_voiture || [],
          types_carburant: Array.from(carburants),
          carrosseries_disponibles: carrosseries,
          transmissions_disponibles: Array.from(transmissions),
          prix_depuis: prixMin,
          nombre_variantes: vars.length,
        };
      })
      .filter(Boolean);

    return sendSuccess(res, {
      voitures: voituresEnrichies,
      count: voituresEnrichies.length,
    });
  } catch (error) {
    return sendError(
      res,
      "Erreur récupération voitures neuves configurateur",
      error
    );
  }
};

const getVoituresOccasionFinder = async (req, res) => {
  try {
    const Model_porsche = (await import("../models/model_porsche.model.js"))
      .default;

    // Filtres depuis query params
    const { modele, carrosserie, annee_min, annee_max, prix_max } = req.query;

    // Query voitures occasion
    const voituresQuery = { type_voiture: false };
    if (modele) {
      voituresQuery.nom_model = new RegExp(modele, "i");
    }

    const voitures = await Voiture.find(voituresQuery).lean();
    if (!voitures || voitures.length === 0) {
      return sendSuccess(res, { voitures: [], count: 0 });
    }

    // Filtres model_porsche
    const filters = {
      voiture: { $in: voitures.map((v) => v._id) },
      disponible: true,
    };

    if (carrosserie) {
      filters.type_carrosserie = new RegExp(carrosserie, "i");
    }
    if (annee_min || annee_max) {
      filters.annee_production = {};
      if (annee_min) filters.annee_production.$gte = new Date(annee_min);
      if (annee_max) filters.annee_production.$lte = new Date(annee_max);
    }

    // Filtrer par prix_base de la variante
    if (prix_max) {
      filters.prix_base = { $lte: parseInt(prix_max) };
    }

    // Récupérer occasions
    const occasions = await Model_porsche.find(filters)
      .populate("voiture", "nom_model description photo_voiture")
      .populate("couleur_exterieur", "nom_couleur")
      .populate("couleur_interieur", "nom_couleur")
      .sort({ annee_production: -1 })
      .lean();

    const occasionsFiltrees = occasions;

    // Formater selon Porsche Approved (champs existants uniquement)
    const voituresFormatees = occasionsFiltrees.map((occasion) => {
      const voiture = occasion.voiture || {};

      return {
        _id: occasion._id,
        nom_model: occasion.nom_model,
        voiture_base: {
          _id: voiture._id,
          nom_model: voiture.nom_model,
          description: voiture.description,
          photo_voiture: voiture.photo_voiture || [],
        },
        type_carrosserie: occasion.type_carrosserie,
        annee_production: occasion.annee_production,
        couleur_exterieur: occasion.couleur_exterieur?.nom_couleur || "N/A",
        couleur_interieur:
          occasion.couleur_interieur?.map((c) => c.nom_couleur).join(", ") ||
          "N/A",
        specifications: {
          moteur: occasion.specifications?.moteur || "N/A",
          puissance: occasion.specifications?.puissance || 0,
          transmission: occasion.specifications?.transmission || "N/A",
          acceleration_0_100: occasion.specifications?.acceleration_0_100 || 0,
          vitesse_max: occasion.specifications?.vitesse_max || 0,
          consommation: occasion.specifications?.consommation || 0,
        },
        prix_base_variante: occasion.prix_base || 0,
        concessionnaire: occasion.concessionnaire || "Centre Porsche",
        numero_vin: occasion.numero_vin || "N/A",
        disponible: occasion.disponible,
      };
    });

    return sendSuccess(res, {
      voitures: voituresFormatees,
      count: voituresFormatees.length,
      filtres_appliques: {
        modele: modele || "tous",
        carrosserie: carrosserie || "toutes",
        annee: annee_min && annee_max ? `${annee_min}-${annee_max}` : "toutes",
        prix_max: prix_max || "illimité",
      },
    });
  } catch (error) {
    return sendError(res, "Erreur récupération voitures occasion", error);
  }
};

export {
  createVoiture,
  getAllVoitures,
  getVoitureById,
  updateVoiture,
  deleteVoiture,
  addImages,
  removeImages,
  getModelsPorscheByVoiture,
  getVoituresNeuves,
  getVoituresOccasionFinder,
};
