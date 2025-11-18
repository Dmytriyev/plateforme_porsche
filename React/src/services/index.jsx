/**
 * Export centralisé de tous les services
 * Facilite l'importation des services dans les composants
 * 
 * Utilisation :
 * import { authService, voitureService } from '@/services';
 */

export { default as authService } from './auth.service.jsx';
export { default as voitureService } from './voiture.service.jsx';
export { default as modelPorscheService } from './modelPorsche.service.jsx';
export { default as accesoireService } from './accesoire.service.jsx';
export { default as personnalisationService } from './personnalisation.service.jsx';
export { default as commandeService } from './commande.service.jsx';
export { default as maVoitureService } from './ma_voiture.service.jsx';

