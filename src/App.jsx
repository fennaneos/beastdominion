// src/App.jsx
import { useState } from "react";
import TopBar from "./components/layout/TopBar.jsx";
import TabBar from "./components/layout/TabBar.jsx";
import DeckBuilder from "./components/deckbuilder/DeckBuilder.jsx";
import CampaignScreen from "./components/play/CampaignScreen.jsx";
import BattleScreen from "./components/battle/BattleScreen.jsx";
import DeckLoader from "./components/ui/DeckLoader.jsx";
import MedievalAlert from "./components/ui/MedievalAlert.jsx";

// Import your card collection
import { cards } from "./data/cards.js";

// Simple home screen (medieval-flavored placeholder)
const HomeScreen = () => (
  <div
    style={{
      padding: "20px",
      color: "var(--text-light)",
      textAlign: "center",
    }}
  >
    <h1
      style={{
        fontFamily: "Cinzel, serif",
        color: "var(--gold-accent)",
      }}
    >
      Welcome to Beast Dominion
    </h1>
    <p>Build your deck and conquer the campaign!</p>
  </div>
);

export default function App() {
  /* --------------------------------------------------------------------- */
  /*  TAB NAVIGATION STATE                                                 */
  /* --------------------------------------------------------------------- */
  const [activeMainTab, setActiveMainTab] = useState("home");

  /* --------------------------------------------------------------------- */
  /*  GLOBAL RESOURCES                                                     */
  /* --------------------------------------------------------------------- */
  const [gold, setGold] = useState(1250);
  const [shards, setShards] = useState(80);

  /* --------------------------------------------------------------------- */
  /*  PLAYER DECK & UPGRADES (SINGLE SOURCE OF TRUTH)                      */
  /* --------------------------------------------------------------------- */
  const [playerDeck, setPlayerDeck] = useState([]);
  const [upgrades, setUpgrades] = useState({});

  /* --------------------------------------------------------------------- */
  /*  PLAY / BATTLE STATE                                                  */
  /* --------------------------------------------------------------------- */
  const [playMode, setPlayMode] = useState("campaign"); // "campaign" | "battle"
  const [currentLevelInfo, setCurrentLevelInfo] = useState(null);
  const [pendingLevelInfo, setPendingLevelInfo] = useState(null);

  /* --------------------------------------------------------------------- */
  /*  CAMPAIGN PROGRESSION                                                 */
  /* --------------------------------------------------------------------- */
  // Shape:
  // {
  //   darkwood: { maxUnlockedLevel: number, completedLevels: number[] },
  //   embercliffs: { ... },
  //   frozendepths: { ... }
  // }
  const [campaignProgress, setCampaignProgress] = useState({
    darkwood: {
      // Level 0 = tutorial. It’s reachable by default.
      maxUnlockedLevel: 0,
      completedLevels: [],
    },
    embercliffs: {
      // You can tweak these when you want cross-chapter gating
      maxUnlockedLevel: 1,
      completedLevels: [],
    },
    frozendepths: {
      maxUnlockedLevel: 1,
      completedLevels: [],
    },
  });

  /* --------------------------------------------------------------------- */
  /*  DECK LOADER / MEDIEVAL ALERT                                         */
  /* --------------------------------------------------------------------- */
  const [isDeckLoaderOpen, setIsDeckLoaderOpen] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState(null);

  /* --------------------------------------------------------------------- */
  /*  TAB HANDLER                                                          */
  /* --------------------------------------------------------------------- */
  const handleChangeTab = (tab) => {
    setActiveMainTab(tab);

    if (tab !== "play") {
      // Whenever we leave the Play tab, reset battle state
      setPlayMode("campaign");
      setCurrentLevelInfo(null);
      setPendingLevelInfo(null);
    }
  };

  /* --------------------------------------------------------------------- */
  /*  START / EXIT BATTLE                                                  */
  /* --------------------------------------------------------------------- */
  const handleStartBattle = (levelInfo) => {
    // If player has no valid deck yet, open DeckLoader first
    if (!playerDeck || playerDeck.length < 6) {
      setPendingLevelInfo(levelInfo);
      setIsDeckLoaderOpen(true);
      return;
    }

    setCurrentLevelInfo(levelInfo);
    setPlayMode("battle");
    setActiveMainTab("play");
  };

  const handleExitBattle = () => {
    setPlayMode("campaign");
    setCurrentLevelInfo(null);
    setPendingLevelInfo(null);
  };

  /* --------------------------------------------------------------------- */
  /*  BATTLE RESULT → CAMPAIGN PROGRESSION                                 */
  /* --------------------------------------------------------------------- */
  const handleBattleComplete = (result, levelInfo) => {
    // Only update progression on a victory
    if (result !== "victory") return;
    if (!levelInfo?.chapterId || typeof levelInfo.levelId !== "number") return;

    const { chapterId, levelId } = levelInfo;

    setCampaignProgress((prev) => {
      const current = prev[chapterId] || {
        maxUnlockedLevel: 0,
        completedLevels: [],
      };

      // Add this level to completedLevels (if not already there)
      const completedLevels = current.completedLevels.includes(levelId)
        ? current.completedLevels
        : [...current.completedLevels, levelId];

      // Simple rule: clearing level N unlocks level N+1
      const nextLevelId = levelId + 1;
      const maxUnlockedLevel = Math.max(
        current.maxUnlockedLevel ?? 0,
        nextLevelId
      );

      return {
        ...prev,
        [chapterId]: {
          ...current,
          completedLevels,
          maxUnlockedLevel,
        },
      };
    });
  };

  /* --------------------------------------------------------------------- */
  /*  DECK LOADER HANDLERS                                                 */
  /* --------------------------------------------------------------------- */
  const handleLoadDeckFromLoader = (loadedDeck, loadedUpgrades) => {
    setPlayerDeck(loadedDeck);
    setUpgrades(loadedUpgrades);
    setIsDeckLoaderOpen(false);

    // Show nice medieval confirmation
    setConfirmationMessage("Deck loaded successfully!");

    if (pendingLevelInfo) {
      // There was a battle we tried to start → resume it now
      setCurrentLevelInfo(pendingLevelInfo);
      setPlayMode("battle");
      setActiveMainTab("play");
      setPendingLevelInfo(null);
    } else {
      // If we just loaded a deck from elsewhere, send the player to Deck tab
      setActiveMainTab("deck");
    }
  };

  const handleCancelDeckLoader = () => {
    setIsDeckLoaderOpen(false);
    setPendingLevelInfo(null);
  };

  /* --------------------------------------------------------------------- */
  /*  RENDER                                                               */
  /* --------------------------------------------------------------------- */
  return (
    <div className="app-root">
      <TopBar gold={gold} shards={shards} />
      <TabBar active={activeMainTab} onChange={handleChangeTab} />

      <div className="app-content">
        {/* HOME TAB -------------------------------------------------------- */}
        {activeMainTab === "home" && <HomeScreen />}

        {/* PLAY TAB -------------------------------------------------------- */}
        {activeMainTab === "play" &&
          (playMode === "campaign" ? (
            <CampaignScreen
              gold={gold}
              shards={shards}
              onStartBattle={handleStartBattle}
              // >>> NEW: pass campaign progression <<<
              progress={campaignProgress}
            />
          ) : (
            <BattleScreen
              playerDeck={playerDeck}
              upgrades={upgrades}
              levelInfo={currentLevelInfo}
              onExitBattle={handleExitBattle}
              // >>> NEW: notify App when battle ends <<<
              onBattleComplete={handleBattleComplete}
            />
          ))}

        {/* COLLECTION TAB -------------------------------------------------- */}
        {activeMainTab === "collection" && (
          <DeckBuilder
            mode="collection"
            gold={gold}
            setGold={setGold}
            collectionCards={cards}
          />
        )}

        {/* DECK TAB -------------------------------------------------------- */}
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
          />
        )}
      </div>

      {/* DECK LOADER MODAL ----------------------------------------------- */}
      {isDeckLoaderOpen && (
        <DeckLoader
          cards={cards}
          onLoad={handleLoadDeckFromLoader}
          onCancel={handleCancelDeckLoader}
        />
      )}

      {/* MEDIEVAL ALERT MODAL -------------------------------------------- */}
      {confirmationMessage && (
        <MedievalAlert
          message={confirmationMessage}
          onClose={() => setConfirmationMessage(null)}
        />
      )}
    </div>
  );
}
