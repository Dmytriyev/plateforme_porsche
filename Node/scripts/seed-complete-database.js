/**
 * Script COMPLET pour peupler la base de données MongoDB
 * Ajoute TOUTES les données : voitures, variantes, accessoires, couleurs, etc.
 * 
 * Exécutez: node scripts/seed-complete-database.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Voiture from '../models/voiture.model.js';
import ModelPorsche from '../models/model_porsche.model.js';
import Accesoire from '../models/accesoire.model.js';
import CouleurExterieur from '../models/couleur_exterieur.model.js';
import CouleurInterieur from '../models/couleur_interieur.model.js';
import CouleurAccesoire from '../models/couleur_accesoire.model.js';
import TailleJante from '../models/taille_jante.model.js';
import Siege from '../models/siege.model.js';
import Package from '../models/package.model.js';

dotenv.config();

console.log('');
console.log('═══════════════════════════════════════════════════════════════════');
console.log('  🚀 SEED COMPLET DE LA BASE DE DONNÉES PORSCHE');
console.log('═══════════════════════════════════════════════════════════════════');
console.log('');

// ==================== DONNÉES ====================

const voituresData = [
  // VOITURES NEUVES
  {
    type_voiture: true,
    nom_model: '911',
    description: 'L\'icône intemporelle. La Porsche 911 incarne la quintessence de la sportivité depuis 1963. Moteur boxer 6 cylindres à plat, design reconnaissable entre tous.',
  },
  {
    type_voiture: true,
    nom_model: 'Cayenne',
    description: 'Le SUV sportif de luxe. Combine les performances Porsche avec le confort et la polyvalence d\'un SUV premium. Parfait pour la famille sportive.',
  },
  {
    type_voiture: true,
    nom_model: 'Cayman',
    description: 'La voiture de sport biplace à moteur central. Équilibre parfait, agilité exceptionnelle. Le plaisir de conduite à l\'état pur.',
  },
  
  // VOITURES D'OCCASION
  {
    type_voiture: false,
    nom_model: '911',
    description: 'Porsche 911 d\'occasion certifiée. Historique complet, entretien Porsche Center, garantie incluse. État impeccable.',
  },
  {
    type_voiture: false,
    nom_model: 'Cayenne',
    description: 'Cayenne d\'occasion certifiée. SUV premium avec toutes les options. Entretien complet, prête à partir.',
  },
  {
    type_voiture: false,
    nom_model: 'Cayman',
    description: 'Cayman d\'occasion certifiée. Sportive pure avec historique Porsche. Contrôlée et garantie.',
  },
];

const variantesData = [
  // Variantes 911
  { nom_variante: 'Carrera', modele: '911', type: true, puissance: 385, transmission: 'PDK', acceleration: 4.2, prix: 120000 },
  { nom_variante: 'Carrera S', modele: '911', type: true, puissance: 450, transmission: 'PDK', acceleration: 3.7, prix: 135000 },
  { nom_variante: 'Carrera 4 GTS', modele: '911', type: true, puissance: 480, transmission: 'PDK', acceleration: 3.3, prix: 155000 },
  { nom_variante: 'Turbo', modele: '911', type: true, puissance: 580, transmission: 'PDK', acceleration: 2.7, prix: 190000 },
  { nom_variante: 'Turbo S', modele: '911', type: true, puissance: 650, transmission: 'PDK', acceleration: 2.6, prix: 220000 },
  { nom_variante: 'GT3', modele: '911', type: true, puissance: 510, transmission: 'Manuelle', acceleration: 3.4, prix: 175000 },
  
  // Variantes Cayenne
  { nom_variante: 'Cayenne', modele: 'Cayenne', type: true, puissance: 340, transmission: 'Tiptronic', acceleration: 6.2, prix: 85000 },
  { nom_variante: 'Cayenne S', modele: 'Cayenne', type: true, puissance: 440, transmission: 'Tiptronic', acceleration: 5.0, prix: 95000 },
  { nom_variante: 'Cayenne GTS', modele: 'Cayenne', type: true, puissance: 460, transmission: 'Tiptronic', acceleration: 4.5, prix: 115000 },
  { nom_variante: 'Cayenne Turbo', modele: 'Cayenne', type: true, puissance: 550, transmission: 'Tiptronic', acceleration: 3.9, prix: 145000 },
  
  // Variantes Cayman
  { nom_variante: 'Cayman', modele: 'Cayman', type: true, puissance: 300, transmission: 'PDK', acceleration: 5.1, prix: 65000 },
  { nom_variante: 'Cayman S', modele: 'Cayman', type: true, puissance: 350, transmission: 'PDK', acceleration: 4.6, prix: 75000 },
  { nom_variante: 'Cayman GTS', modele: 'Cayman', type: true, puissance: 400, transmission: 'PDK', acceleration: 4.1, prix: 90000 },
  { nom_variante: 'Cayman GT4', modele: 'Cayman', type: true, puissance: 420, transmission: 'Manuelle', acceleration: 4.4, prix: 105000 },
];

const accessoiresData = [
  // Porte-clés
  { nom: 'Porte-clés Porsche Crest', type: 'porte_cles', description: 'Porte-clés officiel avec écusson Porsche', prix: 45, stock: 100 },
  { nom: 'Porte-clés 911 Silhouette', type: 'porte_cles', description: 'Silhouette élégante de la 911', prix: 55, stock: 80 },
  { nom: 'Porte-clés Cuir Premium', type: 'porte_cles', description: 'Cuir véritable, finition main', prix: 85, stock: 50 },
  
  // Casquettes
  { nom: 'Casquette Porsche Racing', type: 'casquette', description: 'Casquette officielle Motorsport', prix: 45, stock: 120 },
  { nom: 'Casquette 911 Collection', type: 'casquette', description: 'Design classique, ajustable', prix: 40, stock: 150 },
  { nom: 'Casquette Cayenne Edition', type: 'casquette', description: 'Style sport élégant', prix: 42, stock: 100 },
  
  // Vêtements
  { nom: 'T-shirt Porsche Classic', type: 'vetement', description: 'Coton premium, logo brodé', prix: 65, stock: 200 },
  { nom: 'Polo Porsche Racing', type: 'vetement', description: 'Coupe ajustée, respirant', prix: 95, stock: 150 },
  { nom: 'Veste Softshell Porsche', type: 'vetement', description: 'Coupe-vent, imperméable', prix: 185, stock: 80 },
  { nom: 'Pull Porsche Heritage', type: 'vetement', description: 'Laine mérinos, design classique', prix: 145, stock: 60 },
  
  // Bagages
  { nom: 'Sac de voyage Porsche', type: 'bagages', description: 'Grande capacité, cuir véritable', prix: 450, stock: 30 },
  { nom: 'Valise cabine Porsche', type: 'bagages', description: 'Format cabine, 4 roues', prix: 380, stock: 40 },
  { nom: 'Sac à dos Porsche', type: 'bagages', description: 'Compartiment laptop, design sport', prix: 195, stock: 80 },
  
  // Décoration
  { nom: 'Horloge murale 911', type: 'decoration', description: 'Design volant, 30cm diamètre', prix: 125, stock: 50 },
  { nom: 'Poster 911 Classic', type: 'decoration', description: 'Impression haute qualité, 50x70cm', prix: 45, stock: 100 },
  { nom: 'Modèle réduit 911 Turbo', type: 'decoration', description: 'Échelle 1:18, détails parfaits', prix: 185, stock: 40 },
  
  // Miniatures
  { nom: 'Miniature 911 GT3 1:43', type: 'miniature', description: 'Collection officielle Porsche', prix: 65, stock: 120 },
  { nom: 'Miniature Cayenne 1:43', type: 'miniature', description: 'Finition exceptionnelle', prix: 60, stock: 100 },
  { nom: 'Miniature 911 Carrera 1:18', type: 'miniature', description: 'Portes ouvrantes, très détaillée', prix: 195, stock: 50 },
];

const couleursExterieurData = [
  { nom: 'Noir', code_hex: '#000000', prix_supplementaire: 0 },
  { nom: 'Blanc Carrara', code_hex: '#FFFFFF', prix_supplementaire: 0 },
  { nom: 'Gris GT Argent', code_hex: '#8C8C8C', prix_supplementaire: 750 },
  { nom: 'Bleu Gentiane', code_hex: '#2E5090', prix_supplementaire: 2890 },
  { nom: 'Rouge Carmin', code_hex: '#A2231D', prix_supplementaire: 3150 },
  { nom: 'Vert Racing', code_hex: '#0F5532', prix_supplementaire: 3150 },
  { nom: 'Jaune Racing', code_hex: '#F7C744', prix_supplementaire: 3150 },
];

const couleursInterieurData = [
  { nom: 'Cuir Noir', code_hex: '#1A1A1A', prix_supplementaire: 0 },
  { nom: 'Cuir Bordeaux', code_hex: '#5C1A1A', prix_supplementaire: 1500 },
  { nom: 'Cuir Cognac', code_hex: '#8B4513', prix_supplementaire: 1500 },
  { nom: 'Alcantara Noir', code_hex: '#000000', prix_supplementaire: 2200 },
  { nom: 'Cuir Craie', code_hex: '#E8DCC8', prix_supplementaire: 1800 },
];

const jantesData = [
  { taille: '19 pouces', style: 'Carrera S', prix: 0 },
  { taille: '20 pouces', style: 'Carrera S', prix: 1450 },
  { taille: '20 pouces', style: 'Turbo', prix: 2890 },
  { taille: '21 pouces', style: 'GT3', prix: 4250 },
  { taille: '21 pouces', style: 'Sport Design', prix: 3890 },
];

const siegesData = [
  { type: 'Sport', materiau: 'Cuir', prix_supplementaire: 0 },
  { type: 'Sport Plus', materiau: 'Cuir/Alcantara', prix_supplementaire: 1890 },
  { type: 'Confort', materiau: 'Cuir', prix_supplementaire: 1200 },
  { type: 'Baquet Carbone', materiau: 'Carbone/Alcantara', prix_supplementaire: 5890 },
];

const packagesData = [
  { 
    nom: 'Pack Sport Chrono', 
    description: 'Chronomètre, mode Sport Plus, Launch Control', 
    prix: 2890 
  },
  { 
    nom: 'Pack Confort', 
    description: 'Sièges confort, climatisation automatique, capteurs parking', 
    prix: 3450 
  },
  { 
    nom: 'Pack Premium', 
    description: 'Système audio Bose, sièges ventilés, éclairage ambiance', 
    prix: 5890 
  },
  { 
    nom: 'Pack Assistance', 
    description: 'Régulateur adaptatif, Lane Assist, détection angles morts', 
    prix: 4250 
  },
];

// ==================== FONCTIONS ====================

async function clearDatabase() {
  console.log('🗑️  Nettoyage de la base de données...');
  
  await Voiture.deleteMany({});
  await ModelPorsche.deleteMany({});
  await Accesoire.deleteMany({});
  await CouleurExterieur.deleteMany({});
  await CouleurInterieur.deleteMany({});
  await CouleurAccesoire.deleteMany({});
  await TailleJante.deleteMany({});
  await Siege.deleteMany({});
  await Package.deleteMany({});
  
  console.log('✅ Base de données nettoyée\n');
}

async function seedVoitures() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  🚗 AJOUT DES VOITURES (Modèles de base)');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const voitures = [];
  for (const data of voituresData) {
    const voiture = await Voiture.create(data);
    voitures.push(voiture);
    const typeLabel = data.type_voiture ? '✨ NEUVE' : '🔄 OCCASION';
    console.log(`✅ ${typeLabel} - ${data.nom_model}`);
  }
  
  console.log(`\n📊 Total: ${voitures.length} voitures ajoutées\n`);
  return voitures;
}

async function seedVariantes(voitures) {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  🏎️  AJOUT DES VARIANTES PORSCHE');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const variantes = [];
  for (const data of variantesData) {
    // Trouver la voiture parente (neuve)
    const voitureParent = voitures.find(
      v => v.nom_model === data.modele && v.type_voiture === data.type
    );
    
    if (!voitureParent) {
      console.log(`⚠️  Voiture ${data.modele} non trouvée, skip variante ${data.nom_variante}`);
      continue;
    }
    
    const variante = await ModelPorsche.create({
      nom_model: data.nom_variante,
      voiture: voitureParent._id,
      puissance_ch: data.puissance,
      type_transmission: data.transmission,
      acceleration_0_100: data.acceleration,
      prix_base: data.prix,
      type_carrosserie: 'Coupé',
      statut: 'disponible',
      disponible: true,
    });
    
    variantes.push(variante);
    console.log(`✅ ${data.modele} ${data.nom_variante} - ${data.puissance}ch - ${data.prix.toLocaleString()}€`);
  }
  
  console.log(`\n📊 Total: ${variantes.length} variantes ajoutées\n`);
  return variantes;
}

async function seedAccessoires() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  🛍️  AJOUT DES ACCESSOIRES');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  const accessoires = [];
  for (const data of accessoiresData) {
    const accessoire = await Accesoire.create(data);
    accessoires.push(accessoire);
    console.log(`✅ [${data.type}] ${data.nom} - ${data.prix}€`);
  }
  
  console.log(`\n📊 Total: ${accessoires.length} accessoires ajoutés\n`);
  return accessoires;
}

async function seedCouleurs() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  🎨 AJOUT DES COULEURS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('COULEURS EXTÉRIEURES:');
  const couleursExt = [];
  for (const data of couleursExterieurData) {
    const couleur = await CouleurExterieur.create(data);
    couleursExt.push(couleur);
    const prix = data.prix_supplementaire > 0 ? `+${data.prix_supplementaire}€` : 'Série';
    console.log(`✅ ${data.nom} (${data.code_hex}) - ${prix}`);
  }
  
  console.log(`\nCOULEURS INTÉRIEURES:`);
  const couleursInt = [];
  for (const data of couleursInterieurData) {
    const couleur = await CouleurInterieur.create(data);
    couleursInt.push(couleur);
    const prix = data.prix_supplementaire > 0 ? `+${data.prix_supplementaire}€` : 'Série';
    console.log(`✅ ${data.nom} (${data.code_hex}) - ${prix}`);
  }
  
  console.log(`\n📊 Total: ${couleursExt.length} extérieures + ${couleursInt.length} intérieures\n`);
  return { couleursExt, couleursInt };
}

async function seedOptions() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  ⚙️  AJOUT DES OPTIONS');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  console.log('JANTES:');
  const jantes = [];
  for (const data of jantesData) {
    const jante = await TailleJante.create(data);
    jantes.push(jante);
    const prix = data.prix > 0 ? `+${data.prix}€` : 'Série';
    console.log(`✅ ${data.taille} ${data.style} - ${prix}`);
  }
  
  console.log(`\nSIÈGES:`);
  const sieges = [];
  for (const data of siegesData) {
    const siege = await Siege.create(data);
    sieges.push(siege);
    const prix = data.prix_supplementaire > 0 ? `+${data.prix_supplementaire}€` : 'Série';
    console.log(`✅ ${data.type} ${data.materiau} - ${prix}`);
  }
  
  console.log(`\nPACKAGES:`);
  const packages = [];
  for (const data of packagesData) {
    const pack = await Package.create(data);
    packages.push(pack);
    console.log(`✅ ${data.nom} - ${data.prix}€`);
  }
  
  console.log(`\n📊 Total: ${jantes.length} jantes + ${sieges.length} sièges + ${packages.length} packages\n`);
  return { jantes, sieges, packages };
}

async function displaySummary() {
  console.log('');
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('  📊 RÉSUMÉ COMPLET DE LA BASE DE DONNÉES');
  console.log('═══════════════════════════════════════════════════════════════════\n');
  
  const countVoituresNeuves = await Voiture.countDocuments({ type_voiture: true });
  const countVoituresOccasion = await Voiture.countDocuments({ type_voiture: false });
  const countVariantes = await ModelPorsche.countDocuments();
  const countAccessoires = await Accesoire.countDocuments();
  const countCouleursExt = await CouleurExterieur.countDocuments();
  const countCouleursInt = await CouleurInterieur.countDocuments();
  const countJantes = await TailleJante.countDocuments();
  const countSieges = await Siege.countDocuments();
  const countPackages = await Package.countDocuments();
  
  console.log('🚗 VOITURES:');
  console.log(`   ✨ Neuves: ${countVoituresNeuves}`);
  console.log(`   🔄 Occasion: ${countVoituresOccasion}`);
  console.log(`   📦 Total: ${countVoituresNeuves + countVoituresOccasion}\n`);
  
  console.log(`🏎️  VARIANTES PORSCHE: ${countVariantes}\n`);
  
  console.log(`🛍️  ACCESSOIRES: ${countAccessoires}`);
  console.log(`   Types: porte-clés, casquettes, vêtements, bagages, décoration, miniatures\n`);
  
  console.log('🎨 COULEURS:');
  console.log(`   Extérieures: ${countCouleursExt}`);
  console.log(`   Intérieures: ${countCouleursInt}\n`);
  
  console.log('⚙️  OPTIONS:');
  console.log(`   Jantes: ${countJantes}`);
  console.log(`   Sièges: ${countSieges}`);
  console.log(`   Packages: ${countPackages}\n`);
  
  console.log('═══════════════════════════════════════════════════════════════════');
  console.log('  ✅ BASE DE DONNÉES COMPLÈTEMENT PEUPLÉE !');
  console.log('═══════════════════════════════════════════════════════════════════\n');
}

// ==================== EXÉCUTION ====================

async function main() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(process.env.DB_URI);
    console.log('✅ Connecté à MongoDB\n');
    
    await clearDatabase();
    const voitures = await seedVoitures();
    const variantes = await seedVariantes(voitures);
    const accessoires = await seedAccessoires();
    const couleurs = await seedCouleurs();
    const options = await seedOptions();
    
    await displaySummary();
    
    console.log('🌐 TESTEZ MAINTENANT:');
    console.log('   • http://localhost:5173/ (Page d\'accueil)');
    console.log('   • http://localhost:5173/catalogue/neuve (Voitures neuves)');
    console.log('   • http://localhost:5173/catalogue/occasion (Voitures d\'occasion)');
    console.log('   • http://localhost:5173/accessoires (Accessoires)\n');
    
    await mongoose.connection.close();
    console.log('✅ Déconnexion de MongoDB');
    console.log('');
    
  } catch (error) {
    console.error('❌ ERREUR:', error.message);
    console.error(error);
    process.exit(1);
  }
}

main();

