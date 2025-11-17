// src/components/battle/BattleResultPanel.jsx
import React, { useState, useEffect } from "react";
import "./BattleResultPanel.css";

export default function BattleResultPanel({ result, goldEarned, onExit }) {
  const [showCoins, setShowCoins] = useState(false);

  // Trigger the coin animation a moment after the panel appears
  useEffect(() => {
    const timer = setTimeout(() => setShowCoins(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const isVictory = result === "victory";

  return (
    <div className="battle-result-overlay">
      <div className="battle-result-panel">
        <div className="battle-result-header">
          <h1>{isVictory ? "Victory!" : "Defeat"}</h1>
        </div>

        <div className="battle-result-content">
          <p className="battle-result-text">
            {isVictory
              ? "Your beasts stand triumphant. The bards will sing of this clash in smoky taverns."
              : "Your forces have fallen. The wilds do not forgive weakness… but they reward those who return stronger."}
          </p>

          {isVictory && (
            <div className="battle-reward-section">
              <h2>Rewards</h2>
              <div className="reward-item">
                <span className="reward-amount">+{goldEarned}</span>
                <img src="/src/assets/icons/coin.png" alt="Gold" className="reward-icon" />
              </div>
              <div className="coin-shower">
                {[...Array(15)].map((_, i) => (
                  <div
                    key={i}
                    className={`coin ${showCoins ? "fly" : ""}`}
                    style={{ "--delay": `${i * 0.1}s` }}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="battle-result-actions">
          <button className="battle-result-btn" onClick={onExit}>
            {isVictory ? "Return to Map" : "Retreat to Camp"}
          </button>
        </div>
      </div>
    </div>
  );
}