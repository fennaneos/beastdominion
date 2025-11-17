// src/App.jsx
import { useState } from "react";
import TopBar from "./components/layout/TopBar.jsx";
import TabBar from "./components/layout/TabBar.jsx";
import DeckBuilder from "./components/deckbuilder/DeckBuilder.jsx";
import CampaignScreen from "./components/play/CampaignScreen.jsx";
import BattleScreen from "./components/battle/BattleScreen.jsx";
import DeckPreviewTooltip from "./components/ui/DeckPreviewTooltip.jsx";

// Import your card collection
import { cards } from './data/cards.js';

const STORAGE_KEY = "bd-saved-deck-v1";

// Placeholder for the future Home Screen component
const HomeScreen = () => (
  <div style={{ padding: '20px', color: 'var(--text-light)', textAlign: 'center' }}>
    <h1 style={{ fontFamily: 'Cinzel, serif', color: 'var(--gold-accent)' }}>Welcome to Beast Dominion</h1>
    <p>Build your deck and conquer the campaign!</p>
  </div>
);

// --- MODAL COMPONENT ---
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-title">{title}</h2>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};

export default function App() {
  // --- TAB NAVIGATION STATE ---
  const [activeMainTab, setActiveMainTab] = useState("home");

  // --- GLOBAL RESOURCE STATE ---
  const [gold, setGold] = useState(1250);
  const [shards, setShards] = useState(80);

  // --- PLAYER DECK & UPGRADES STATE (SINGLE SOURCE OF TRUTH) ---
  const [playerDeck, setPlayerDeck] = useState([]);
  const [upgrades, setUpgrades] = useState({});

  // --- PLAY/BATTLE STATE ---
  const [playMode, setPlayMode] = useState("campaign");
  const [currentLevelInfo, setCurrentLevelInfo] = useState(null);

  // --- MODAL & TOOLTIP STATE ---
  const [isInvalidDeckModalOpen, setInvalidDeckModalOpen] = useState(false);
  const [tooltipData, setTooltipData] = useState(null);
  const [tooltipStyle, setTooltipStyle] = useState({});

  // --- EVENT HANDLERS ---
  const handleChangeTab = (tab) => {
    setActiveMainTab(tab);
    if (tab !== "play") {
      setPlayMode("campaign");
      setCurrentLevelInfo(null);
    }
  };

  const handleStartBattle = (levelInfo) => {
    if (playerDeck.length === 0 || playerDeck.length < 6) {
      setInvalidDeckModalOpen(true);
      return;
    }
    setCurrentLevelInfo(levelInfo);
    setPlayMode("battle");
  };

  const handleExitBattle = () => {
    setPlayMode("campaign");
    setCurrentLevelInfo(null);
  };

  const handleSetupDeck = () => {
    setInvalidDeckModalOpen(false);
    setActiveMainTab("deck");
  };

  // --- DECK LOADING HANDLER (FIXED AND CLEANED) ---
  const loadDeckFromStorage = () => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        alert("No saved deck found.");
        return;
      }
      const payload = JSON.parse(raw);
      if (!Array.isArray(payload.deck)) {
        throw new Error("Invalid deck payload");
      }

      // Map saved IDs back to full card objects
      const loadedDeckObjects = payload.deck
        .map(id => cards.find(c => c.id === id))
        .filter(Boolean);

      // *** FIX: Check if the final deck is actually valid ***
      if (loadedDeckObjects.length === 0) {
        alert("Saved deck is empty or contains cards that no longer exist. It has not been loaded.");
        return; // Exit here, do not show success
      }

      setPlayerDeck(loadedDeckObjects);
      if (payload.upgrades && typeof payload.upgrades === "object") {
        setUpgrades(payload.upgrades);
      }
      
      setInvalidDeckModalOpen(false);
      setActiveMainTab("deck");
      alert("Deck loaded successfully!");
    } catch (error) {
      alert("Failed to load deck. It may be corrupted.");
      console.error(error);
    }
  };

  // --- NEW: Function to completely clear saved data ---
  const clearAllSavedData = () => {
    if (window.confirm("Are you sure you want to delete all saved deck data? This cannot be undone.")) {
      localStorage.removeItem(STORAGE_KEY);
      alert("All saved data has been cleared.");
      setInvalidDeckModalOpen(false);
    }
  };

  // --- TOOLTIP HANDLERS (ROBUST JS POSITIONING) ---
  const handleShowTooltip = (event) => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const payload = raw ? JSON.parse(raw) : null;
      const rect = event.target.getBoundingClientRect();
      
      setTooltipStyle({
        top: `${rect.top - 10}px`,
        left: `${rect.left + rect.width / 2}px`,
      });
      setTooltipData(payload);
    } catch (error) {
      setTooltipData(null);
    }
  };

  const handleHideTooltip = () => {
    setTooltipData(null);
  };

  // --- RENDER LOGIC ---
  return (
    <div className="app-root">
      <TopBar gold={gold} shards={shards} />
      <TabBar active={activeMainTab} onChange={handleChangeTab} />

      <div className="app-content">
        {activeMainTab === "home" && <HomeScreen />}

        {activeMainTab === "play" && (
          playMode === "campaign" ? (
            <CampaignScreen
              gold={gold}
              shards={shards}
              onStartBattle={handleStartBattle}
            />
          ) : (
            <BattleScreen
              playerDeck={playerDeck}
              upgrades={upgrades}
              levelInfo={currentLevelInfo}
              onExitBattle={handleExitBattle}
            />
          )
        )}

        {activeMainTab === "collection" && (
          <DeckBuilder
            mode="collection"
            gold={gold}
            setGold={setGold}
            collectionCards={cards}
            // Pass tooltip handlers for consistency
            onShowTooltip={handleShowTooltip}
            onHideTooltip={handleHideTooltip}
          />
        )}

        {activeMainTab === "deck" && (
          <DeckBuilder
            mode="deck"
            gold={gold}
            setGold={setGold}
            playerDeck={playerDeck}
            onDeckChange={setPlayerDeck}
            upgrades={upgrades}
            onUpgradesChange={setUpgrades}
            collectionCards={cards}
            // Pass tooltip handlers
            onShowTooltip={handleShowTooltip}
            onHideTooltip={handleHideTooltip}
          />
        )}
      </div>

      {/* --- INVALID DECK MODAL --- */}
      <Modal
        isOpen={isInvalidDeckModalOpen}
        onClose={() => setInvalidDeckModalOpen(false)}
        title="Deck Not Ready"
      >
        <p>You need a deck of at least 6 cards to start a battle.</p>
        <div className="modal-actions">
          <button 
            className="db-button db-button--primary" 
            onClick={handleSetupDeck}
          >
            Setup Deck
          </button>
          <div style={{ position: 'relative' }}>
            <button 
              className="db-button db-button--outline" 
              onClick={loadDeckFromStorage}
              onMouseEnter={handleShowTooltip}
              onMouseLeave={handleHideTooltip}
            >
              Load Saved Deck
            </button>
            <DeckPreviewTooltip deckData={tooltipData} style={tooltipStyle} />
          </div>
        </div>
        
        {/* --- NEW: Clear Data Section --- */}
        <hr style={{ margin: '20px 0', border: '1px solid var(--border-dark)' }} />
        <p style={{ fontSize: '14px', opacity: '0.8' }}>
          If you're having trouble with saved decks, you can clear all data.
        </p>
        <button 
          className="db-button db-button--outline" 
          onClick={clearAllSavedData}
          style={{ fontSize: '14px' }}
        >
          Clear All Saved Data
        </button>
      </Modal>

      {/* --- SINGLE, GLOBAL TOOLTIP --- */}
      <DeckPreviewTooltip deckData={tooltipData} style={tooltipStyle} />
    </div>
  );
}