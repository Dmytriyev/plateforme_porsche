import LigneCommande from "../models/ligneCommande.model.js";
import Commande from "../models/Commande.model.js";
import ligneCommandeValidation from "../validations/ligneCommande.validation.js";

const createLigneCommande = async (req, res) => {
  try {
    const { body, user } = req;

    // Vérifier les données en premier
    if (!body) {
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }

    // Validation de type_produit et produit correspondant
    if (body.type_produit === true && !body.voiture) {
      return res.status(400).json({
        message: "Une voiture est requise quand type_produit est true",
      });
    }

    if (body.type_produit === false && !body.accesoire) {
      return res.status(400).json({
        message: "Un accessoire est requis quand type_produit est false",
      });
    }

    // Chercher la commande active (panier)
    const commande = await Commande.findOne({ user: user.id, status: true });

    if (!commande) {
      return res.status(404).json({
        message: "Aucune commande active trouvée pour cet utilisateur",
      });
    }

    const line = { ...body, commande: commande._id.toString() };
    const { error } = ligneCommandeValidation(line).ligneCommandeCreate;
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const ligneCommande = new LigneCommande(line);
    const newLigneCommande = await ligneCommande.save();

    // Retourner avec populate pour avoir les détails
    const populatedLigne = await LigneCommande.findById(newLigneCommande._id)
      .populate("voiture", "nom_model prix type_voiture")
      .populate("accesoire", "nom_accesoire prix")
      .populate("commande");

    return res.status(201).json(populatedLigne);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const getAllLigneCommandes = async (req, res) => {
  try {
    const ligneCommandes = await LigneCommande.find()
      .populate("voiture", "nom_model prix type_voiture")
      .populate("accesoire", "nom_accesoire prix")
      .populate("commande", "date_commande status")
      .sort({ createdAt: -1 });
    return res.status(200).json(ligneCommandes);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const getLigneCommandeById = async (req, res) => {
  try {
    const ligneCommande = await LigneCommande.findById(req.params.id)
      .populate("voiture", "nom_model prix type_voiture description")
      .populate("accesoire", "nom_accesoire prix description")
      .populate("commande", "date_commande status user");

    if (!ligneCommande) {
      return res.status(404).json({ message: "ligneCommande n'existe pas" });
    }

    return res.status(200).json(ligneCommande);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const updateLigneCommande = async (req, res) => {
  try {
    const { body } = req;

    if (!body || Object.keys(body).length === 0) {
      return res
        .status(400)
        .json({ message: "Pas de données dans la requête" });
    }

    // Vérifier que la ligne existe
    const existingLigne = await LigneCommande.findById(req.params.id);
    if (!existingLigne) {
      return res.status(404).json({ message: "ligneCommande n'existe pas" });
    }

    const { error } = ligneCommandeValidation(body).ligneCommandeUpdate;
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const updatedLigneCommande = await LigneCommande.findByIdAndUpdate(
      req.params.id,
      body,
      { new: true }
    )
      .populate("voiture", "nom_model prix type_voiture")
      .populate("accesoire", "nom_accesoire prix")
      .populate("commande");

    return res.status(200).json(updatedLigneCommande);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

const deleteLigneCommande = async (req, res) => {
  try {
    // Vérifier d'abord si la ligne existe
    const ligneCommande = await LigneCommande.findById(req.params.id);

    if (!ligneCommande) {
      return res.status(404).json({ message: "ligneCommande n'existe pas" });
    }

    // Vérifier si la commande est encore un panier (status: true)
    const commande = await Commande.findById(ligneCommande.commande);
    if (commande && commande.status === false) {
      return res.status(403).json({
        message:
          "Impossible de supprimer une ligne d'une commande déjà validée",
      });
    }

    await LigneCommande.findByIdAndDelete(req.params.id);

    return res.status(200).json({
      message: "ligneCommande a été supprimée",
      deletedId: req.params.id,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Erreur serveur", error: error });
  }
};

export {
  createLigneCommande,
  getAllLigneCommandes,
  getLigneCommandeById,
  updateLigneCommande,
  deleteLigneCommande,
};
