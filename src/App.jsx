import { useState } from "react";
import TopBar from "./components/layout/TopBar.jsx";
import TabBar from "./components/layout/TabBar.jsx";
import DeckBuilder from "./components/deckbuilder/DeckBuilder.jsx";

export default function App() {
  const [activeMainTab, setActiveMainTab] = useState("deck");
  const [gold, setGold] = useState(1250);
  const [shards, setShards] = useState(80);

  return (
    <div className="app-root">
      <TopBar gold={gold} shards={shards} />
      <TabBar active={activeMainTab} onChange={setActiveMainTab} />

      <div className="app-content">
        {activeMainTab === "play" && (
          <div className="placeholder-page">
            <h2>Play (coming later)</h2>
            <p>
              Here we will add the actual battle screen, animations, and turn
              controls once the core rules are locked in.
            </p>
          </div>
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
