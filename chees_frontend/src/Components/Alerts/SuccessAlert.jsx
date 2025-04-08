import React, { useEffect, useState } from 'react';
import './Alert.css';

const SuccessAlert = ({ message, onClose, iconType }) => {
  const [fade, setFade] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setFade(true); 
    }, 3000);

    const closeTimer = setTimeout(() => {
      onClose(); 
    }, 4000);

    return () => {
      clearTimeout(timer);
      clearTimeout(closeTimer);
    };
  }, [onClose]);

  const handleClose = () => {
    setFade(true); 
    setTimeout(() => {
      onClose();
    }, 500); 
  };

  return (
    <div className={`alert success ${fade ? 'fadeOut' : ''}`} onTransitionEnd={() => fade && onClose()}>
      <div className="alert-content">
        <span className="alert-icon">✔️</span>
        <span className="alert-message">{message}</span>
      </div>
      <button className="alert-close" onClick={handleClose}>×</button>
    </div>
  );
};

export default SuccessAlert;
