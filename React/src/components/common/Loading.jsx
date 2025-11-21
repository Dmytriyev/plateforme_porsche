import '../../css/components/Loading.css';

const Loading = ({ size = 'md', fullScreen = false, message = '' }) => {
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
