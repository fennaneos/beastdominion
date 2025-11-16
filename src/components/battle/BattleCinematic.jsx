// src/components/battle/BattleCinematic.jsx
import React, { useState, useEffect } from "react";
// ============================================================================
// 4. VICTORY / DEFEAT CINEMATIC
// ============================================================================
export function BattleCinematic({ winner, onContinue, battleStats }) {
  const [showConfetti, setShowConfetti] = useState(false);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    if (winner === "player") {
      setShowConfetti(true);
      const audio = new Audio("/sfx/victory.mp3");
      audio.volume = 0.8;
      audio.play().catch(() => {});
    } else if (winner === "enemy") {
      const audio = new Audio("/sfx/defeat.mp3");
      audio.volume = 0.8;
      audio.play().catch(() => {});
    }

    const t = setTimeout(() => setShowStats(true), 2000);
    return () => clearTimeout(t);
  }, [winner]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0, 0, 0, 0.8)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 2000,
      }}
    >
      <div
        style={{
          fontSize: "48px",
          fontWeight: "bold",
          color: winner === "player" ? "#FFD700" : "#FF5252",
          textShadow: "0 0 20px rgba(0,0,0,0.8)",
          marginBottom: "20px",
          animation: "fadeIn 1s ease-out",
        }}
      >
        {winner === "player" ? "VICTORY!" : "DEFEAT!"}
      </div>

      {showConfetti && winner === "player" && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
          }}
        >
          {Array.from({ length: 100 }).map((_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                width: "10px",
                height: "10px",
                backgroundColor: [
                  "#FF5252",
                  "#4CAF50",
                  "#2196F3",
                  "#FFC107",
                  "#9C27B0",
                ][Math.floor(Math.random() * 5)],
                left: `${Math.random() * 100}%`,
                top: `-10px`,
                opacity: Math.random(),
                transform: `rotate(${Math.random() * 360}deg)`,
                animation: `fall ${3 + Math.random() * 2}s linear forwards`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      )}

      {showStats && (
        <div
          style={{
            background: "rgba(0, 0, 0, 0.7)",
            borderRadius: "12px",
            padding: "20px",
            color: "white",
            maxWidth: "500px",
            animation: "fadeIn 1s ease-out",
          }}
        >
          <h3 style={{ textAlign: "center", marginBottom: "15px" }}>
            Battle Statistics
          </h3>
          <div style={{ display: "flex", justifyContent: "space-between" }}>
            <div>
              <div>Total Damage Dealt: {battleStats.totalDamageDealt}</div>
              <div>Total Damage Taken: {battleStats.totalDamageTaken}</div>
              <div>Cards Defeated: {battleStats.cardsDefeated}</div>
            </div>
            <div>
              <div>Battle Duration: {battleStats.duration} turns</div>
              <div>
                Perfect Victory: {battleStats.perfectVictory ? "Yes" : "No"}
              </div>
              <div>Experience Gained: +{battleStats.experienceGained}</div>
            </div>
          </div>

          <div style={{ marginTop: "15px", textAlign: "center" }}>
            <button
              onClick={onContinue}
              style={{
                background: winner === "player" ? "#4CAF50" : "#F44336",
                color: "white",
                border: "none",
                borderRadius: "20px",
                padding: "10px 20px",
                fontSize: "16px",
                cursor: "pointer",
              }}
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default BattleCinematic;