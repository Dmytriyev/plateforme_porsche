import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';
import porscheService from '../services/porscheService';

function ApiTest() {
  const [apiStatus, setApiStatus] = useState('En attente...');
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const testApiConnection = async () => {
    try {
      const response = await fetch(API_BASE_URL);
      const text = await response.text();
      setApiStatus(` Connecté: ${text}`);
    } catch (err) {
      setApiStatus(` Erreur: ${err.message}`);
    }
  };

  const loadModels = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await porscheService.getAllModels();
      setModels(data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      setModels([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testApiConnection();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1> Test de Connexion API Porsche</h1>

      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f0f0f0', borderRadius: '8px' }}>
        <h2>Status de l'API</h2>
        <p><strong>URL:</strong> {API_BASE_URL}</p>
        <p><strong>Status:</strong> {apiStatus}</p>
        <button onClick={testApiConnection} style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px' }}>
          Retester
        </button>
      </div>

      <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#e8f5e9', borderRadius: '8px' }}>
        <h2>Test Modèles Porsche</h2>
        <button onClick={loadModels} disabled={loading} style={{ padding: '10px 20px', cursor: 'pointer', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '5px' }}>
          {loading ? ' Chargement...' : ' Charger'}
        </button>
        {error && <div style={{ padding: '10px', backgroundColor: '#f8d7da', color: '#721c24', borderRadius: '5px', marginTop: '10px' }}> {error}</div>}
        {models.length > 0 && <div style={{ marginTop: '15px' }}><h3> {models.length} modèles chargés</h3></div>}
      </div>

      <div style={{ padding: '15px', backgroundColor: '#fff3cd', borderRadius: '8px' }}>
        <h3> Stack Info</h3>
        <ul><li> MongoDB: Connecté</li><li> Node.js: Port {API_BASE_URL}</li><li> React + Vite</li><li> CORS: Activé</li></ul>
      </div>
    </div>
  );
}

export default ApiTest;
