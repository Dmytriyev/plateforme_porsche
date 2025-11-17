#!/bin/bash

echo "🚀 Démarrage de la Plateforme Porsche"
echo "====================================="
echo ""

# Couleurs
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Vérifier MongoDB
echo -n "1️⃣ Vérification MongoDB... "
if mongosh --quiet --eval 'db.runCommand({ping:1})' mongodb://localhost:27017 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Connecté${NC}"
else
    echo -e "${RED}❌ Non connecté${NC}"
    echo "   Démarrage de MongoDB..."
    brew services start mongodb-community
    sleep 2
fi

# Vérifier si Node.js API tourne déjà
echo -n "2️⃣ Vérification Node.js API... "
if curl -s http://localhost:3000/ > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Déjà démarré${NC}"
else
    echo -e "${YELLOW}⏳ Démarrage...${NC}"
    cd Node
    npm start > ../logs/node.log 2>&1 &
    NODE_PID=$!
    echo "   PID: $NODE_PID"
    sleep 3
    cd ..
fi

# Démarrer React
echo -n "3️⃣ Démarrage React Frontend... "
cd React
npm run dev &
REACT_PID=$!
echo -e "${GREEN}✅ PID: $REACT_PID${NC}"
cd ..

echo ""
echo "====================================="
echo -e "${GREEN}✅ Stack démarrée avec succès !${NC}"
echo ""
echo "📍 URLs:"
echo "   • MongoDB:  mongodb://localhost:27017"
echo "   • API:      http://localhost:3000"
echo "   • Frontend: http://localhost:5173"
echo ""
echo "📝 Pour arrêter:"
echo "   kill $NODE_PID $REACT_PID"
echo "   brew services stop mongodb-community"
echo ""
