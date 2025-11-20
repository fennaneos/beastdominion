// src/components/battle/BattleCinematic.jsx
import React, { useState, useEffect } from "react";

export default function BattleCinematic({
  winner,            // "player" | "enemy"
  goldReward = 0,    // number
  battleStats = {},  // damage dealt, taken, duration…
  onContinue,        // callback when pressing Continue
}) {
  const [showPanel, setShowPanel] = useState(false);

  useEffect(() => {
    // AUDIO
    let audio;
    if (winner === "player") {
      audio = new Audio("/sfx/victory.mp3");
      audio.volume = 0.8;
    } else {
      audio = new Audio("/sfx/defeat.mp3");
      audio.volume = 0.8;
    }
    audio.play().catch(() => {});

    // DELAY PANEL REVEAL FOR CINEMATIC FEEL
    const t = setTimeout(() => setShowPanel(true), 300);
    return () => clearTimeout(t);
  }, [winner]);

  if (!showPanel) return null;

  const isVictory = winner === "player";

  return (
    <div className="battle-result-overlay">

      {/* ============================ */}
      {/*        FX LAYER BEHIND        */}
      {/* ============================ */}
      <div className={`battle-result-fx ${isVictory ? "victory" : "defeat"}`}>
        <div className="fx-rune-circle" />
        <div className="fx-swords" />

        {isVictory && (
          <div className="fx-wings" />
        )}

        {!isVictory && (
          <div className="fx-cracks" />
        )}
      </div>

      {/* ============================ */}
      {/*       MAIN SHIELD PANEL      */}
      {/* ============================ */}
      <div className={`battle-result-panel ${isVictory ? "victory" : "defeat"}`}>

        {/* Decorative wings on the shield itself */}
        <div className="wing wing-left" />
        <div className="wing wing-right" />

        <div className="battle-result-header">
          {isVictory ? "VICTORY" : "DEFEAT"}
        </div>

        <div className="battle-result-text">
          {isVictory
            ? "Your beasts stand triumphant."
            : "Your forces have fallen in battle."}
        </div>

        {/* ============================ */}
        {/*        REWARDS (victory)     */}
        {/* ============================ */}
        {isVictory && (
          <div className="battle-result-rewards">
            <div className="battle-result-reward-label">Gold Earned</div>
            <div className="battle-result-gold-amount">
              +{goldReward}
            </div>
            <div className="battle-result-gold-label">
              Sent to your treasury
            </div>

            {/* Coin burst */}
            <div className="battle-result-coins">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="battle-result-coin" />
              ))}
            </div>
          </div>
        )}

        {/* ============================ */}
        {/*        BATTLE STATS          */}
        {/* ============================ */}
        <div style={{ marginTop: "18px", color: "#ffe8c5", fontSize: "15px" }}>
          <div>Total Damage Dealt: {battleStats.totalDamageDealt ?? 0}</div>
          <div>Total Damage Taken: {battleStats.totalDamageTaken ?? 0}</div>
          <div>Cards Defeated: {battleStats.cardsDefeated ?? 0}</div>
          <div>Battle Duration: {battleStats.duration ?? 0} turns</div>
        </div>

        {/* ============================ */}
        {/*        CONTINUE BUTTON       */}
        {/* ============================ */}
        <div className="battle-result-actions">
          <button className="battle-result-btn" onClick={onContinue}>
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
