// src/components/ui/DeckNameModal.jsx
import React, { useState, useRef, useEffect } from 'react';

const DeckNameModal = ({ isOpen, onClose, onConfirm, initialName = "" }) => {
  const [deckName, setDeckName] = useState(initialName);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isOpen]);

  // This function calls the onConfirm prop passed from DeckBuilder
  const handleSubmit = (e) => {
    e.preventDefault();
    if (deckName.trim()) {
      onConfirm(deckName.trim()); // The magic happens here
    }
  };
  
  // This function calls the onClose prop passed from DeckBuilder
  const handleCancel = () => {
      onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleCancel}>
      <div className="modal-content modal-content--small" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">Name Your Deck</h2>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <input
              ref={inputRef}
              type="text"
              value={deckName}
              onChange={(e) => setDeckName(e.target.value)}
              placeholder="Enter deck name..."
              maxLength={30}
              className="db-input"
              style={{ width: '100%', marginBottom: '20px' }}
            />
          </div>
          <div className="modal-actions">
            <button type="button" className="db-button db-button--ghost" onClick={handleCancel}>
              Cancel
            </button>
            <button type="submit" className="db-button db-button--primary">
              Save Deck
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeckNameModal;