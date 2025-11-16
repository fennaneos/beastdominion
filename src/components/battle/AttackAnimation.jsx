// src/components/battle/AttackAnimation.jsx
import React, { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// ============================================================================
// 1. ATTACK ANIMATION (projectile between two positions)
// ============================================================================
function AttackAnimation({ from, to, type, onComplete }) {
  const groupRef = useRef();
  const [progress, setProgress] = useState(0);
  const hasCompleted = useRef(false); // guard so onComplete is only called once

  const getProjectileType = (type) => {
    switch (type) {
      case "bite":
        return { color: "#ff5252", shape: "sphere", speed: 0.015 };
      case "firebreath":
        return { color: "#ff9800", shape: "cone", speed: 0.01 };
      case "pounce":
        return { color: "#8d6e63", shape: "box", speed: 0.02 };
      case "slash":
        return { color: "#ffffff", shape: "plane", speed: 0.025 };
      case "magic":
        return { color: "#9c27b0", shape: "sphere", speed: 0.008 };
      default:
        return { color: "#ffffff", shape: "sphere", speed: 0.015 };
    }
  };

  const projectile = getProjectileType(type);

  useFrame((state) => {
    if (!groupRef.current || hasCompleted.current) return;

    setProgress((prev) => {
      const newProgress = Math.min(prev + projectile.speed, 1);

      const currentPos = new THREE.Vector3().lerpVectors(
        new THREE.Vector3(...from),
        new THREE.Vector3(...to),
        newProgress
      );
      groupRef.current.position.copy(currentPos);

      const wobble = Math.sin(state.clock.elapsedTime * 10) * 0.1;
      groupRef.current.position.y += wobble;

      if (newProgress >= 1 && !hasCompleted.current) {
        hasCompleted.current = true;
        setTimeout(() => onComplete?.(), 200);
      }
      return newProgress;
    });
  });

  const renderProjectile = () => {
    switch (projectile.shape) {
      case "sphere":
        return (
          <mesh>
            <sphereGeometry args={[0.3, 8, 8]} />
            <meshBasicMaterial
              color={projectile.color}
              transparent
              opacity={0.8}
            />
          </mesh>
        );
      case "cone":
        return (
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <coneGeometry args={[0.2, 0.8, 6]} />
            <meshBasicMaterial
              color={projectile.color}
              transparent
              opacity={0.8}
            />
          </mesh>
        );
      case "box":
        return (
          <mesh>
            <boxGeometry args={[0.4, 0.4, 0.4]} />
            <meshBasicMaterial
              color={projectile.color}
              transparent
              opacity={0.8}
            />
          </mesh>
        );
      case "plane":
        return (
          <mesh rotation={[0, 0, Math.PI / 4]}>
            <planeGeometry args={[0.8, 0.2]} />
            <meshBasicMaterial
              color={projectile.color}
              transparent
              opacity={0.8}
            />
          </mesh>
        );
      default:
        return (
          <mesh>
            <sphereGeometry args={[0.3, 8, 8]} />
            <meshBasicMaterial
              color={projectile.color}
              transparent
              opacity={0.8}
            />
          </mesh>
        );
    }
  };

  return (
    <group ref={groupRef}>
      {renderProjectile()}
      <mesh>
        <sphereGeometry args={[0.5, 8, 8]} />
        <meshBasicMaterial
          color={projectile.color}
          transparent
          opacity={0.3}
        />
      </mesh>
    </group>
  );
}

export default AttackAnimation;