# ⚡ DÉMARRAGE SIMPLE - 3 ÉTAPES

## 🎯 Démarrage rapide en 3 commandes

### 1️⃣ Peupler la base de données (une seule fois)

```bash
cd /Users/macbookm1pro/Document/Diplome_final/Code/plateforme_porsche/Node
node scripts/seed-complete-database.js
```

**Attendez le message:** ✅ BASE DE DONNÉES COMPLÈTEMENT PEUPLÉE !

---

### 2️⃣ Démarrer le BACKEND (Terminal 1)

```bash
cd /Users/macbookm1pro/Document/Diplome_final/Code/plateforme_porsche/Node
npm start
```

**Attendez:** ✅ Connexion à mongoDB réussie

---

### 3️⃣ Démarrer le FRONTEND (Terminal 2)

```bash
cd /Users/macbookm1pro/Document/Diplome_final/Code/plateforme_porsche/React
npm run dev
```

**Ouvrez:** http://localhost:5173/

---

## ✅ Pages à tester:

- http://localhost:5173/ (Accueil)
- http://localhost:5173/catalogue/neuve (Voitures neuves)
- http://localhost:5173/catalogue/occasion (Voitures occasion)
- http://localhost:5173/accessoires (Accessoires)

---

## ⚠️ Problème?

### Pas de données?
```bash
# Répeupler la base
cd Node/
node scripts/seed-complete-database.js
```

### ERR_CONNECTION_REFUSED?
```bash
# Redémarrer le backend
cd Node/
npm start
```

### MongoDB pas démarré?
```bash
brew services start mongodb-community
```

---

**C'est tout ! 🚀**
