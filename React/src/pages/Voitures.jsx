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

  // Onglet actif (tous, neuves, occasions)
  const [activeTab, setActiveTab] = useState(searchParams.get('type') || 'tous');

  // Filtres
  const [filters, setFilters] = useState({
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

  // Filtrer les voitures selon l'onglet actif et les critères
  const voituresFiltrees = voitures.filter((voiture) => {
    // Filtre par onglet (neuf/occasion/tous)
    if (activeTab === 'neuves' && !voiture.voiture?.type_voiture) return false;
    if (activeTab === 'occasions' && voiture.voiture?.type_voiture) return false;

    // Filtre par modèle
    if (filters.modele && !voiture.nom_model?.toLowerCase().includes(filters.modele.toLowerCase())) {
      return false;
    }

    // Filtre par prix
    const prixTotal = voiture.prix_calcule?.prix_total || voiture.prix_base || 0;
    if (filters.prixMin && prixTotal < parseFloat(filters.prixMin)) return false;
    if (filters.prixMax && prixTotal > parseFloat(filters.prixMax)) return false;

    // Filtre par transmission
    if (filters.transmissionType && voiture.specifications?.transmission !== filters.transmissionType) {
      return false;
    }

    return true;
  });

  // Statistiques pour les onglets
  const stats = {
    tous: voitures.length,
    neuves: voitures.filter(v => v.voiture?.type_voiture === true).length,
    occasions: voitures.filter(v => v.voiture?.type_voiture === false).length,
  };

  const handleFilterChange = (name, value) => {
    setFilters({ ...filters, [name]: value });
  };

  const handleResetFilters = () => {
    setFilters({
      modele: '',
      prixMin: '',
      prixMax: '',
      transmissionType: '',
    });
    setActiveTab('tous');
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Mettre à jour l'URL
    const newParams = new URLSearchParams(searchParams);
    if (tab === 'tous') {
      newParams.delete('type');
    } else {
      newParams.set('type', tab);
    }
    navigate(`?${newParams.toString()}`, { replace: true });
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

        {/* Onglets Tous / Neuves / Occasions */}
        <div className="voitures-tabs">
          <button
            className={`voitures-tab ${activeTab === 'tous' ? 'voitures-tab-active' : ''}`}
            onClick={() => handleTabChange('tous')}
          >
            Toutes
            <span className="voitures-tab-count">{stats.tous}</span>
          </button>
          <button
            className={`voitures-tab ${activeTab === 'neuves' ? 'voitures-tab-active' : ''}`}
            onClick={() => handleTabChange('neuves')}
          >
            Neuves
            <span className="voitures-tab-count">{stats.neuves}</span>
          </button>
          <button
            className={`voitures-tab ${activeTab === 'occasions' ? 'voitures-tab-active' : ''}`}
            onClick={() => handleTabChange('occasions')}
          >
            Occasions
            <span className="voitures-tab-count">{stats.occasions}</span>
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
                    {/* Image voiture */}
                    <div className="voiture-image-container">
                      {voiture.photo_porsche && voiture.photo_porsche.length > 0 ? (
                        <img
                          src={`http://localhost:3000${voiture.photo_porsche[0].name}`}
                          alt={voiture.photo_porsche[0].alt || voiture.nom_model}
                          className="voiture-image"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                      ) : null}
                      <div className="voiture-image-placeholder" style={{ display: voiture.photo_porsche && voiture.photo_porsche.length > 0 ? 'none' : 'flex' }}>
                        <span className="voiture-image-letter">
                          {voiture.nom_model?.charAt(0) || '?'}
                        </span>
                      </div>
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
                      <div className="voiture-badge-container">
                        {voiture.voiture?.type_voiture ? (
                          <span className="voiture-badge voiture-badge-new">
                            ✨ Neuve
                          </span>
                        ) : (
                          <span className="voiture-badge voiture-badge-used">
                            🔄 Occasion
                          </span>
                        )}
                        {voiture.disponible && (
                          <span className="voiture-badge voiture-badge-available">
                            Disponible
                          </span>
                        )}
                      </div>

                      {/* Prix */}
                      {(voiture.prix_calcule?.prix_total || voiture.prix_base) && (
                        <p className="voiture-price">
                          {formatPrice(voiture.prix_calcule?.prix_total || voiture.prix_base)}
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
