import Stripe from "stripe";
import dotenv from "dotenv";
import LigneCommande from "../models/ligneCommande.model.js";
import Commande from "../models/Commande.model.js";

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
// Créer une session de paiement
export const createCheckoutSession = async (req, res) => {
  try {
    const { id } = req.params;
    const commande = await Commande.findById(id).populate(
      "user",
      "email nom prenom adresse code_postale telephone"
    );
    if (!commande) {
      return res.status(404).json({ message: "la commande n'existe pas" });
    }
    const ligneCommande = await LigneCommande.find({ commande: id })
      .populate("type_produit_a", "prix nom_produit")
      .populate("type_produit_v", "prix nom_produit");
    let items = [];
    if (ligneCommande.length == 0) {
      return res.status(400).json({ message: "le panier est vide" });
    }
    ligneCommande.map((line) => {
      let item = {
        price_data: {
          currency: "eur",
          product_data: {
            name: line.type_produit_v
              ? line.type_produit_v.nom_produit
              : line.type_produit_a.nom_produit,
          },
          unit_amount: line_type_produit_v
            ? line.type_produit_v.prix
            : line.type_produit_a.prix,
        },
        quantite: line.quantite,
      };
      items.push(item);
    });
    const customer = await stripe.customers.create({
      name: `${commande.user.nom} ${commande.user.prenom}`,
      email: commande.user.email,
      telephone: commande.user.telephone,
      adresse: {
        adresse: commande.user.adresse,
        code_postale: commande.user.code_postale,
        country: "FR",
      },
    });

    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ["card", "paypal"],
      line_items: items,
      // les produits envoyés depuis le frontend
      mode: "payment",
      // les url à adaptable en cas de succè ou échec de la transaction
      success_url: "http://localhost:3000/success",
      cancel_url: "http://localhost:3000/cancel",
      metadata: {
        commandeId: id,
      },
      invoice_creation: { enabled: true },
    });
    res.json({ url: session.url }); // URL vers la page de paiement Stripe
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
// Webhook : Stripe informe le backend quand un paiement est validé
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
  // Traitement selon le type d'événement
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    console.log("Paiement réussi :", session);

    const commandeId = session.metadata.commandeId;
    const commande = await Commande.findById(commandeId);
    commande.status = false;
    const invoice = await stripe.invoices.retrieve(session.invoice);
    console.log(invoice);
    commande.factureUrl = invoice.hosted_invoice_url;
    await commande.save();
    const panier = new Commande();
    panier.user = commande.user;
    await panier.save();
  }
  res.json({ received: true });
};
