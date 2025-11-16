// src/components/battle/Graveyard.jsx
import React from "react";
import { Html } from "@react-three/drei";

// ============================================================================
// 6. GRAVEYARD
// ============================================================================
function Graveyard({ units, owner }) {
  const layoutRow = (units, { x, y, spacing }) => {
    const n = units.length || 1;
    const offsetZ = -((n - 1) * spacing) / 2;
    return units.map((u, i) => ({
      unit: u,
      position: [x, y, offsetZ + i * spacing],
    }));
  };

  const graveyardLayout = layoutRow(units, {
    x: owner === "player" ? 15 : -15,
    y: 0.5,
    spacing: 2.0,
  });

  return (
    <group>
      <mesh
        rotation={[0, owner === "player" ? Math.PI / 2 : -Math.PI / 2, 0]}
        position={[owner === "player" ? 15 : -15, -0.01, 0]}
      >
        <planeGeometry args={[6, 12]} />
        <meshStandardMaterial
          color={owner === "player" ? "#1a1a2e" : "#2e1a1a"}
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>

      <Html
        position={[owner === "player" ? 15 : -15, 0.1, 6]}
        style={{
          pointerEvents: "none",
          textAlign: "center",
          fontSize: 14,
          color: owner === "player" ? "#4dd0ff" : "#ff7b3d",
          textShadow: "0 0 6px rgba(0,0,0,0.9)",
        }}
      >
        <div>{owner === "player" ? "Your Graveyard" : "Enemy Graveyard"}</div>
      </Html>

      {graveyardLayout.map(({ unit, position }) => (
        <group key={unit.id} position={position}>
          <mesh position={[0, 0, 0.08]}>
            <boxGeometry args={[1.5, 2.2, 0.15]} />
            <meshStandardMaterial
              color="#0a0a0a"
              metalness={0.4}
              roughness={0.45}
            />
          </mesh>
          <mesh position={[0, 0, 0.09]}>
            <planeGeometry args={[1.4, 2.1]} />
            <meshStandardMaterial color="#1a1a1a" roughness={0.7} />
          </mesh>
        </group>
      ))}
    </group>
  );
}



export default Graveyard;