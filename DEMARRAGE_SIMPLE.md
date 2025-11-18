# 🚨 ERREUR: Backend Non Démarré

## LE PROBLÈME

```
❌ ERR_CONNECTION_REFUSED
❌ http://localhost:3000/voiture/all
```

**Cela signifie:** Le serveur backend Node.js **N'EST PAS EN COURS D'EXÉCUTION**.

---

## ✅ SOLUTION RAPIDE (2 Terminaux)

### **Terminal 1 - BACKEND**

```bash
cd /Users/macbookm1pro/Document/Diplome_final/Code/plateforme_porsche
./start-backend.sh
```

**OU manuellement:**
```bash
cd /Users/macbookm1pro/Document/Diplome_final/Code/plateforme_porsche/Node
npm start
```

**Vous DEVEZ voir:**
```
✅ Connexion à mongoDB réussie
✅ Serveur démarré sur le port 3000
```

**⚠️ NE PAS FERMER CE TERMINAL !**

---

### **Terminal 2 - FRONTEND**

```bash
cd /Users/macbookm1pro/Document/Diplome_final/Code/plateforme_porsche
./start-frontend.sh
```

**OU manuellement:**
```bash
cd /Users/macbookm1pro/Document/Diplome_final/Code/plateforme_porsche/React
npm run dev
```

**Vous DEVEZ voir:**
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

**⚠️ NE PAS FERMER CE TERMINAL !**

---

## 🧪 VÉRIFICATION

### **1. Tester le backend dans le navigateur:**

```
http://localhost:3000/
```

**Vous devriez voir:**
```json
{
  "message": "API Porsche en ligne"
}
```

### **2. Tester l'endpoint voitures:**

```
http://localhost:3000/voiture/all
```

**Vous devriez voir:** Un JSON avec la liste des voitures (peut être vide `[]` si la DB est vide)

### **3. Ouvrir l'application React:**

```
http://localhost:5173/
```

---

## 🚨 SI LE BACKEND NE DÉMARRE PAS

### **Erreur: MongoDB**

```bash
# Démarrer MongoDB
brew services start mongodb-community

# Vérifier qu'il tourne
brew services list | grep mongodb
# Doit afficher: mongodb-community started
```

### **Erreur: Port 3000 déjà utilisé**

```bash
# Trouver le processus qui utilise le port
lsof -i :3000

# Tuer le processus
kill -9 [PID]

# Relancer le backend
npm start
```

### **Erreur: Dépendances manquantes**

```bash
cd Node/
npm install
npm start
```

---

## 📋 CHECKLIST AVANT DE DÉMARRER

- [ ] MongoDB installé: `brew install mongodb-community`
- [ ] MongoDB démarré: `brew services start mongodb-community`
- [ ] Dépendances Node installées: `cd Node && npm install`
- [ ] Dépendances React installées: `cd React && npm install`
- [ ] Fichier `.env` existe dans `Node/` (voir `.env.example`)
- [ ] Fichier `.env` existe dans `React/` avec `VITE_API_URL=http://localhost:3000`

---

## 🎯 ORDRE DE DÉMARRAGE (IMPORTANT!)

```
1. MongoDB     (service en arrière-plan)
   ↓
2. Backend     (Terminal 1, port 3000)
   ↓
3. Frontend    (Terminal 2, port 5173)
```

**Les 3 doivent être actifs en même temps !**

---

## 💡 ASTUCE

Utilisez les scripts fournis pour simplifier:

**Terminal 1:**
```bash
./start-backend.sh
```

**Terminal 2:**
```bash
./start-frontend.sh
```

Ces scripts vérifient automatiquement MongoDB et installent les dépendances si nécessaire.

---

## 🆘 AIDE RAPIDE

**Backend ne répond pas ?**
→ Vérifiez qu'il tourne: `curl http://localhost:3000/`

**Frontend ne charge pas ?**
→ Vérifiez `.env`: `cat React/.env` (doit contenir `VITE_API_URL=http://localhost:3000`)

**Toujours des erreurs ?**
→ Redémarrez tout:
1. Ctrl+C dans les 2 terminaux
2. `./start-backend.sh` (Terminal 1)
3. `./start-frontend.sh` (Terminal 2)

---

## ✅ SUCCÈS

Quand tout fonctionne:

- ✅ Terminal 1 affiche: "Serveur sur port 3000"
- ✅ Terminal 2 affiche: "Local: http://localhost:5173/"
- ✅ Page Home affiche: 911, Cayman, Cayenne avec photos
- ✅ Aucune erreur console

🎉 **Votre plateforme Porsche est en ligne !**

