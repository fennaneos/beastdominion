// src/components/ui/DeckLoader.jsx
import { useState, useEffect } from "react";
import "./DeckLoader.css";

const STORAGE_KEY = "bd-saved-deck-v1";

/* ============================================================
   LOCAL STORAGE HELPERS
============================================================ */
const fetchAllSavedDecks = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const payload = JSON.parse(raw);
    const deckName = payload.name || "My Awesome Deck";

    return [
      {
        ...payload,
        name: deckName,
        id: STORAGE_KEY,
      },
    ];
  } catch (error) {
    console.error("Failed to parse saved deck data.", error);
    return [];
  }
};

/* ============================================================
   MAIN COMPONENT
============================================================ */
export default function DeckLoader({
  cards,
  onLoad,
  onCancel,
  onGoToDeckBuilder,
  updateUserData,
}) {
  const [savedDecks, setSavedDecks] = useState([]);
  const [selectedDeckId, setSelectedDeckId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  /* ------------------------------------------------------------
     LOAD LOCAL SAVED DECKS
  ------------------------------------------------------------ */
  useEffect(() => {
    setSavedDecks(fetchAllSavedDecks());
  }, []);

  /* ------------------------------------------------------------
     MANUAL LOAD EXISTING SAVED DECK
  ------------------------------------------------------------ */
  const handleLoadClick = () => {
    if (!selectedDeckId) return;

    setIsLoading(true);
    const deckToLoad = savedDecks.find((d) => d.id === selectedDeckId);

    setTimeout(() => {
      // Pass the deck IDs directly, not the card objects
      onLoad(deckToLoad.deck);
      setIsLoading(false);
    }, 1000);
  };

  /* ------------------------------------------------------------
     AUTO-FILL DECK (Random 6 Cards)
  ------------------------------------------------------------ */
  const handleAutoFill = async () => {
    if (!updateUserData) {
      console.warn("updateUserData missing from props!");
      return;
    }

    // Shuffle & pick 6 random cards
    const randomCards = [...cards]
      .sort(() => Math.random() - 0.5)
      .slice(0, 6);

    const deckIds = randomCards.map(c => c.id);

    // Save to Firestore
    await updateUserData({
      deck: deckIds,
      upgrades: {} // optional: clear upgrades
    });

    // Notify App.jsx → closes loader + starts battle if needed
    onLoad(deckIds);
  };

  /* ------------------------------------------------------------
     RENDER
  ------------------------------------------------------------ */
  return (
    <div className="deck-loader-overlay">
      <div className="deck-loader-content">
        <h2 className="deck-loader-title">Choose Your Deck</h2>

        {/* ===================== NO SAVED DECKS ===================== */}
        {savedDecks.length === 0 ? (
          <p className="deck-loader-empty">No saved decks found.</p>
        ) : (
          <div className="deck-loader-carousel">
            {savedDecks.map((deck) => {
              const firstCardId = deck.deck[0];
              const firstCard = cards.find((c) => c.id === firstCardId);
              const cardImage =
                firstCard?.image ||
                "https://picsum.photos/seed/empty/150/210";

              return (
                <div
                  key={deck.id}
                  className={`deck-card-3d ${
                    selectedDeckId === deck.id ? "selected" : ""
                  }`}
                  onClick={() => setSelectedDeckId(deck.id)}
                >
                  <div
                    className="deck-card-face"
                    style={{ backgroundImage: `url(${cardImage})` }}
                  >
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

        {/* ========================= ACTIONS ========================= */}
        <div className="deck-loader-actions">
          {/* Cancel */}
          <button className="db-button db-button--outline" onClick={onCancel}>
            Cancel
          </button>

          {/* Auto-fill deck */}
          <button
            className="db-button db-button--outline"
            onClick={handleAutoFill}
            disabled={isLoading}
          >
            Auto-Fill Deck
          </button>

          {/* Go to deck builder */}
          <button
            className="db-button db-button--outline"
            onClick={onGoToDeckBuilder}
          >
            Go to Deck Builder
          </button>

          {/* Load Deck */}
          {savedDecks.length > 0 && (
            <button
              className={`db-button db-button--primary ${
                isLoading ? "loading" : ""
              }`}
              onClick={handleLoadClick}
              disabled={!selectedDeckId || isLoading}
            >
              {isLoading ? "Loading..." : "Load Deck"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}