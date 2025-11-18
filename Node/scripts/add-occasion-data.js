/**
 * Script pour ajouter des voitures d'occasion dans MongoDB
 * Exécutez: node scripts/add-occasion-data.js
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Voiture from '../models/voiture.model.js';

dotenv.config();

const occasionData = [
  {
    type_voiture: false, // OCCASION
    nom_model: '911',
    description: 'Porsche 911 Carrera S d\'occasion certifiée. État impeccable, entretien complet Porsche.',
    photo_voiture: []
  },
  {
    type_voiture: false, // OCCASION
    nom_model: 'Cayenne',
    description: 'Porsche Cayenne d\'occasion certifiée. SUV premium avec toutes les options.',
    photo_voiture: []
  },
  {
    type_voiture: false, // OCCASION
    nom_model: 'Cayman',
    description: 'Porsche Cayman d\'occasion certifiée. Sportive pure avec historique complet.',
    photo_voiture: []
  }
];

async function addOccasionData() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(process.env.DB_URI);
    console.log('✅ Connecté à MongoDB');

    // Vérifier si des voitures d'occasion existent déjà
    const existingOccasion = await Voiture.find({ type_voiture: false });
    console.log(`📊 Voitures d'occasion existantes: ${existingOccasion.length}`);

    if (existingOccasion.length > 0) {
      console.log('ℹ️  Des voitures d\'occasion existent déjà:');
      existingOccasion.forEach(v => {
        console.log(`   - ${v.nom_model} (ID: ${v._id})`);
      });
      console.log('');
      console.log('💡 Si vous voulez en ajouter d\'autres, modifiez occasionData dans le script');
    } else {
      console.log('📝 Ajout de voitures d\'occasion...');
      
      for (const data of occasionData) {
        const voiture = new Voiture(data);
        await voiture.save();
        console.log(`✅ Ajouté: ${data.nom_model} (occasion)`);
      }
      
      console.log('');
      console.log('🎉 Voitures d\'occasion ajoutées avec succès !');
    }

    // Afficher le résumé
    const totalNeuves = await Voiture.countDocuments({ type_voiture: true });
    const totalOccasion = await Voiture.countDocuments({ type_voiture: false });
    
    console.log('');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  📊 RÉSUMÉ BASE DE DONNÉES');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✨ Voitures NEUVES: ${totalNeuves}`);
    console.log(`🔄 Voitures OCCASION: ${totalOccasion}`);
    console.log(`📦 TOTAL: ${totalNeuves + totalOccasion}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    await mongoose.connection.close();
    console.log('');
    console.log('✅ Déconnexion de MongoDB');
    console.log('');
    console.log('🚀 Vous pouvez maintenant actualiser http://localhost:5173/catalogue/occasion');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

addOccasionData();

