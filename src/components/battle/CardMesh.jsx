// src/components/battle/CardMesh.jsx
import React, { useRef, useMemo, useState, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import MonsterCard from "../card/MonsterCard.jsx";
import CardTooltip from "./CardTooltip.jsx";
import AttackAnimation from "./AttackAnimation.jsx";
import DamageEffect from "./DamageEffect.jsx";
import BurningCard from "./BurningCard.jsx";
// ============================================================================
// 8. CARDMESH – 3D card + hover tooltip + tutorial finger
// ============================================================================
function CardMesh({
  unit,
  position,
  owner,
  zone,
  isSelected,
  isTarget,
  isAttacking,
  onClick,
  isDying,
  onDeathComplete,
  attackAnimation,
  damageEffect,
  // NEW: highlight this specific mesh with a pointing finger
  showTutorialFinger = false,
}) {
  const groupRef = useRef();
  const glowRef = useRef();
  const basePos = useMemo(() => position, [position]);
  const [pulsePhase, setPulsePhase] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (isAttacking) {
      const t = setTimeout(() => {}, 600);
      return () => clearTimeout(t);
    }
  }, [isAttacking]);

  useFrame((state, dt) => {
    if (isDying) return;
    const g = groupRef.current;
    const glow = glowRef.current;
    if (!g) return;

    const [bx, by, bz] = basePos;
    const time = state.clock.elapsedTime;

    setPulsePhase((prev) => (prev + dt * 2) % (Math.PI * 2));

    // Floating hover motion
    g.position.x = bx;
    g.position.y = by + Math.sin(time * 0.8 + bx) * 0.05;

    // Attack thrust on Z
    const attackOffset = isAttacking ? Math.sin(time * 15) * 0.8 : 0;
    const targetZ = bz + (owner === "player" ? -attackOffset : attackOffset);
    g.position.z += (targetZ - g.position.z) * 10 * dt;

    // Gentle sway
    g.rotation.y = Math.sin(time * 0.7 + bx) * 0.04;
    if (isSelected) g.rotation.y += Math.sin(time * 2) * 0.02;
    if (isTarget) g.rotation.x = Math.sin(time * 3) * 0.05;

    // Scale up when selected / hovered
    const targetScale =
      showTutorialFinger || isSelected ? 1.2 : isHovered ? 1.05 : 1;
    const currentScale = g.scale.x || 1;
    const s = currentScale + (targetScale - currentScale) * 8 * dt;
    g.scale.set(s, s, s);

    // Glowing border
    if (glow) {
      const baseGlow = showTutorialFinger ? 2.0 : 0.8;
      const glowIntensity =
        (isSelected || isTarget || showTutorialFinger
          ? baseGlow
          : 0.5) + Math.sin(pulsePhase) * 0.3;
      glow.material.emissiveIntensity = glowIntensity;
    }
  });

  const auraColor = owner === "player" ? "#4dd0ff" : "#ff7b3d";
  const targetAuraColor = isTarget ? "#ff3366" : auraColor;

  const handleCardClick = (e) => {
    e.stopPropagation();
    onClick?.({ unitId: unit.id, owner, zone });
  };

  const rarityColors = {
    common: "#9e9e9e",
    rare: "#2196f3",
    epic: "#9c27b0",
    legendary: "#ff9800",
  };
  const rarityColor = rarityColors[unit.rarity] || "#9e9e9e";

// In CardMesh.jsx

const displayCard = useMemo(
  () => ({
    id: unit.id,
    name: unit.name,
    cost: unit.cost ?? 0,
    attack: unit.attack ?? 0,
    health: unit.health ?? 0,
    maxHealth: unit.maxHealth ?? unit.health ?? 1,
    race: unit.race,
    rarity: unit.rarity,
    stars: unit.stars ?? unit.level ?? 1,
    text: unit.text ?? unit.ability ?? "",
    // FIX THIS LINE:
    image: unit.image ?? unit.card?.image, 
    imageTop: unit.imageTop,
    abilityName: unit.abilityName ?? unit.ability ?? "",
  }),
  [unit]
);
  const getAttackType = (race) => {
    switch (race) {
      case "dog":
        return "bite";
      case "dragon":
        return "firebreath";
      case "wolf":
        return "pounce";
      case "human":
        return "slash";
      case "elf":
        return "magic";
      default:
        return "slash";
    }
  };

  if (isDying) {
    return (
      <BurningCard unit={unit} renderCard={renderCard} position={position} onComplete={onDeathComplete} />
    );
  }

  return (
    <group ref={groupRef} position={position}>
      {attackAnimation && (
        <AttackAnimation
          from={attackAnimation.from}
          to={attackAnimation.to}
          type={getAttackType(unit.race)}
          onComplete={attackAnimation.onComplete}
        />
      )}

      {damageEffect && (
        <DamageEffect
          damage={damageEffect.damage}
          type={damageEffect.type}
          position={position}
          onComplete={damageEffect.onComplete}
        />
      )}

      {/* Glow layers */}
      <mesh ref={glowRef}>
        <boxGeometry args={[2.9, 4.4, 0.3]} />
        <meshStandardMaterial
          transparent
          opacity={showTutorialFinger ? 0.35 : 0.2}
          emissive={targetAuraColor}
          emissiveIntensity={showTutorialFinger ? 2.0 : 0.8}
        />
      </mesh>
      <mesh>
        <boxGeometry args={[3.1, 4.6, 0.1]} />
        <meshStandardMaterial
          transparent
          opacity={0.15}
          emissive={targetAuraColor}
          emissiveIntensity={0.5}
        />
      </mesh>

      {/* Card body */}
      <mesh position={[0, 0, 0.08]}>
        <boxGeometry args={[2.6, 4.1, 0.25]} />
        <meshStandardMaterial
          color={owner === "player" ? "#1b1725" : "#221216"}
          metalness={0.4}
          roughness={0.45}
          emissive={isSelected || showTutorialFinger ? "#ffffff" : "#000000"}
          emissiveIntensity={isSelected || showTutorialFinger ? 0.15 : 0}
        />
      </mesh>

      {/* UI layer with MonsterCard + hover tooltip */}
      <Html
        transform
        position={[0, 0.4, 0.15]}
        distanceFactor={6}
        style={{ pointerEvents: "auto" }}
      >
        <div
          onClick={handleCardClick}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            width: 170,
            height: 200,
            position: "relative",
            borderRadius: 10,
            overflow: "visible",
            cursor: "pointer",
            transform: isSelected || showTutorialFinger ? "translateY(-4px)" : "none",
            transition: "box-shadow 0.15s ease, transform 0.15s ease",
          }}
        >
          <div style={{ pointerEvents: "none", width: "100%", height: "100%" }}>
            <MonsterCard card={displayCard} size="normal" />
          </div>

          {/* Hover tooltip ABOVE card */}
          {isHovered && (
            <div
              style={{
                position: "absolute",
                bottom: "110%",
                left: "50%",
                transform: "translateX(-50%)",
                width: 240,
                background:
                  "linear-gradient(180deg, rgba(8,8,12,0.95), rgba(16,16,24,0.92))",
                color: "#fff",
                padding: 12,
                borderRadius: 8,
                boxShadow: "0 10px 35px rgba(0,0,0,0.7)",
                border: `1px solid ${rarityColor}88`,
                zIndex: 50,
                pointerEvents: "auto",
                fontSize: 12,
                lineHeight: 1.4,
                maxHeight: "350px",
                overflowY: "auto",
              }}
            >
              {unit.text && (
                <div style={{ marginBottom: 10 }}>
                  <div
                    style={{
                      fontSize: 11,
                      opacity: 0.75,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      marginBottom: 4,
                    }}
                  >
                    Effect
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      opacity: 0.9,
                      fontStyle: "italic",
                      lineHeight: 1.3,
                    }}
                  >
                    {unit.text}
                  </div>
                </div>
              )}

              {unit.race && (
                <div style={{ marginBottom: 8 }}>
                  <span
                    style={{
                      fontSize: 11,
                      opacity: 0.75,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                    }}
                  >
                    Race:{" "}
                  </span>
                  <span
                    style={{
                      fontSize: 11,
                      opacity: 0.95,
                      fontWeight: 600,
                    }}
                  >
                    {unit.race}
                  </span>
                </div>
              )}

              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <div
                  style={{
                    padding: "5px 8px",
                    borderRadius: 6,
                    background: "rgba(255,82,82,0.15)",
                    border: "1px solid rgba(255,82,82,0.3)",
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  ATK: <span style={{ color: "#ff5252" }}>{unit.attack}</span>
                </div>
                <div
                  style={{
                    padding: "5px 8px",
                    borderRadius: 6,
                    background: "rgba(76,175,80,0.15)",
                    border: "1px solid rgba(76,175,80,0.3)",
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  HP:{" "}
                  <span style={{ color: "#4caf50" }}>
                    {unit.health}/{unit.maxHealth}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </Html>

      {/* NEW: tutorial finger anchored to this card */}
      {showTutorialFinger && (
        <Html
          position={[0, 3, 0]}
          style={{
            pointerEvents: "none",
            fontSize: 30,
            textShadow: "0 0 8px rgba(0,0,0,0.8)",
            animation: "tutorial-finger-bounce 1.2s ease-in-out infinite",
          }}
        >
          <div>☝️</div>
        </Html>
      )}

      <CardTooltip unit={unit} visible={false} />
    </group>
  );
}


export default CardMesh;