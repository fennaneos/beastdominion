// src/components/battle/FireEffects.jsx
import React, { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";

// ============================================================================
// 5. FIRE + BURNING CARD
// ============================================================================
function RealisticFire({ position, intensity = 1.0 }) {
  const fireRef = useRef();
  const [flames, setFlames] = useState([]);

  useEffect(() => {
    const newFlames = [];
    for (let i = 0; i < 50; i++) {
      newFlames.push({
        position: [
          position[0] + (Math.random() - 0.5) * 1.5,
          position[1],
          position[2] + (Math.random() - 0.5) * 1.5,
        ],
        velocity: [
          (Math.random() - 0.5) * 0.03,
          Math.random() * 0.05 + 0.02,
          (Math.random() - 0.5) * 0.03,
        ],
        life: Math.random(),
        size: Math.random() * 0.2 + 0.1,
        color: Math.random() > 0.5 ? 0xff4500 : 0xffa500,
      });
    }
    setFlames(newFlames);
  }, [position]);

  useFrame((state, dt) => {
    if (!fireRef.current) return;

    flames.forEach((flame, i) => {
      flame.position[0] += flame.velocity[0];
      flame.position[1] += flame.velocity[1];
      flame.position[2] += flame.velocity[2];
      flame.life -= dt * 0.7;

      flame.velocity[0] += (Math.random() - 0.5) * 0.001;
      flame.velocity[2] += (Math.random() - 0.5) * 0.001;

      if (flame.life <= 0) {
        flame.position = [
          position[0] + (Math.random() - 0.5) * 1.5,
          position[1],
          position[2] + (Math.random() - 0.5) * 1.5,
        ];
        flame.velocity = [
          (Math.random() - 0.5) * 0.03,
          Math.random() * 0.05 + 0.02,
          (Math.random() - 0.5) * 0.03,
        ];
        flame.life = 1.0;
      }

      if (fireRef.current.children[i]) {
        fireRef.current.children[i].position.set(...flame.position);
        fireRef.current.children[i].material.opacity = flame.life * intensity;

        const hue = 0.08 - flame.life * 0.08;
        fireRef.current.children[i].material.color.setHSL(
          hue,
          1.0,
          0.5 + flame.life * 0.2
        );
      }
    });
  });

  return (
    <group ref={fireRef}>
      {flames.map((flame, i) => (
        <mesh key={`flame-${i}`} position={flame.position}>
          <coneGeometry args={[flame.size, flame.size * 2, 6]} />
          <meshBasicMaterial
            color={flame.color}
            transparent
            opacity={flame.life * intensity}
          />
        </mesh>
      ))}
    </group>
  );
}



export default RealisticFire;
