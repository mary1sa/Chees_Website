import React, { useEffect, useRef } from 'react';
import { FiCheckCircle, FiXCircle, FiInfo } from 'react-icons/fi';
import './ConfirmAction.css';

const ConfirmAction = ({ isOpen, onClose, onConfirm, actionDescription }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      modalRef.current?.focus();
    }

    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-action-title"
      aria-describedby="confirm-action-description"
    >
      <div
        ref={modalRef}
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
        aria-labelledby="confirm-action-title"
        aria-describedby="confirm-action-description"
      >
        <FiInfo className="modal-icon" aria-hidden="true" />
        <h2 id="confirm-action-title" className="modal-title">
          Confirmer l'action
        </h2>
        <p id="confirm-action-description" className="modal-message">
          Êtes-vous sûr de vouloir {actionDescription} ? Cette action est irréversible.
        </p>
        <div className="modal-actions">
          <button
            className="btn cancel-btn"
            onClick={onClose}
            aria-label="Annuler l'action"
          >
            <FiXCircle className="btn-icon" aria-hidden="true" />
            <span>Annuler</span>
          </button>
          <button
            className="btn confirm-btn"
            onClick={onConfirm}
            aria-label="Confirmer l'action"
          >
            <FiCheckCircle className="btn-icon" aria-hidden="true" />
            <span>Confirmer</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmAction;
