// src/App.jsx
import { useState } from "react";

import TopBar from "./components/layout/TopBar.jsx";
import TabBar from "./components/layout/TabBar.jsx";

import DeckBuilder from "./components/deckbuilder/DeckBuilder.jsx";
import CampaignScreen from "./components/play/CampaignScreen.jsx";
import BattlefieldAnime2D from "./components/battle/BattlefieldAnime2D.jsx";


import DeckLoader from "./components/ui/DeckLoader.jsx";
import MedievalAlert from "./components/ui/MedievalAlert.jsx";

import { cards } from "./data/cards.js";

import useUserData from "./hooks/useUserData";
import LoginScreen from "./components/LoginScreen.jsx";

const HomeScreen = () => (
  <div
    style={{
      padding: "20px",
      color: "var(--text-light)",
      textAlign: "center",
    }}
  >
    <h1 style={{ fontFamily: "Cinzel, serif", color: "var(--gold-accent)" }}>
      Welcome to Beast Dominion
    </h1>
    <p>Build your deck and conquer the campaign!</p>
  </div>
);

export default function App() {
  /* ----------------------------------------------------------------------- */
  /*  FIREBASE DATA                                                          */
  /* ----------------------------------------------------------------------- */
  const { user, data, updateUserData, loading } = useUserData();

  const [activeMainTab, setActiveMainTab] = useState("home");
  const [playMode, setPlayMode] = useState("campaign");
  const [currentLevelInfo, setCurrentLevelInfo] = useState(null);

  const [pendingLevelInfo, setPendingLevelInfo] = useState(null);
  const [isDeckLoaderOpen, setIsDeckLoaderOpen] = useState(false);

  const [confirmationMessage, setConfirmationMessage] = useState(null);

  /* ----------------------------------------------------------------------- */
  if (loading) return <div>Loading…</div>;
  if (!user) return <LoginScreen />;

  const gold = data?.gold ?? 0;
  const shards = data?.shards ?? 0;
  const stamina = data?.stamina ?? 100;

  /* ----------------------------------------------------------------------- */
  /*  TAB HANDLING                                                           */
  /* ----------------------------------------------------------------------- */
  const handleChangeTab = (tab) => {
    setActiveMainTab(tab);
    if (tab !== "play") {
      setPlayMode("campaign");
      setCurrentLevelInfo(null);
      setPendingLevelInfo(null);
    }
  };

  /* ----------------------------------------------------------------------- */
  /*  BATTLE LOGIC                                                           */
  /* ----------------------------------------------------------------------- */
  const handleStartBattle = (levelInfo) => {
    // Always show deck loader before starting battle
    setPendingLevelInfo(levelInfo);
    setIsDeckLoaderOpen(true);
  };

  // NEW: Handle starting tutorial
  const handleStartTutorial = () => {
    const tutorialLevelInfo = {
      type: "tutorial",
      chapterId: "darkwood",
      levelId: 0,
      chapter: {
        id: "darkwood",
        name: "Darkwood",
        staminaCost: 0,
      },
      level: {
        id: 0,
        label: "T",
      }
    };

    setCurrentLevelInfo(tutorialLevelInfo);
    setPlayMode("battle");
    setActiveMainTab("play");
  };

  const handleExitBattle = () => {
    setPlayMode("campaign");
    setCurrentLevelInfo(null);
  };

  const handleBattleComplete = (result, levelInfo) => {
    if (result !== "victory") return;

    // Tutorial win
    if (levelInfo?.type === "tutorial") {
      updateUserData({
        progress: {
          ...data.progress,
          darkwood: { maxUnlockedLevel: 1, completedLevels: [0] }
        },
      });

      setConfirmationMessage(
        "Tutorial complete! Darkwood Level 1 unlocked."
      );
      return;
    }

    // Normal battle win
    const { chapterId, levelId } = levelInfo;
    if (!chapterId) return;

    const chapter = data.progress?.[chapterId] || {
      completedLevels: [],
      maxUnlockedLevel: 0,
    };

    const completed = Array.from(
      new Set([...chapter.completedLevels, levelId])
    );

    updateUserData({
      progress: {
        ...data.progress,
        [chapterId]: {
          completedLevels: completed,
          maxUnlockedLevel: Math.max(
            chapter.maxUnlockedLevel,
            levelId + 1
          ),
        },
      },
    });
  };

  /* ----------------------------------------------------------------------- */
  /*  SKIP TUTORIAL                                                          */
  /* ----------------------------------------------------------------------- */
  const handleSkipTutorial = () => {
    updateUserData({
      progress: {
        ...data.progress,
        darkwood: {
          maxUnlockedLevel: 1,
          completedLevels: [0],   // mark tutorial "complete"
        },
      },
    });

    setConfirmationMessage("Tutorial skipped! Darkwood Level 1 unlocked.");
  };

  /* ----------------------------------------------------------------------- */
  /*  DECK LOADER                                                            */
  /* ----------------------------------------------------------------------- */
  const handleLoadDeckFromLoader = (deckIds) => {
    updateUserData({ deck: deckIds });
    setIsDeckLoaderOpen(false);

    if (pendingLevelInfo) {
      setCurrentLevelInfo(pendingLevelInfo);
      setPlayMode("battle");
      setActiveMainTab("play");
      setPendingLevelInfo(null);
    }
  };

  const handleCancelDeckLoader = () => {
    setIsDeckLoaderOpen(false);
    setPendingLevelInfo(null);
  };

  const handleGoToDeckBuilder = () => {
    setIsDeckLoaderOpen(false);
    setActiveMainTab("deck");
    setPendingLevelInfo(null);
  };

  /* ----------------------------------------------------------------------- */
  /*  RENDER                                                                 */
  /* ----------------------------------------------------------------------- */
  
  // Convert deck IDs to actual card objects for battlefield
  const getPlayerDeckFromData = () => {
    if (!data.deck || data.deck.length === 0) return null;
    
    return data.deck.map(deckCardId => {
      const card = cards.find(c => c.id === deckCardId);
      if (!card) {
        // Fallback if card not found
        return {
          id: deckCardId,
          name: "Unknown Card",
          baseAttack: 1,
          baseHealth: 1,
          race: "beast",
          rarity: "common",
          image: null
        };
      }
      return card;
    });
  };

  const playerDeck = getPlayerDeckFromData();

  return (
    <div className="app-root">
      <TopBar gold={gold} shards={shards} stamina={stamina} user={user} />

      <TabBar active={activeMainTab} onChange={handleChangeTab} />

      <div className="app-content">
        {activeMainTab === "home" && <HomeScreen />}

        {activeMainTab === "play" &&
          (playMode === "campaign" ? (
            <CampaignScreen
              gold={gold}
              shards={shards}
              stamina={stamina}
              onStartBattle={handleStartBattle}
              onStartTutorial={handleStartTutorial}
              onSkipTutorial={handleSkipTutorial}
              progress={data.progress}
            />
          ) : (
            <BattlefieldAnime2D
              initialPlayerDeck={playerDeck}
              initialEnemyDeck={null} // Let component generate enemy deck
              levelInfo={currentLevelInfo}
              onExitBattle={handleExitBattle}
              onBattleComplete={handleBattleComplete}
            />
          ))}

        {activeMainTab === "collection" && (
          <DeckBuilder
            mode="collection"
            userData={data}
            updateUserData={updateUserData}
            collectionCards={cards}
          />
        )}

        {activeMainTab === "deck" && (
          <DeckBuilder
            mode="deck"
            userData={data}
            updateUserData={updateUserData}
            collectionCards={cards}
          />
        )}
      </div>

      {isDeckLoaderOpen && (
        <DeckLoader
          cards={cards}
          onLoad={handleLoadDeckFromLoader}
          onCancel={handleCancelDeckLoader}
          onGoToDeckBuilder={handleGoToDeckBuilder}
          updateUserData={updateUserData}
        />
      )}

      {confirmationMessage && (
        <MedievalAlert onClose={() => setConfirmationMessage(null)}>
          {confirmationMessage}
        </MedievalAlert>
      )}
    </div>
  );
}