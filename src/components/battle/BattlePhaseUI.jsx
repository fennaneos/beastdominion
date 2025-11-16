// src/components/battle/BattlePhaseUI.jsx
import React from "react";
import { Html } from "@react-three/drei";

// ============================================================================
// 9. BATTLE PHASE UI (corner icon + small hint)
// ============================================================================
function BattlePhaseUI({
  phase,
  isPlayerTurn,
  selectedAttackerId,
  selectedTargetId,
}) {
  const getPhaseIndicator = () => {
    if (!isPlayerTurn) {
      if (phase === "enemyAnimating") return "⚔";
      return "⛔";
    }
    if (phase === "selectAttacker") return "👆";
    if (phase === "selectTarget") return "🎯";
    if (phase === "playerAnimating") return "⚔";
    return "▶";
  };

  const getPhaseColor = () => {
    if (!isPlayerTurn) return "#ff9500";
    if (phase === "playerAnimating") return "#4CAF50";
    if (phase === "selectAttacker") return "#4dd0ff";
    if (phase === "selectTarget") return "#fbbf24";
    return "#4dd0ff";
  };

  const phaseIndicator = getPhaseIndicator();
  const phaseColor = getPhaseColor();

  return (
    <>
      <Html
        position={[-8, 9, 0]}
        style={{
          pointerEvents: "none",
          textAlign: "center",
          fontSize: 32,
          color: phaseColor,
          textShadow: `0 0 15px ${phaseColor}, 0 0 8px rgba(0,0,0,0.8)`,
        }}
      >
        {phaseIndicator}
      </Html>

      {phase === "selectTarget" && selectedAttackerId && (
        <Html
          position={[0, 6.5, 0]}
          style={{
            pointerEvents: "none",
            textAlign: "center",
            fontSize: 11,
            color: phaseColor,
            textShadow: "0 0 10px rgba(0,0,0,0.8)",
            opacity: 0.7,
          }}
        >
          Click enemy card →
        </Html>
      )}
    </>
  );
}


export default BattlePhaseUI;