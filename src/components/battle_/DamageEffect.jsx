// src/components/battle/DamageEffect.jsx
import React, { useState, useEffect } from "react";
import { Html } from "@react-three/drei";

// ============================================================================
// 2. DAMAGE EFFECT (damage numbers + scratches or heal sparkles)
// ============================================================================
function DamageEffect({ damage, type, position, onComplete }) {
  const [showDamage, setShowDamage] = useState(true);
  const [showBlood, setShowBlood] = useState(true);
  const [scratchRotations] = useState([
    Math.random() * Math.PI * 2,
    Math.random() * Math.PI * 2,
    Math.random() * Math.PI * 2,
  ]);

  useEffect(() => {
    const t1 = setTimeout(() => setShowDamage(false), 1500);
    const t2 = setTimeout(() => setShowBlood(false), 3000);
    const t3 = setTimeout(() => onComplete?.(), 3000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  return (
    <group position={position}>
      {showDamage && (
        <Html
          position={[0, 1.5, 0]}
          style={{
            pointerEvents: "none",
            transform: "translateX(-50%)",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              fontSize: "28px",
              fontWeight: "bold",
              textShadow:
                "0 0 12px rgba(0,0,0,0.9), 0 0 6px rgba(255, 82, 82, 0.6)",
              animation: "floatUp 1.5s ease-out forwards",
              color: type === "heal" ? "#4CAF50" : "#FF5252",
              fontFamily: "Arial Black, sans-serif",
            }}
          >
            {damage > 0 ? `-${damage}` : `+${Math.abs(damage)}`}
          </div>
        </Html>
      )}

      {/* Blood scratches for damage */}
      {showBlood && type === "damage" && (
        <group>
          {[0, 1, 2].map((i) => (
            <mesh
              key={i}
              position={[
                Math.random() * 0.6 - 0.3,
                Math.random() * 0.8 - 0.4,
                0.15,
              ]}
              rotation={[0, 0, scratchRotations[i]]}
            >
              <planeGeometry args={[1.4 - i * 0.2, 0.15]} />
              <meshBasicMaterial
                color="#a00000"
                transparent
                opacity={0.8 - i * 0.2}
                alphaTest={0.1}
              />
            </mesh>
          ))}
          <mesh position={[Math.random() * 0.4, Math.random() * 0.4, 0.15]}>
            <circleGeometry args={[0.3 + Math.random() * 0.2, 8]} />
            <meshBasicMaterial
              color="#8b0000"
              transparent
              opacity={0.6}
              alphaTest={0.1}
            />
          </mesh>
        </group>
      )}

      {/* Healing sparkles */}
      {showBlood && type === "heal" && (
        <group>
          <Sparkles
            count={20}
            speed={0.3}
            opacity={0.8}
            size={3}
            position={[0, 0.5, 0]}
            scale={[1, 1, 1]}
            color="#4CAF50"
          />
        </group>
      )}
    </group>
  );
}

export default DamageEffect;