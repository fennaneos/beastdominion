// src/components/battle/fx/ImpactFlashFX.jsx

import React, { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Quick white flash overlay that appears on attack impact.
 */
export default function ImpactFlashFX({ position, onComplete, type = "default" }) {
  const meshRef = useRef();
  const [opacity, setOpacity] = useState(1);
  const [scale, setScale] = useState(0.8); // Start slightly smaller

  useEffect(() => {
    const t = setTimeout(() => onComplete?.(), 350);
    return () => clearTimeout(t);
  }, [onComplete]);

  useFrame((_, dt) => {
    setOpacity((o) => Math.max(o - dt * 4, 0));
    setScale((s) => Math.min(s + dt * 2, 1.1)); // Grow slightly
    
    if (meshRef.current) {
      meshRef.current.material.opacity = opacity;
      meshRef.current.scale.set(scale, scale, scale);
    }
  });

  // Different colors based on attack type
  const getColor = (type) => {
    switch (type) {
      case "bite": return "#ffcccc";
      case "firebreath": return "#ffcc00";
      case "magic": return "#cc99ff";
      default: return "white";
    }
  };

  return (
    <mesh ref={meshRef} position={[position[0], position[1], position[2] + 0.28]}>
      <planeGeometry args={[3.6, 5]} />
      <meshBasicMaterial color={getColor(type)} transparent opacity={opacity} />
    </mesh>
  );
}