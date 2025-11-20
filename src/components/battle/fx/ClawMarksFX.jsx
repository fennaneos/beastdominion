// src/components/battle/fx/ClawMarksFX.jsx

import React, { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Dark red claw marks that slash across a card during a hit.
 */
export default function ClawMarksFX({ position, onComplete, type = "default" }) {
  const groupRef = useRef();
  const [alpha, setAlpha] = useState(1);
  const [scale, setScale] = useState(0.5); // Start smaller and grow

  useEffect(() => {
    const t = setTimeout(() => onComplete?.(), 700);
    return () => clearTimeout(t);
  }, [onComplete]);

  useFrame((_, dt) => {
    setAlpha((a) => Math.max(a - dt * 2, 0));
    setScale((s) => Math.min(s + dt * 3, 1)); // Grow to full size quickly
    
    if (groupRef.current) {
      groupRef.current.children.forEach((m) => {
        m.material.opacity = alpha;
        m.scale.x = scale;
        m.scale.y = scale;
      });
    }
  });

  // Different slash patterns based on attack type
  const getSlashPattern = (type) => {
    switch (type) {
      case "bite":
        return [
          { x: -0.3, y: 0.2, rot: -0.2 },
          { x: 0.3, y: 0.2, rot: 0.2 },
          { x: 0, y: -0.3, rot: 0 }
        ];
      case "firebreath":
        return [
          { x: -0.5, y: 0.5, rot: -0.3 },
          { x: 0, y: 0, rot: 0 },
          { x: 0.5, y: -0.5, rot: 0.3 }
        ];
      case "magic":
        return [
          { x: 0, y: 0.5, rot: 0 },
          { x: -0.4, y: 0, rot: -0.4 },
          { x: 0.4, y: 0, rot: 0.4 },
          { x: 0, y: -0.5, rot: 0 }
        ];
      default: // slash, pounce
        return [
          { x: -0.4, y: 0.5, rot: -0.6 },
          { x: 0.1, y: 0.3, rot: -0.5 },
          { x: 0.45, y: -0.1, rot: -0.4 }
        ];
    }
  };

  const slashes = getSlashPattern(type);
  const color = type === "firebreath" ? "#ff6600" : type === "magic" ? "#9933ff" : "#8b0000";

  return (
    <group position={position} ref={groupRef}>
      {slashes.map((s, i) => (
        <mesh
          key={i}
          position={[s.x, s.y, 0.25]}
          rotation={[0, 0, s.rot]}
        >
          <planeGeometry args={[1.3, 0.18]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={alpha}
          />
        </mesh>
      ))}
    </group>
  );
}