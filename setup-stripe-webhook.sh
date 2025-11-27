# fiche de configuration pour configurer le webhook Stripe localement
#!/usr/bin/env bash
set -e
PORT=${PORT:-3000}
FORWARD_URL="http://localhost:${PORT}/webhook"
# Vérifier si la CLI Stripe est installée
if ! command -v stripe >/dev/null 2>&1; then
  echo "Erreur: Stripe CLI introuvable. Installez-le d'abord: https://stripe.com/docs/stripe-cli"
  exit 1
fi
# Démarrer l'écoute des événements Stripe et les transférer à l'URL locale
echo "Forwarding Stripe events to: ${FORWARD_URL}"
echo "If the CLI prints a webhook signing secret (whsec_...), copy it and set STRIPE_WEBHOOK_SECRET in your environment or .env file."
echo "Starting 'stripe listen' (press Ctrl+C to stop)...\n"
# Si l'argument --export est fourni, extraire le secret et l'écrire dans .env
if [ "$1" = "--export" ]; then
  TMP_LOG="/tmp/stripe_listen_$$.log"
  stripe listen --print-secret --forward-to "${FORWARD_URL}" | tee "${TMP_LOG}"
  echo
  # Extraire le secret du log temporaire
  SECRET_LINE=$(grep -Eo "whsec_[A-Za-z0-9_]+" "${TMP_LOG}" | head -n 1 || true)
  # Écrire le secret dans .env
  if [ -n "${SECRET_LINE}" ]; then
    if [ -f .env ]; then
      echo "STRIPE_WEBHOOK_SECRET=${SECRET_LINE}" >> .env
      echo "Appended STRIPE_WEBHOOK_SECRET to .env"
    else
      echo "STRIPE_WEBHOOK_SECRET=${SECRET_LINE}" > .env
      echo "Created .env and wrote STRIPE_WEBHOOK_SECRET"
    fi
    echo "Secret written to .env (please verify)."
  else
    echo "Impossible d'extraire automatiquement le secret depuis la sortie de la CLI."
    echo "Ouvrez ${TMP_LOG} et copiez la valeur 'whsec_...' si elle est affichée."
  fi
  exit 0
else
# Simplement démarrer l'écoute sans extraire le secret
  stripe listen --print-secret --forward-to "${FORWARD_URL}"
fi
