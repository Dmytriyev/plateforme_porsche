// - createCheckoutSession construit les line_items depuis les lignes de commande (acompte ou prix)
// - webhookHandler vérifie la signature (raw body) et met à jour la commande après paiement
import * as paymentService from "../services/payment.service.js";

export const createCheckoutSession = async (req, res) => {
  try {
    const { id } = req.params;
    // Vérification de l'utilisateur si présent
    if (req.user && req.user.id && req.user.id !== undefined) {
      // L'utilisateur est déjà vérifié via le middleware `auth` sur la route
    }

    const session = await paymentService.createCheckoutSession({
      commandeId: id,
      user: req.user || null,
    });

    return res.json({
      id: session.id,
      url: session.url,
      status: session.status,
      customer: session.customer,
    });
  } catch (err) {
    const status = err && err.status ? err.status : 500;
    return res.status(status).json({ error: err.message });
  }
};

export const webhookHandler = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  try {
    const result = await paymentService.processWebhook({
      rawBody: req.body,
      signature: sig,
    });
    // Toujours répondre 200 à Stripe en cas de bonne réception
    return res.json({ received: true, result });
  } catch (err) {
    const status = err && err.status ? err.status : 500;
    return res.status(status).send(`Webhook error: ${err.message}`);
  }
};
