# Charte Graphique Porsche - Application au Site

## 📋 Résumé

La charte graphique officielle Porsche a été appliquée au site de vente de véhicules. Ce document détaille tous les changements effectués et comment utiliser le nouveau système de design.

---

## 🎨 Couleurs

### Couleurs Principales

```css
--color-black: #000000         /* Textes principaux, navigation, structure */
--color-white: #FFFFFF         /* Arrière-plans, contrastes */
--color-anthracite: #2B2B2B    /* Sections secondaires */
```

### Couleurs Secondaires

```css
--color-red-porsche: #D5001C      /* Boutons CTA, accents */
--color-red-porsche-dark: #B00015 /* Hover boutons */
--color-grey-light: #F5F5F5       /* Arrière-plans sections */
--color-grey-medium: #757575      /* Textes secondaires */
--color-gold: #B8860B             /* Badges certifiés (à venir) */
```

### Couleurs d'État

```css
--color-success: #4CAF50          /* Disponible */
--color-warning: #FF9800          /* Réservé */
--color-grey-disabled: #9E9E9E    /* Vendu/Désactivé */
```

---

## 📝 Typographie

### Police

**Inter** / **Helvetica Neue** comme police principale

```css
--font-family-primary: 'Inter', 'Helvetica Neue', -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
```

### Tailles

```css
--font-size-h1: 56px              /* Titres principaux */
--font-size-h2: 40px              /* Titres sections */
--font-size-h3: 28px              /* Sous-titres */
--font-size-body: 18px            /* Corps de texte */
--font-size-body-small: 16px      /* Corps petit */
--font-size-secondary: 14px       /* Métadonnées */
--font-size-button: 16px          /* Boutons */
```

### Graisses

```css
--font-weight-regular: 400        /* Texte normal */
--font-weight-medium: 500         /* Boutons */
--font-weight-semibold: 600       /* H2, H3 */
--font-weight-bold: 700           /* H1, titres */
```

### Hauteurs de ligne

```css
--line-height-tight: 1.2          /* Titres */
--line-height-normal: 1.4         /* Sous-titres */
--line-height-relaxed: 1.6        /* Corps */
```

---

## 🔘 Boutons

### Utilisation

```jsx
import Button from './components/common/Button';

// Bouton primaire (rouge Porsche)
<Button variant="primary">Commander</Button>

// Bouton secondaire (contour noir)
<Button variant="secondary">En savoir plus</Button>

// Bouton tertiaire (texte seulement)
<Button variant="tertiary">Annuler</Button>

// Tailles
<Button size="sm">Petit</Button>
<Button size="md">Moyen</Button>
<Button size="lg">Grand</Button>

// Pleine largeur
<Button fullWidth>Confirmer</Button>
```

### Styles

**Primaire:**
- Fond: Rouge Porsche (#D5001C)
- Texte: Blanc
- Hover: Rouge foncé (#B00015) + élévation
- Border-radius: 2px
- Text-transform: UPPERCASE
- Letter-spacing: 1.5px

**Secondaire:**
- Fond: Transparent
- Bordure: 2px solid noir
- Texte: Noir
- Hover: Fond noir + texte blanc

**Tertiaire:**
- Texte seulement
- Hover: Rouge Porsche + translation

---

## 📐 Espacements (Système 8pt)

Tous les espacements sont des multiples de 8px:

```css
--spacing-xs: 8px
--spacing-sm: 16px
--spacing-md: 24px
--spacing-lg: 32px
--spacing-xl: 48px
--spacing-2xl: 64px
--spacing-3xl: 80px
--spacing-4xl: 120px
```

### Utilisation

```css
.ma-section {
  padding: var(--spacing-xl);          /* 48px */
  margin-bottom: var(--spacing-4xl);   /* 120px */
  gap: var(--spacing-md);              /* 24px */
}
```

---

## 🖼️ Ombres

```css
--shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.06)   /* Filtres, barres */
--shadow-md: 0 2px 12px rgba(0, 0, 0, 0.08)  /* Cartes au repos */
--shadow-lg: 0 4px 20px rgba(0, 0, 0, 0.12)  /* Cartes hover */
--shadow-xl: 0 8px 32px rgba(0, 0, 0, 0.16)  /* Modales */
```

---

## ⚡ Transitions

```css
--transition-duration: 0.3s
--transition-easing: cubic-bezier(0.4, 0, 0.2, 1)
```

### Utilisation

```css
.mon-element {
  transition: all var(--transition-duration) var(--transition-easing);
}

/* Ou spécifique */
.mon-autre-element {
  transition: transform var(--transition-duration) var(--transition-easing);
}
```

---

## 📏 Layout

```css
--container-max-width: 1440px
--container-padding-desktop: 80px
--container-padding-mobile: 24px
--grid-gap: 32px
```

### Container

```css
.container {
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: 0 var(--container-padding-desktop);
}

@media (max-width: 768px) {
  .container {
    padding: 0 var(--container-padding-mobile);
  }
}
```

---

## 📱 Responsive

```css
/* Desktop */
@media (min-width: 1440px) { }

/* Tablet */
@media (min-width: 768px) and (max-width: 1439px) { }

/* Mobile */
@media (max-width: 768px) { }
```

---

## 📂 Fichiers Créés

### Variables CSS
**Fichier:** `src/styles/variables.css`
- Toutes les variables CSS Porsche
- Importé dans `main.jsx`

### Composant Button
**Fichiers:**
- `src/components/common/Button.jsx`
- `src/components/common/Button.css`

**Utilisation:** Importé et utilisé dans tous les composants nécessitant des boutons

### Navigation
**Fichiers:**
- `src/components/layout/Navbar.jsx` (modifié)
- `src/components/layout/Navbar.css` (créé)

### Styles Globaux
**Fichier:** `src/index.css` (modifié)
- Typographie globale appliquée
- Styles de base pour `body`, `h1-h6`, `p`, `a`

### Page Home
**Fichier:** `src/pages/Home.css` (modifié)
- Variables appliquées à toutes les sections
- Hero, modèles, accessoires avec charte Porsche

---

## ✅ Pages Déjà Modifiées

- ✅ **Home** - Variables appliquées, boutons rouges, espacements corrects
- ✅ **Navbar** - Fond noir, texte blanc, hover rouge
- ✅ **Styles globaux** - Typographie Porsche, containers, liens

---

## 🎯 Pages à Modifier (Prochaines Étapes)

### Pages Principales
- [ ] Voitures (liste et détail)
- [ ] Accessoires (liste et détail)
- [ ] Configurateur
- [ ] ChoixVoiture
- [ ] CatalogueModeles
- [ ] ListeVariantes
- [ ] ConfigurationComplete

### Pages Utilisateur
- [ ] Login
- [ ] Register
- [ ] Mon Compte
- [ ] Mes Voitures
- [ ] Mes Commandes
- [ ] Mes Réservations

### Dashboards
- [ ] Dashboard Admin
- [ ] Dashboard Conseiller

### Composants
- [ ] Card
- [ ] Input
- [ ] Alert
- [ ] Loading
- [ ] Modal

---

## 📖 Comment Appliquer la Charte à une Nouvelle Page

### Étape 1: Importer les variables (si nécessaire)
Les variables sont déjà globales via `main.jsx`, mais pour référence:

```jsx
// Les variables sont automatiquement disponibles
```

### Étape 2: Utiliser les variables dans le CSS

```css
/* Fichier: MaPage.css */

.ma-section {
  /* Couleurs */
  background-color: var(--color-white);
  color: var(--color-black);
  
  /* Typographie */
  font-family: var(--font-family-primary);
  font-size: var(--font-size-body);
  
  /* Espacements */
  padding: var(--spacing-xl);
  margin-bottom: var(--spacing-4xl);
  
  /* Ombres */
  box-shadow: var(--shadow-md);
  
  /* Transitions */
  transition: all var(--transition-duration) var(--transition-easing);
}

.ma-section:hover {
  box-shadow: var(--shadow-lg);
}
```

### Étape 3: Utiliser le composant Button

```jsx
import Button from '../../components/common/Button';

function MaPage() {
  return (
    <div>
      <h1>Mon Titre</h1>
      <p>Mon contenu</p>
      <Button variant="primary">Action Principale</Button>
      <Button variant="secondary">Action Secondaire</Button>
    </div>
  );
}
```

---

## 🎨 Principes de Design Porsche

### Minimalisme Allemand
- Espaces blancs généreux
- Typographie claire et lisible
- Hiérarchie visuelle forte

### Excellence Premium
- Photographie haute qualité uniquement
- Détails soignés (ombres subtiles, transitions fluides)
- Cohérence absolue dans tous les éléments

### Performance et Innovation
- Animations fluides
- Temps de chargement optimisés
- Responsive parfait sur tous les appareils

---

## ⚠️ À NE PAS FAIRE

❌ **Utiliser des couleurs hors charte**
```css
/* MAUVAIS */
.mon-bouton {
  background-color: #FF0000; /* Rouge trop vif */
}

/* BON */
.mon-bouton {
  background-color: var(--color-red-porsche); /* Rouge Porsche officiel */
}
```

❌ **Espacements non-standard**
```css
/* MAUVAIS */
.ma-section {
  padding: 25px; /* Pas un multiple de 8 */
}

/* BON */
.ma-section {
  padding: var(--spacing-md); /* 24px */
}
```

❌ **Typographie incohérente**
```css
/* MAUVAIS */
h1 {
  font-size: 50px;
  font-weight: 500;
}

/* BON */
h1 {
  font-size: var(--font-size-h1); /* 56px */
  font-weight: var(--font-weight-bold); /* 700 */
}
```

---

## 🚀 Build et Déploiement

### Vérifier le build
```bash
cd React
npm run build
```

### Lancer le dev
```bash
npm run dev
```

### Linter
```bash
npm run lint
```

---

## 📞 Support

Pour toute question sur l'application de la charte graphique, référez-vous à:
- Ce document
- `src/styles/variables.css` pour toutes les variables
- `chartre_graphique.md` pour la charte complète

---

**Dernière mise à jour:** 2025
**Version:** 1.0
**Statut:** ✅ Charte partiellement appliquée (Home, Navbar, Boutons)

