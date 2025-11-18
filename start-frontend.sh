#!/bin/bash

echo "═══════════════════════════════════════════════════════════════════"
echo "  🎨 DÉMARRAGE FRONTEND REACT"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

# Aller dans le dossier React
cd "$(dirname "$0")/React" || exit

# Vérifier que node_modules existe
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
fi

echo ""
echo "✅ Frontend prêt à démarrer"
echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo ""

# Démarrer Vite
npm run dev

