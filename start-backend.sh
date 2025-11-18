#!/bin/bash

echo "═══════════════════════════════════════════════════════════════════"
echo "  🚀 DÉMARRAGE BACKEND PORSCHE"
echo "═══════════════════════════════════════════════════════════════════"
echo ""

# Vérifier si MongoDB tourne
echo "1️⃣  Vérification MongoDB..."
if brew services list | grep -q "mongodb-community.*started"; then
    echo "✅ MongoDB est démarré"
else
    echo "⚠️  MongoDB n'est pas démarré"
    echo "   Démarrage de MongoDB..."
    brew services start mongodb-community
    sleep 2
fi

echo ""
echo "2️⃣  Démarrage du serveur Node.js..."
echo ""

# Aller dans le dossier Node
cd "$(dirname "$0")/Node" || exit

# Vérifier que node_modules existe
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
fi

echo ""
echo "✅ Serveur prêt à démarrer"
echo ""
echo "═══════════════════════════════════════════════════════════════════"
echo ""

# Démarrer le serveur
npm start

