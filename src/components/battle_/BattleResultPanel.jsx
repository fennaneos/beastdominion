// src/components/battle/BattleResultPanel.jsx
import React, { useEffect, useState } from "react";
import "./BattleResultPanel.css";

export default function BattleResultPanel({
  result,
  reward = 0,
  onContinue,
}) {
  const [flyingCoins, setFlyingCoins] = useState([]);

  // Spawn flying coins animation on mount
  useEffect(() => {
    if (result !== "victory" || reward <= 0) return;

    const coins = [];
    for (let i = 0; i < 12; i++) {
      coins.push({
        id: i,
        left: 50 + (Math.random() * 40 - 20),
        delay: i * 0.15,
      });
    }
    setFlyingCoins(coins);
  }, [result, reward]);

  return (
    <div className="brp-overlay">
      <div className={`brp-panel ${result}`}>
        {/* Decorative Wings */}
        <div className="brp-wings"></div>

        {/* Title */}
        <div className="brp-title">
          {result === "victory" ? "VICTORY" : "DEFEAT"}
        </div>

        {/* Reward Section */}
        {result === "victory" && (
          <div className="brp-reward-box">
            <div className="brp-reward-label">Reward:</div>
            <div className="brp-reward-value">
              <img className="brp-coin-icon" src="/assets/coin.png" />
              +{reward}
            </div>
          </div>
        )}

        {/* Flying coins */}
        {result === "victory" &&
          flyingCoins.map((c) => (
            <div
              key={c.id}
              className="brp-flying-coin"
              style={{
                left: `${c.left}%`,
                animationDelay: `${c.delay}s`,
              }}
            >
              <img src="/assets/coin.png" />
            </div>
          ))}

        {/* Button */}
        <button
          className="brp-btn"
          onClick={onContinue}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
