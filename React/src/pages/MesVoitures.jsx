import { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { maVoitureService } from '../services';
import { AuthContext } from '../context/AuthContext.jsx';
import { Loading } from '../components/common';
import { API_URL } from '../config/api.js';
import buildUrl from '../utils/buildUrl';
import '../css/MesVoitures.css';
import '../css/components/Message.css';


const MesVoitures = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [voitures, setVoitures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [voituresEnregistrees, setVoituresEnregistrees] = useState([]);

  useEffect(() => {
    if (user) {
      fetchMesVoitures();
    }
  }, [user]);

  const fetchMesVoitures = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await maVoitureService.getMesVoitures();
      setVoitures(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement de vos voitures');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Formater la date d'immatriculation
   */
  const formatDateImmat = (date) => {
    if (!date) return null;
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', { month: '2-digit', year: 'numeric' });
  };

  /**
   * Formater la puissance
   */
  const formatPower = (infoMoteur) => {
    // Extraire la puissance depuis info_moteur si disponible
    // Format attendu: "400 ch / 294 kW" ou similaire
    if (!infoMoteur) return null;
    return infoMoteur; // Retourner tel quel pour l'instant
  };

  /**
   * Toggle enregistrement d'une voiture
   */
  const handleToggleEnregistrer = (voitureId) => {
    setVoituresEnregistrees(prev => {
      const isSelected = prev.includes(voitureId);
      if (isSelected) {
        return prev.filter(id => id !== voitureId);
      } else {
        return [...prev, voitureId];
      }
    });
  };

  /**
   * Supprimer une voiture
   */
  const _handleSupprimer = async (id) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette voiture ?')) {
      return;
    }

    try {
      await maVoitureService.supprimerMaVoiture(id);
      setSuccess('Voiture supprimée avec succès');
      setTimeout(() => setSuccess(''), 3000);
      fetchMesVoitures();
    } catch (err) {
      setError(err.message || 'Erreur lors de la suppression');
    }
  };

  if (!user) {
    return (
      <div className="mes-voitures-error">
        <p>Vous devez être connecté pour accéder à cette page</p>
        <button onClick={() => navigate('/login')}>Se connecter</button>
      </div>
    );
  }

  if (loading) {
    return <Loading fullScreen message="Chargement de vos voitures..." />;
  }

  // Récupérer la première photo disponible pour l'image générale
  const photoGenerale = voitures.length > 0 && voitures[0]?.photo_voiture_actuel?.length > 0
    ? voitures[0].photo_voiture_actuel[0]
    : null;

  return (
    <div className="mes-voitures-container-finder">
      {/* Image générale en haut */}
      <section className="mes-voitures-hero-finder">
        {photoGenerale ? (
          <div className="mes-voitures-hero-image-finder">
            <img
              src={buildUrl(photoGenerale.name)}
              alt="Mes Porsche"
              className="mes-voitures-hero-img-finder"
              onError={(e) => {
                e.target.style.display = 'none';
                if (e.target.nextSibling) {
                  e.target.nextSibling.style.display = 'flex';
                }
              }}
            />
          </div>
        ) : (
          <div className="mes-voitures-hero-placeholder-finder">
            <span className="mes-voitures-hero-text-finder">Mes Porsche</span>
          </div>
        )}
      </section>

      {/* Boutons de gestion */}
      <section className="mes-voitures-actions-header-finder">
        <div className="mes-voitures-actions-container-finder">
          <button
            className="mes-voitures-action-btn-finder"
            onClick={() => navigate('/ajouter-ma-voiture')}
          >
            + Ajouter ma Porsche
          </button>
          <button
            className="mes-voitures-action-btn-finder"
            onClick={() => navigate('/occasion')}
          >
            Parcourir les annonces et sauvegarder des véhicules
          </button>
        </div>
      </section>

      {/* Messages */}
      {error && (
        <div className="mes-voitures-messages-finder">
          <div className="message-box message-error">
            <p>{error}</p>
          </div>
        </div>
      )}
      {success && (
        <div className="mes-voitures-messages-finder">
          <div className="message-box message-success">
            <p>{success}</p>
          </div>
        </div>
      )}

      {/* Liste des voitures */}
      {voitures.length === 0 ? (
        <section className="mes-voitures-empty-finder">
          <div className="mes-voitures-empty-content-finder">
            <p className="mes-voitures-empty-text-finder">
              Vous n'avez pas encore ajouté de Porsche
            </p>
            <button
              className="mes-voitures-empty-btn-finder"
              onClick={() => navigate('/ajouter-ma-voiture')}
            >
              Ajouter ma première Porsche
            </button>
          </div>
        </section>
      ) : (
        <section className="mes-voitures-list-finder">
          {voitures.map((voiture) => {
            // Récupérer les photos
            const photos = voiture.photo_voiture_actuel && Array.isArray(voiture.photo_voiture_actuel)
              ? voiture.photo_voiture_actuel.filter(p => p && (p.name || p._id))
              : [];

            const photoPrincipale = photos.length > 0 ? photos[0] : null;
            const thumbnails = photos.slice(1, 4); // Maximum 3 thumbnails

            const isEnregistree = voituresEnregistrees.includes(voiture._id);
            const dateImmat = formatDateImmat(voiture.annee_production);

            return (
              <article key={voiture._id} className="mes-voitures-card-finder">
                {/* Image principale et thumbnails */}
                <div className="mes-voitures-images-finder">
                  {/* Image principale */}
                  <div className="mes-voitures-main-image-finder">
                    {photoPrincipale && photoPrincipale.name ? (
                      <img
                        src={buildUrl(photoPrincipale.name)}
                        alt={voiture.type_model || 'Porsche'}
                        className="mes-voitures-main-img-finder"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          if (e.target.nextSibling) {
                            e.target.nextSibling.style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    <div
                      className="mes-voitures-image-placeholder-finder"
                      style={{ display: photoPrincipale && photoPrincipale.name ? 'none' : 'flex' }}
                    >
                      <span className="mes-voitures-image-letter-finder">
                        {voiture.type_model?.charAt(0) || 'P'}
                      </span>
                    </div>
                  </div>

                  {/* Thumbnails */}
                  {thumbnails.length > 0 && (
                    <div className="mes-voitures-thumbnails-finder">
                      {thumbnails.map((thumb, index) => (
                        <div key={index} className="mes-voitures-thumbnail-finder">
                          <img
                            src={buildUrl(thumb.name)}
                            alt={`Vue ${index + 2}`}
                            className="mes-voitures-thumbnail-img-finder"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Informations */}
                <div className="mes-voitures-info-finder">
                  {/* Nom et statut */}
                  <div className="mes-voitures-header-card-finder">
                    <h3 className="mes-voitures-name-finder">
                      {voiture.type_model || 'Porsche'}
                    </h3>
                    <div className="mes-voitures-status-finder">
                      <span className="mes-voitures-approved-badge-finder">
                        Véhicule d'occasion Porsche Approved
                      </span>
                      {dateImmat && (
                        <span className="mes-voitures-date-finder">
                          Enregistrée le {dateImmat}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Spécifications */}
                  <div className="mes-voitures-specs-finder">
                    {voiture.couleur_exterieur && (
                      <div className="mes-voitures-spec-item-finder">
                        <span className="mes-voitures-spec-label-finder">Couleur:</span>
                        <span className="mes-voitures-spec-value-finder">
                          {voiture.couleur_exterieur.nom_couleur}
                        </span>
                        {voiture.couleur_interieur && (
                          <span className="mes-voitures-spec-value-finder">
                            / {voiture.couleur_interieur.nom_couleur}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="mes-voitures-spec-item-finder">
                      <span className="mes-voitures-spec-label-finder">Carburant:</span>
                      <span className="mes-voitures-spec-value-finder">Essence</span>
                    </div>
                    {dateImmat && (
                      <div className="mes-voitures-spec-item-finder">
                        <span className="mes-voitures-spec-label-finder">Première immatriculation:</span>
                        <span className="mes-voitures-spec-value-finder">{dateImmat}</span>
                      </div>
                    )}
                    {voiture.info_transmission && voiture.info_transmission !== 'N/A' && (
                      <div className="mes-voitures-spec-item-finder">
                        <span className="mes-voitures-spec-label-finder">Transmission:</span>
                        <span className="mes-voitures-spec-value-finder">
                          {voiture.info_transmission.includes('PDK') || voiture.info_transmission.includes('Automatique')
                            ? 'Transmission intégrale • PDK (automatique)'
                            : voiture.info_transmission.includes('Manuelle')
                              ? 'Transmission intégrale • Manuelle'
                              : voiture.info_transmission}
                        </span>
                      </div>
                    )}
                    {voiture.info_moteur && voiture.info_moteur !== 'N/A' && (
                      <div className="mes-voitures-spec-item-finder">
                        <span className="mes-voitures-spec-label-finder">Puissance:</span>
                        <span className="mes-voitures-spec-value-finder">
                          {formatPower(voiture.info_moteur) || voiture.info_moteur}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mes-voitures-actions-card-finder">
                    <button
                      className="mes-voitures-btn-details-finder"
                      onClick={() => navigate(`/mes-voitures/${voiture._id}`)}
                    >
                      Détails du véhicule
                    </button>
                    <button
                      className={`mes-voitures-btn-compare-finder ${isEnregistree ? 'enregistre' : ''}`}
                      onClick={() => handleToggleEnregistrer(voiture._id)}
                    >
                      {isEnregistree ? (
                        <>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
                          </svg>
                          Enregistré
                        </>
                      ) : (
                        <>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
                          </svg>
                          → Comparer
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {/* Message d'ajout d'une autre Porsche */}
      {voitures.length > 0 && (
        <section className="mes-voitures-add-more-finder">
          <div className="mes-voitures-add-more-content-finder">
            <p className="mes-voitures-add-more-text-finder">
              Voulez-vous ajouter une autre Porsche à cette liste?
            </p>
            <button
              className="mes-voitures-add-more-btn-finder"
              onClick={() => navigate('/occasion')}
            >
              Parcourir les annonces et sauvegarder des véhicules
            </button>
          </div>
        </section>
      )}
    </div>
  );
};

export default MesVoitures;


