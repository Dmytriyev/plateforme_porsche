/**
 * components/common/Loading.jsx — Indicateur de chargement centralisé.
 *
 * @file components/common/Loading.jsx
 */

import "../../css/components/Loading.css";

// Indicateur de chargement centralisé (option fullScreen) utilisé dans l'UI
const Loading = ({ size = "md", fullScreen = false, message = "" }) => {
  const spinner = (
    <div className="loading-content">
      <div className={`loading-spinner loading-spinner-${size}`} />
      {message && <p className="loading-message">{message}</p>}
    </div>
  );

  if (fullScreen) {
    return <div className="loading-fullscreen">{spinner}</div>;
  }

  return <div className="loading-container">{spinner}</div>;
};

export default Loading;
