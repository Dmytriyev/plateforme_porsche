import Stripe from "stripe";
import dotenv from "dotenv";
import LigneCommande from "../models/ligneCommande.model.js";
import Commande from "../models/Commande.model.js";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
export const createCheckoutSession = async (req, res) => {
  try {
    const { id } = req.params;
    const commande = await Commande.findById(id).populate(
      "user",
      "email nom prenom adresse code_postal telephone"
    );
    if (!commande) {
      return res.status(404).json({ message: "la commande n'existe pas" });
    }

    // Vérifier que c'est un panier actif
    if (commande.status === false) {
      return res
        .status(400)
        .json({ message: "Cette commande a déjà été validée" });
    }

    // Vérifier que l'utilisateur est propriétaire (si req.user existe)
    if (req.user && commande.user._id.toString() !== req.user.id) {
      return res
        .status(403)
        .json({ message: "Vous n'êtes pas autorisé à payer cette commande" });
    }

    const ligneCommande = await LigneCommande.find({ commande: id })
      .populate("accesoire", "nom_accesoire prix")
      .populate("voiture", "nom_model prix type_voiture");

    if (ligneCommande.length === 0) {
      return res.status(400).json({ message: "le panier est vide" });
    }

    let items = [];
    ligneCommande.forEach((line) => {
      // Déterminer le prix correct depuis LigneCommande
      let unitPrice = 0;
      let productName = "";

      if (line.voiture && line.acompte > 0) {
        unitPrice = line.acompte;
        productName = `${line.voiture.nom_model} (Acompte)`;
      } else if (line.accesoire && line.accesoire.prix) {
        unitPrice = line.accesoire.prix;
        productName = line.accesoire.nom_accesoire;
      } else if (line.prix) {
        unitPrice = line.prix;
        productName = line.voiture
          ? line.voiture.nom_model
          : "Produit personnalisé";
      }

      // Stripe requiert les prix en centimes
      const unitAmountInCents = Math.round(unitPrice * 100);

      let item = {
        price_data: {
          currency: "eur",
          product_data: {
            name: productName,
          },
          unit_amount: unitAmountInCents,
        },
        quantity: line.quantite,
      };
      items.push(item);
    });
    const customer = await stripe.customers.create({
      name: `${commande.user.nom} ${commande.user.prenom}`,
      email: commande.user.email,
      phone: commande.user.telephone,
      address: {
        line1: commande.user.adresse,
        postal_code: commande.user.code_postal,
      },
    });

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ["card", "paypal"],
      line_items: items,
      mode: "payment",
      success_url:
        process.env.FRONTEND_URL + "/success" ||
        "http://localhost:3000/success",
      cancel_url:
        process.env.FRONTEND_URL + "/cancel" || "http://localhost:3000/cancel",
      metadata: {
        commandeId: id,
      },
      invoice_creation: { enabled: true },
    });
    res.json({
      id: session.id,
      url: session.url,
      status: session.status,
      customer: session.customer,
    });
  } catch (error) {
    console.error("Erreur création session Stripe:", error);
    res.status(500).json({ error: error.message });
  }
};
export const webhookHandler = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    try {
      const commandeId = session.metadata.commandeId;

      if (!commandeId) {
        console.error("Metadata commandeId manquant dans le webhook");
        return res.status(400).json({ error: "commandeId manquant" });
      }

      const commande = await Commande.findById(commandeId);
      if (!commande) {
        console.error(`Commande ${commandeId} introuvable`);
        return res.status(404).json({ error: "Commande introuvable" });
      }

      // Vérifier que la commande n'a pas déjà été traitée
      if (commande.status === false && commande.factureUrl) {
        console.warn(`Commande ${commandeId} déjà traitée`);
        return res.json({ received: true, message: "Déjà traité" });
      }

      // Récupérer la facture Stripe
      const invoice = await stripe.invoices.retrieve(session.invoice);

      // Calculer le total depuis les lignes de commande
      const lignesCommande = await LigneCommande.find({ commande: commandeId });
      const total = lignesCommande.reduce((sum, line) => {
        let prix = 0;
        if (line.acompte > 0) {
          prix = line.acompte;
        } else if (line.prix) {
          prix = line.prix;
        }
        return sum + prix * line.quantite;
      }, 0);

      // Mettre à jour la commande
      commande.status = false;
      commande.factureUrl = invoice.hosted_invoice_url;
      commande.prix = total;
      commande.date_commande = new Date();
      await commande.save();

      // Créer un nouveau panier pour l'utilisateur
      const nouveauPanier = new Commande({
        user: commande.user,
        date_commande: new Date(),
        prix: 0,
        acompte: 0,
        status: true,
      });
      await nouveauPanier.save();

      console.log(
        `Commande ${commandeId} validée | Nouveau panier: ${nouveauPanier._id}`
      );
    } catch (error) {
      console.error(" Erreur traitement webhook:", error);
      return res.status(500).json({ error: "Erreur traitement paiement" });
    }
  }

  res.json({ received: true });
};
