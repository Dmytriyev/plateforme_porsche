import Stripe from "stripe";
import dotenv from "dotenv";
import LigneCommande from "../models/ligneCommande.model.js";
import Commande from "../models/Commande.model.js";
import { createFactureFromStripe } from "./facture.controller.js";

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
    const ligneCommande = await LigneCommande.find({ commande: id })
      .populate("accesoire", "nom_accesoire prix")
      .populate("voiture", "nom_model prix acompte");
    let items = [];
    if (ligneCommande.length == 0) {
      return res.status(400).json({ message: "le panier est vide" });
    }
    ligneCommande.map((line) => {
      let item = {
        price_data: {
          currency: "eur",
          product_data: {
            name: line.voiture
              ? line.voiture.nom_model
              : line.accesoire.nom_accesoire,
          },
          unit_amount: line.voiture
            ? line.voiture.acompte
            : line.accesoire.prix,
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
      success_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel",
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
    console.log("Paiement réussi :", session);

    try {
      const commandeId = session.metadata.commandeId;

      const commande = await Commande.findById(commandeId);
      if (!commande) {
        console.error(`Commande ${commandeId} introuvable`);
        return res.status(404).json({ error: "Commande introuvable" });
      }

      const invoice = await stripe.invoices.retrieve(session.invoice);
      console.log("Facture Stripe récupérée:", invoice.id);

      const facture = await createFactureFromStripe(session, invoice);
      console.log(`Facture persistée: ${facture.numeroFacture}`);

      commande.status = false;
      commande.factureUrl = invoice.hosted_invoice_url;
      await commande.save();
      console.log(`Commande ${commandeId} mise à jour`);

      const nouveauPanier = new Commande({
        user: commande.user,
        date_commande: new Date(),
        prix: 0,
        acompte: 0,
        status: true,
      });
      await nouveauPanier.save();
      console.log(`Nouveau panier créé: ${nouveauPanier._id}`);
    } catch (error) {
      console.error(" Erreur traitement webhook:", error);
      return res.status(500).json({ error: "Erreur traitement paiement" });
    }
  }
  res.json({ received: true });
};
