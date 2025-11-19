import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { voitureService } from '../services';
import { Loading, Alert } from '../components/common';
import { formatPrice } from '../utils/format.js';
import { API_URL } from '../config/api.jsx';
import './CatalogueModeles.css';

/**
 * Page Catalogue des Modèles (911, Cayenne, Cayman...)
 * 
 * EXPLICATION POUR ÉTUDIANT:
 * ==========================
 * Cette page affiche:
 * - Pour les NEUVES: Les modèles groupés (911, Cayenne, Cayman) → clic → variantes
 * - Pour les OCCASIONS: TOUTES les occasions individuelles → clic → page de détails
 * 
 * Concepts utilisés:
 * 1. useParams: Récupère le paramètre 'type' de l'URL
 * 2. useState: Gère l'état (liste, chargement, erreurs)
 * 3. useEffect: Charge les données au montage
 * 4. map(): Transforme chaque élément en JSX
 */
const CatalogueModeles = () => {
  const { type } = useParams(); // 'neuve' ou 'occasion'
  const navigate = useNavigate();
  const [modeles, setModeles] = useState([]); // Pour les neuves: modèles groupés | Pour occasions: toutes les occasions
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isNeuf = type === 'neuve';

  useEffect(() => {
    let isMounted = true;
    let abortController = new AbortController();

    const fetchModeles = async () => {
      try {
        setLoading(true);
        setError('');
        
        // OPTIMISÉ: Utiliser l'endpoint dédié du backend au lieu de filtrer côté client
        // Backend: GET /voiture/neuve ou GET /voiture/occasion
        const response = isNeuf 
          ? await voitureService.getVoituresNeuves()
          : await voitureService.getVoituresOccasion();
        
        // Vérifier que le composant est toujours monté avant de mettre à jour l'état
        if (!isMounted) return;
      
        // Vérifier que la réponse est bien un tableau
        let data = Array.isArray(response) ? response : [];
        
        // Les occasions ont directement nom_model et photo_voiture
        
        if (isNeuf) {
          // Pour les neuves: grouper par nom_model pour éviter les doublons
          const uniqueModeles = data.reduce((acc, voiture) => {
            if (!acc.find(m => m.nom_model === voiture.nom_model)) {
              acc.push(voiture);
            }
            return acc;
          }, []);
          if (isMounted) setModeles(uniqueModeles);
        } else {
          // ========== POUR LES OCCASIONS: GROUPER PAR MODÈLE DE BASE ==========
          // 
          // EXPLICATION POUR ÉTUDIANT:
          // ==========================
          // Pour les occasions, on groupe par modèle de base (911, Cayman, Cayenne)
          // comme dans le Finder Porsche. On affiche les modèles de base avec leurs
          // informations agrégées (prix min, nombre d'occasions, etc.)
          //
          // Exemple de données:
          // [
          //   { _id: "abc1", nom_model: "911", annee: 2020, prix: 50000, ... },
          //   { _id: "abc2", nom_model: "911", annee: 2021, prix: 55000, ... },
          //   { _id: "abc3", nom_model: "Cayenne", annee: 2019, prix: 45000, ... }
          // ]
          //
          // Résultat groupé:
          // [
          //   { nom_model: "911", nombre_occasions: 2, prix_min: 50000, ... },
          //   { nom_model: "Cayenne", nombre_occasions: 1, prix_min: 45000, ... }
          // ]
          
          // Filtrer uniquement les modèles 911, Cayman, Cayenne
          const modelesAffiches = ['911', 'Cayman', 'Cayenne'];
          
          // Grouper les occasions par nom_model
          const modelesGroupes = {};
          
          data.forEach(occasion => {
            const nomModel = occasion.nom_model || occasion.voiture_base?.nom_model || '';
            
            // Ne garder que les modèles à afficher
            if (!modelesAffiches.includes(nomModel)) return;
            
            if (!modelesGroupes[nomModel]) {
              // Initialiser le groupe pour ce modèle
              modelesGroupes[nomModel] = {
                nom_model: nomModel,
                occasions: [],
                photo_voiture: [],
                description: '',
                voiture_base: null,
              };
            }
            
            // Ajouter l'occasion au groupe
            modelesGroupes[nomModel].occasions.push(occasion);
            
            // Récupérer les photos du modèle de base (priorité à voiture_base)
            if (occasion.voiture_base?.photo_voiture && modelesGroupes[nomModel].photo_voiture.length === 0) {
              if (Array.isArray(occasion.voiture_base.photo_voiture)) {
                modelesGroupes[nomModel].photo_voiture = occasion.voiture_base.photo_voiture.filter(p => p && (p.name || p._id));
              } else if (typeof occasion.voiture_base.photo_voiture === 'object' && occasion.voiture_base.photo_voiture.name) {
                modelesGroupes[nomModel].photo_voiture = [occasion.voiture_base.photo_voiture];
              }
            }
            
            // Récupérer la description du modèle de base
            if (!modelesGroupes[nomModel].description && occasion.voiture_base?.description) {
              modelesGroupes[nomModel].description = occasion.voiture_base.description;
            }
            
            // Garder la référence au modèle de base
            if (!modelesGroupes[nomModel].voiture_base && occasion.voiture_base) {
              modelesGroupes[nomModel].voiture_base = occasion.voiture_base;
            }
          });
          
          // Convertir l'objet en tableau et calculer les statistiques
          const modelesFormates = Object.values(modelesGroupes).map(groupe => {
            // Calculer le prix minimum
            const prixListe = groupe.occasions
              .map(occ => occ.prix_base_variante || occ.prix_base || 0)
              .filter(p => p > 0);
            const prixMin = prixListe.length > 0 ? Math.min(...prixListe) : 0;
            
            // Extraire les carrosseries uniques
            const carrosseries = [...new Set(
              groupe.occasions
                .map(occ => occ.type_carrosserie)
                .filter(Boolean)
            )];
            
            // Extraire les transmissions uniques
            const transmissions = new Set();
            groupe.occasions.forEach(occ => {
              const trans = occ.specifications?.transmission || '';
              if (trans.includes('PDK') || trans.includes('Automatique')) {
                transmissions.add('Automatique');
              }
              if (trans.includes('Manuelle')) {
                transmissions.add('Manuelle');
              }
            });
            
            return {
              _id: groupe.voiture_base?._id || groupe.nom_model, // ID du modèle de base
              nom_model: groupe.nom_model,
              description: groupe.description || `Porsche ${groupe.nom_model} d'occasion certifiée.`,
              photo_voiture: groupe.photo_voiture,
              type_voiture: false,
              nombre_occasions: groupe.occasions.length,
              prix_depuis: prixMin,
              carrosseries_disponibles: carrosseries,
              transmissions_disponibles: Array.from(transmissions),
            };
          });
          
          const ordreModeles = ['911', 'Cayman', 'Cayenne'];
          modelesFormates.sort((a, b) => {
            const indexA = ordreModeles.indexOf(a.nom_model);
            const indexB = ordreModeles.indexOf(b.nom_model);
            return (indexA === -1 ? 999 : indexA) - (indexB === -1 ? 999 : indexB);
          });
          
          if (isMounted) setModeles(modelesFormates);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Erreur lors du chargement des modèles');
          console.error(err);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchModeles();

    // Cleanup function pour annuler la requête si le composant est démonté
    return () => {
      isMounted = false;
      abortController.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]); // type seul suffit car isNeuf est calculé à partir de type

  /**
   * Gestion du clic sur une carte
   * 
   * EXPLICATION POUR ÉTUDIANT:
   * ==========================
   * - Pour les NEUVES: On va vers la liste des variantes du modèle
   * - Pour les OCCASIONS: On va vers la liste des occasions de ce modèle (comme pour les neuves)
   */
  const handleModeleClick = (modele) => {
    if (isNeuf) {
      // Pour les neuves: rediriger vers la liste des variantes de ce modèle
      navigate(`/variantes/${type}/${modele._id}`);
    } else {
      // Pour les occasions: rediriger vers la liste des occasions de ce modèle
      // L'ID utilisé est celui du modèle de base (voiture)
      navigate(`/occasion/${modele._id}`);
    }
  };

  /**
   * Fonction pour obtenir les informations spécifiques d'un modèle
   * 
   * EXPLICATION POUR ÉTUDIANT:
   * ==========================
   * Cette fonction retourne les informations formatées pour chaque modèle
   * en utilisant UNIQUEMENT les données disponibles dans la base de données
   */
  const getModeleInfo = (modele) => {
    // Descriptions par défaut (utilisées si description non disponible)
    const descriptions = {
      '911': 'L\'icône de génération en génération.',
      '718': 'La sportive deux places au moteur central arrière.',
      'Cayman': 'La sportive deux places au moteur central arrière.',
      'Cayenne': 'Le SUV à l\'ADN sportif et familial.',
    };

    // Nombre de places par modèle (données statiques car non disponibles dans la base)
    const seats = {
      '911': '2+2',
      '718': '2',
      'Cayman': '2',
      'Cayenne': '5',
    };

    // Utiliser les données enrichies du backend si disponibles
    return {
      description: modele.description || descriptions[modele.nom_model] || 'Découvrez ce modèle emblématique',
      bodyTypes: modele.carrosseries_disponibles || [],
      seats: seats[modele.nom_model] || '2',
      transmissions: modele.transmissions_disponibles || [],
      prixDepuis: modele.prix_depuis || 0,
      nombreOccasions: modele.nombre_occasions || 0,
      fuelType: 'Essence', // Par défaut, toutes les Porsche sont essence
    };
  };

  if (loading) {
    return <Loading fullScreen message="Chargement des modèles..." />;
  }

  if (error) {
    return (
      <div className="error-container">
        <Alert variant="error">{error}</Alert>
      </div>
    );
  }

  return (
    <div className="catalogue-modeles-container">
      <div className="catalogue-modeles-content">
        {/* En-tête */}
        <div className="catalogue-modeles-header">
          <button 
            onClick={() => navigate('/choix-voiture')} 
            className="catalogue-back-btn"
          >
            ← Retour au choix
          </button>
          <h1 className="catalogue-modeles-title">
            {isNeuf ? 'Porsche Neuves' : 'Toutes les Voitures d\'Occasion'}
          </h1>
          <p className="catalogue-modeles-subtitle">
            {isNeuf 
              ? 'Choisissez votre modèle à configurer' 
              : `${modeles.length} ${modeles.length > 1 ? 'occasions disponibles' : 'occasion disponible'}`
            }
          </p>
        </div>

        {/* Liste des modèles */}
        {modeles.length === 0 ? (
          <div className="catalogue-empty">
            <p>Aucun modèle {isNeuf ? 'neuf' : 'd\'occasion'} disponible pour le moment.</p>
          </div>
        ) : (
          <div className={`catalogue-modeles-grid ${isNeuf ? 'catalogue-modeles-grid-neuf' : 'catalogue-modeles-grid-occasion'}`}>
            {modeles.map((modele) => {
              const modeleInfo = getModeleInfo(modele);
              
              return (
                <button
                  key={modele._id}
                  data-modele-id={modele._id}
                  onClick={() => handleModeleClick(modele)}
                  className={`catalogue-modele-card ${isNeuf ? 'catalogue-modele-card-neuf' : 'catalogue-modele-card-occasion'}`}
                >
                  {/* Header avec nom et badge carburant */}
                  <div className="catalogue-modele-header">
                    <h2 className="catalogue-modele-name">
                      {modele.nom_model}
                    </h2>
                    <span className="catalogue-modele-fuel-badge">
                      {modeleInfo.fuelType}
                    </span>
                  </div>

                  {/* Image */}
                  <div className="catalogue-modele-image-container">
                    {(() => {
                      // Déterminer la photo principale à afficher
                      let photoPrincipale = null;
                      
                      // Priorité 1: photo_porsche (photos de la variante)
                      if (modele.photo_porsche && Array.isArray(modele.photo_porsche) && modele.photo_porsche.length > 0) {
                        const validPhotos = modele.photo_porsche.filter(p => p && (p.name || p._id));
                        if (validPhotos.length > 0) {
                          photoPrincipale = validPhotos[0];
                        }
                      }
                      // Priorité 2: photo_voiture (photos du modèle de base)
                      if (!photoPrincipale && modele.photo_voiture && Array.isArray(modele.photo_voiture) && modele.photo_voiture.length > 0) {
                        const validPhotos = modele.photo_voiture.filter(p => p && (p.name || p._id));
                        if (validPhotos.length > 0) {
                          photoPrincipale = validPhotos[0];
                        }
                      }
                      
                      // Afficher la photo si disponible
                      if (photoPrincipale && photoPrincipale.name) {
                        // Construire l'URL de la photo
                        let photoUrl = photoPrincipale.name;
                        if (!photoUrl.startsWith('http')) {
                          // Si le chemin commence par /, utiliser directement, sinon ajouter /
                          photoUrl = photoUrl.startsWith('/') 
                            ? `${API_URL}${photoUrl}`
                            : `${API_URL}/${photoUrl}`;
                        }
                        
                        return (
                          <img
                            src={photoUrl}
                            alt={photoPrincipale.alt || modele.nom_model}
                            className="catalogue-modele-image"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              if (e.target.nextSibling) {
                                e.target.nextSibling.style.display = 'flex';
                              }
                            }}
                            onLoad={() => {
                              // Cacher le placeholder si l'image charge correctement
                              const placeholder = document.querySelector(`.catalogue-modele-card[data-modele-id="${modele._id}"] .catalogue-modele-placeholder`);
                              if (placeholder) {
                                placeholder.style.display = 'none';
                              }
                            }}
                          />
                        );
                      }
                      return null;
                    })()}
                    <div 
                      className="catalogue-modele-placeholder"
                      style={{ 
                        display: (() => {
                          const hasPhotoPorsche = modele.photo_porsche && Array.isArray(modele.photo_porsche) && modele.photo_porsche.length > 0 && modele.photo_porsche.some(p => p && p.name);
                          const hasPhotoVoiture = modele.photo_voiture && Array.isArray(modele.photo_voiture) && modele.photo_voiture.length > 0 && modele.photo_voiture.some(p => p && p.name);
                          return (hasPhotoPorsche || hasPhotoVoiture) ? 'none' : 'flex';
                        })()
                      }}
                    >
                      <span className="catalogue-modele-letter">
                        {modele.nom_model?.charAt(0) || '?'}
                      </span>
                    </div>
                  </div>

                  {/* Informations */}
                  <div className="catalogue-modele-info">
                    {/* Description */}
                    <p className="catalogue-modele-description">
                      {modeleInfo.description}
                    </p>

                    {/* Prix pour les occasions */}
                    {!isNeuf && modeleInfo.prixDepuis > 0 && (
                      <div className="catalogue-modele-prix-occasion">
                        À partir de {formatPrice(modeleInfo.prixDepuis)} TTC
                      </div>
                    )}

                    {/* Nombre d'occasions disponibles */}
                    {!isNeuf && modeleInfo.nombreOccasions > 0 && (
                      <div className="catalogue-modele-count-occasion">
                        {modeleInfo.nombreOccasions} {modeleInfo.nombreOccasions > 1 ? 'véhicules disponibles' : 'véhicule disponible'}
                      </div>
                    )}

                    {/* Spécifications */}
                    <div className="catalogue-modele-specs">
                      {modeleInfo.bodyTypes.length > 0 && (
                        <div className="catalogue-modele-spec-item">
                          <span className="catalogue-modele-spec-label">Carrosserie</span>
                          <span className="catalogue-modele-spec-value">
                            {modeleInfo.bodyTypes.join(', ')}
                          </span>
                        </div>
                      )}
                      <div className="catalogue-modele-spec-item">
                        <span className="catalogue-modele-spec-label">Sièges</span>
                        <span className="catalogue-modele-spec-value">
                          {modeleInfo.seats}
                        </span>
                      </div>
                      {modeleInfo.transmissions.length > 0 && (
                        <div className="catalogue-modele-spec-item">
                          <span className="catalogue-modele-spec-label">Boîte de vitesse</span>
                          <span className="catalogue-modele-spec-value">
                            {modeleInfo.transmissions.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bouton CTA */}
                  <div className="catalogue-modele-cta">
                    {isNeuf 
                      ? `Configurer ${modele.nom_model}`
                      : `Voir les ${modeleInfo.nombreOccasions} ${modeleInfo.nombreOccasions > 1 ? 'véhicules' : 'véhicule'} →`
                    }
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CatalogueModeles;

