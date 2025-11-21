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
  {
    path: "/demande-contact",
    elementName: "DemandeContact",
    title: "Nous contacter",
    hideFromMenu: true,
  },
];

export const protectedRoutes = [
  {
    path: "/mon-compte",
    elementName: "MonCompte",
    title: "Mon compte",
    hideFromMenu: true,
  },
  {
    path: "/mes-voitures",
    elementName: "MesVoitures",
    title: "Mes voitures",
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
