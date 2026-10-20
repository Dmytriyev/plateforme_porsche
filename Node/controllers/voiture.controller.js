/**
 * Contrôleur Voiture
 * - Gère les gammes de voitures : création, lecture, validation des photos
 *   et gestion des options par modèle
 */
// Gère les gammes de voitures ( 911, Cayenne, Cayman)
/**
 * Schéma Mongoose pour les configurations de modèles Porsche.
 * 1. USER visite voiture une model-start(911)
 * 2. USER choisit model_porsche une VARIANTE (Carrera, Carrera S, GTS, Turbo)
 * 3. Chaque variante a ses specs (puissance, transmission, accélération)
 * 4. USER configure: couleurs, jantes, sièges, package, options
 * 5. calcule prix total (prix_base_variante + options)
 * voiture = Modèle de voiture général (911, Cayman, Cayenne)
 */

import Voiture from "../models/voiture.model.js";
import voitureValidation from "../validations/voiture.validation.js";
import Photo from "../models/photo_voiture.model.js";
import { PORSCHE_MODELS } from "../utils/model_porsche.constants.js";
import logger from "../utils/logger.js";
import {
  sendSuccess,
  sendError,
  sendNotFound,
  sendValidationError,
} from "../utils/responses.js";

// Créer une nouvelle gamme de voiture
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
      for (const photoId of body.photo_voiture) {
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
// Récupérer toutes les gammes de voitures 911, Cayenne, Cayman
const getAllVoitures = async (req, res) => {
  try {
    const voitures = await Voiture.find()
      .populate("photo_voiture", "name alt")
      .sort({ createdAt: -1 }) // Trier par date de création
      .lean(); // Retourne des plain JS objects (plus léger)
    // Retourner le tableau directement dans data pour compatibilité avec extractArray
    return sendSuccess(res, voitures, "Voitures récupérées avec succès");
  } catch (error) {
    return sendError(res, "Erreur serveur", 500, error);
  }
};

// Récupérer une gamme de voiture par ID
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

// Mettre à jour une gamme de voiture
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

    // Isoler le champ d'images des autres données pour le traiter
    const { photo_voiture, ...otherData } = body;

    // Vérifier que les photos existent avant de les ajouter
    if (
      photo_voiture &&
      Array.isArray(photo_voiture) &&
      photo_voiture.length > 0
    ) {
      for (const photoId of photo_voiture) {
        const photo = await Photo.findById(photoId);
        if (!photo) {
          return sendNotFound(res, `La photo ${photoId} n'existe pas`);
        }
      }
    }

    // Construire la requête de mise à jour
    const updateQuery =
      photo_voiture && Array.isArray(photo_voiture) && photo_voiture.length > 0
        ? {
            ...otherData,
            $addToSet: { photo_voiture: { $each: photo_voiture } },
          }
        : otherData;
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
// Supprimer une gamme de voiture avec model_porsche
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

// Ajouter des images à une gamme de voiture
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

// Supprimer des images d'une gamme de voiture
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
      // $pull pour supprimer les photos spécifiées
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
// Récupérer tous les modèles Porsche associés à une gamme de voiture
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

// Récupérer toutes les voitures neuves pour le configurateur
const getVoituresNeuves = async (req, res) => {
  try {
    const Model_porsche = (await import("../models/model_porsche.model.js"))
      .default;

    // Récupérer voitures neuves avec photos associées (type_voiture: true)
    const voitures = await Voiture.find({ type_voiture: true })
      .populate("photo_voiture", "name alt")
      .lean();
    // Gérer le cas où il n'y a pas de voitures disponibles
    if (!voitures || voitures.length === 0) {
      return sendSuccess(res, { voitures: [], count: 0 });
    }

    // Récupérer variantes disponibles pour ces voitures
    const voitureIds = voitures.map((v) => v._id);
    const variantes = await Model_porsche.find({
      voiture: { $in: voitureIds },
      disponible: true,
    })
      .select("voiture prix_base type_carrosserie specifications")
      .lean();

    // Grouper variantes par voiture_id pour un accès facile
    const variantesMap = {};
    variantes.forEach((v) => {
      const id = v.voiture._id.toString();
      if (!variantesMap[id]) variantesMap[id] = [];
      variantesMap[id].push(v);
    });

    // Ajouter données agrégées à chaque voiture
    const voituresEnrichies = voitures
      .map((voiture) => {
        const vars = variantesMap[voiture._id.toString()];
        if (!vars || vars.length === 0) return null;

        // carrosseries (Coupé, Cabriolet, Targa, SUV)
        const carrosseries = [
          ...new Set(vars.map((v) => v.type_carrosserie).filter(Boolean)),
        ];

        // transmissions (Automatique, Manuelle)
        const transmissions = new Set();
        vars.forEach((v) => {
          const trans = v.specifications?.transmission || "";
          if (trans.includes("PDK")) transmissions.add("Automatique");
          if (trans.includes("Manuelle")) transmissions.add("Manuelle");
        });

        // Calcul prix_base de chaque voiture
        const prixListe = vars
          .map((v) => v.prix_base || 0)
          .filter((p) => p > 0);
        const prixMin = prixListe.length > 0 ? Math.min(...prixListe) : 0;
        if (carrosseries.length === 0 || prixMin === 0) return null;
        return {
          _id: voiture._id,
          nom_model: voiture.nom_model,
          description: voiture.description,
          photo_voiture: voiture.photo_voiture || [],
          carrosseries_disponibles: carrosseries,
          transmissions_disponibles: Array.from(transmissions),
          prix_depuis: prixMin,
          nombre_variantes: vars.length,
        };
      })
      .filter(Boolean);

    // Si aucune variante détaillée n'a été trouvée, retourner les voitures de base
    if (!voituresEnrichies || voituresEnrichies.length === 0) {
      const voituresSimples = voitures.map((voiture) => ({
        _id: voiture._id,
        nom_model: voiture.nom_model,
        description: voiture.description,
        photo_voiture: voiture.photo_voiture || [],
        type_voiture: voiture.type_voiture,
        message:
          "Variantes détaillées non disponibles - Contactez le concessionnaire",
      }));

      return sendSuccess(res, {
        voitures: voituresSimples,
        count: voituresSimples.length,
      });
    }

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
// Recherche de voiture d'occasion
const getVoituresOccasionFinder = async (req, res) => {
  try {
    const Model_porsche = (await import("../models/model_porsche.model.js"))
      .default;
    const { modele, carrosserie, annee_min, annee_max, prix_max } = req.query;
    // Récupérer les voitures d'occasion associées (type_voiture: false)
    const voituresQuery = { type_voiture: false };
    if (modele) {
      // nom_model est un enum ('911', 'Cayman', 'Cayenne') dans le modèle Voiture
      // Valider que le modèle est dans les valeurs autorisées
      if (PORSCHE_MODELS.includes(modele)) {
        voituresQuery.nom_model = modele;
      } else {
        // Si le modèle n'est pas valide, retourner un résultat vide
        return sendSuccess(res, {
          voitures: [],
          count: 0,
          message: `Modèle "${modele}" non valide. Modèles disponibles: ${PORSCHE_MODELS.join(
            ", "
          )}`,
        });
      }
    }
    const voitures = await Voiture.find(voituresQuery)
      .populate("photo_voiture", "name alt")
      .lean();
    // Vérifier si des voitures d'occasion ont été trouvées
    if (!voitures || voitures.length === 0) {
      return sendSuccess(res, {
        voitures: [],
        count: 0,
        message: "Aucune voiture d'occasion ne correspond aux critères",
      });
    }

    // Filtres model_porsche
    const filters = {
      voiture: { $in: voitures.map((v) => v._id) },
    };

    // Appliquer les filtres de recherche (échapper pour éviter ReDoS)
    if (carrosserie) {
      const escapedCarrosserie = carrosserie.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );
      filters.type_carrosserie = new RegExp(escapedCarrosserie, "i");
    }

    // Appliquer les filtres d'année de production
    if (annee_min || annee_max) {
      filters.annee_production = {};
      // Filtrer par année de production
      if (annee_min) filters.annee_production.$gte = new Date(annee_min);
      if (annee_max) filters.annee_production.$lte = new Date(annee_max);
    }
    // Filtrer par prix_base
    if (prix_max) {
      filters.prix_base = { $lte: parseInt(prix_max, 10) };
    }
    // Récupérer occasions avec les filtres appliqués
    const occasions = await Model_porsche.find(filters)
      .populate("voiture", "nom_model description")
      .populate("couleur_exterieur", "nom_couleur")
      .populate("couleur_interieur", "nom_couleur")
      .populate("photo_porsche", "name alt _id")
      .sort({ annee_production: -1 })
      .lean();

    // Récupérer les voitures uniques pour charger leurs photos
    const voitureIds = [
      ...new Set(occasions.map((o) => o.voiture?._id).filter(Boolean)),
    ];
    const voituresAvecPhotos = await Voiture.find({ _id: { $in: voitureIds } })
      .populate("photo_voiture", "name alt")
      .lean();

    // Créer un map pour accès rapide
    const voituresMap = new Map(
      voituresAvecPhotos.map((v) => [v._id.toString(), v])
    );

    // Si aucune variante Model_porsche n'existe, retourner les Voitures d'occasion de base
    if (!occasions || occasions.length === 0) {
      logger.warn(
        "[getVoituresOccasionFinder] Aucun Model_porsche trouvé, retour des Voitures de base"
      );
      // Retourner les voitures d'occasion de base sans variantes détaillées
      const voituresSimples = voitures.map((voiture) => ({
        _id: voiture._id,
        nom_model: voiture.nom_model,
        voiture_base: {
          _id: voiture._id,
          nom_model: voiture.nom_model,
          description: voiture.description,
          photo_voiture: voiture.photo_voiture || [],
        },
        description: voiture.description,
        photo_voiture: voiture.photo_voiture || [],
        type_voiture: voiture.type_voiture,
        type_carrosserie: "N/A",
        annee_production: null,
        couleur_exterieur: "N/A",
        couleur_interieur: "N/A",
        specifications: {
          moteur: "N/A",
          puissance: 0,
          transmission: "N/A",
          acceleration_0_100: 0,
          vitesse_max: 0,
          consommation: 0,
        },
        prix_base_variante: 0,
        concessionnaire: "Centre Porsche",
        numero_vin: "N/A",
        disponible: true,
        message:
          "Variantes détaillées non disponibles - Contactez le concessionnaire",
      }));

      return sendSuccess(res, {
        voitures: voituresSimples,
        count: voituresSimples.length,
        filtres_appliques: {
          modele: modele || "tous",
          carrosserie: carrosserie || "toutes",
          annee:
            annee_min && annee_max ? `${annee_min}-${annee_max}` : "toutes",
          prix_max: prix_max || "illimité",
        },
      });
    }

    // Appliquer les filtres et formater les résultats Porsche Certified
    const occasionsFiltrees = occasions;

    // Log la première occasion pour voir si voiture est populé
    if (occasionsFiltrees.length > 0) {
      logger.info(`[getVoituresOccasionFinder] Première occasion:`, {
        _id: occasionsFiltrees[0]._id,
        nom_model: occasionsFiltrees[0].nom_model,
        voiture: occasionsFiltrees[0].voiture,
        voiture_id_raw: occasionsFiltrees[0].voiture?._id || "undefined",
      });
    }
    // Formater les données de chaque voiture d'occasion
    const voituresFormatees = occasionsFiltrees.map((occasion) => {
      const voiture = occasion.voiture || {};
      const voitureAvecPhotos =
        voituresMap.get(voiture._id?.toString()) || voiture;

      // Assembler les données formatées de la voiture d'occasion
      return {
        _id: occasion._id,
        nom_model: occasion.nom_model || (voiture && voiture.nom_model) || "",
        voiture_base: {
          _id: voiture._id || null,
          nom_model: voiture.nom_model || "",
          description: voiture.description || "",
          photo_voiture: voitureAvecPhotos.photo_voiture || [],
        },
        photo_porsche: occasion.photo_porsche || [],
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
        prix_base: occasion.prix_base || 0,
        concessionnaire: occasion.concessionnaire || "Centre Porsche",
        numero_vin: occasion.numero_vin || "N/A",
        disponible: occasion.disponible,
      };
    });
    // Retourner les résultats avec les filtres appliqués et le compte total
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

// Page  complète d'une voiture model-start (911, Cayman, Cayenne)
const getVoiturePage = async (req, res) => {
  try {
    const voitureId = req.params.id;

    // Récupérer la voiture avec ses photos
    const voiture = await Voiture.findById(voitureId)
      .populate("photo_voiture", "name alt")
      .lean();
    // Vérifier que la voiture existe
    if (!voiture) {
      return sendNotFound(res, "Gamme de voiture introuvable");
    }

    // Import dynamique pour éviter les dépendances circulaires
    const Model_porsche = (await import("../models/model_porsche.model.js"))
      .default;

    // Récupérer toutes les variantes disponibles pour cette voiture
    const variantes = await Model_porsche.find({
      voiture: voitureId,
      disponible: true,
    })
      .select(
        "nom_model type_carrosserie description specifications prix_base photo_porsche"
      )
      .populate("photo_porsche", "name alt")
      .sort({ prix_base: 1 })
      .lean();

    // Calculer les statistiques agrégées
    const prixMin =
      variantes.length > 0
        ? Math.min(
            ...variantes.map((v) => v.prix_base || 0).filter((p) => p > 0)
          )
        : 0;
    // Carrosseries disponibles pour ce modèle
    const carrosseries = [
      ...new Set(variantes.map((v) => v.type_carrosserie).filter(Boolean)),
    ];
    // Transmissions disponibles pour ce modèle
    const transmissions = new Set();
    variantes.forEach((v) => {
      const trans = v.specifications?.transmission || "";
      if (trans.includes("PDK") || trans.includes("Automatique"))
        transmissions.add("Automatique");
      if (trans.includes("Manuelle")) transmissions.add("Manuelle");
    });

    // Formater la réponse pour la page explicative
    const pageData = {
      voiture: {
        _id: voiture._id,
        nom_model: voiture.nom_model,
        type_voiture: voiture.type_voiture,
        description: voiture.description,
        photos: voiture.photo_voiture || [],
        createdAt: voiture.createdAt,
        updatedAt: voiture.updatedAt,
      },
      statistiques: {
        nombre_variantes: variantes.length,
        prix_depuis: prixMin,
        carrosseries_disponibles: carrosseries,
        transmissions_disponibles: Array.from(transmissions),
      },
      variantes: variantes.map((v) => ({
        _id: v._id,
        nom_model: v.nom_model,
        type_carrosserie: v.type_carrosserie,
        prix_base: v.prix_base,
        description: v.description || "",
        specifications: {
          puissance: v.specifications?.puissance || 0,
          transmission: v.specifications?.transmission || "N/A",
          acceleration_0_100: v.specifications?.acceleration_0_100 || 0,
        },
        photo_principale:
          v.photo_porsche && v.photo_porsche.length > 0
            ? v.photo_porsche[0]
            : null,
        nombre_photos: v.photo_porsche ? v.photo_porsche.length : 0,
      })),
    };

    return sendSuccess(
      res,
      pageData,
      `Page explicative de la ${voiture.nom_model} récupérée avec succès`
    );
  } catch (error) {
    return sendError(res, "Erreur serveur", 500, error);
  }
};

// ==================== FONCTIONS STAFF ====================

/**
 * Ajouter une voiture d'occasion (staff uniquement)
 */
const ajouterVoitureOccasion = async (req, res) => {
  try {
    // Vérifier que l'utilisateur est staff
    if (!req.user) {
      return sendUnauthorized(res, "Authentification requise");
    }

    const staffRoles = ["admin", "responsable", "conseillere"];
    if (!req.user.isAdmin && !staffRoles.includes(req.user.role)) {
      return sendError(
        res,
        "Accès refusé. Vous devez être membre du staff.",
        403
      );
    }

    const { body } = req;

    if (!body || Object.keys(body).length === 0) {
      return sendValidationError(res, "Pas de données dans la requête");
    }

    // Valider les données requises
    if (!body.nom_model) {
      return sendValidationError(res, "Le nom du modèle est requis");
    }

    if (!body.prix) {
      return sendValidationError(res, "Le prix est requis");
    }

    if (!body.kilometrage) {
      return sendValidationError(res, "Le kilométrage est requis");
    }

    // Créer d'abord l'entrée Voiture (gamme générale)
    let voiture;
    if (body.voiture_id) {
      // Si une voiture existe déjà, l'utiliser
      voiture = await Voiture.findById(body.voiture_id);
      if (!voiture) {
        return sendNotFound(res, "Voiture (gamme)");
      }
    } else {
      // Sinon créer une nouvelle entrée Voiture
      voiture = await new Voiture({
        type_voiture: false, // Occasion
        nom_model: body.nom_model_gamme || body.nom_model,
        description: body.description_gamme || body.description,
        photo_voiture: body.photos_gamme || [],
      }).save();
    }

    // Import dynamique pour éviter dépendance circulaire
    const Model_porsche = (await import("../models/model_porsche.model.js"))
      .default;

    // Créer le Model_porsche (configuration spécifique d'occasion)
    const modelPorsche = await new Model_porsche({
      nom_model: body.nom_model,
      type_carrosserie: body.type_carrosserie || "Coupe",
      annee_production: body.annee_production || new Date(),
      specifications: body.specifications || {
        moteur: body.moteur || "Non spécifié",
        puissance: body.puissance || 0,
        couple: body.couple || 0,
        transmission: body.transmission || "Manuelle",
        acceleration_0_100: body.acceleration_0_100 || 0,
        vitesse_max: body.vitesse_max || 0,
        consommation: body.consommation || 0,
      },
      description: body.description,
      prix: body.prix,
      kilometrage: body.kilometrage,
      couleur_exterieur: body.couleur_exterieur,
      couleur_interieur: body.couleur_interieur,
      taille_jante: body.taille_jante,
      siege: body.siege,
      package: body.package,
      photo_porsche: body.photos || [],
      voiture: voiture._id,
    }).save();

    // Populer les données complètes
    const modelComplet = await Model_porsche.findById(modelPorsche._id)
      .populate("voiture")
      .populate("couleur_exterieur")
      .populate("couleur_interieur")
      .populate("taille_jante")
      .populate("siege")
      .populate("package")
      .populate("photo_porsche");

    return sendSuccess(
      res,
      modelComplet,
      "Voiture d'occasion ajoutée avec succès",
      201
    );
  } catch (error) {
    return sendError(res, "Erreur serveur", 500, error);
  }
};

/**
 * Supprimer une voiture d'occasion (staff uniquement)
 */
const supprimerVoitureOccasion = async (req, res) => {
  try {
    // Vérifier que l'utilisateur est staff
    if (!req.user) {
      return sendUnauthorized(res, "Authentification requise");
    }

    const staffRoles = ["admin", "responsable", "conseillere"];
    if (!req.user.isAdmin && !staffRoles.includes(req.user.role)) {
      return sendError(
        res,
        "Accès refusé. Vous devez être membre du staff.",
        403
      );
    }

    const { id } = req.params;

    // Import dynamique
    const Model_porsche = (await import("../models/model_porsche.model.js"))
      .default;
    const modelPorsche = await Model_porsche.findById(id).populate("voiture");

    if (!modelPorsche) {
      return sendNotFound(res, "Voiture d'occasion");
    }

    // Vérifier que c'est bien une voiture d'occasion
    if (modelPorsche.voiture.type_voiture !== false) {
      return sendValidationError(
        res,
        "Cette action est réservée aux voitures d'occasion"
      );
    }

    // Vérifier qu'il n'y a pas de réservations actives
    const Reservation = (await import("../models/reservation.model.js"))
      .default;
    const reservationsActives = await Reservation.countDocuments({
      model_porsche: id,
      status: true,
    });

    if (reservationsActives > 0) {
      return sendError(
        res,
        "Impossible de supprimer cette voiture, elle a des réservations actives",
        400
      );
    }

    // Supprimer le model_porsche
    await Model_porsche.findByIdAndDelete(id);

    return sendSuccess(res, { id }, "Voiture d'occasion supprimée avec succès");
  } catch (error) {
    return sendError(res, "Erreur serveur", 500, error);
  }
};

/**
 * Récupérer toutes les voitures d'occasion (staff)
 */
const getVoituresOccasion = async (req, res) => {
  try {
    // Vérifier que l'utilisateur est staff
    if (!req.user) {
      return sendUnauthorized(res, "Authentification requise");
    }

    const staffRoles = ["admin", "responsable", "conseillere"];
    if (!req.user.isAdmin && !staffRoles.includes(req.user.role)) {
      return sendError(
        res,
        "Accès refusé. Vous devez être membre du staff.",
        403
      );
    }

    const Model_porsche = (await import("../models/model_porsche.model.js"))
      .default;
    const voitures = await Model_porsche.find()
      .populate({
        path: "voiture",
        match: { type_voiture: false },
      })
      .populate("couleur_exterieur")
      .populate("couleur_interieur")
      .populate("taille_jante")
      .populate("siege")
      .populate("package")
      .populate("photo_porsche")
      .sort({ createdAt: -1 });

    // Filtrer pour ne garder que les voitures d'occasion
    const voituresOccasion = voitures.filter(
      (v) => v.voiture && v.voiture.type_voiture === false
    );

    return sendSuccess(res, {
      voitures: voituresOccasion,
      total: voituresOccasion.length,
    });
  } catch (error) {
    return sendError(res, "Erreur serveur", 500, error);
  }
};

/**
 * Mettre à jour une voiture d'occasion (staff uniquement)
 */
const modifierVoitureOccasion = async (req, res) => {
  try {
    // Vérifier que l'utilisateur est staff
    if (!req.user) {
      return sendUnauthorized(res, "Authentification requise");
    }

    const staffRoles = ["admin", "responsable", "conseillere"];
    if (!req.user.isAdmin && !staffRoles.includes(req.user.role)) {
      return sendError(
        res,
        "Accès refusé. Vous devez être membre du staff.",
        403
      );
    }

    const { id } = req.params;
    const { body } = req;

    if (!body || Object.keys(body).length === 0) {
      return sendValidationError(res, "Pas de données dans la requête");
    }

    const Model_porsche = (await import("../models/model_porsche.model.js"))
      .default;
    const modelPorsche = await Model_porsche.findById(id).populate("voiture");

    if (!modelPorsche) {
      return sendNotFound(res, "Voiture d'occasion");
    }

    // Vérifier que c'est bien une voiture d'occasion
    if (modelPorsche.voiture.type_voiture !== false) {
      return sendValidationError(
        res,
        "Cette action est réservée aux voitures d'occasion"
      );
    }

    // Mettre à jour les champs autorisés
    const champsAutorisés = [
      "nom_model",
      "type_carrosserie",
      "annee_production",
      "specifications",
      "description",
      "prix",
      "kilometrage",
      "couleur_exterieur",
      "couleur_interieur",
      "taille_jante",
      "siege",
      "package",
      "photo_porsche",
    ];

    champsAutorisés.forEach((champ) => {
      if (body[champ] !== undefined) {
        modelPorsche[champ] = body[champ];
      }
    });

    await modelPorsche.save();

    // Populer les données complètes
    const modelComplet = await Model_porsche.findById(id)
      .populate("voiture")
      .populate("couleur_exterieur")
      .populate("couleur_interieur")
      .populate("taille_jante")
      .populate("siege")
      .populate("package")
      .populate("photo_porsche");

    return sendSuccess(
      res,
      modelComplet,
      "Voiture d'occasion modifiée avec succès"
    );
  } catch (error) {
    return sendError(res, "Erreur serveur", 500, error);
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
  getVoiturePage,
  // Fonctions staff
  ajouterVoitureOccasion,
  supprimerVoitureOccasion,
  getVoituresOccasion,
  modifierVoitureOccasion,
};
