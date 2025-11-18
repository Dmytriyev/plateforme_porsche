#!/bin/bash

# Script pour initialiser MongoDB en mode replica set local
# Nécessaire pour les transactions MongoDB

echo "🔧 Initialisation de MongoDB en mode Replica Set..."
echo ""

# Vérifier si MongoDB est installé
if ! command -v mongod &> /dev/null; then
    echo "❌ MongoDB n'est pas installé. Installez-le d'abord:"
    echo "   brew tap mongodb/brew"
    echo "   brew install mongodb-community@7.0"
    exit 1
fi

# Vérifier si MongoDB est en cours d'exécution
if pgrep -x "mongod" > /dev/null; then
    echo "⚠️  MongoDB est déjà en cours d'exécution."
    echo "   Arrêtez-le d'abord avec: brew services stop mongodb-community"
    echo "   Ou: killall mongod"
    exit 1
fi

# Créer le répertoire de données si nécessaire
DATA_DIR="$HOME/data/db-replica"
mkdir -p "$DATA_DIR"

echo "📁 Répertoire de données: $DATA_DIR"
echo ""

# Démarrer MongoDB avec replica set
echo "🚀 Démarrage de MongoDB en mode replica set..."
mongod --replSet rs0 --port 27017 --dbpath "$DATA_DIR" --bind_ip localhost --fork --logpath "$DATA_DIR/mongod.log"

# Attendre que MongoDB démarre
sleep 3

# Initialiser le replica set
echo ""
echo "⚙️  Initialisation du replica set..."
mongosh --eval "rs.initiate({
  _id: 'rs0',
  members: [{ _id: 0, host: 'localhost:27017' }]
})"

# Vérifier le status
sleep 2
echo ""
echo "✅ Status du replica set:"
mongosh --eval "rs.status()" --quiet

echo ""
echo "🎉 MongoDB Replica Set initialisé avec succès!"
echo ""
echo "📝 Pour vous connecter:"
echo "   mongosh"
echo ""
echo "📝 Dans votre .env, utilisez:"
echo "   DB_URI=mongodb://localhost:27017/porsche?replicaSet=rs0"
echo ""
echo "📝 Pour arrêter MongoDB:"
echo "   mongosh --eval 'db.adminCommand({ shutdown: 1 })'"
echo "   ou: killall mongod"
echo ""
