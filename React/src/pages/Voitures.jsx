import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import voitureService from '../services/voiture.service.jsx';
import { Loading, Card, Button } from '../components/common';
import { formatPrice } from '../utils/format.js';
import './Voitures.css';

/**
 * Page catalogue des voitures
 */
const Voitures = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const [voitures, setVoitures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filtres
  const [filters, setFilters] = useState({
    type: searchParams.get('type') || '', // neuf ou occasion
    modele: searchParams.get('modele') || '',
    prixMin: '',
    prixMax: '',
    transmissionType: '',
  });

  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchVoitures = async () => {
      try {
        setLoading(true);
        const data = await voitureService.getAllModels();
        setVoitures(data);
      } catch (err) {
        setError('Erreur lors du chargement des voitures');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchVoitures();
  }, []);

  // Filtrer les voitures selon les critères
  const voituresFiltrees = voitures.filter((voiture) => {
    // Filtre par type
    if (filters.type === 'neuf' && !voiture.type_voiture) return false;
    if (filters.type === 'occasion' && voiture.type_voiture) return false;

    // Filtre par modèle
    if (filters.modele && !voiture.nom_model?.toLowerCase().includes(filters.modele.toLowerCase())) {
      return false;
    }

    // Filtre par prix
    if (filters.prixMin && voiture.prix < parseFloat(filters.prixMin)) return false;
    if (filters.prixMax && voiture.prix > parseFloat(filters.prixMax)) return false;

    // Filtre par transmission
    if (filters.transmissionType && voiture.specifications?.transmission !== filters.transmissionType) {
      return false;
    }

    return true;
  });

  const handleFilterChange = (name, value) => {
    setFilters({ ...filters, [name]: value });
  };

  const handleResetFilters = () => {
    setFilters({
      type: '',
      modele: '',
      prixMin: '',
      prixMax: '',
      transmissionType: '',
    });
  };

  const handleViewDetails = (id) => {
    navigate(`/voitures/${id}`);
  };

  if (loading) return <Loading fullScreen message="Chargement des voitures..." />;

  if (error) {
    return (
      <div className="error-container">
        <p className="error-text">{error}</p>
      </div>
    );
  }

  return (
    <div className="voitures-container">
      <div className="voitures-content">
        {/* En-tête */}
        <div className="voitures-header">
          <div>
            <h1 className="voitures-title">Catalogue Porsche</h1>
            <p className="voitures-subtitle">
              Découvrez notre collection de voitures neuves et d'occasion
            </p>
          </div>
          
          {/* Bouton filtres mobile */}
          <button 
            className="voitures-filter-toggle"
            onClick={() => setShowFilters(!showFilters)}
          >
            <svg className="voitures-filter-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filtres
          </button>
        </div>

        <div className="voitures-layout">
          {/* Sidebar filtres */}
          <aside className={`voitures-sidebar ${showFilters ? 'voitures-sidebar-open' : ''}`}>
            <div className="voitures-filters">
              <div className="voitures-filters-header">
                <h2 className="voitures-filters-title">Filtres</h2>
                <button onClick={handleResetFilters} className="voitures-filters-reset">
                  Réinitialiser
                </button>
              </div>

              {/* Type */}
              <div className="voitures-filter-group">
                <h3 className="voitures-filter-label">Type</h3>
                <div className="voitures-filter-options">
                  <label className="voitures-filter-option">
                    <input
                      type="radio"
                      name="type"
                      value=""
                      checked={filters.type === ''}
                      onChange={(e) => handleFilterChange('type', e.target.value)}
                    />
                    <span>Tous</span>
                  </label>
                  <label className="voitures-filter-option">
                    <input
                      type="radio"
                      name="type"
                      value="neuf"
                      checked={filters.type === 'neuf'}
                      onChange={(e) => handleFilterChange('type', e.target.value)}
                    />
                    <span>Neuves</span>
                  </label>
                  <label className="voitures-filter-option">
                    <input
                      type="radio"
                      name="type"
                      value="occasion"
                      checked={filters.type === 'occasion'}
                      onChange={(e) => handleFilterChange('type', e.target.value)}
                    />
                    <span>Occasion</span>
                  </label>
                </div>
              </div>

              {/* Modèle */}
              <div className="voitures-filter-group">
                <h3 className="voitures-filter-label">Modèle</h3>
                <input
                  type="text"
                  placeholder="Rechercher un modèle..."
                  value={filters.modele}
                  onChange={(e) => handleFilterChange('modele', e.target.value)}
                  className="voitures-filter-input"
                />
              </div>

              {/* Prix */}
              <div className="voitures-filter-group">
                <h3 className="voitures-filter-label">Prix</h3>
                <div className="voitures-filter-price">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.prixMin}
                    onChange={(e) => handleFilterChange('prixMin', e.target.value)}
                    className="voitures-filter-input"
                  />
                  <span>-</span>
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.prixMax}
                    onChange={(e) => handleFilterChange('prixMax', e.target.value)}
                    className="voitures-filter-input"
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* Liste des voitures */}
          <div className="voitures-main">
            <div className="voitures-results-header">
              <p className="voitures-results-count">
                {voituresFiltrees.length} {voituresFiltrees.length > 1 ? 'véhicules' : 'véhicule'}
              </p>
            </div>

            {voituresFiltrees.length === 0 ? (
              <div className="voitures-empty">
                <p className="voitures-empty-text">Aucune voiture ne correspond à vos critères.</p>
              </div>
            ) : (
              <div className="voitures-grid">
                {voituresFiltrees.map((voiture) => (
                  <Card key={voiture._id} hover padding="md">
                    {/* Image placeholder */}
                    <div className="voiture-image-placeholder">
                      <span className="voiture-image-letter">
                        {voiture.nom_model?.charAt(0) || '?'}
                      </span>
                    </div>

                    {/* Informations */}
                    <div className="voiture-details">
                      <h3 className="voiture-name">{voiture.nom_model}</h3>
                      
                      {voiture.description && (
                        <p className="voiture-description">
                          {voiture.description.substring(0, 100)}...
                        </p>
                      )}

                      {/* Specs rapides */}
                      {voiture.specifications && (
                        <div className="voiture-specs-quick">
                          {voiture.specifications.puissance && (
                            <span>{voiture.specifications.puissance} ch</span>
                          )}
                          {voiture.specifications.acceleration_0_100 && (
                            <span>• 0-100: {voiture.specifications.acceleration_0_100}s</span>
                          )}
                        </div>
                      )}

                      {/* Badge type */}
                      <div>
                        {voiture.type_voiture ? (
                          <span className="voiture-badge voiture-badge-new">
                            Neuve
                          </span>
                        ) : (
                          <span className="voiture-badge voiture-badge-used">
                            Occasion
                          </span>
                        )}
                      </div>

                      {/* Prix */}
                      {voiture.prix && (
                        <p className="voiture-price">
                          {formatPrice(voiture.prix)}
                        </p>
                      )}

                      {/* Bouton */}
                      <Button fullWidth onClick={() => handleViewDetails(voiture._id)}>
                        Voir les détails
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Voitures;
