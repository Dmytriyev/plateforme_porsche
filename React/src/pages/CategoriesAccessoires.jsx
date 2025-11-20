import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { accesoireService } from '../services';
import { Loading, Alert } from '../components/common';
import './CategoriesAccessoires.css';
import { API_URL } from '../config/api.jsx';
import buildUrl from '../utils/buildUrl';

/**
 * Page Catégories d'Accessoires
 * Première étape: Choisir la catégorie (porte-clés, casquettes, décoration...)
 */
const CategoriesAccessoires = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      setError('');

      // OPTIMISÉ: Utiliser endpoint dédié pour récupérer types + compteurs
      // Backend: GET /accesoire/types
      const typesData = await accesoireService.getAvailableTypes();

      // Si le backend retourne déjà le format correct avec types et compteurs
      if (Array.isArray(typesData) && typesData.length > 0 && typeof typesData[0] === 'object') {
        // Format: [{ type: "porte-cles", count: 5 }]
        const categoriesWithIcons = typesData.map(cat => ({
          type: cat.type || cat._id,
          count: cat.count || 0,
          photo: null // Les photos seront chargées depuis les accessoires de la catégorie
        }));
        setCategories(categoriesWithIcons);
      } else if (Array.isArray(typesData)) {
        // Format simple: ["porte-cles", "casquette", ...]
        const categoriesWithIcons = typesData.map(type => ({
          type: type,
          count: 0, // Le backend ne fournit pas le compteur
          photo: null
        }));
        setCategories(categoriesWithIcons);
      } else {
        // Fallback: charger tous les accessoires (ancien comportement)
        const allAccessoires = await accesoireService.getAllAccessoires();

        if (!Array.isArray(allAccessoires)) {
          setCategories([]);
          return;
        }

        const categoriesMap = {};
        allAccessoires.forEach(acc => {
          if (acc && acc.type_accesoire) {
            if (!categoriesMap[acc.type_accesoire]) {
              categoriesMap[acc.type_accesoire] = {
                type: acc.type_accesoire,
                count: 0,
                photo: acc.photo_accesoire?.[0] || null
              };
            }
            categoriesMap[acc.type_accesoire].count++;
          }
        });
        setCategories(Object.values(categoriesMap));
      }
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des catégories');
    } finally {
      setLoading(false);
    }
  };

  const handleCategorieClick = (categorie) => {
    navigate(`/accessoires/categorie/${encodeURIComponent(categorie)}`);
  };

  const getCategorieLabel = (type) => {
    // Retourne le label propre pour la catégorie (conforme charte graphique Porsche)
    // Vérification de sécurité pour éviter les erreurs si type est undefined/null
    if (!type || typeof type !== 'string') {
      return 'Catégorie';
    }

    const labels = {
      'porte-clés': 'Porte-clés',
      'porte-cles': 'Porte-clés',
      'casquettes': 'Casquettes',
      'casquette': 'Casquettes',
      'decoration': 'Décoration',
      'décoration': 'Décoration',
      'vetements': 'Vêtements',
      'vêtements': 'Vêtements',
      'bagages': 'Bagages',
      'miniatures': 'Miniatures',
      'livres': 'Livres',
      'technologie': 'Technologie'
    };

    const typeLower = type.toLowerCase();
    if (labels[typeLower]) {
      return labels[typeLower];
    }

    // Formatage sécurisé avec vérification de la longueur
    if (type.length > 0) {
      return type.charAt(0).toUpperCase() + type.slice(1);
    }

    return 'Catégorie';
  };

  if (loading) {
    return <Loading fullScreen message="Chargement des catégories..." />;
  }

  if (error) {
    return (
      <div className="error-container">
        <Alert variant="error">{error}</Alert>
      </div>
    );
  }

  return (
    <div className="categories-accessoires-container">
      <div className="categories-accessoires-content">
        {/* En-tête */}
        <div className="categories-accessoires-header">
          <h1 className="categories-accessoires-title">Accessoires Porsche</h1>
          <p className="categories-accessoires-subtitle">
            Choisissez une catégorie pour découvrir nos accessoires premium
          </p>
        </div>

        {/* Grille des catégories */}
        {categories.length === 0 ? (
          <div className="categories-empty">
            <p>Aucune catégorie d'accessoires disponible pour le moment.</p>
          </div>
        ) : (
          <div className="categories-grid">
            {categories
              .filter((cat) => cat && cat.type) // Filtrer les catégories sans type valide
              .map((cat) => (
                <button
                  key={cat.type}
                  onClick={() => handleCategorieClick(cat.type)}
                  className="categorie-card"
                >
                  {/* Image de fond si disponible */}
                  {cat.photo ? (
                    <div className="categorie-background">
                      <img
                        src={buildUrl(cat.photo.name)}
                        alt={cat.type}
                        className="categorie-bg-image"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      <div className="categorie-overlay"></div>
                    </div>
                  ) : (
                    <div className="categorie-background-default"></div>
                  )}

                  {/* Contenu */}
                  <div className="categorie-content">
                    <h2 className="categorie-name">
                      {getCategorieLabel(cat.type)}
                    </h2>
                    <p className="categorie-count">{cat.count} article{cat.count > 1 ? 's' : ''}</p>
                  </div>

                  <div className="categorie-cta">
                    Découvrir →
                  </div>
                </button>
              ))}
          </div>
        )}

        {/* Information complémentaire */}
        <div className="categories-info">
          <div className="categories-info-card">
            <h3>Collection Premium</h3>
            <p>
              Tous nos accessoires Porsche sont authentiques et conçus pour offrir
              la même qualité et le même design que nos véhicules.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoriesAccessoires;

