import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { accesoireService } from '../services';
import { Loading, Alert } from '../components/common';
import './CategoriesAccessoires.css';

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
      
      // Récupérer tous les accessoires
      const allAccessoires = await accesoireService.getAllAccessoires();
      
      // Extraire les catégories uniques avec compteur
      const categoriesMap = {};
      allAccessoires.forEach(acc => {
        if (acc.type_accesoire) {
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
      
      const categoriesArray = Object.values(categoriesMap);
      setCategories(categoriesArray);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des catégories');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCategorieClick = (categorie) => {
    navigate(`/accessoires/categorie/${encodeURIComponent(categorie)}`);
  };

  const getCategorieIcon = (type) => {
    const icons = {
      'porte-clés': '🔑',
      'porte-cles': '🔑',
      'casquettes': '🧢',
      'casquette': '🧢',
      'decoration': '🎨',
      'décoration': '🎨',
      'vetements': '👕',
      'vêtements': '👕',
      'bagages': '🧳',
      'miniatures': '🏎️',
      'livres': '📚',
      'technologie': '💻'
    };
    return icons[type.toLowerCase()] || '🎁';
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
            {categories.map((cat) => (
              <button
                key={cat.type}
                onClick={() => handleCategorieClick(cat.type)}
                className="categorie-card"
              >
                {/* Image de fond si disponible */}
                {cat.photo ? (
                  <div className="categorie-background">
                    <img
                      src={`http://localhost:3000${cat.photo.name}`}
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
                  <div className="categorie-icon">{getCategorieIcon(cat.type)}</div>
                  <h2 className="categorie-name">
                    {cat.type.charAt(0).toUpperCase() + cat.type.slice(1)}
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
            <h3>✨ Collection Premium</h3>
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

