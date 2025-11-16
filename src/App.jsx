// src/App.jsx
import { useState } from "react";
import TopBar from "./components/layout/TopBar.jsx";
import TabBar from "./components/layout/TabBar.jsx";
import DeckBuilder from "./components/deckbuilder/DeckBuilder.jsx";
import CampaignScreen from "./components/play/CampaignScreen.jsx";
import BattleScreen from "./components/battle/BattleScreen.jsx";

export default function App() {
  const [activeMainTab, setActiveMainTab] = useState("deck");
  const [gold, setGold] = useState(1250);
  const [shards, setShards] = useState(80);

  // NEW: inside the Play tab, are we on the map or in a fight?
  const [playMode, setPlayMode] = useState("campaign"); // "campaign" | "battle"
  const [currentLevelInfo, setCurrentLevelInfo] = useState(null);

  const handleChangeTab = (tab) => {
    setActiveMainTab(tab);
    // If we leave Play, reset to map next time we come back
    if (tab !== "play") {
      setPlayMode("campaign");
      setCurrentLevelInfo(null);
    }
  };

  return (
    <div className="app-root">
      <TopBar gold={gold} shards={shards} />
      <TabBar active={activeMainTab} onChange={handleChangeTab} />

      <div className="app-content">
        {activeMainTab === "play" && (
          playMode === "campaign" ? (
            <CampaignScreen
              gold={gold}
              shards={shards}
              // ⬇️ this is called when you click "Start fight"
              onStartBattle={(payload) => {
                setCurrentLevelInfo(payload);
                setPlayMode("battle");
              }}
            />
          ) : (
            <BattleScreen
              levelInfo={currentLevelInfo}
              onExitBattle={() => {
                setPlayMode("campaign");
              }}
            />
          )
        )}

        {activeMainTab === "collection" && (
          <DeckBuilder mode="collection" gold={gold} setGold={setGold} />
        )}

        {activeMainTab === "deck" && (
          <DeckBuilder mode="deck" gold={gold} setGold={setGold} />
        )}
      </div>
    </div>
  );
}
