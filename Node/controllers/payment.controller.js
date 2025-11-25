/**
 * controllers/payment.controller.js — Routes liées à Stripe (checkout + webhook).
 *
 * Notes pédagogiques :
 * - `createCheckoutSession` construit les `line_items` à partir des lignes de commande
 *   et retourne la session Stripe (id/url) pour le frontend.
 * - `webhookHandler` doit être reçu via `express.raw` pour vérifier la signature
 *   et doit être idempotent (ne pas retraiter une commande déjà marquée payée).
 */
import logger from "../utils/logger.js";
import * as paymentService from "../services/payment.service.js";

export const createCheckoutSession = async (req, res) => {
  try {
    const { id } = req.params;
    logger.info(
      "Création session Stripe pour commande:",
      id,
      "Utilisateur:",
      req.user?.id
    );

    // Vérification de l'utilisateur si présent
    if (req.user?.id) {
      // L'utilisateur est déjà vérifié via le middleware `auth` sur la route
    }

    const session = await paymentService.createCheckoutSession({
      commandeId: id,
      user: req.user || null,
    });

    logger.info("Session Stripe créée:", {
      id: session.id,
      url: session.url,
      status: session.status,
    });

    return res.json({
      id: session.id,
      url: session.url,
      status: session.status,
      customer: session.customer,
    });
  } catch (err) {
    logger.error("Erreur création session Stripe:", err);
    const status = err?.status ?? 500;
    return res.status(status).json({ error: err.message });
  }
};

export const webhookHandler = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  logger.info("Webhook Stripe reçu");
  try {
    const result = await paymentService.processWebhook({
      rawBody: req.body,
      signature: sig,
    });
    logger.info("Webhook traité avec succès:", result);
    // Toujours répondre 200 à Stripe en cas de bonne réception
    return res.json({ received: true, result });
  } catch (err) {
    logger.error("Erreur webhook Stripe:", err);
    const status = err?.status ?? 500;
    return res.status(status).send(`Webhook error: ${err.message}`);
  }
};
