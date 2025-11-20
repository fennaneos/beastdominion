// ============================================================================
//  HYBRID BATTLEFIELD SCENE (SINGLE CANVAS VERSION — STABLE & ERROR-PROOF)
//  --------------------------------------------------------------------------
//  FIXES:
//   ✓ Only ONE <Canvas> instance
//   ✓ No DOM or text inside Canvas
//   ✓ No stray whitespace inside R3F tree
//   ✓ Correct separation: 2D DOM (hand, field, UI) + 3D Canvas (arena + hand)
//   ✓ Robust drag-drop bridge 3D→2D
//   ✓ Anime2D hover glows integrated
//   ✓ Medieval UI and banners
//   ✓ Uses CardMesh, VFX, Tutorial finger
// ============================================================================

import React, { useEffect, useState, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { Html } from "@react-three/drei";

import CardMesh from "../battle_/CardMesh.jsx";
import CurvyArrow from "./fx/CurvyArrow.jsx";
import ClawMarksFX from "./fx/ClawMarksFX.jsx";
import ImpactFlashFX from "./fx/ImpactFlashFX.jsx";

// ============================================================================
// CONSTANTS
// ============================================================================

const FIELD_SPACING = 2.6;

const PLAYER_Y = -2.2;
const ENEMY_Y = 2.2;
const HAND_Y = -4.2;

const computeFieldPositions = (isEnemy) => {
  const baseY = isEnemy ? ENEMY_Y : PLAYER_Y;
  return [
    [-FIELD_SPACING, baseY, 0],
    [0, baseY, 0],
    [FIELD_SPACING, baseY, 0],
  ];
};

const PLAYER_FIELD_POS = computeFieldPositions(false);
const ENEMY_FIELD_POS = computeFieldPositions(true);

// ============================================================================
//  2D FIELD SLOT COMPONENT
// ============================================================================

function FieldSlot2D({
  owner,
  index,
  unit,
  isHovered,
  isLegal,
  onHover,
  onLeave,
  onDrop,
}) {
  return (
    <div
      onMouseEnter={() => onHover(index, owner)}
      onMouseLeave={onLeave}
      onMouseUp={() => onDrop(index, owner)}
      className={
        "hyb-slot " +
        (owner === "enemy" ? "hyb-slot-enemy " : "hyb-slot-player ") +
        (isHovered ? (isLegal ? "hyb-slot-legal" : "hyb-slot-illegal") : "")
      }
    >
      {unit ? (
        <div className="hyb-slot-unit">
          <img src={unit.image} alt="" />
          <div className="hyb-slot-atk">{unit.attack}</div>
          <div className="hyb-slot-hp">{unit.currentHp}</div>
        </div>
      ) : null}
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function BattlefieldScene({
  playerField,
  enemyField,
  playerHand,
  enemyHand,

  selectedAttackerId,
  selectedTargetId,
  attackingUnitId,
  attackAnimations,
  damageEffects,
  dyingUnits,

  isPlayerTurn,

  onCardClick,
  onDropOnField,
  onAttackConfirm,
  onEndTurn,
}) {
  // ==========================================================================
  // INTERNAL DRAG STATE
  // ==========================================================================
  const [dragUnitId, setDragUnitId] = useState(null);
  const [hoverOwner, setHoverOwner] = useState(null);
  const [hoverIndex, setHoverIndex] = useState(null);

  // ==========================================================================
  // CSS INJECTION
  // ==========================================================================
  useEffect(() => {
    if (document.getElementById("hyb-style-2") !== null) return;

    const style = document.createElement("style");
    style.id = "hyb-style-2";
    style.textContent = `
      .hyb-root {
        width: 100%; height: 100%;
        position: relative;
        font-family: 'Cinzel', serif;
        overflow: hidden;
        color: #f0e6d2;
      }

      .hyb-enemy-hand {
        position: absolute;
        top: 8px;
        left: 50%; transform: translateX(-50%);
        display: flex; gap: 14px;
        z-index: 20;
        opacity: 0.7;
      }
      .hyb-enemy-card {
        width: 80px; height: 120px;
        background: linear-gradient(135deg,#2a1810,#1a0f08);
        border: 2px solid #7a0000;
        border-radius: 10px;
      }

      .hyb-field-row {
        position: absolute;
        left: 50%; transform: translateX(-50%);
        display: flex; gap: 22px;
        z-index: 20;
      }
      .hyb-field-row-enemy { top: 130px; }
      .hyb-field-row-player { bottom: 130px; }

      .hyb-slot {
        width: 140px; height: 190px;
        border-radius: 12px;
        background: rgba(60,40,20,0.12);
        border: 2px solid rgba(255,255,255,0.15);
        transition: 0.15s;
        position: relative;
        overflow: hidden;
      }
      .hyb-slot-enemy { border-color: #b00a; }
      .hyb-slot-player { border-color: #f6d99aaa; }

      .hyb-slot-legal {
        box-shadow: 0 0 25px rgba(50,205,50,0.8);
        border-color: #32cd32 !important;
        transform: translateY(-6px);
      }
      .hyb-slot-illegal {
        box-shadow: 0 0 25px rgba(255,20,20,0.8);
        border-color: #ff4444 !important;
        transform: translateY(-6px);
      }

      .hyb-slot-unit img {
        width: 100%; height: 100%; object-fit: cover;
        opacity: 0.55;
      }
      .hyb-slot-atk {
        position: absolute; bottom: 6px; left: 6px;
        color: #ff5252; font-weight: bold; font-size: 16px;
      }
      .hyb-slot-hp {
        position: absolute; bottom: 6px; right: 6px;
        color: #4caf50; font-weight: bold; font-size: 16px;
      }

      .hyb-right {
        position: absolute;
        right: 16px; top: 50%; transform: translateY(-50%);
        display: flex; flex-direction: column;
        gap: 16px;
        z-index: 25;
      }
      .hyb-attack {
        width: 110px; height: 110px;
        border-radius: 50%;
        background: radial-gradient(circle,#e6c07a,#8f6b32);
        border: 3px solid #fff1b9;
        display: flex; align-items:center; justify-content:center;
        font-size: 42px;
        cursor: pointer;
        box-shadow: 0 0 25px rgba(255,200,120,0.6);
      }
      .hyb-attack:hover { transform: scale(1.05); }

      .hyb-endturn {
        padding: 10px 20px;
        background: #1b1114;
        border: 2px solid #f6d99a;
        border-radius: 8px;
        color: #f6d99a;
        text-transform: uppercase;
        font-size: 12px;
        cursor: pointer;
      }

      .hyb-turn-banner {
        position: absolute;
        top: 50px; left: 50%; transform: translateX(-50%);
        padding: 12px 24px;
        border-radius: 999px;
        background: rgba(20,10,10,0.5);
        border: 1px solid rgba(255,255,255,0.15);
        letter-spacing: 3px;
        font-size: 15px;
        z-index: 30;
      }
    `;
    document.head.appendChild(style);
  }, []);

  // ==========================================================================
  // 3D UNIT LIST
  // ==========================================================================
  const allUnits = [
    ...playerField.map((u, i) =>
      u ? { ...u, owner: "player", pos: PLAYER_FIELD_POS[i] } : null
    ),
    ...enemyField.map((u, i) =>
      u ? { ...u, owner: "enemy", pos: ENEMY_FIELD_POS[i] } : null
    ),
  ].filter(Boolean);

  // ==========================================================================
  // HAND POSITIONS (3D)
  // ==========================================================================
  const handPositions = playerHand.map((_, i) => {
    const spread = playerHand.length * 1.3;
    return [-spread / 2 + i * 1.3, HAND_Y, 0.6];
  });

  // ==========================================================================
  // EVENT HANDLERS
  // ==========================================================================
  const startDrag = (unitId) => setDragUnitId(unitId);
  const stopDrag = () => {
    setDragUnitId(null);
    setHoverIndex(null);
    setHoverOwner(null);
  };

  const onSlotHover = (index, owner) => {
    if (!dragUnitId) return;
    setHoverIndex(index);
    setHoverOwner(owner);
  };

  const onSlotLeave = () => {
    setHoverIndex(null);
    setHoverOwner(null);
  };

  const dropOnSlot = (index, owner) => {
    if (!dragUnitId) return;
    onDropOnField?.(dragUnitId, index, owner);
    stopDrag();
  };

  // ==========================================================================
  // RENDER
  // ==========================================================================
  return (
    <div className="hyb-root">
      {/* =========================== ENEMY HAND (2D) ======================== */}
      <div className="hyb-enemy-hand">
        {enemyHand.map((_, i) => (
          <div className="hyb-enemy-card" key={i} />
        ))}
      </div>

      {/* =========================== ENEMY FIELD (2D) ======================== */}
      <div className="hyb-field-row hyb-field-row-enemy">
        {enemyField.map((unit, i) => (
          <FieldSlot2D
            key={i}
            index={i}
            owner="enemy"
            unit={unit}
            isHovered={hoverOwner === "enemy" && hoverIndex === i}
            isLegal={!unit && dragUnitId}
            onHover={onSlotHover}
            onLeave={onSlotLeave}
            onDrop={dropOnSlot}
          />
        ))}
      </div>

      {/* =========================== PLAYER FIELD (2D) ====================== */}
      <div className="hyb-field-row hyb-field-row-player">
        {playerField.map((unit, i) => (
          <FieldSlot2D
            key={i}
            index={i}
            owner="player"
            unit={unit}
            isHovered={hoverOwner === "player" && hoverIndex === i}
            isLegal={!unit && dragUnitId}
            onHover={onSlotHover}
            onLeave={onSlotLeave}
            onDrop={dropOnSlot}
          />
        ))}
      </div>

      {/* =========================== TURN BANNER ============================ */}
      <div className="hyb-turn-banner">
        {isPlayerTurn ? "YOUR TURN" : "ENEMY TURN"}
      </div>

      {/* =========================== RIGHT PANEL (UI) ======================= */}
      <div className="hyb-right">
        <div className="hyb-attack" onClick={() => onAttackConfirm?.()}>
          ⚔
        </div>
        <button className="hyb-endturn" onClick={() => onEndTurn?.()}>
          End Turn
        </button>
      </div>

      {/* =========================== SINGLE CANVAS (3D) ===================== */}
      <Canvas
        camera={{ position: [0, 0, 10], fov: 40 }}
        style={{
          width: "100%",
          height: "100%",
          position: "absolute",
          inset: 0,
          zIndex: 5,
        }}
      >
        <ambientLight intensity={0.68} />
        <directionalLight intensity={0.5} position={[5, 8, 10]} />

        {/* --- 3D FIELD UNITS --- */}
        <group>
          {allUnits.map((u) => (
            <CardMesh
              key={u.id}
              unit={u}
              position={u.pos}
              owner={u.owner}
              zone="field"
              isSelected={selectedAttackerId === u.id}
              isTarget={selectedTargetId === u.id}
              isAttacking={attackingUnitId === u.id}
              isDying={dyingUnits.includes(u.id)}
              attackAnimation={attackAnimations.find((a) => a.unitId === u.id)}
              damageEffect={damageEffects.find((d) => d.unitId === u.id)}
              onClick={onCardClick}
            />
          ))}
        </group>

        {/* --- 3D PLAYER HAND --- */}
        <group>
          {playerHand.map((u, i) => (
            <group
              key={u.id}
              onPointerDown={() => startDrag(u.id)}
              onPointerUp={stopDrag}
              pointerEvents="auto"
            >
              <CardMesh
                unit={u}
                position={handPositions[i]}
                owner="player"
                zone="hand"
                isSelected={dragUnitId === u.id}
                onClick={onCardClick}
              />
            </group>
          ))}
        </group>
      </Canvas>
    </div>
  );
}
