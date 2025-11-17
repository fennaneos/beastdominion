// src/components/ui/DeckLoader.jsx
import { useState, useEffect } from "react";
import "./DeckLoader.css";

const STORAGE_KEY = "bd-saved-deck-v1";

const fetchAllSavedDecks = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    
    const payload = JSON.parse(raw);
    const deckName = payload.name || "My Awesome Deck";
    return [{ ...payload, name: deckName, id: STORAGE_KEY }];
  } catch (error) {
    console.error("Failed to parse saved deck data.", error);
    return [];
  }
};

export default function DeckLoader({ cards, onLoad, onCancel }) {
  const [savedDecks, setSavedDecks] = useState([]);
  const [selectedDeckId, setSelectedDeckId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setSavedDecks(fetchAllSavedDecks());
  }, []);

  const handleLoadClick = () => {
    if (!selectedDeckId) return;

    setIsLoading(true);
    const deckToLoad = savedDecks.find(d => d.id === selectedDeckId);
    
    setTimeout(() => {
      const loadedDeckObjects = deckToLoad.deck
        .map((id) => cards.find((c) => c.id === id))
        .filter(Boolean);

      onLoad(loadedDeckObjects, deckToLoad.upgrades || {});
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="deck-loader-overlay">
      <div className="deck-loader-content">
        <h2 className="deck-loader-title">Choose Your Deck</h2>
        {savedDecks.length === 0 ? (
          <p className="deck-loader-empty">No saved decks found.</p>
        ) : (
          <div className="deck-loader-carousel">
            {savedDecks.map((deck) => {
              // *** NEW: Find the first card's image ***
              const firstCardId = deck.deck[0];
              const firstCard = cards.find(c => c.id === firstCardId);
              const cardImage = firstCard ? firstCard.image : 'https://picsum.photos/seed/empty/150/210'; // Fallback image

              return (
                <div
                  key={deck.id}
                  className={`deck-card-3d ${selectedDeckId === deck.id ? 'selected' : ''}`}
                  onClick={() => setSelectedDeckId(deck.id)}
                >
                  <div 
                    className="deck-card-face"
                    style={{ backgroundImage: `url(${cardImage})` }} // *** NEW: Set background image ***
                  >
                    {/* The content is now just an overlay on the image */}
                    <div className="deck-card-info-overlay">
                      <h3>{deck.name}</h3>
                      <p>{deck.deck.length} Cards</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div className="deck-loader-actions">
          <button className="db-button db-button--outline" onClick={onCancel}>
            Cancel
          </button>
          {savedDecks.length > 0 && (
            <button
              className={`db-button db-button--primary ${isLoading ? 'loading' : ''}`}
              onClick={handleLoadClick}
              disabled={!selectedDeckId || isLoading}
            >
              {isLoading ? 'Loading...' : 'Load Deck'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}