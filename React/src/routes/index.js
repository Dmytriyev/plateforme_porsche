/**
 * routes/index.js — Définition des routes React Router
 *
 * Notes pédagogiques :
 * - `routes` contient les chemins publics et `protectedRoutes` les chemins
 *   nécessitant authentification. Le routage est configuré dynamiquement dans `App.jsx`.
 * - `getMenuItems` filtre les routes pour construire la navigation principale.
 * - Avantage pédagogique : séparer la déclaration des routes de leur rendu facilite
 *   la maintenance et la génération automatique du menu.
 */

export const routes = [
  { path: "/", elementName: "Home", title: "Accueil" },
  { path: "/login", elementName: "Login", title: "Login", hideFromMenu: true },
  {
    path: "/register",
    elementName: "Register",
    title: "S'inscrire",
    hideFromMenu: true,
  },
  {
    path: "/choix-voiture",
    elementName: "ChoixVoiture",
    title: "Choix voiture",
  },
  {
    path: "/catalogue/:type",
    elementName: "CatalogueModeles",
    title: "Catalogue",
  },
  {
    path: "/variantes/:type/:modeleId",
    elementName: "ListeVariantes",
    title: "Variantes",
    hideFromMenu: true,
  },
  {
    path: "/variante/:id",
    elementName: "VariantePage",
    title: "Variante",
    hideFromMenu: true,
  },
  {
    path: "/occasion/:id",
    elementName: "OccasionPage",
    title: "Occasion",
    hideFromMenu: true,
  },
  {
    path: "/occasion/ajouter",
    elementName: "AjouterModelPorsche",
    title: "Ajouter voiture",
    hideFromMenu: true,
    requiresStaff: true,
  },
  {
    path: "/occasion/:id/modifier",
    elementName: "ModifierModelPorsche",
    title: "Modifier voiture",
    hideFromMenu: true,
    requiresStaff: true,
  },
  {
    path: "/configurateur/:voitureId/:varianteId",
    elementName: "Configurateur",
    title: "Configurateur",
    hideFromMenu: true,
  },
  {
    path: "/configurer/:varianteId",
    elementName: "Configurateur",
    title: "Configurateur",
    hideFromMenu: true,
  },
  { path: "/accessoires", elementName: "Accessoires", title: "Accessoires" },
  {
    path: "/accessoires/ajouter",
    elementName: "AjouterAccessoire",
    title: "Ajouter accessoire",
    hideFromMenu: true,
    requiresStaff: true,
  },
  {
    path: "/accessoires/:id/modifier",
    elementName: "ModifierAccessoire",
    title: "Modifier accessoire",
    hideFromMenu: true,
    requiresStaff: true,
  },
  {
    path: "/accessoires/detail/:id",
    elementName: "AccessoireDetail",
    title: "Détail accessoire",
    hideFromMenu: true,
  },
  {
    path: "/panier",
    elementName: "Panier",
    title: "Panier",
    hideFromMenu: true,
  },
];

export const protectedRoutes = [
  {
    path: "/commande/checkout",
    elementName: "Checkout",
    title: "Finaliser commande",
    hideFromMenu: true,
  },
  {
    path: "/success",
    elementName: "PaymentSuccess",
    title: "Paiement réussi",
    hideFromMenu: true,
  },
  {
    path: "/cancel",
    elementName: "PaymentCancel",
    title: "Paiement annulé",
    hideFromMenu: true,
  },
  {
    path: "/mon-compte",
    elementName: "MonCompte",
    title: "Mon compte",
    hideFromMenu: true,
  },
  {
    path: "/mon-compte/modifier",
    elementName: "ModifierMonCompte",
    title: "Modifier mon compte",
    hideFromMenu: true,
  },
  {
    path: "/mes-voitures",
    elementName: "MesVoitures",
    title: "Mes voitures",
    hideFromMenu: true,
  },
  {
    path: "/mes-voitures/:id",
    elementName: "MaVoitureDetail",
    title: "Détail voiture",
    hideFromMenu: true,
  },
  {
    path: "/mes-voitures/:id/modifier",
    elementName: "ModifierMaVoiture",
    title: "Modifier voiture",
    hideFromMenu: true,
  },
  {
    path: "/ajouter-ma-voiture",
    elementName: "AjouterMaVoiture",
    title: "Ajouter ma voiture",
    hideFromMenu: true,
  },
  {
    path: "/mes-commandes",
    elementName: "MesCommandes",
    title: "Mes commandes",
    hideFromMenu: true,
  },
];

export const getMenuItems = () =>
  routes
    .filter((r) => !r.hideFromMenu)
    .map((r) => ({ path: r.path, title: r.title }));

export default { routes, protectedRoutes, getMenuItems };
