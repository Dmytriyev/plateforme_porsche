import mongoose from 'mongoose';

const couleur_interieurSchema = new mongoose.Schema({
    nom_couleur: {
      type: String,
      required: true
    },
    photo_couleur: {
      type: String,
      required: true
    },
    description: {
      type: String
    }
}, { timestamps: true });

export default mongoose.model('Couleur_interieur', couleur_interieurSchema);
