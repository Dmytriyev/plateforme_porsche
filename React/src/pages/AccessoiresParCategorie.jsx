import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { accesoireService } from '../services';
import { Loading, Alert } from '../components/common';
import { formatPrice } from '../utils/format.js';
import { API_URL } from '../config/api.jsx';
import './AccessoiresParCategorie.css';

/**
 * Page Liste Accessoires par Catégorie
 * 
 * EXPLICATION POUR ÉTUDIANT:
 * ==========================
 * Cette page affiche tous les accessoires d'une catégorie spécifique.
 * 
 * Exemples d'URL:
 * - /accessoires/categorie/vetement → Affiche tous les vêtements
 * - /accessoires/categorie/porte-cl%C3%A9s → Affiche tous les porte-clés
 * - /accessoires/categorie/decoration → Affiche tous les objets de décoration
 * 
 * Concepts utilisés:
 * 1. useParams: Récupère le paramètre 'categorie' de l'URL
 * 2. decodeURIComponent: Décode les caractères spéciaux dans l'URL (%C3%A9 → é)
 * 3. Normalisation: Convertit différents formats en un format unique pour le backend
 * 4. useEffect: Charge les données quand la catégorie change
 */
const AccessoiresParCategorie = () => {
  const { categorie } = useParams(); // Récupère 'porte-cl%C3%A9s' depuis l'URL
  const navigate = useNavigate();
  const [accessoires, setAccessoires] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAccessoires();
  }, [categorie]);

  const fetchAccessoires = async () => {
    try {
      setLoading(true);
      setError('');
      
      let categorieDecodee = decodeURIComponent(categorie).toLowerCase();
      
      const normalisations = {
        'décoration': 'decoration',
        'decoration': 'decoration',
        'vetement': 'vetement',
        'vêtement': 'vetement',
        'vetements': 'vetement',
        'vêtements': 'vetement',
        'porte-clés': 'porte-clés',
        'porte clés': 'porte-clés',
        'porte cles': 'porte-clés',
        'porte-cles': 'porte-clés',
        'portecles': 'porte-clés',
      };
      
      const categorieNormalisee = normalisations[categorieDecodee] || categorieDecodee;
      
      const response = await accesoireService.getAccessoiresByType(categorieNormalisee);
      
      const filteredAccessoires = Array.isArray(response) ? response : [];
      
      
      setAccessoires(filteredAccessoires);
    } catch (err) {
      const errorMessage = err.message || 'Erreur lors du chargement des accessoires';
      setError(errorMessage);
      console.error('Erreur fetchAccessoires:', {
        categorie,
        erreur: err.message,
        details: err
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAccessoireClick = (accessoire) => {
    navigate(`/accessoires/detail/${accessoire._id}`);
  };

  if (loading) {
    return <Loading fullScreen message="Chargement des accessoires..." />;
  }

  if (error) {
    return (
      <div className="error-container">
        <Alert variant="error">{error}</Alert>
      </div>
    );
  }

  return (
    <div className="accessoires-categorie-container">
      <div className="accessoires-categorie-content">
        {/* En-tête */}
        <div className="accessoires-categorie-header">
          <button 
            onClick={() => navigate('/accessoires')} 
            className="accessoires-back-btn"
          >
            ← Retour aux catégories
          </button>
          <h1 className="accessoires-categorie-title">
            {(() => {
              // Formater le titre de manière élégante
              const categorieDecodee = decodeURIComponent(categorie);
              const labels = {
                'porte-clés': 'Porte-clés',
                'porte-cles': 'Porte-clés',
                'vetement': 'Vêtements',
                'vêtement': 'Vêtements',
                'decoration': 'Décoration',
                'décoration': 'Décoration',
              };
              return labels[categorieDecodee.toLowerCase()] 
                || categorieDecodee.charAt(0).toUpperCase() + categorieDecodee.slice(1);
            })()}
          </h1>
          <p className="accessoires-categorie-subtitle">
            {accessoires.length} article{accessoires.length > 1 ? 's' : ''} disponible{accessoires.length > 1 ? 's' : ''}
          </p>
        </div>

        {/* Liste des accessoires */}
        {accessoires.length === 0 ? (
          <div className="accessoires-empty">
            <p>Aucun accessoire disponible dans cette catégorie.</p>
          </div>
        ) : (
          <div className="accessoires-grid">
            {accessoires.map((accessoire) => (
              <button
                key={accessoire._id}
                onClick={() => handleAccessoireClick(accessoire)}
                className="accessoire-card"
              >
                {/* Image */}
                <div className="accessoire-image-container">
                  {(() => {
                    // Récupérer la première photo disponible
                    const photoPrincipale = accessoire.photo_accesoire && 
                      Array.isArray(accessoire.photo_accesoire) && 
                      accessoire.photo_accesoire.length > 0 
                      ? accessoire.photo_accesoire[0] 
                      : null;
                    
                    if (photoPrincipale && photoPrincipale.name) {
                      // Construire l'URL complète de l'image
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
                          alt={photoPrincipale.alt || accessoire.nom_accesoire}
                          className="accessoire-image"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            if (e.target.nextSibling) {
                              e.target.nextSibling.style.display = 'flex';
                            }
                          }}
                          onLoad={(e) => {
                            // Cacher le placeholder si l'image charge correctement
                            const placeholder = e.target.nextSibling;
                            if (placeholder && placeholder.classList.contains('accessoire-placeholder')) {
                              placeholder.style.display = 'none';
                            }
                          }}
                        />
                      );
                    }
                    return null;
                  })()}
                  <div 
                    className="accessoire-placeholder"
                    style={{ 
                      display: (() => {
                        const hasPhoto = accessoire.photo_accesoire && 
                          Array.isArray(accessoire.photo_accesoire) && 
                          accessoire.photo_accesoire.length > 0 &&
                          accessoire.photo_accesoire[0]?.name;
                        return hasPhoto ? 'none' : 'flex';
                      })()
                    }}
                  >
                    <span className="accessoire-letter">
                      {accessoire.nom_accesoire?.charAt(0) || '?'}
                    </span>
                  </div>
                </div>

                {/* Informations */}
                <div className="accessoire-info">
                  <h2 className="accessoire-name">{accessoire.nom_accesoire}</h2>
                  
                  {accessoire.description && (
                    <p className="accessoire-description">
                      {accessoire.description.length > 100
                        ? accessoire.description.substring(0, 100) + '...'
                        : accessoire.description
                      }
                    </p>
                  )}

                  {/* Couleur */}
                  {accessoire.couleur_accesoire && (
                    <div className="accessoire-couleur">
                      <span className="accessoire-couleur-label">Couleur:</span>
                      <span className="accessoire-couleur-value">
                        {accessoire.couleur_accesoire.nom_couleur}
                      </span>
                    </div>
                  )}

                  {/* Prix */}
                  <div className="accessoire-price">
                    {formatPrice(accessoire.prix)}
                  </div>
                </div>

                <div className="accessoire-cta">
                  Voir les détails →
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AccessoiresParCategorie;

