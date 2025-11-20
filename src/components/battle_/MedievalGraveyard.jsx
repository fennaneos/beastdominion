import React from "react";
import { Html } from "@react-three/drei";
import * as THREE from "three";

export default function MedievalGraveyard({ units, owner }) {
  const isPlayer = owner === "player";
  const baseX = isPlayer ? -10 : 10;
  const baseZ = isPlayer ? 6 : -6;

  const glowColor = isPlayer ? "#4dd0ff" : "#ff7b3d";

  return (
    <group>

      {/* --- Stone foundation slab --- */}
      <mesh position={[baseX, -0.03, baseZ]}>
        <boxGeometry args={[4.8, 0.25, 3.2]} />
        <meshStandardMaterial
          color="#2b2b2b"
          roughness={0.85}
          metalness={0.15}
        />
      </mesh>

      {/* --- Small Gothic Mausoleum Block --- */}
      <mesh position={[baseX, 0.9, baseZ]}>
        <boxGeometry args={[2.2, 1.6, 1.4]} />
        <meshStandardMaterial
          color="#3a3a3a"
          roughness={0.75}
          metalness={0.15}
        />
      </mesh>

      {/* Roof */}
      <mesh position={[baseX, 1.8, baseZ]}>
        <coneGeometry args={[1.6, 0.8, 4]} />
        <meshStandardMaterial color="#222" roughness={0.9} metalness={0.1} />
      </mesh>

      {/* --- Two Gothic Tombstones (always visible) --- */}
      {[-1.2, 1.2].map((offsetX, i) => (
        <group key={`stone-${i}`} position={[baseX + offsetX, 0.7, baseZ]}>

          {/* Arched Top */}
          <mesh position={[0, 0.7, 0]}>
            <cylinderGeometry args={[0.6, 0.6, 1.3, 12, 1, false, 0, Math.PI]} />
            <meshStandardMaterial color="#2d2d2d" roughness={0.85} />
          </mesh>

          {/* Body */}
          <mesh>
            <boxGeometry args={[1.2, 1.6, 0.25]} />
            <meshStandardMaterial color="#262626" roughness={0.9} />
          </mesh>

          {/* Inset plate */}
          <mesh position={[0, 0.1, 0.14]}>
            <boxGeometry args={[0.7, 0.4, 0.05]} />
            <meshStandardMaterial color="#3b3b3b" roughness={0.9} />
          </mesh>

        </group>
      ))}

      {/* --- Fog Layer --- */}
      <mesh position={[baseX, 0.2, baseZ]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[6, 4]} />
        <meshStandardMaterial
          color={glowColor}
          transparent
          opacity={0.05}
        />
      </mesh>

      {/* --- Magical Lantern Glow --- */}
      <mesh position={[baseX, 2.2, baseZ]}>
        <sphereGeometry args={[0.15, 8, 8]} />
        <meshStandardMaterial
          emissive={glowColor}
          emissiveIntensity={1.5}
          color={glowColor}
          transparent
          opacity={0.95}
        />
      </mesh>

      {/* Wooden signpost */}
      <group position={[baseX, 1.4, baseZ]}>
        <mesh position={[0, -0.3, 0]}>
          <boxGeometry args={[0.12, 0.8, 0.12]} />
          <meshStandardMaterial color="#4a3420" roughness={0.9} />
        </mesh>

        <mesh position={[0, 0.1, 0]}>
          <boxGeometry args={[1.8, 0.6, 0.1]} />
          <meshStandardMaterial color="#5c422a" roughness={0.8} />
        </mesh>

        <Html
          position={[0, 0.1, 0.06]}
          style={{
            pointerEvents: "none",
            textAlign: "center",
            fontSize: 14,
            color: glowColor,
            textShadow: "0 0 6px rgba(0,0,0,1)",
            fontFamily: "Cinzel, serif",
            width: "120px",
          }}
        >
          <div>{isPlayer ? "Your Graveyard" : "Enemy Graveyard"}</div>
        </Html>
      </group>

    </group>
  );
}
