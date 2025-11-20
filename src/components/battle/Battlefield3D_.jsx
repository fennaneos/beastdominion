/**
 * =============================================================================
 * BATTLEFIELD3D - 3D Battle Arena + Guided Medieval Tutorial (ORCHESTRATOR)
 * =============================================================================
 *
 * This component:
 *   - Owns camera UI (settings, coordinates panel).
 *   - Owns tutorial state machine (which step, what clicks are allowed).
 *   - Wraps the <Canvas> and renders <BattlefieldScene /> inside it.
 *   - Forwards valid clicks from BattlefieldScene to the parent `onCardClick`.
 *
 * It does NOT:
 *   - Change the actual game state (no summoning, no damage, no turn logic).
 *     That all lives in the parent battle/battle-screen logic.
 *
 * IMPORTANT FOR THE TUTORIAL:
 *   - Steps 2–4 (play 1st/2nd/3rd creature) advance only when
 *     playerField.length is 1 / 2 / 3 respectively.
 *   - We only forward clicks that match `tutorialExpectedClick`
 *     when the tutorial is active.
 *   - Console logs show clearly what is happening for each click.
 */

import React, { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";

import BattlefieldScene from "./BattlefieldScene_.jsx";
import TutorialOverlay from "../battle_/TutorialOverlay.jsx";
import BattlePhaseUI from "../battle_/BattlePhaseUI_.jsx";

// ============================================================================
// MAIN BATTLEFIELD3D
// ============================================================================
export default function Battlefield3D({
  // Board state (owned by parent battle logic)
  playerField = [],
  enemyField = [],
  playerHand = [],
  enemyHand = [],
  playerGraveyard = [],
  enemyGraveyard = [],

  // Interaction callback (owned by parent)
  onCardClick,

  // Animation / selection state
  selectedAttackerId,
  selectedTargetId,
  attackingUnitId,
  dyingUnits = [],
  onDeathComplete,
  attackAnimations = [],
  damageEffects = [],
  battlePhase,
  isPlayerTurn,
  onAttackConfirm,
  onEndTurn,

  // Tutorial control from parent
  enableTutorial,
  onTutorialFinished,
  onChangeTutorialEnabled,
  levelInfo,
}) {
  // ------------------------------------------------------------------------
  // UI STATE (purely visual; does not affect rules)
  // ------------------------------------------------------------------------
  const [showSettings, setShowSettings] = useState(false);
  const [showCoordinates, setShowCoordinates] = useState(false); // Set to false by default

  // ------------------------------------------------------------------------
  // TUTORIAL ENGINE STATE
  // ------------------------------------------------------------------------
  enableTutorial =
    levelInfo?.chapterId === "darkwood" &&
    (levelInfo?.levelId === 0 || levelInfo?.level?.id === 0);
  const [tutorialEnabled, setTutorialEnabled] = useState(enableTutorial);
  const [isTutorialActive, setIsTutorialActive] = useState(enableTutorial);
  const [tutorialStep, setTutorialStep] = useState(enableTutorial ? 0 : -1);

  useEffect(() => {
    setTutorialEnabled(
      levelInfo?.chapterId === "darkwood" &&
      (levelInfo?.levelId === 0 || levelInfo?.level?.id === 0)
    );
  }, [levelInfo?.chapterId, levelInfo?.levelId, levelInfo?.level?.id]);

  const [tutorialExpectedClick, setTutorialExpectedClick] = useState(null);
  const [tutorialHint, setTutorialHint] = useState("");
  const [duelAttacker, setDuelAttacker] = useState(null);
  const [duelDefender, setDuelDefender] = useState(null);
  const [showDuelOverlay, setShowDuelOverlay] = useState(false);

  // ------------------------------------------------------------------------
  // Card hover state
  // ------------------------------------------------------------------------
  const [hoveredCard, setHoveredCard] = useState(null);
  const [dragState, setDragState] = useState(null);

  // ========================================================================
  // 1) Decide which ZONE is clickable at each tutorial step
  // ========================================================================
  useEffect(() => {
    if (!tutorialEnabled || !isTutorialActive) {
      setTutorialExpectedClick(null);
      return;
    }

    let expected = null;

    if (tutorialStep === 2 || tutorialStep === 3 || tutorialStep === 4) {
      expected = { owner: "player", zone: "hand" };
    } else if (tutorialStep === 5) {
      expected = { owner: "player", zone: "field" };
    } else if (tutorialStep === 6) {
      expected = { owner: "enemy", zone: "field" };
    }

    setTutorialExpectedClick(expected);

    if (expected) {
      console.log("[Tutorial] Step", tutorialStep, "expects click =>", expected);
    } else {
      console.log("[Tutorial] Step", tutorialStep, "does not expect clicks.");
    }
  }, [tutorialStep, tutorialEnabled, isTutorialActive]);

  // ========================================================================
  // 2) Progress tutorial based on ACTUAL creatures on the field
  // ========================================================================
  useEffect(() => {
    if (!tutorialEnabled || !isTutorialActive) return;

    const fieldCount = (playerField || []).filter(
      (u) => u !== null && u !== undefined
    ).length;

    if (tutorialStep === 2 && fieldCount >= 1) {
      console.log("[Tutorial] Detected", fieldCount, "creature(s) on field → advancing to Step 3.");
      setTutorialStep(3);
    } else if (tutorialStep === 3 && fieldCount >= 2) {
      console.log("[Tutorial] Detected", fieldCount, "creatures on field → advancing to Step 4.");
      setTutorialStep(4);
    } else if (tutorialStep === 4 && fieldCount >= 3) {
      console.log("[Tutorial] Detected", fieldCount, "creatures on field → advancing to Step 5 (choose attacker).");
      setTutorialStep(5);
    }
  }, [playerField, tutorialStep, tutorialEnabled, isTutorialActive]);

  // ========================================================================
  // 3) Gated click handler – the ONLY place we forward clicks to parent
  // ========================================================================
  const handleCardClick = (info) => {
    console.log("[Click] Raw click from 3D scene:", info);
    console.log("[Click] Tutorial active?", isTutorialActive, "| step:", tutorialStep, "| expects:", tutorialExpectedClick);

    if (!tutorialEnabled || !isTutorialActive) {
      console.log("[Click] Tutorial inactive → checking for target selection");
      
      if (battlePhase === "selectTarget" && info.owner === "enemy" && info.zone === "field") {
        console.log("[Click] Enemy card selected as target:", info.unitId);
        onCardClick?.({ ...info, isTargetSelection: true });
        return;
      }
      
      console.log("[Click] Forwarding to parent");
      onCardClick?.(info);
      return;
    }

    if (!tutorialExpectedClick) {
      console.log("[Click] Tutorial step", tutorialStep, "is not expecting clicks → ignoring.");
      return;
    }

    const matchesOwner = info && info.owner === tutorialExpectedClick.owner;
    const matchesZone = info && info.zone === tutorialExpectedClick.zone;

    if (!matchesOwner || !matchesZone) {
      console.log("[Click] Wrong zone/owner. expected=", tutorialExpectedClick, "got=", info);
      setTutorialHint("That's not where the tutorial is pointing. Try again.");
      return;
    }

    setTutorialHint("");

    if (tutorialStep === 5) {
      const attackerUnit = (playerField || []).find((u) => u && u.id === info.unitId);
      if (attackerUnit) {
        setDuelAttacker({ ...attackerUnit });
      }
      console.log("[Click] Accepted attacker selection → forwarding to parent.");
      onCardClick?.(info);
      setTutorialStep(6);
      return;
    }

    if (tutorialStep === 6) {
      const defenderUnit = (enemyField || []).find((u) => u && u.id === info.unitId);
      if (defenderUnit) {
        setDuelDefender({ ...defenderUnit });
      }
      console.log("[Click] Accepted target selection → forwarding to parent.");
      onCardClick?.(info);
      setShowDuelOverlay(true);
      setTutorialStep(7);
      return;
    }

    if (tutorialStep === 2 || tutorialStep === 3 || tutorialStep === 4) {
      console.log("[Click] Accepted hand click during step", tutorialStep, "→ forwarding to parent. Tutorial will advance once parent actually moves the card to the field.");
      onCardClick?.(info);
      return;
    }

    console.log("[Click] Tutorial step", tutorialStep, "→ forwarding to parent.");
    onCardClick?.(info);
  };

  // ========================================================================
  // 4) Tutorial control buttons
  // ========================================================================
  const handleTutorialNext = () => {
    setTutorialStep((s) => {
      console.log("[Tutorial] Next clicked. Step", s, "→", s + 1);
      return s + 1;
    });
  };

  const handleTutorialFinish = () => {
    console.log("[Tutorial] Finish clicked. Disabling tutorial.");
    setIsTutorialActive(false);
    setTutorialStep(-1);
    setTutorialExpectedClick(null);
    setTutorialHint("");
    onTutorialFinished?.();
  };

  const toggleTutorialEnabled = () => {
    const nv = !tutorialEnabled;
    console.log("[Tutorial] Toggle tutorial →", nv);
    setTutorialEnabled(nv);
    onChangeTutorialEnabled?.(nv);

    if (!nv) {
      setIsTutorialActive(false);
      setTutorialStep(-1);
      setTutorialExpectedClick(null);
    } else {
      setIsTutorialActive(true);
      setTutorialStep(0);
    }
  };

  // ========================================================================
  // 5) FIXED CAMERA AND COORDINATES
  // ========================================================================
  // These are now fixed constants
  const fixedCameraPosition = [-0.223, 14.517, 17.058];
  const fixedCameraFov = 54;

  // ========================================================================
  // 6) RENDER
  // ========================================================================
  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      {/* -------------------------------------------------------------------
       * RIGHT PANEL – settings + tutorial toggle
       * ----------------------------------------------------------------- */}
      <div
        style={{
          position: "absolute",
          top: 180,
          right: 20,
          zIndex: 11,
          display: "flex",
          flexDirection: "column",
          gap: 15,
          minWidth: 300,
        }}
      >
        {/* Coordinates debug block - now toggleable */}
        {showCoordinates && (
          <div
            style={{
              backgroundColor: "rgba(0, 0, 0, 0.8)",
              border: "2px solid #4dd0ff",
              borderRadius: 8,
              padding: 15,
              fontFamily: "monospace",
              fontSize: 11,
              color: "#4dd0ff",
              lineHeight: 1.5,
              boxShadow:
                "0 0 15px rgba(77, 208, 255, 0.3), inset 0 0 5px rgba(77, 208, 255, 0.1)",
            }}
          >
            <div
              style={{
                marginBottom: 8,
                fontWeight: "bold",
                color: "#00ff41",
                fontSize: 12,
              }}
            >
              CAMERA COORDINATES
            </div>
            <div>X: {fixedCameraPosition[0].toFixed(3)}</div>
            <div>Y: {fixedCameraPosition[1].toFixed(3)}</div>
            <div>Z: {fixedCameraPosition[2].toFixed(3)}</div>
            <div
              style={{
                marginTop: 8,
                borderTop: "1px solid #4dd0ff",
                paddingTop: 8,
              }}
            >
              <div>FOV: {fixedCameraFov.toFixed(1)}°</div>
              <div>Zoom: Fixed</div>
              <div>Rotation: Fixed</div>
              <div>Distance: Fixed</div>
            </div>
          </div>
        )}

        {/* Settings toggle button */}
        <button
          onClick={() => setShowSettings(!showSettings)}
          title="Battle Settings"
          style={{
            width: "100%",
            padding: 10,
            borderRadius: 6,
            backgroundColor: showSettings ? "#00ff41" : "#1a1a2e",
            border: `2px solid ${showSettings ? "#00ff41" : "#ff9500"}`,
            color: showSettings ? "#000" : "#ff9500",
            cursor: "pointer",
            fontSize: 13,
            fontWeight: "bold",
            boxShadow: showSettings
              ? "0 0 15px #00ff41, inset 0 0 8px rgba(0,255,65,0.3)"
              : "0 0 8px rgba(255,149,0,0.3)",
          }}
        >
          ⚙ SETTINGS
        </button>

        {/* Settings panel contents */}
        {showSettings && (
          <div
            style={{
              backgroundColor: "rgba(26,26,46,0.95)",
              border: "2px solid #ff9500",
              borderRadius: 8,
              padding: 15,
              boxShadow:
                "0 8px 32px rgba(255,149,0,0.2), inset 0 0 10px rgba(255,149,0,0.05)",
              fontFamily: "Arial, sans-serif",
            }}
          >
            <div
              style={{
                fontSize: 13,
                fontWeight: "bold",
                color: "#ff9500",
                marginBottom: 12,
                textAlign: "center",
                borderBottom: "2px solid #ff9500",
                paddingBottom: 8,
              }}
            >
              SETTINGS
            </div>

            {/* Coordinates toggle button inside settings */}
            <div style={{ marginBottom: 12 }}>
              <button
                onClick={() => setShowCoordinates(!showCoordinates)}
                style={{
                  width: "100%",
                  padding: 8,
                  backgroundColor: showCoordinates ? "#4dd0ff" : "#0f0f1e",
                  border: "2px solid #4dd0ff",
                  color: showCoordinates ? "#000" : "#4dd0ff",
                  borderRadius: 4,
                  cursor: "pointer",
                  fontSize: 11,
                  fontWeight: "bold",
                  marginBottom: 6,
                }}
              >
                {showCoordinates ? "✓" : "○"} Coordinates
              </button>
            </div>

            {/* Tutorial toggle UI */}
            <div style={{ marginBottom: 12 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: "bold",
                  color: "#ff9500",
                  marginBottom: 6,
                }}
              >
                📜 Darkwood Tutorial
              </div>
              <button
                onClick={toggleTutorialEnabled}
                style={{
                  width: "100%",
                  padding: 8,
                  backgroundColor: tutorialEnabled ? "#4dd0ff" : "#0f0f1e",
                  border: "2px solid #4dd0ff",
                  color: tutorialEnabled ? "#000" : "#4dd0ff",
                  borderRadius: 4,
                  cursor: "pointer",
                  fontSize: 11,
                  fontWeight: "bold",
                  marginBottom: 6,
                }}
              >
                {tutorialEnabled ? "Disable Tutorial" : "Enable Tutorial"}
              </button>
              <div
                style={{
                  fontSize: 10,
                  color: "#cccccc",
                  lineHeight: 1.4,
                }}
              >
                When enabled, first battle of Chapter 1 – Darkwood will be
                guided step by step. Once you're comfortable, turn this off.
              </div>
            </div>

            {/* Extra placeholders for "Abandon battle" / "Go home" buttons */}
            <div style={{ borderTop: "2px solid #ff9500", paddingTop: 12 }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  width: "100%",
                  padding: 8,
                  backgroundColor: "#0f0f1e",
                  border: "2px solid #ff6b6b",
                  color: "#ff6b6b",
                  borderRadius: 4,
                  cursor: "pointer",
                  fontSize: 11,
                  fontWeight: "bold",
                  marginBottom: 6,
                }}
              >
                Abandon Battle
              </button>
              <button
                onClick={() => window.location.href = "/"}
                style={{
                  width: "100%",
                  padding: 8,
                  backgroundColor: "#0f0f1e",
                  border: "2px solid #6bcf7f",
                  color: "#6bcf7f",
                  borderRadius: 4,
                  cursor: "pointer",
                  fontSize: 11,
                  fontWeight: "bold",
                }}
              >
                Go Home
              </button>
            </div>
          </div>
        )}
      </div>

      {/* -------------------------------------------------------------------
       * MAIN THREE.JS CANVAS
       * ----------------------------------------------------------------- */}
      <div style={{ width: "100%", height: "100%", overflow: "hidden" }}>
        <Canvas
          camera={{ 
            position: fixedCameraPosition, 
            fov: fixedCameraFov 
          }}
          style={{ position: "relative", zIndex: 1 }}
        >
          {/* Full 3D scene contents */}
          <BattlefieldScene
            playerField={playerField}
            enemyField={enemyField}
            playerHand={playerHand}
            enemyHand={enemyHand}
            playerGraveyard={playerGraveyard}
            enemyGraveyard={enemyGraveyard}
            onCardClick={handleCardClick}
            selectedAttackerId={selectedAttackerId}
            selectedTargetId={selectedTargetId}
            attackingUnitId={attackingUnitId}
            dyingUnits={dyingUnits}
            onDeathComplete={onDeathComplete}
            attackAnimations={attackAnimations}
            damageEffects={damageEffects}
            battlePhase={battlePhase}
            isPlayerTurn={isPlayerTurn}
            tutorialExpectedClick={tutorialExpectedClick}
            isTutorialActive={isTutorialActive}
            tutorialStep={tutorialStep}
            onAttackConfirm={onAttackConfirm}
            onCardHover={setHoveredCard}
            hoveredCard={hoveredCard}
            dragState={dragState}
            onDragStart={(card) => setDragState({ card, from: "hand" })}
            onDragEnd={() => setDragState(null)}
            onDrop={(cardId, slotIndex, zone) => {
              if (onCardClick) {
                onCardClick({
                  cardId,
                  slotIndex,
                  zone,
                  owner: "player",
                  isDrop: true
                });
              }
              setDragState(null);
            }}
          />

          {/* OrbitControls are completely disabled to fix the camera */}
          <OrbitControls
            enablePan={false}
            enableRotate={false}
            enableZoom={false}
          />
        </Canvas>
      </div>

      {/* -------------------------------------------------------------------
       * BATTLE PHASE UI (ATTACK BUTTON, ETC.)
       * ----------------------------------------------------------------- */}
      <BattlePhaseUI
        phase={battlePhase}
        isPlayerTurn={isPlayerTurn}
        selectedAttackerId={selectedAttackerId}
        selectedTargetId={selectedTargetId}
        onAttackConfirm={onAttackConfirm}
        onEndTurn={onEndTurn}
      />

      {/* -------------------------------------------------------------------
       * OVERLAYS ON TOP OF THE CANVAS
       * ----------------------------------------------------------------- */}
      <TutorialOverlay
        active={tutorialEnabled && isTutorialActive}
        step={tutorialStep}
        hint={tutorialHint}
        onNext={handleTutorialNext}
        onFinish={handleTutorialFinish}
      />
    </div>
  );
}