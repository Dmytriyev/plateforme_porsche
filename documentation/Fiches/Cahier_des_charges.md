# Cahier des Charges - Plateforme de Vente Porsche

## 1. Présentation du Projet

### 1.1 Contexte

Création d'un site web/application pour la vente de véhicules Porsche neufs et d'occasion certifiés Porsche, permettant aux clients d'effectuer leurs achats et réservations en ligne.

### 1.2 Objectifs

- Simplifier le processus de vente et de réservation de véhicules Porsche
- Digitaliser l'expérience en permettant aux clients d'acheter ou réserver depuis leur domicile
- Optimiser le stockage des véhicules et reduire le nobre des boutiques

### 1.3 Période de réalisation

- Début : 06/10/2025
- Livraison finale : 28/11/2025

## 2. Public Cible

- **Visiteurs non connectés** : Consultation du catalogue. Configurer une voiture Neuf
- **Clients connectés** : Achat et réservation de véhicules. Achat dans la boutique en ligne. Proposer sa voiture en vente
- **Responsable** : Gestion complète de la plateforme. Mettre en vente une voiture occasion. Mettre en vente accessoire.
- **Conseiller** : Gestion de propositions des voitures. Gestion de reservations des voitures occasions.

## 3. Fonctionnalités Principales

### 3.1 Accès Public (Non connecté)

#### Catalogue de véhicules

- Consultation de tous les véhicules disponibles
- Filtres de recherche avancés :
  - Type (neuf/occasion certifié)
  - Modèle (911, Cayenne)
- Tri par : prix
- Fiches détaillées par véhicule :
  - Galerie photos haute résolution (ex: 20 photos)
  - Caractéristiques techniques complètes
  - Équipements
  - Prix TTC
  - Disponibilité
- Consultation de boutique des accesoires

#### Pages informatives

- Présentation de l'entreprise
- Programme de certification Porsche
- Conditions de vente
- Contact

### 3.2 Espace Client (Connecté)

#### Gestion de compte

- Inscription
- Connexion
- Profil utilisateur :
  - Informations personnelles
  - Coordonnées
  - Modelde de votre Porsche
- Réinitialisation de mot de passe

#### Fonctionnalités d'achat/réservation

- Réservation de véhicule occasion certifié:
  - Délai de réservation (ex: 48h)
  - Contact par conseiller
- Achat en ligne :
  - Choix de model et version
  - Choix de couleur exterieur/interieur
  - Choix la date de livraison dans le centre Porsche
  - Versement de paiement d'un acompte (250€)
- Achat dans la boutique des accesoires
  - Panier

#### Fonctionnalités supplémentaires

- Liste de favoris
- Demande d'essai
- Proposer sa voiture en vente (trade-in)
- Demande de certification Porsche

### 3.3 Back-office Administrateur

#### Gestion du catalogue

- Ajout/modification/suppression de véhicules
- Upload multiple de photos
- Gestion des caractéristiques techniques
- Gestion du stock et disponibilité
- Statuts : disponible, réservé, vendu

#### Gestion des utilisateurs

- Liste des clients

#### Gestion des commandes/réservations

- Dashboard des réservations en cours
- Validation/refus des réservations
- Génération de documents (contrats, factures)

## 4 Architecture du Système

#### Frontend :

- React
- Tailwind et CSS

#### Backend :

- Node.js
- API REST

#### Base de données :

- MongooDB

#### Paiement :

- Paiement sécurisé (Stripe)

#### Sécurité

- Authentification sécurisée (JWT ou session)
- Hashage des mots de passe (bcrypt)
- Conformité RGPD

#### Compatibilité

- Responsive design (mobile, tablette, desktop)

## 5. Livrables Attendus

- Documentation technique (architecture, API)
- Manuel administrateur

## 6. Planning Prévisionnel

**Analyse et conception (1,5 semaines)**

- Validation du cahier des charges
- Use case, MCD, MLD, UML Diagramme de classes
- Wireframe, Maquettes

**Développement (4 semaines)**

- BackEnd administrateur
- Espace client
- Intégrations paiement Stripe
- Frontend interface
- Documentation

**Tests (3 jours)**

- Tests fonctionnels
- Tests de sécurité
- Corrections de bugs
