// TutorialDamageFX.jsx
// Floating damage, healing, and impact indicators.

import React from "react";
import { Html } from "@react-three/drei";

function DamagePopup({ entry }) {
  const color =
    entry.type === "damage"
      ? "#ff4b4b"
      : entry.type === "heal"
      ? "#6bff7b"
      : "#ffd76b";

  const sign = entry.type === "heal" ? "+" : "-";
  const value = entry.amount ?? 0;

  const style = {
    fontFamily: "'Cinzel', serif",
    fontWeight: 800,
    fontSize: "18px",
    color,
    textShadow: "0 0 8px rgba(0,0,0,0.8)",
    transform: "translateY(-6px)",
  };

  return (
    <Html
      key={entry.id}
      position={entry.position || [0, 1.4, 0]}
      transform
      distanceFactor={6}
      style={{ pointerEvents: "none" }}
    >
      <div style={style}>
        {sign}
        {value}
      </div>
    </Html>
  );
}

export default function TutorialDamageFX({ entries }) {
  if (!entries || !entries.length) return null;
  return (
    <group>
      {entries.map((e) => (
        <DamagePopup key={e.id} entry={e} />
      ))}
    </group>
  );
}
