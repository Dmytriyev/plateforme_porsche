import { Component } from 'react';
import { Button } from './common';
import './ErrorBoundary.css';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    if (import.meta.env.DEV) {
    }
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary-container">
          <div className="error-boundary-content">
            <div>
              <div className="error-boundary-icon" aria-hidden="true" />
              <h1 className="error-boundary-title">Oups !</h1>
              <p className="error-boundary-message">
                Une erreur inattendue s'est produite
              </p>

              {import.meta.env.DEV && this.state.error && (
                <details className="error-boundary-details">
                  <summary>
                    Détails de l'erreur (dev only)
                  </summary>
                  <div className="error-details-box">
                    <p className="error-message">
                      {this.state.error.toString()}
                    </p>
                    {this.state.errorInfo && (
                      <pre className="error-stack">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                </details>
              )}
            </div>

            <div className="error-boundary-buttons">
              <Button onClick={this.handleReload} variant="primary">
                Recharger la page
              </Button>
              <Button onClick={this.handleGoHome} variant="secondary">
                Retour à l'accueil
              </Button>
            </div>

            <p className="error-boundary-footer">
              Si le problème persiste, contactez le support
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
