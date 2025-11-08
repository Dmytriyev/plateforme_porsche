// - createCheckoutSession construit les line_items depuis les lignes de commande (acompte ou prix)
// - webhookHandler vérifie la signature (raw body) et met à jour la commande après paiement
import Stripe from "stripe";
import LigneCommande from "../models/ligneCommande.model.js";
import Commande from "../models/Commande.model.js";

// Initialiser Stripe avec la clé secrète d'environnement
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
export const createCheckoutSession = async (req, res) => {
  try {
    // Récupérer la commande par ID depuis les paramètres de l'URL
    const { id } = req.params;
    const commande = await Commande.findById(id).populate(
      "user",
      "email nom prenom adresse code_postal telephone"
    );
    if (!commande) {
      return res.status(404).json({ message: "Commande n'existe pas" });
    }

    // Vérifier que c'est un panier actif (status: false = panier non validé)
    if (commande.status === true) {
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

    // Récupérer les lignes de commande associées
    const ligneCommande = await LigneCommande.find({ commande: id })
      .populate("accesoire", "nom_accesoire prix")
      .populate("voiture", "nom_model type_voiture");

    if (ligneCommande.length === 0) {
      return res.status(400).json({ message: "Le panier est vide" });
    }

    // Construire les items pour Stripe Checkout
    let items = [];
    // Parcourir chaque ligne de commande pour créer les items
    ligneCommande.forEach((line) => {
      let unitPrice = 0;
      let productName = "Produit";

      // Déterminer le prix unitaire et le nom du produit
      if (line.voiture && line.acompte && line.acompte > 0) {
        // Pour les voitures avec acompte, utiliser l'acompte
        unitPrice = line.acompte;
        productName = `${line.voiture.nom_model} (Acompte)`;
      } else if (line.accesoire && line.accesoire.prix) {
        // Pour les accessoires, utiliser le prix de l'accessoire
        unitPrice = line.accesoire.prix;
        productName = line.accesoire.nom_accesoire;
      } else if (line.prix) {
        // Utiliser le prix stocké dans la ligne de commande
        unitPrice = line.prix;
        productName = line.voiture
          ? line.voiture.nom_model
          : "Produit personnalisé";
      }

      // Stripe requiert les prix en centimes (entiers)
      const unitAmountInCents = Math.round(unitPrice * 100);
      // Créer l'item pour Stripe Checkout
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
      // Ajouter l'item à la liste des items
      items.push(item);
    });

    // Créer un client Stripe avec les informations de l'utilisateur
    const customer = await stripe.customers.create({
      name: `${commande.user.nom} ${commande.user.prenom}`,
      email: commande.user.email,
      phone: commande.user.telephone,
      address: {
        line1: commande.user.adresse,
        postal_code: commande.user.code_postal,
      },
    });

    // Créer la session de paiement Stripe Checkout
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ["card", "paypal"],
      line_items: items,
      mode: "payment",
      // URLs de succès et d'annulation
      success_url: process.env.FRONTEND_URL
        ? `${process.env.FRONTEND_URL}/success`
        : "http://localhost:3001/success",
      cancel_url: process.env.FRONTEND_URL
        ? `${process.env.FRONTEND_URL}/cancel`
        : "http://localhost:3001/cancel",
      metadata: {
        commandeId: id,
      },
      // Facture automatique à la fin du paiement
      invoice_creation: { enabled: true },
    });

    // Retourner les détails de la session au client
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

// Gérer les webhooks Stripe pour les événements de paiement
export const webhookHandler = async (req, res) => {
  // Vérifier la signature du webhook Stripe
  const sig = req.headers["stripe-signature"];
  // Construire l'événement Stripe à partir du corps brut et de la signature
  let event;
  try {
    // Utiliser le corps brut pour vérifier la signature
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).send(`Webhook error: ${err.message}`);
  }
  // Gérer l'événement de session de paiement complétée
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;

    try {
      // Récupérer la commande associée via les métadonnées
      const commandeId = session.metadata.commandeId;
      // Vérifier que l'ID de commande est présent
      if (!commandeId) {
        return res.status(400).json({ error: "commandeId manquant" });
      }
      // Trouver la commande dans la base de données
      const commande = await Commande.findById(commandeId);
      if (!commande) {
        return res.status(404).json({ error: "Commande introuvable" });
      }
      // Vérifier si la commande a déjà été traitée
      if (commande.status === true && commande.factureUrl) {
        return res.json({ received: true, message: "Déjà traité" });
      }

      // Récupérer la facture Stripe associée à la session
      const invoice = await stripe.invoices.retrieve(session.invoice);

      // Calculer le total depuis les lignes de commande
      const lignesCommande = await LigneCommande.find({ commande: commandeId });
      // Calculer le total en fonction des acomptes ou prix
      const total = lignesCommande.reduce((sum, line) => {
        let prix = 0;
        if (line.acompte > 0) {
          prix = line.acompte;
        } else if (line.prix) {
          prix = line.prix;
        }
        return sum + prix * line.quantite;
      }, 0);

      // Mettre à jour la commande (status: true = commande validée/payée)
      commande.status = true;
      // Ajouter l'URL de la facture hébergée par Stripe
      commande.factureUrl = invoice.hosted_invoice_url;
      commande.prix = total;
      commande.date_commande = new Date();
      await commande.save();

      // Créer un nouveau panier pour l'utilisateur (status: false = panier actif)
      const nouveauPanier = new Commande({
        user: commande.user,
        date_commande: new Date(),
        prix: 0,
        acompte: 0,
        status: false,
      });
      await nouveauPanier.save();
    } catch (error) {
      return res.status(500).json({ error: "Erreur traitement paiement" });
    }
  }
  // Répondre à Stripe pour confirmer la réception du webhook
  res.json({ received: true });
};
