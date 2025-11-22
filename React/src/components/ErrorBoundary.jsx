import { Component } from 'react';
import { Button } from './common';
import '../css/ErrorBoundary.css';

class ErrorBoundary extends Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error });
    if (import.meta.env.DEV) console.error('ErrorBoundary:', error, errorInfo);
  }

  handleReload = () => window.location.reload();
  handleHome = () => window.location.href = '/';

  render() {
    if (!this.state.hasError) return this.props.children;

    const { error } = this.state;

    return (
      <div className="error-boundary-container">
        <div className="error-boundary-content">
          <div>
            <div className="error-boundary-icon" aria-hidden="true" />
            <h1 className="error-boundary-title">Oups !</h1>
            <p className="error-boundary-message">Une erreur inattendue s'est produite</p>

            {import.meta.env.DEV && error && (
              <details className="error-boundary-details">
                <summary>Détails de l'erreur</summary>
                <pre className="error-stack">{error.toString()}</pre>
              </details>
            )}
          </div>

          <div className="error-boundary-buttons">
            <Button onClick={this.handleReload} variant="primary">
              Recharger la page
            </Button>
            <Button onClick={this.handleHome} variant="secondary">
              Retour à l'accueil
            </Button>
          </div>

          <p className="error-boundary-footer">Si le problème persiste, contactez le support</p>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
