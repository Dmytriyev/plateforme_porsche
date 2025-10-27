import mongoose from 'mongoose';

const taille_janteSchema = new mongoose.Schema({
    taille_jante: {
      type: String,
      required: true
    },
    photo_jante: {
      type: String,
      required: true
    },
    description: {
      type: String
    }
}, { timestamps: true });

export default mongoose.model('Taille_jante', taille_janteSchema);
