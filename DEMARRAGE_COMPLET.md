# 🚀 Guide de Démarrage Complet - Plateforme Porsche

## ⚠️ PROBLÈME: Erreur `ERR_NETWORK`

Cette erreur signifie que le **frontend React ne peut pas communiquer avec le backend Node.js**.

---

## 📋 SOLUTION: Démarrage en 3 étapes

### ✅ ÉTAPE 1: Vérifier MongoDB

MongoDB doit être démarré **AVANT** le backend Node.js.

**Sur macOS:**
```bash
brew services start mongodb-community
```

**Vérifier que MongoDB tourne:**
```bash
brew services list | grep mongodb
# Vous devez voir: mongodb-community started
```

---

### ✅ ÉTAPE 2: Démarrer le Backend Node.js (Port 3000)

**Ouvrir un NOUVEAU terminal:**

```bash
# Aller dans le dossier Node
cd /Users/macbookm1pro/Document/Diplome_final/Code/plateforme_porsche/Node

# Vérifier que le fichier .env existe
ls -la .env

# Si .env n'existe pas, le créer:
# Copier .env.example vers .env et configurer les variables

# Installer les dépendances (si première fois)
npm install

# Démarrer le serveur
npm start
```

**✅ Vous DEVEZ voir ces messages:**
```
✅ Connexion à mongoDB réussie
✅ Serveur démarré sur le port 3000
```

**❌ Si vous voyez une erreur MongoDB:**
- MongoDB n'est pas démarré
- La connexion dans .env est incorrecte

**⚠️ IMPORTANT:** 
- **NE PAS FERMER** ce terminal
- Le backend doit rester actif

---

### ✅ ÉTAPE 3: Démarrer le Frontend React (Port 5173)

**Ouvrir un AUTRE terminal (le 2ème):**

```bash
# Aller dans le dossier React
cd /Users/macbookm1pro/Document/Diplome_final/Code/plateforme_porsche/React

# Vérifier le fichier .env
cat .env
# Doit contenir: VITE_API_URL=http://localhost:3000

# Installer les dépendances (si première fois)
npm install

# Démarrer Vite
npm run dev
```

**✅ Vous DEVEZ voir:**
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

**Ouvrir le navigateur:**
```
http://localhost:5173
```

---

## 🔍 VÉRIFICATION: Les 2 serveurs tournent

### Terminal 1 - Backend Node.js
```bash
# Dans: /Node
npm start

# Vous voyez:
✅ Serveur sur port 3000
✅ MongoDB connecté
```

### Terminal 2 - Frontend React Vite
```bash
# Dans: /React
npm run dev

# Vous voyez:
✅ Local: http://localhost:5173/
```

---

## 🧪 TEST: Vérifier que le backend répond

**Dans un 3ème terminal OU dans le navigateur:**

```bash
# Test avec curl
curl http://localhost:3000/

# OU ouvrir dans le navigateur:
# http://localhost:3000/
```

**Vous devriez voir:**
```json
{
  "message": "API Porsche en ligne"
}
```

**Si ça ne fonctionne pas:**
- Le backend n'est PAS démarré
- Retournez à l'ÉTAPE 2

---

## 🛠️ DÉPANNAGE

### Erreur: `ERR_CONNECTION_REFUSED`

**Cause:** Backend pas démarré

**Solution:**
```bash
cd /Users/macbookm1pro/Document/Diplome_final/Code/plateforme_porsche/Node
npm start
```

### Erreur: `ERR_NETWORK` ou CORS

**Cause:** Configuration CORS incorrecte

**Vérifier dans `Node/server.js`:**
```javascript
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));
```

### Erreur: MongoDB connection

**Cause:** MongoDB pas démarré

**Solution:**
```bash
brew services start mongodb-community
```

### Le frontend ne charge pas les données

**Vérifier le fichier `React/.env`:**
```bash
cat React/.env
```

**Doit contenir:**
```
VITE_API_URL=http://localhost:3000
```

**Si modifié, REDÉMARRER Vite:**
```bash
# Ctrl+C dans le terminal React
npm run dev
```

---

## ✅ CHECKLIST COMPLÈTE

- [ ] MongoDB démarré (`brew services list`)
- [ ] Backend Node.js démarré (Terminal 1)
  - [ ] Message: "✅ Connexion à mongoDB réussie"
  - [ ] Message: "Serveur sur port 3000"
- [ ] Frontend React démarré (Terminal 2)
  - [ ] Message: "Local: http://localhost:5173/"
- [ ] Test backend: `curl http://localhost:3000/` fonctionne
- [ ] Fichier `React/.env` contient: `VITE_API_URL=http://localhost:3000`
- [ ] Page React charge sans erreur console

---

## 🎯 RÉSUMÉ RAPIDE

**3 choses doivent tourner en même temps:**

1. **MongoDB** (service en arrière-plan)
2. **Backend Node.js** (Terminal 1, port 3000)
3. **Frontend React** (Terminal 2, port 5173)

**Si l'erreur persiste:**
1. Vérifier les 3 points ci-dessus
2. Redémarrer les 2 terminaux
3. Vider le cache du navigateur (Ctrl+Shift+R)

---

## 📞 COMMANDES UTILES

```bash
# Vérifier les ports utilisés
lsof -i :3000  # Backend
lsof -i :5173  # Frontend

# Arrêter un processus sur un port
kill -9 $(lsof -ti:3000)

# Voir les logs en temps réel
# Dans Node/: npm start
# Les logs s'affichent dans le terminal
```

---

## 🎉 SUCCÈS

Quand tout fonctionne, vous devez voir:

- **Page Home** avec les 3 modèles: 911, Cayman, Cayenne
- **Photos** des voitures depuis l'API
- **Aucune erreur** dans la console du navigateur
- **Navigation** fluide entre les pages

Bon courage ! 🚗

