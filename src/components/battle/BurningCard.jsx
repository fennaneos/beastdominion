import React, { useRef, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";


function BurningCard({ unit, position, onComplete }) {
  const groupRef = useRef();
  const [burnProgress, setBurnProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  useFrame((state, dt) => {
    if (!groupRef.current || isComplete) return;

    setBurnProgress((prev) => {
      const p = Math.min(prev + dt * 0.5, 1);

      groupRef.current.scale.setScalar(1 - p * 0.3);
      groupRef.current.rotation.y += dt * 0.5;
      groupRef.current.rotation.z =
        Math.sin(state.clock.elapsedTime * 5) * 0.1 * p;

      if (p >= 1 && !isComplete) {
        setIsComplete(true);
        setTimeout(() => onComplete?.(), 500);
      }
      return p;
    });
  });

  return (
    <group ref={groupRef} position={position}>
      <mesh position={[0, 0, 0.08]}>
        <boxGeometry args={[2.6, 4.1, 0.25]} />
        <meshStandardMaterial
          color="#221216"
          metalness={0.4}
          roughness={0.45}
          emissive="#ff3300"
          emissiveIntensity={burnProgress * 0.5}
        />
      </mesh>

      <Html
        transform
        position={[0, 0.4, 0.18]}
        distanceFactor={6}
        style={{ pointerEvents: "none" }}
      >
        <div
          style={{
            width: 170,
            height: 200,
            borderRadius: 14,
            overflow: "hidden",
            background: "#111",
            opacity: 1 - burnProgress * 0.7,
            filter: `brightness(${1 - burnProgress * 0.5}) sepia(${burnProgress})`,
          }}
        >
          {unit.image && (
            <img
              src={unit.image}
              alt={unit.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          )}
        </div>
      </Html>

      <RealisticFire position={[0, 0, 0]} intensity={1.0 - burnProgress * 0.3} />
    </group>
  );
}

export default BurningCard;