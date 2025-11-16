// src/components/battle/BattlefieldScene.jsx

import React, { useEffect, useRef, useState, useMemo } from "react"; // FIX 1: Added useMemo
import { useFrame } from "@react-three/fiber";
import { Html, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import MonsterCard from "../card/MonsterCard.jsx";

// ---------------------------------------------------------------------------
// 1. NEW: Dramatic Blood Splatter Effect on Hit
// ---------------------------------------------------------------------------
function BloodSplatterEffect({ position, onComplete }) {
  const groupRef = useRef();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setProgress(1), 300); // Hold for 300ms
    const cleanupTimer = setTimeout(() => onComplete?.(), 1500); // Total duration 1.5s
    return () => { clearTimeout(timer); clearTimeout(cleanupTimer); };
  }, [onComplete]);

  useFrame(() => {
    if (!groupRef.current) return;
    const splats = groupRef.current.children;
    splats.forEach((splat) => {
      const targetScale = progress < 1 ? 1 : 1 - (progress - 1) * 0.8;
      const targetOpacity = progress < 1 ? 0.9 : 0.9 - (progress - 1) * 1.2;
      splat.scale.lerp(new THREE.Vector3(targetScale, targetScale, 1), 0.1);
      splat.material.opacity = Math.max(0, targetOpacity);
    });
  });

  const splatters = useMemo(() => {
    const s = [];
    for (let i = 0; i < 4; i++) {
      s.push({
        pos: [(Math.random() - 0.5) * 1.5, Math.random() * 1.2 - 0.6, 0.16],
        rot: Math.random() * Math.PI * 2,
        scale: 0.8 + Math.random() * 0.6,
      });
    }
    return s;
  }, []);

  return (
    <group ref={groupRef} position={position}>
      {splatters.map((s, i) => (
        <mesh key={i} position={s.pos} rotation={[0, 0, s.rot]} scale={[s.scale, s.scale, 1]}>
          <planeGeometry args={[0.8, 0.3]} />
          <meshBasicMaterial color="#8b0000" transparent opacity={0.9} />
        </mesh>
      ))}
    </group>
  );
}

// ---------------------------------------------------------------------------
// 2. Attack projectile animation (unchanged)
// ---------------------------------------------------------------------------
function AttackAnimation({ from, to, type = "slash", onComplete }) {
  const groupRef = useRef();
  const [progress, setProgress] = useState(0);
  const hasCompleted = useRef(false);
  const safeFrom = Array.isArray(from) && from.length >= 3 ? from : [0, 2, 0];
  const safeTo = Array.isArray(to) && to.length >= 3 ? to : [0, 2, 0];

  useEffect(() => {
    if (!from || !to) console.warn("[AttackAnimation] Missing from/to", { from, to });
  }, [from, to]);

  const projectile = useMemo(() => {
    const types = { bite: { color: "#ff5252", shape: "sphere", speed: 0.015 }, firebreath: { color: "#ff9800", shape: "cone", speed: 0.01 }, pounce: { color: "#8d6e63", shape: "box", speed: 0.02 }, slash: { color: "#ffffff", shape: "plane", speed: 0.025 }, magic: { color: "#9c27b0", shape: "sphere", speed: 0.008 } };
    return types[type] || types.slash;
  }, [type]);

  useFrame((state) => {
    if (!groupRef.current || hasCompleted.current) return;
    setProgress((prev) => {
      const newProgress = Math.min(prev + projectile.speed, 1);
      const currentPos = new THREE.Vector3().lerpVectors(new THREE.Vector3(...safeFrom), new THREE.Vector3(...safeTo), newProgress);
      groupRef.current.position.copy(currentPos);
      groupRef.current.position.y += Math.sin(state.clock.elapsedTime * 10) * 0.1;
      if (newProgress >= 1 && !hasCompleted.current) { hasCompleted.current = true; setTimeout(() => onComplete?.(), 200); }
      return newProgress;
    });
  });

  const renderProjectile = () => {
    const common = { material: <meshBasicMaterial color={projectile.color} transparent opacity={0.8} /> };
    switch (projectile.shape) {
      case "sphere": return <mesh key="proj" {...common}><sphereGeometry args={[0.3, 8, 8]} /></mesh>;
      case "cone": return <mesh key="proj" rotation={[Math.PI / 2, 0, 0]} {...common}><coneGeometry args={[0.2, 0.8, 6]} /></mesh>;
      case "box": return <mesh key="proj" {...common}><boxGeometry args={[0.4, 0.4, 0.4]} /></mesh>;
      case "plane": return <mesh key="proj" rotation={[0, 0, Math.PI / 4]} {...common}><planeGeometry args={[0.8, 0.2]} /></mesh>;
      default: return null;
    }
  };

  return (
    <group ref={groupRef}>
      {renderProjectile()}
      <mesh><sphereGeometry args={[0.5, 8, 8]} /><meshBasicMaterial color={projectile.color} transparent opacity={0.3} /></mesh>
    </group>
  );
}

// ---------------------------------------------------------------------------
// 3. Damage / heal number FX
// ---------------------------------------------------------------------------
function DamageEffect({ damage, type, position, onComplete }) {
  const [showDamage, setShowDamage] = useState(true);
  useEffect(() => { const t1 = setTimeout(() => setShowDamage(false), 1500); const t3 = setTimeout(() => onComplete?.(), 1500); return () => { clearTimeout(t1); clearTimeout(t3); }; }, [onComplete]);

  return (
    <group position={position}>
      {showDamage && (
        <Html position={[0, 1.5, 0]} style={{ pointerEvents: "none", transform: "translateX(-50%)", zIndex: 1000 }}>
          <div style={{ fontSize: "28px", fontWeight: "bold", textShadow: "0 0 12px rgba(0,0,0,0.9), 0 0 6px rgba(255, 82, 82, 0.6)", animation: "floatUp 1.5s ease-out forwards", color: type === "heal" ? "#4CAF50" : "#FF5252", fontFamily: "Arial Black, sans-serif" }}>
            {damage > 0 ? `-${damage}` : `+${Math.abs(damage)}`}
          </div>
        </Html>
      )}
    </group>
  );
}

// ---------------------------------------------------------------------------
// 4. NEW: Stunning 3D Fire & Burning Card Animation
// ---------------------------------------------------------------------------
function StunningFireEffect({ unit, position, onComplete }) {
  const groupRef = useRef();
  const [burnProgress, setBurnProgress] = useState(0);
  const embers = useMemo(() => Array.from({ length: 20 }, () => ({
    position: [(Math.random() - 0.5) * 1.5, Math.random() * 0.5, (Math.random() - 0.5) * 1.5],
    velocity: [(Math.random() - 0.5) * 0.02, Math.random() * 0.03 + 0.01, (Math.random() - 0.5) * 0.02],
    life: Math.random(),
  })), []);

  useFrame((state, dt) => {
    if (!groupRef.current) return;
    const g = groupRef.current;
    setBurnProgress((prev) => {
      const p = Math.min(prev + dt * 0.3, 1); // Slower burn
      g.rotation.y += dt * 0.5;
      g.rotation.z = Math.sin(state.clock.elapsedTime * 3) * 0.2 * p;
      g.scale.setScalar(1 - p * 0.4);
      g.position.y = Math.sin(state.clock.elapsedTime * 2) * -0.3 * p;
      
      const cardMesh = g.children.find(child => child.geometry instanceof THREE.BoxGeometry && child.position.z === 0.08);
      if (cardMesh) {
        cardMesh.material.color.lerpColors(new THREE.Color(0x221216), new THREE.Color(0x111111), p);
        cardMesh.material.emissiveIntensity = (1 - p) * 0.5;
      }
      
      embers.forEach((ember, i) => {
        ember.position[0] += ember.velocity[0]; ember.position[1] += ember.velocity[1]; ember.position[2] += ember.velocity[2];
        ember.life -= dt * 0.5;
        if (ember.life <= 0) { ember.position = [(Math.random() - 0.5) * 1.5, 0, (Math.random() - 0.5) * 1.5]; ember.life = 1; }
        const emberMesh = g.children.find(child => child.userData.type === 'ember' && child.userData.index === i);
        if (emberMesh) { emberMesh.position.set(...ember.position); emberMesh.material.opacity = ember.life * (1 - p * 0.5); }
      });
      if (p >= 1) setTimeout(() => onComplete?.(), 500);
      return p;
    });
  });

  const renderCard = unit.card ?? unit;

  return (
    <group ref={groupRef} position={position}>
      <mesh position={[0, 0, 0.08]}><boxGeometry args={[2.6, 4.1, 0.25]} /><meshStandardMaterial color="#221216" metalness={0.4} roughness={0.45} emissive="#ff3300" emissiveIntensity={0.5} /></mesh>
      <Html transform position={[0, 0.4, 0.18]} distanceFactor={6} style={{ pointerEvents: "none" }}>
        <div style={{ width: 170, height: 200, borderRadius: 14, overflow: "hidden", background: "#111", opacity: 1 - burnProgress * 0.7, filter: `brightness(${1 - burnProgress * 0.5}) sepia(${burnProgress})` }}>
          {renderCard?.image && <img src={renderCard.image} alt={unit.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
        </div>
      </Html>
      {[0, 1, 2].map((i) => <mesh key={`flame-${i}`} position={[Math.sin(i) * 0.5, 1.5 + i * 0.3, Math.cos(i) * 0.5]} rotation={[Math.random() * 0.2, 0, 0]}><coneGeometry args={[0.2 + i * 0.1, 1.5 + i * 0.3, 6]} /><meshBasicMaterial color={i % 2 === 0 ? 0xffa500 : 0xff4500} transparent opacity={0.6 - burnProgress * 0.4} /></mesh>)}
      {embers.map((ember, i) => <mesh key={`ember-${i}`} userData={{ type: 'ember', index: i }}><sphereGeometry args={[0.05, 4, 4]} /><meshBasicMaterial color="#ffff00" transparent opacity={0.9} /></mesh>)}
    </group>
  );
}

// ---------------------------------------------------------------------------
// 5. NEW: Medieval 3D Graveyard (visible even when empty)
// ---------------------------------------------------------------------------
function MedievalGraveyard({ units, owner }) {
  const isPlayer = owner === "player";
  const basePosition = [isPlayer ? 8 : -8, -0.05, 4]; // Moved closer to center

  return (
    <group>
      <mesh position={basePosition} rotation={[0, isPlayer ? Math.PI / 2 : -Math.PI / 2, 0]}>
        <cylinderGeometry args={[3, 3.5, 0.3, 8]} />
        <meshStandardMaterial color="#4a4a4a" roughness={0.9} />
      </mesh>
      <mesh position={[basePosition[0], basePosition[1] + 0.04, basePosition[2]]} rotation={[0, isPlayer ? Math.PI / 2 : -Math.PI / 2, 0]}>
        <cylinderGeometry args={[2.8, 3.3, 0.1, 8]} />
        <meshStandardMaterial color="#5a5a5a" roughness={0.8} />
      </mesh>

      {/* Always show a few placeholder stones */}
      {[0, 1].map((i) => (
        <group key={`placeholder-${i}`} position={[basePosition[0] + (i - 0.5) * 1.8, 0.8, basePosition[2]]}>
          <mesh rotation={[0.3, 0, 0.1]}><boxGeometry args={[1.6, 2.4, 0.2]} /><meshStandardMaterial color="#2c2c2c" metalness={0.1} roughness={0.85} /></mesh>
          <mesh position={[0, 0.7, 0.2]}><boxGeometry args={[0.1, 0.6, 0.1]} /><meshStandardMaterial color="#3a3a3a" roughness={0.9} /></mesh>
          <mesh position={[0, 0.9, 0.2]}><boxGeometry args={[0.4, 0.1, 0.1]} /><meshStandardMaterial color="#3a3a3a" roughness={0.9} /></mesh>
        </group>
      ))}

      <Html position={[basePosition[0], 1.5, basePosition[2]]} style={{ pointerEvents: "none", textAlign: "center", fontSize: 14, color: isPlayer ? "#4dd0ff" : "#ff7b3d", textShadow: "0 0 6px rgba(0,0,0,0.9)" }}>
        <div>{isPlayer ? "Your Graveyard" : "Enemy Graveyard"}</div>
      </Html>
    </group>
  );
}

// ---------------------------------------------------------------------------
// 6. Main 3D Card Mesh
// ---------------------------------------------------------------------------
function CardMesh({ unit, position, owner, zone, slotIndex, isSelected, isTarget, isAttacking, onClick, isDying, onDeathComplete, attackAnimation, damageEffect, isDimmed = false, isTutorialLocked = false }) {
  const groupRef = useRef();
  const glowRef = useRef();
  const [pulsePhase, setPulsePhase] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // FIX: Moved renderCard definition to top to prevent ReferenceError
  const renderCard = unit.card ?? unit;

  if (isDying) {
    return <StunningFireEffect unit={unit} position={position} onComplete={onDeathComplete} />;
  }

  useFrame((state, dt) => {
    if (!groupRef.current) return;
    const g = groupRef.current; const glow = glowRef.current;
    const [bx, by, bz] = position; const time = state.clock.elapsedTime;
    setPulsePhase((prev) => (prev + dt * 2) % (Math.PI * 2));
    g.position.x = bx; g.position.y = by + Math.sin(time * 0.8 + bx) * 0.05;
    const attackOffset = isAttacking ? Math.sin(time * 15) * 0.8 : 0;
    const targetZ = bz + (owner === "player" ? -attackOffset : attackOffset);
    g.position.z += (targetZ - g.position.z) * 10 * dt;
    g.rotation.y = Math.sin(time * 0.7 + bx) * 0.04;
    if (isSelected) g.rotation.y += Math.sin(time * 2) * 0.02;
    if (isTarget) g.rotation.x = Math.sin(time * 3) * 0.05;
    const targetScale = isSelected ? 1.15 : isHovered ? 1.05 : 1;
    const s = (g.scale.x || 1) + (targetScale - (g.scale.x || 1)) * 8 * dt;
    g.scale.set(s, s, s);
    if (glow) glow.material.emissiveIntensity = (isSelected || isTarget) ? 1.5 + Math.sin(pulsePhase) * 0.5 : 0.5 + Math.sin(pulsePhase) * 0.2;
  });

  const auraColor = owner === "player" ? "#4dd0ff" : "#ff7b3d";
  const targetAuraColor = isTarget ? "#ff3366" : auraColor;
  const rarityColors = { common: "#9e9e9e", rare: "#2196f3", epic: "#9c27b0", legendary: "#ff9800" };
  const rarityColor = rarityColors[unit.rarity] || "#9e9e9e";

  const getAttackTypeByRace = (race) => { switch ((race || "").toLowerCase()) { case "dog": return "bite"; case "dragon": return "firebreath"; case "wolf": return "pounce"; case "human": return "slash"; case "elf": return "magic"; default: return "slash"; } };

  return (
    <group ref={groupRef}>
      {attackAnimation && attackAnimation.from && attackAnimation.to && <AttackAnimation from={attackAnimation.from} to={attackAnimation.to} type={attackAnimation.type || getAttackTypeByRace(unit.race)} onComplete={attackAnimation.onComplete} />}
      {damageEffect && damageEffect.type === 'damage' && <BloodSplatterEffect position={position} onComplete={damageEffect.onComplete} />}
      {damageEffect && <DamageEffect damage={damageEffect.damage} type={damageEffect.type} position={position} onComplete={damageEffect.onComplete} />}
      <mesh ref={glowRef}><boxGeometry args={[2.9, 4.4, 0.3]} /><meshStandardMaterial transparent opacity={0.2} emissive={targetAuraColor} emissiveIntensity={0.8} /></mesh>
      <mesh><boxGeometry args={[3.1, 4.6, 0.1]} /><meshStandardMaterial transparent opacity={0.15} emissive={targetAuraColor} emissiveIntensity={0.5} /></mesh>
      <mesh position={[0, 0, 0.08]}><boxGeometry args={[2.6, 4.1, 0.25]} /><meshStandardMaterial color={owner === "player" ? "#1b1725" : "#221216"} metalness={0.4} roughness={0.45} emissive={isSelected ? "#ffffff" : "#000000"} emissiveIntensity={isSelected ? 0.1 : 0} /></mesh>
      <Html transform position={[0, 0.4, 0.15]} distanceFactor={6} style={{ pointerEvents: "auto" }}>
        <div onClick={(e) => { e.stopPropagation(); if (isTutorialLocked) return; onClick?.({ unitId: unit.id, owner, zone, slotIndex }); }} onMouseEnter={() => !isDimmed && !isTutorialLocked && setIsHovered(true)} onMouseLeave={() => !isDimmed && !isTutorialLocked && setIsHovered(false)} style={{ width: 170, height: 200, position: "relative", borderRadius: 10, overflow: "visible", cursor: isDimmed || isTutorialLocked ? "default" : "pointer", transform: isSelected ? "translateY(-4px)" : "none", transition: "box-shadow 0.15s ease, transform 0.15s ease", filter: isDimmed ? "blur(2px) grayscale(60%) brightness(0.7)" : "none", pointerEvents: isDimmed || isTutorialLocked ? "none" : "auto" }}>
          <div style={{ pointerEvents: "none", width: "100%", height: "100%" }}><MonsterCard card={renderCard} size="normal" /></div>
          {isHovered && (
            <div style={{ position: "absolute", bottom: "110%", left: "50%", transform: "translateX(-50%)", width: 240, background: "linear-gradient(180deg, rgba(8,8,12,0.95), rgba(16,16,24,0.92))", color: "#fff", padding: 12, borderRadius: 8, boxShadow: "0 10px 35px rgba(0,0,0,0.7)", border: `1px solid ${rarityColor}88`, zIndex: 50, pointerEvents: "auto", fontSize: 12, lineHeight: 1.4, maxHeight: "350px", overflowY: "auto" }}>
              {unit.text && (<div style={{ marginBottom: 10 }}><div style={{ fontSize: 11, opacity: 0.75, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 4 }}>Effect</div><div style={{ fontSize: 11, opacity: 0.9, fontStyle: "italic", lineHeight: 1.3 }}>{unit.text}</div></div>)}
              {unit.race && (<div style={{ marginBottom: 8 }}><span style={{ fontSize: 11, opacity: 0.75, textTransform: "uppercase", letterSpacing: "0.5px" }}>Race: </span><span style={{ fontSize: 11, opacity: 0.95, fontWeight: 600 }}>{unit.race}</span></div>)}
              <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                <div style={{ padding: "5px 8px", borderRadius: 6, background: "rgba(255,82,82,0.15)", border: "1px solid rgba(255,82,82,0.3)", fontSize: 11, fontWeight: 700 }}>ATK: <span style={{ color: "#ff5252" }}>{unit.attack ?? renderCard.attack}</span></div>
                <div style={{ padding: "5px 8px", borderRadius: 6, background: "rgba(76,175,80,0.15)", border: "1px solid rgba(76,175,80,0.3)", fontSize: 11, fontWeight: 700 }}>HP: <span style={{ color: "#4caf50" }}>{(unit.health ?? renderCard.health ?? renderCard.hp)}/{unit.maxHealth ?? renderCard.maxHealth ?? renderCard.health ?? renderCard.hp}</span></div>
              </div>
            </div>
          )}
        </div>
      </Html>
    </group>
  );
}

// ---------------------------------------------------------------------------
// 7. Phase indicator in the corner
// ---------------------------------------------------------------------------
function BattlePhaseUI({ phase, isPlayerTurn, selectedAttackerId }) {
  const ringRef = useRef();
  const isEnemyTurn = !isPlayerTurn;
  const phaseColor = (() => { if (isEnemyTurn) return "#ff6b35"; if (phase === "resolving") return "#4CAF50"; if (phase === "selectTarget") return "#fbbf24"; return "#4dd0ff"; })();
  const phaseLabel = (() => { if (isEnemyTurn) { if (phase === "resolving") return "Enemy attack resolving"; return "Enemy turn"; } if (phase === "selectTarget") return "Choose an enemy target"; if (phase === "summonOrAttack") return "Your turn: play or attack"; if (phase === "resolving") return "Attack resolving"; return "Your turn"; })();
  useFrame((state, dt) => { if (!ringRef.current) return; const t = state.clock.elapsedTime; ringRef.current.rotation.z += dt * 1.5; const pulse = 1 + (phase === "selectTarget" ? 0.15 : 0.08) * Math.sin(t * 3.0); ringRef.current.scale.set(pulse, pulse, pulse); });
  return (
    <>
      <group position={[-11, 8.5, 0]}>
        <mesh ref={ringRef}><torusGeometry args={[1.1, 0.18, 16, 32]} /><meshStandardMaterial color={phaseColor} emissive={phaseColor} emissiveIntensity={1.2} metalness={0.9} roughness={0.2} /></mesh>
        <Sparkles count={18} speed={0.7} opacity={0.9} size={3} scale={[2.4, 2.4, 2.4]} color={phaseColor} />
        <Html position={[0, -1.8, 0]} style={{ pointerEvents: "none", textAlign: "center", fontSize: 11, color: "#fef9e7", textShadow: "0 0 8px rgba(0,0,0,0.9)", whiteSpace: "nowrap" }}>
          <div>{phaseLabel}</div>
          {phase === "selectTarget" && selectedAttackerId && !isEnemyTurn && <div style={{ opacity: 0.85, marginTop: 3 }}>Click an enemy creature</div>}
        </Html>
      </group>
    </>
  );
}

// ---------------------------------------------------------------------------
// 8. Tutorial hand finger pointer
// ---------------------------------------------------------------------------
function TutorialHandFinger({ position, visible }) {
  if (!visible) return null;
  return <Html position={position} style={{ pointerEvents: "none", fontSize: 32, filter: "drop-shadow(0 0 8px rgba(0,0,0,0.9))" }}><span role="img" aria-label="finger">☟</span></Html>;
}

// ---------------------------------------------------------------------------
// 9. Main BattlefieldScene component
// ---------------------------------------------------------------------------
export default function BattlefieldScene({ playerField, enemyField, playerHand, playerGraveyard, enemyGraveyard, onCardClick, selectedAttackerId, selectedTargetId, attackingUnitId, dyingUnits, onDeathComplete, attackAnimations, damageEffects, battlePhase, isPlayerTurn, tutorialExpectedClick, isTutorialActive, tutorialStep, guidedHandIndex, }) {
  
  // FIX 2: Moved the log into useEffect to prevent infinite loop
  useEffect(() => {
    console.log("BattlefieldScene State Check:", {
      dyingUnits,
      playerGraveyard,
      enemyGraveyard,
      damageEffects,
    });
  }, [dyingUnits, playerGraveyard, enemyGraveyard, damageEffects]); // Only log when these props change

  const layoutRow = (units, { z, y, spacing }) => { const n = units.length || 1; const offsetX = -((n - 1) * spacing) / 2; return units.map((u, i) => ({ unit: u, position: [offsetX + i * spacing, y, z], slotIndex: i })); };
  const playerFieldLayout = layoutRow(playerField, { z: 0, y: 1.7, spacing: 4.2 });
  const enemyFieldLayout = layoutRow(enemyField, { z: -9, y: 1.7, spacing: 4.2 });
  const handLayout = layoutRow(playerHand, { z: 9, y: 3.2, spacing: 3.2 });

  const unitPositions = {}; playerFieldLayout.forEach(({ unit, position }) => { if (unit) unitPositions[unit.id] = position; }); enemyFieldLayout.forEach(({ unit, position }) => { if (unit) unitPositions[unit.id] = position; });
  const effectByTarget = {}; damageEffects.forEach((fx) => { if (fx?.targetId) effectByTarget[fx.targetId] = fx; });

  const hasValidGuidedHandIndex = guidedHandIndex != null && guidedHandIndex >= 0 && guidedHandIndex < handLayout.length;
  const isHandStep = isTutorialActive && (tutorialStep === 2 || tutorialStep === 3 || tutorialStep === 4) && hasValidGuidedHandIndex;
  const isTargetStep = isTutorialActive && tutorialStep === 6;
  const isEnemyTargetTutorial = isTargetStep && tutorialExpectedClick && tutorialExpectedClick.owner === "enemy" && tutorialExpectedClick.zone === "field";

  return (
    <>
      <color attach="background" args={["#0a0a14"]} />
      <ambientLight intensity={0.4} />
      <directionalLight position={[6, 12, 6]} intensity={1.2} castShadow color="#ffd4a3" />
      <directionalLight position={[-6, 8, -4]} intensity={0.5} color="#ffbba0" />
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow><planeGeometry args={[30, 22]} /><meshStandardMaterial color="#2a2416" roughness={0.9} metalness={0.1} /></mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}><planeGeometry args={[36, 28]} /><meshStandardMaterial color="#1a1812" /></mesh>
      <Sparkles count={80} speed={0.4} opacity={0.5} size={3} position={[0, 3, 0]} scale={[14, 4, 12]} color="#e6ccff" />

      {[0, 1, 2].map((i) => { const n = 3; const offsetX = -((n - 1) * 4.2) / 2; const slotPosition = [offsetX + i * 4.2, 1.7, 0]; const hasCard = playerField[i] != null; return !hasCard ? (<mesh key={`player-slot-${i}`} position={slotPosition}><boxGeometry args={[3.5, 4.8, 0.1]} /><meshStandardMaterial color="#4dd0ff" transparent opacity={0.1} wireframe /></mesh>) : null; })}
      {[0, 1, 2].map((i) => { const n = 3; const offsetX = -((n - 1) * 4.2) / 2; const slotPosition = [offsetX + i * 4.2, 1.7, -9]; const hasCard = enemyField[i] != null; return !hasCard ? (<mesh key={`enemy-slot-${i}`} position={slotPosition}><boxGeometry args={[3.5, 4.8, 0.1]} /><meshStandardMaterial color="#ff9500" transparent opacity={0.1} wireframe /></mesh>) : null; })}

      {playerFieldLayout.map(({ unit, position, slotIndex }) => {
        if (!unit) return null;
        const rawAttack = attackAnimations.find((a) => a && a.attackerId === unit.id);
        let animForThisCard = null;
        if (rawAttack) { const fromPos = unitPositions[rawAttack.attackerId]; const toPos = unitPositions[rawAttack.targetId]; if (fromPos && toPos) { animForThisCard = { from: fromPos, to: toPos, type: rawAttack.type }; } }
        const lockPlayerField = isTutorialActive && (tutorialStep === 2 || tutorialStep === 3 || tutorialStep === 4 || tutorialStep === 6);
        return <CardMesh key={unit.id} unit={unit} position={position} owner="player" zone="field" slotIndex={slotIndex} isSelected={selectedAttackerId === unit.id} isTarget={selectedTargetId === unit.id} isAttacking={attackingUnitId === unit.id} isDying={dyingUnits.includes(unit.id)} onDeathComplete={() => onDeathComplete(unit.id)} onClick={onCardClick} attackAnimation={animForThisCard} damageEffect={effectByTarget[unit.id]} isDimmed={lockPlayerField} isTutorialLocked={lockPlayerField} />;
      })}

      {enemyFieldLayout.map(({ unit, position, slotIndex }) => {
        if (!unit) return null;
        const rawAttack = attackAnimations.find((a) => a && a.attackerId === unit.id);
        let animForThisCard = null;
        if (rawAttack) { const fromPos = unitPositions[rawAttack.attackerId]; const toPos = unitPositions[rawAttack.targetId]; if (fromPos && toPos) { animForThisCard = { from: fromPos, to: toPos, type: rawAttack.type }; } }
        const enemyLockedBeforeStep6 = isTutorialActive && tutorialStep >= 2 && tutorialStep < 6;
        let isGuidedEnemySlot = false;
        if (isEnemyTargetTutorial) { if (typeof tutorialExpectedClick.slotIndex === "number") { isGuidedEnemySlot = tutorialExpectedClick.slotIndex === slotIndex; } else { isGuidedEnemySlot = true; } }
        const isDimmed = enemyLockedBeforeStep6 || (isEnemyTargetTutorial && !isGuidedEnemySlot);
        return (
          <group key={unit.id}>
            <CardMesh unit={unit} position={position} owner="enemy" zone="field" slotIndex={slotIndex} isSelected={selectedTargetId === unit.id || isGuidedEnemySlot} isTarget={selectedTargetId === unit.id} isAttacking={attackingUnitId === unit.id} isDying={dyingUnits.includes(unit.id)} onDeathComplete={() => onDeathComplete(unit.id)} onClick={onCardClick} attackAnimation={animForThisCard} damageEffect={effectByTarget[unit.id]} isDimmed={isDimmed} isTutorialLocked={isDimmed} />
            <TutorialHandFinger visible={isEnemyTargetTutorial && isGuidedEnemySlot} position={[position[0], position[1] + 4, position[2]]} />
          </group>
        );
      })}

      {handLayout.map(({ unit, position, slotIndex }) => {
        if (!unit) return null;
        const isGuidedSlot = isHandStep && guidedHandIndex === slotIndex;
        const isDimmed = isHandStep && !isGuidedSlot;
        return (
          <group key={unit.id}>
            <CardMesh unit={unit} position={position} owner="player" zone="hand" slotIndex={slotIndex} isSelected={isGuidedSlot} isTarget={false} isAttacking={false} onClick={onCardClick} isDying={false} onDeathComplete={() => {}} attackAnimation={null} damageEffect={effectByTarget[unit.id]} isDimmed={isDimmed} isTutorialLocked={isDimmed} />
            <TutorialHandFinger visible={isGuidedSlot} position={[position[0], position[1] + 4, position[2] - 1]} />
          </group>
        );
      })}

      <MedievalGraveyard units={playerGraveyard} owner="player" />
      <MedievalGraveyard units={enemyGraveyard} owner="enemy" />

      <BattlePhaseUI phase={battlePhase} isPlayerTurn={isPlayerTurn} selectedAttackerId={selectedAttackerId} selectedTargetId={selectedTargetId} />
    </>
  );
}