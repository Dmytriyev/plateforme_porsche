# 🚀 Guide de démarrage rapide - Plateforme Porsche

## ⚡ Installation en 3 étapes

### 1. Installer les dépendances

```bash
cd React
npm install
```

### 2. Configurer l'environnement

Créer un fichier `.env` :

```env
NODE_API_URL=http://localhost:3000
```

### 3. Démarrer l'application

```bash
npm run dev
```

L'application sera accessible sur **http://localhost:5173** 🎉

---

## 📋 Checklist de vérification

- [ ] Node.js >= 18 installé
- [ ] Backend API en cours d'exécution (port 3000)
- [ ] Dépendances installées (`npm install`)
- [ ] Fichier `.env` créé
- [ ] Application démarrée (`npm run dev`)

---

## 🎯 Premiers pas

### Structure à connaître

```
src/
├── services/     → Appels API
├── context/      → État global
├── components/   → Composants réutilisables
├── pages/        → Pages de l'application
└── utils/        → Fonctions utilitaires
```

### Exemples d'utilisation

#### 1. Utiliser l'authentification

```javascript
import { useAuth } from '../hooks/useAuth';

const MonComposant = () => {
  const { user, login, logout, isAuthenticated } = useAuth();

  return (
    <div>
      {isAuthenticated() ? (
        <p>Bonjour {user.prenom}</p>
      ) : (
        <button onClick={() => login(email, password)}>Se connecter</button>
      )}
    </div>
  );
};
```

#### 2. Utiliser le panier

```javascript
import { usePanier } from '../hooks/usePanier';

const MonComposant = () => {
  const { articles, ajouterAccessoire, total } = usePanier();

  return (
    <div>
      <p>Total : {total}€</p>
      <p>Articles : {articles.length}</p>
    </div>
  );
};
```

#### 3. Appeler l'API

```javascript
import { voitureService } from '../services';

const fetchVoitures = async () => {
  try {
    const voitures = await voitureService.getAllModels();
    console.log(voitures);
  } catch (error) {
    console.error('Erreur:', error);
  }
};
```

#### 4. Utiliser les composants communs

```javascript
import { Button, Input, Card, Loading } from '../components/common';

<Button variant="primary" size="lg" onClick={handleClick}>
  Cliquez ici
</Button>

<Input
  label="Email"
  type="email"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={errorMessage}
/>

<Card hover padding="lg">
  <h3>Titre</h3>
  <p>Contenu</p>
</Card>

<Loading fullScreen message="Chargement..." />
```

---

## 🔧 Commandes utiles

```bash
# Démarrer en développement
npm run dev

# Builder pour production
npm run build

# Prévisualiser le build
npm run preview

# Linter
npm run lint
```

---

## 📁 Fichiers importants

| Fichier | Description |
|---------|-------------|
| `src/App.jsx` | Configuration des routes |
| `src/config/api.jsx` | Configuration Axios |
| `src/context/AuthContext.jsx` | Gestion utilisateur |
| `src/context/PanierContext.jsx` | Gestion panier |

---

## 🎨 Tailwind CSS - Classes essentielles

```javascript
// Conteneur principal
<div className="max-w-7xl mx-auto px-4">

// Grille responsive
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">

// Bouton
<button className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-800">

// Card
<div className="bg-white rounded-lg shadow-lg p-6">

// Texte
<h1 className="text-4xl font-bold">
<p className="text-gray-600">
```

---

## 🐛 Résolution de problèmes

### Erreur : Cannot connect to API

**Solution** : Vérifier que le backend est démarré sur le port 3000

```bash
cd ../Node
npm start
```

### Erreur : Module not found

**Solution** : Réinstaller les dépendances

```bash
rm -rf node_modules package-lock.json
npm install
```

### Erreur : Port already in use

**Solution** : Vite utilise le port 5173 par défaut, libérez-le ou changez le port

```bash
# Dans vite.config.js
export default {
  server: {
    port: 3001
  }
}
```

---

## 📚 Documentation complète

- **README.md** - Documentation complète
- **ARCHITECTURE.md** - Architecture détaillée
- **Doc_md/React/** - Guides et exemples

---

## 🎓 Ressources d'apprentissage

### React

- [React Documentation officielle](https://react.dev)
- [React Tutorial](https://react.dev/learn)

### Tailwind CSS

- [Tailwind Documentation](https://tailwindcss.com/docs)
- [Tailwind Play (test en ligne)](https://play.tailwindcss.com)

### Vite

- [Vite Documentation](https://vitejs.dev)

---

## 💡 Astuces

1. **Hot Reload** : Les modifications sont automatiquement rechargées
2. **DevTools React** : Installer l'extension Chrome/Firefox
3. **Console** : Utiliser `console.log()` pour déboguer
4. **Erreurs** : Lire attentivement les messages d'erreur

---

## ✅ Tester que tout fonctionne

1. Ouvrir **http://localhost:5173**
2. Page d'accueil s'affiche ✓
3. Cliquer sur "Voitures" → Liste vide ou voitures s'affichent ✓
4. Cliquer sur "Connexion" → Formulaire s'affiche ✓
5. Cliquer sur "Panier" (icône) → Panier vide s'affiche ✓

**Si tout fonctionne → Félicitations ! Vous êtes prêt à développer ! 🎉**

---

## 🤝 Besoin d'aide ?

- Consulter **README.md** pour plus de détails
- Consulter **ARCHITECTURE.md** pour comprendre la structure
- Consulter les exemples dans **Doc_md/React/EXEMPLES_CODE/**

**Bon développement ! 🚗💨**

