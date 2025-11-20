// src/App.jsx
import { useState } from "react";

import TopBar from "./components/layout/TopBar.jsx";
import TabBar from "./components/layout/TabBar.jsx";

import DeckBuilder from "./components/deckbuilder/DeckBuilder.jsx";
import CampaignScreen from "./components/play/CampaignScreen.jsx";
import BattleScreen from "./components/battle/BattleScreen.jsx";

import DeckLoader from "./components/ui/DeckLoader.jsx";
import MedievalAlert from "./components/ui/MedievalAlert.jsx";

import { cards } from "./data/cards.js";

import useUserData from "./hooks/useUserData";
import LoginScreen from "./components/LoginScreen.jsx";

// ✅ Make sure this import exists and path matches your folder
import TutorialScreen from "./tutorial/TutorialScreen.jsx";

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
  // "campaign" | "battle" | "tutorial"
  const [playMode, setPlayMode] = useState("campaign");
  const [currentLevelInfo, setCurrentLevelInfo] = useState(null);

  const [pendingLevelInfo, setPendingLevelInfo] = useState(null);
  const [isDeckLoaderOpen, setIsDeckLoaderOpen] = useState(false);

  const [confirmationMessage, setConfirmationMessage] = useState(null);

  /* ----------------------------------------------------------------------- */
  if (loading) return <div>Loading…</div>;
  if (!user) return <LoginScreen />;

  const gold = data.gold ?? 0;
  const shards = data.shards ?? 0;
  const stamina = data.stamina ?? 100;

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
  /*  BATTLE ENTRY                                                           */
  /* ----------------------------------------------------------------------- */
  const handleStartBattle = (levelInfo) => {
    // 🔥 ONLY normal battles go through here now.
    // Tutorial is handled by handleStartTutorial instead.

    if (!data.deck || data.deck.length < 6) {
      setPendingLevelInfo(levelInfo);
      setIsDeckLoaderOpen(true);
      return;
    }

    setCurrentLevelInfo(levelInfo);
    setPlayMode("battle");
    setActiveMainTab("play");
  };

  /* ----------------------------------------------------------------------- */
  /*  TUTORIAL ENTRY (this is what Begin Tutorial should call)               */
  /* ----------------------------------------------------------------------- */
  const handleStartTutorial = () => {
    // optional: store some info if you want
    setCurrentLevelInfo({ type: "tutorial" });
    setPlayMode("tutorial");
    setActiveMainTab("play");
  };

  const handleExitBattle = () => {
    setPlayMode("campaign");
    setCurrentLevelInfo(null);
  };

  const handleBattleComplete = (result, levelInfo) => {
    if (result !== "victory") return;

    // ✅ Only normal campaign levels handled here now
    const { chapterId, levelId } = levelInfo || {};
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
          maxUnlockedLevel: Math.max(chapter.maxUnlockedLevel, levelId + 1),
        },
      },
    });
  };

  /* ----------------------------------------------------------------------- */
  /*  TUTORIAL COMPLETION HANDLER                                            */
  /* ----------------------------------------------------------------------- */
  const handleTutorialComplete = (result) => {
    setPlayMode("campaign");
    setCurrentLevelInfo(null);

    // Skipped tutorial: just go back
    if (result?.skipped) {
      return;
    }

    // Mirror old behaviour: unlock Darkwood 1
    updateUserData({
      progress: {
        darkwood: { maxUnlockedLevel: 1, completedLevels: [0] },
      },
    });

    setConfirmationMessage(
      "Tutorial complete! Darkwood Level 1 unlocked."
    );
  };

  /* ----------------------------------------------------------------------- */
  /*  DECK LOADER                                                            */
  /* ----------------------------------------------------------------------- */
  const handleLoadDeckFromLoader = (deckIds) => {
    updateUserData({ deck: deckIds });
    setIsDeckLoaderOpen(false);

    if (pendingLevelInfo) {
      handleStartBattle(pendingLevelInfo);
    }
  };

  const handleCancelDeckLoader = () => {
    setIsDeckLoaderOpen(false);
    setPendingLevelInfo(null);
  };

  /* ----------------------------------------------------------------------- */
  /*  RENDER                                                                 */
  /* ----------------------------------------------------------------------- */
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
              // ⬇️ Wire both callbacks:
              onStartBattle={handleStartBattle}
              onStartTutorial={handleStartTutorial}
              progress={data.progress}
            />
          ) : playMode === "battle" ? (
            <BattleScreen
              playerDeck={data.deck}
              upgrades={data.upgrades}
              levelInfo={currentLevelInfo}
              onExitBattle={handleExitBattle}
              onBattleComplete={handleBattleComplete}
            />
          ) : (
            // playMode === "tutorial"
            <TutorialScreen onComplete={handleTutorialComplete} />
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
