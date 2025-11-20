// src/components/battle/DuelOverlay.jsx
import React from "react";

// ============================================================================
// 12. ZOOMED DUEL OVERLAY (two big cards + blood + arrow)
// ============================================================================
function DuelOverlay({ attacker, defender, onClose }) {
  if (!attacker || !defender) return null;

  const damageToDefender = attacker.attack ?? 0;
  const damageToAttacker = defender.attack ?? 0;

  const defenderNewHp = Math.max((defender.health ?? 0) - damageToDefender, 0);
  const attackerNewHp = Math.max((attacker.health ?? 0) - damageToAttacker, 0);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        background: "rgba(0,0,0,0.75)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 40,
        pointerEvents: "auto",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 10,
          fontSize: 16,
          color: "#ffeec0",
          fontFamily: "Georgia, serif",
          textShadow: "0 0 6px #000",
        }}
      >
        {attacker.name} attacks {defender.name}
      </div>

      <div
        style={{
          display: "flex",
          gap: 40,
          alignItems: "center",
          padding: 20,
          borderRadius: 12,
          background:
            "linear-gradient(135deg, rgba(32,24,16,0.95), rgba(10,6,3,0.98))",
          border: "2px solid #d4af37",
          boxShadow: "0 0 24px rgba(0,0,0,0.9)",
        }}
      >
        {/* Attacker card snapshot */}
        <div style={{ position: "relative" }}>
          <div
            style={{
              width: 200,
              height: 280,
              borderRadius: 8,
              overflow: "hidden",
              background: "#111",
            }}
          >
            {attacker.image && (
              <img
                src={attacker.image}
                alt={attacker.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            )}
          </div>
          {/* blood / damage */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at 50% 30%, rgba(160,0,0,0.8), transparent 60%)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "35%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              fontSize: 64,
              color: "#ff2222",
              fontWeight: "900",
              textShadow: "0 0 12px rgba(0,0,0,0.9)",
            }}
          >
            {damageToAttacker}
          </div>
          <div
            style={{
              position: "absolute",
              bottom: 10,
              left: 0,
              right: 0,
              textAlign: "center",
              color: "#fff",
              fontFamily: "Georgia, serif",
              fontSize: 14,
              textShadow: "0 0 6px #000",
            }}
          >
            HP: {attacker.health} →{" "}
            <span style={{ color: attackerNewHp <= 0 ? "#ff5555" : "#aaffaa" }}>
              {attackerNewHp}
            </span>
          </div>
        </div>

        {/* Arrow between cards */}
        <div
          style={{
            fontSize: 40,
            color: "#ff4444",
            textShadow: "0 0 10px #000",
          }}
        >
          ➤
        </div>

        {/* Defender card snapshot */}
        <div style={{ position: "relative" }}>
          <div
            style={{
              width: 200,
              height: 280,
              borderRadius: 8,
              overflow: "hidden",
              background: "#111",
            }}
          >
            {defender.image && (
              <img
                src={defender.image}
                alt={defender.name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            )}
          </div>
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(circle at 50% 30%, rgba(160,0,0,0.8), transparent 60%)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "35%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              fontSize: 64,
              color: "#ff2222",
              fontWeight: "900",
              textShadow: "0 0 12px rgba(0,0,0,0.9)",
            }}
          >
            {damageToDefender}
          </div>
          <div
            style={{
              position: "absolute",
              bottom: 10,
              left: 0,
              right: 0,
              textAlign: "center",
              color: "#fff",
              fontFamily: "Georgia, serif",
              fontSize: 14,
              textShadow: "0 0 6px #000",
            }}
          >
            HP: {defender.health} →{" "}
            <span style={{ color: defenderNewHp <= 0 ? "#ff5555" : "#aaffaa" }}>
              {defenderNewHp}
            </span>
          </div>
        </div>
      </div>

      <div
        style={{ marginTop: 20, maxWidth: 600, color: "#f5e6c7", fontSize: 13 }}
      >
        <p style={{ textAlign: "center", marginBottom: 6 }}>
          Each card deals damage equal to its ATK. If damage ≥ remaining HP,
          that card dies and is sent to the graveyard.
        </p>
        <p style={{ textAlign: "center" }}>
          When you continue, the normal battle animation and log entries will
          resolve this attack.
        </p>
      </div>

      <button
        onClick={onClose}
        style={{
          marginTop: 14,
          padding: "8px 16px",
          borderRadius: 8,
          border: "1px solid #d4af37",
          background: "linear-gradient(180deg, #f4d582, #c5973d)",
          color: "#22130b",
          fontSize: 13,
          fontWeight: "bold",
          cursor: "pointer",
        }}
      >
        Continue Battle
      </button>
    </div>
  );
}

export default DuelOverlay;