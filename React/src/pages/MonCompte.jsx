import { useAuth } from '../hooks/useAuth.jsx';
import { Card } from '../components/common';
import './MonCompte.css';

/**
 * Page Mon Compte
 */
const MonCompte = () => {
  const { user } = useAuth();

  return (
    <div className="compte-container">
      <div className="compte-content">
        <h1 className="compte-title">Mon compte</h1>

        <div className="compte-grid">
          {/* Informations personnelles */}
          <div>
            <Card padding="lg">
              <h2 className="compte-section-title">Informations personnelles</h2>
              
              <div className="compte-info-list">
                <div className="compte-info-item">
                  <label>Nom complet</label>
                  <p>
                    {user?.prenom} {user?.nom}
                  </p>
                </div>

                <div className="compte-info-item">
                  <label>Email</label>
                  <p>{user?.email}</p>
                </div>

                {user?.telephone && (
                  <div className="compte-info-item">
                    <label>Téléphone</label>
                    <p>{user?.telephone}</p>
                  </div>
                )}

                {user?.adresse && (
                  <div className="compte-info-item">
                    <label>Adresse</label>
                    <p>
                      {user?.adresse}<br />
                      {user?.code_postal} {user?.ville}
                    </p>
                  </div>
                )}

                <div className="compte-info-item">
                  <label>Rôle</label>
                  <p className="compte-role">{user?.role}</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Actions rapides */}
          <div className="compte-actions">
            <Card padding="md" hover className="compte-action-card">
              <h3>Mes commandes</h3>
              <p>Voir l'historique</p>
            </Card>

            <Card padding="md" hover className="compte-action-card">
              <h3>Mes réservations</h3>
              <p>Gérer mes réservations</p>
            </Card>

            <Card padding="md" hover className="compte-action-card">
              <h3>Ma voiture</h3>
              <p>Ajouter ma Porsche</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonCompte;
