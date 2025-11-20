import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { voitureService } from '../services';
import { Loading, Alert } from '../components/common';
import { formatPrice } from '../utils/format.js';
import { API_URL } from '../config/api.jsx';
import buildUrl from '../utils/buildUrl';
import './ToutesOccasions.css';

const ToutesOccasions = () => {
  const [occasions, setOccasions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtreModele, setFiltreModele] = useState('');

  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const chargerOccasions = async () => {
      try {
        setLoading(true);
        setError('');

        const toutesLesOccasions = await voitureService.getVoituresOccasion();

        if (!isMounted) return;

        if (!Array.isArray(toutesLesOccasions)) {
          setOccasions([]);
          return;
        }

        setOccasions(toutesLesOccasions);

      } catch (err) {
        if (!isMounted) return;

        const errorMessage = err.message || 'Erreur lors du chargement des occasions';
        setError(errorMessage);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    chargerOccasions();

    return () => {
      isMounted = false;
    };
  }, []); // Tableau vide = s'exécute une seule fois au montage

  // ========== ÉTAPE 3: FILTRAGE DES OCCASIONS ==========
  // EXPLICATION: On crée une variable calculée qui filtre les occasions
  // Si filtreModele est vide, on affiche toutes les occasions
  // Sinon, on filtre par nom de modèle
  const occasionsFiltrees = occasions.filter(occasion => {
    // Si pas de filtre, on garde toutes les occasions
    if (!filtreModele) {
      return true;
    }

    // Récupérer le nom du modèle de l'occasion
    const nomModel = occasion.nom_model || occasion.voiture_base?.nom_model || '';

    // Comparer avec le filtre (insensible à la casse)
    return nomModel.toLowerCase().includes(filtreModele.toLowerCase());
  });

  // ========== ÉTAPE 4: GESTION DES CLICS ==========
  // Quand on clique sur une occasion, on navigue vers sa page de détails
  const handleOccasionClick = (occasion) => {
    // L'ID de l'occasion est utilisé pour la page de détails
    navigate(`/occasion/${occasion._id}`);
  };

  // ========== ÉTAPE 5: GESTION DU FILTRE ==========
  const handleFiltreChange = (e) => {
    // Mettre à jour le filtre quand l'utilisateur tape dans l'input
    setFiltreModele(e.target.value);
  };

  // ========== ÉTAPE 6: AFFICHAGE DU LOADER ==========
  if (loading) {
    return <Loading fullScreen message="Chargement des occasions..." />;
  }

  // ========== ÉTAPE 7: AFFICHAGE DES ERREURS ==========
  if (error) {
    return (
      <div className="toutes-occasions-error">
        <Alert variant="error">{error}</Alert>
        <button onClick={() => navigate('/choix-voiture')} className="btn-retour">
          ← Retour au choix
        </button>
      </div>
    );
  }

  // ========== ÉTAPE 8: RENDU PRINCIPAL ==========
  return (
    <div className="toutes-occasions-container">
      <div className="toutes-occasions-content">
        {/* En-tête */}
        <div className="toutes-occasions-header">
          <button
            onClick={() => navigate('/choix-voiture')}
            className="toutes-occasions-back-btn"
          >
            ← Retour au choix
          </button>
          <h1 className="toutes-occasions-title">
            Toutes les Voitures d'Occasion
          </h1>
          <p className="toutes-occasions-subtitle">
            {occasions.length} {occasions.length > 1 ? 'occasions disponibles' : 'occasion disponible'}
          </p>
        </div>

        {/* Filtre par modèle */}
        <div className="toutes-occasions-filtre">
          <label htmlFor="filtre-modele" className="filtre-label">
            Filtrer par modèle:
          </label>
          <input
            id="filtre-modele"
            name="filtreModele"
            type="text"
            placeholder="Ex: 911, Cayenne, Cayman..."
            value={filtreModele}
            onChange={handleFiltreChange}
            className="filtre-input"
          />
          {filtreModele && (
            <button
              onClick={() => setFiltreModele('')}
              className="filtre-reset"
            >
              ✕ Effacer
            </button>
          )}
        </div>

        {/* Résultats du filtre */}
        {filtreModele && (
          <div className="toutes-occasions-filtre-info">
            {occasionsFiltrees.length} {occasionsFiltrees.length > 1 ? 'occasions trouvées' : 'occasion trouvée'}
            pour "{filtreModele}"
          </div>
        )}

        {/* Liste des occasions */}
        {occasionsFiltrees.length === 0 ? (
          <div className="toutes-occasions-empty">
            <p>
              {filtreModele
                ? `Aucune occasion trouvée pour "${filtreModele}"`
                : 'Aucune occasion disponible pour le moment.'
              }
            </p>
            {filtreModele && (
              <button
                onClick={() => setFiltreModele('')}
                className="btn-reset-filtre"
              >
                Afficher toutes les occasions
              </button>
            )}
          </div>
        ) : (
          <div className="toutes-occasions-grid">
            {occasionsFiltrees.map((occasion) => {
              // Récupérer les informations de l'occasion
              const nomModel = occasion.nom_model || occasion.voiture_base?.nom_model || 'Modèle';
              const description = occasion.description || occasion.voiture_base?.description || '';
              const prix = occasion.prix_base || occasion.prix_base_variante || 0;

              // Récupérer la photo principale
              let photoPrincipale = null;
              if (occasion.photo_voiture && Array.isArray(occasion.photo_voiture) && occasion.photo_voiture.length > 0) {
                photoPrincipale = occasion.photo_voiture[0];
              } else if (occasion.voiture_base?.photo_voiture) {
                if (Array.isArray(occasion.voiture_base.photo_voiture) && occasion.voiture_base.photo_voiture.length > 0) {
                  photoPrincipale = occasion.voiture_base.photo_voiture[0];
                } else if (occasion.voiture_base.photo_voiture && typeof occasion.voiture_base.photo_voiture === 'object') {
                  photoPrincipale = occasion.voiture_base.photo_voiture;
                }
              }

              return (
                <div
                  key={occasion._id}
                  onClick={() => handleOccasionClick(occasion)}
                  className="occasion-card"
                >
                  {/* Image */}
                  <div className="occasion-card-image-container">
                    {photoPrincipale && photoPrincipale.name ? (
                      <img
                        src={buildUrl(photoPrincipale.name)}
                        alt={nomModel}
                        className="occasion-card-image"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          if (e.target.nextSibling) {
                            e.target.nextSibling.style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <div
                      className="occasion-card-placeholder"
                      style={{ display: photoPrincipale && photoPrincipale.name ? 'none' : 'flex' }}
                    >
                      <span className="occasion-card-letter">
                        {nomModel.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>

                  {/* Informations */}
                  <div className="occasion-card-info">
                    <div className="occasion-card-badges">
                      <span className="occasion-badge occasion-badge-used">Occasion</span>
                      {occasion.disponible && (
                        <span className="occasion-badge occasion-badge-disponible">Disponible</span>
                      )}
                    </div>

                    <h2 className="occasion-card-title">
                      {nomModel}
                      {occasion.annee_production && ` ${occasion.annee_production}`}
                    </h2>

                    {description && (
                      <p className="occasion-card-description">
                        {description.length > 100
                          ? description.substring(0, 100) + '...'
                          : description
                        }
                      </p>
                    )}

                    {/* Spécifications */}
                    <div className="occasion-card-specs">
                      {occasion.type_carrosserie && (
                        <div className="occasion-spec-item">
                          <span className="occasion-spec-label">Carrosserie</span>
                          <span className="occasion-spec-value">{occasion.type_carrosserie}</span>
                        </div>
                      )}
                      {occasion.annee_production && (
                        <div className="occasion-spec-item">
                          <span className="occasion-spec-label">Année</span>
                          <span className="occasion-spec-value">{occasion.annee_production}</span>
                        </div>
                      )}
                      {occasion.specifications?.puissance && (
                        <div className="occasion-spec-item">
                          <span className="occasion-spec-label">Puissance</span>
                          <span className="occasion-spec-value">{occasion.specifications.puissance} ch</span>
                        </div>
                      )}
                    </div>

                    {/* Prix */}
                    {prix > 0 && (
                      <div className="occasion-card-price">
                        <span className="occasion-price-label">Prix</span>
                        <span className="occasion-price-value">{formatPrice(prix)}</span>
                      </div>
                    )}
                  </div>

                  <div className="occasion-card-cta">
                    Voir les détails →
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ToutesOccasions;

