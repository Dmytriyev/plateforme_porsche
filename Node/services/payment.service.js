import Stripe from "stripe";
import LigneCommande from "../models/ligneCommande.model.js";
import Commande from "../models/Commande.model.js";
import { default as logger } from "../utils/logger.js";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const buildLineItems = (ligneCommandes) => {
  const items = [];
  ligneCommandes.forEach((line) => {
    let unitPrice = 0;
    let productName = "Produit";

    if (line.voiture && line.acompte && line.acompte > 0) {
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

    // Normaliser la quantité et le prix
    const quantity = Number(line.quantite) > 0 ? Number(line.quantite) : 1;
    const unitPriceNum = Number(unitPrice) || 0;

    if (unitPriceNum <= 0) {
      logger.warn(
        `Ligne ignorée dans buildLineItems: prix non valide pour produit=${productName} commandeLigneId=${line._id}`
      );
      return; // ignorer les items sans prix valide
    }

    const unitAmountInCents = Math.round(unitPriceNum * 100);
    items.push({
      price_data: {
        currency: "eur",
        product_data: { name: productName },
        unit_amount: unitAmountInCents,
      },
      quantity,
    });
  });
  return items;
};

export const createCheckoutSession = async ({ commandeId, user }) => {
  const commande = await Commande.findById(commandeId).populate(
    "user",
    "email nom prenom adresse code_postal telephone"
  );
  if (!commande)
    throw Object.assign(new Error("Commande introuvable"), { status: 404 });
  if (commande.status === true)
    throw Object.assign(new Error("Commande déjà validée"), { status: 400 });

  const lignes = await LigneCommande.find({ commande: commandeId })
    .populate("accesoire", "nom_accesoire prix")
    .populate("voiture", "nom_model type_voiture");

  if (!lignes || lignes.length === 0)
    throw Object.assign(new Error("Le panier est vide"), { status: 400 });

  const items = buildLineItems(lignes);

  const customer = await stripe.customers.create({
    name: `${commande.user.nom} ${commande.user.prenom}`,
    email: commande.user.email,
    phone: commande.user.telephone,
    address: {
      line1: commande.user.adresse,
      postal_code: commande.user.code_postal,
    },
  });

  const successUrl = process.env.FRONTEND_URL
    ? `${process.env.FRONTEND_URL.replace(/\/$/, "")}/success`
    : "http://localhost:3001/success";
  const cancelUrl = process.env.FRONTEND_URL
    ? `${process.env.FRONTEND_URL.replace(/\/$/, "")}/cancel`
    : "http://localhost:3001/cancel";

  const session = await stripe.checkout.sessions.create({
    customer: customer.id,
    payment_method_types: ["card"],
    line_items: items,
    mode: "payment",
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: { commandeId },
    invoice_creation: { enabled: true },
  });

  // Optionnel: enregistrer l'ID de session Stripe sur la commande pour idempotence (silently)
  try {
    commande.stripeSessionId = session.id;
    await commande.save();
  } catch (e) {
    logger.warn("Impossible d'enregistrer stripeSessionId", e.message);
  }

  return session;
};

export const processWebhook = async ({ rawBody, signature }) => {
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    const e = new Error(`Webhook signature invalide: ${err.message}`);
    e.status = 400;
    throw e;
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const commandeId = session.metadata && session.metadata.commandeId;
    if (!commandeId) {
      throw Object.assign(new Error("commandeId manquant dans metadata"), {
        status: 400,
      });
    }

    const commande = await Commande.findById(commandeId);
    if (!commande)
      throw Object.assign(new Error("Commande introuvable"), { status: 404 });
    // Idempotence: si déjà traitée, ignorer
    if (commande.status === true && commande.factureUrl) {
      return { handled: false, reason: "déjà traité" };
    }

    // Récupérer la facture si disponible
    let invoice = null;
    try {
      if (session.invoice)
        invoice = await stripe.invoices.retrieve(session.invoice);
    } catch (err) {
      logger.warn("Impossible de récupérer la facture Stripe", err.message);
    }

    const lignesCommande = await LigneCommande.find({ commande: commandeId });
    const total = lignesCommande.reduce((sum, line) => {
      let prix = 0;
      if (line.acompte > 0) prix = line.acompte;
      else if (line.prix) prix = line.prix;
      return sum + prix * line.quantite;
    }, 0);

    commande.status = true;
    if (invoice && invoice.hosted_invoice_url)
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
      status: false,
    });
    await nouveauPanier.save();

    // Ici on pourrait envoyer un email ou émettre un event socket
    logger.info(
      `Commande ${commandeId} marquée payée via Stripe session ${session.id}`
    );
    return { handled: true };
  }

  // Autres événements non gérés explicitement
  return { handled: false, reason: `event ${event.type} ignoré` };
};

export default { createCheckoutSession, processWebhook };
