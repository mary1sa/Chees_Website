import React, { useEffect, useRef } from 'react';
import { FiAlertTriangle, FiXCircle, FiTrash2 } from 'react-icons/fi';
import './ConfirmDelete.css';

const ConfirmDelete = ({ isOpen, onClose, onConfirm, itemName }) => {
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
      aria-labelledby="confirm-delete-title"
      aria-describedby="confirm-delete-description"
    >
      <div 
        ref={modalRef}
        className="modal-container"
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
        aria-labelledby="confirm-delete-title"
        aria-describedby="confirm-delete-description"
      >
        <FiAlertTriangle className="modal-icon" aria-hidden="true" />
        <h2 id="confirm-delete-title" className="modal-title">
          Confirmer la suppression
        </h2>
        <p id="confirm-delete-description" className="modal-message">
          Êtes-vous sûr de vouloir supprimer <strong>{itemName}</strong> ? 
          Cette action ne peut pas être annulée.
        </p>
        <div className="modal-actions">
          <button 
            className="btn cancel-btn" 
            onClick={onClose}
            aria-label="Annuler la suppression"
          >
            <FiXCircle className="btn-icon" aria-hidden="true" />
            <span>Annuler</span>
          </button>
          <button 
            className="btn deletebtn" 
            onClick={onConfirm}
            aria-label="Confirmer la suppression"
          >
            <FiTrash2 className="btn-icon" aria-hidden="true" />
            <span>Supprimer</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDelete;
