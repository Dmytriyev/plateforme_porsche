#!/usr/bin/env bash
set -e
# ./setup-stripe-webhook.sh ..lance stripe listen et affiche le secret  du webhook.
PORT=${PORT:-3000}
FORWARD_URL="http://localhost:${PORT}/webhook"

# Check si stripe CLI est installed
if ! command -v stripe >/dev/null 2>&1; then
  echo "Erreur: Stripe CLI introuvable. Installez-le d'abord: https://stripe.com/docs/stripe-cli"
  exit 1
fi

echo "Forwarding Stripe events to: ${FORWARD_URL}"

echo "If the CLI prints a webhook signing secret (whsec_...), copy it and set STRIPE_WEBHOOK_SECRET in your environment or .env file."

echo "Starting 'stripe listen' (press Ctrl+C to stop)...\n"
# Check pour --export flag
if [ "$1" = "--export" ]; then
  # Export mode: capture output pour extract secret
  TMP_LOG="/tmp/stripe_listen_$$.log"
  stripe listen --print-secret --forward-to "${FORWARD_URL}" | tee "${TMP_LOG}"
  echo
  # Extract secret line de la log
  SECRET_LINE=$(grep -Eo "whsec_[A-Za-z0-9_]+" "${TMP_LOG}" | head -n 1 || true)
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
# Normal mode: juste lancer  stripe listen
  stripe listen --print-secret --forward-to "${FORWARD_URL}"
fi
