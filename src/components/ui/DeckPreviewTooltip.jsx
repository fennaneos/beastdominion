// src/components/ui/DeckPreviewTooltip.jsx
import React from 'react';
import { cards } from '../../data/cards.js'; // Use the correct import name

const DeckPreviewTooltip = ({ deckData, style }) => {
  // --- SMART VALIDATION ---
  // Check if deck data is valid AND contains at least one valid card ID from our collection.
  const isValidDeck = deckData && 
    Array.isArray(deckData.deck) && 
    deckData.deck.length > 0 &&
    cards.some(card => card.id === deckData.deck[0]); // Check if the first card ID actually exists

  if (!isValidDeck) {
    return (
      <div className="deck-preview-tooltip deck-preview-tooltip--empty" style={style}>
        <p>No saved deck found.</p>
      </div>
    );
  }

  // If we get here, we know the data is valid.
  const firstCardId = deckData.deck[0];
  const firstCard = cards.find(c => c.id === firstCardId);

  return (
    <div className="deck-preview-tooltip" style={style}>
      <div className="deck-preview-tooltip__image-container">
        {firstCard && <img src={firstCard.image} alt={firstCard.name} />}
      </div>
      <div className="deck-preview-tooltip__info">
        <p className="deck-preview-tooltip__name">{deckData.deckName || "Unnamed Deck"}</p>
        <p className="deck-preview-tooltip__size">{deckData.deck.length} cards</p>
      </div>
    </div>
  );
};

export default DeckPreviewTooltip;