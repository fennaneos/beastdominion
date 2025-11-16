// src/components/battle/Battlefield3D.jsx
/**
 * =============================================================================
 * BATTLEFIELD3D - 3D Battle Arena + Guided Medieval Tutorial (ORCHESTRATOR)
 * =============================================================================
 *
 * This component:
 *   - Owns camera UI (zoom buttons, rotation, coordinates panel).
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

import BattlefieldScene from "./BattlefieldScene.jsx";
import CameraController from "./CameraController.jsx";
import TutorialOverlay from "./TutorialOverlay.jsx";
import DuelOverlay from "./DuelOverlay.jsx";

// ============================================================================
// MAIN BATTLEFIELD3D
// ============================================================================
export default function Battlefield3D({
  // Board state (owned by parent battle logic)
  playerField = [],
  enemyField = [],
  playerHand = [],
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

  // Tutorial control from parent
  enableTutorial = true,
  onTutorialFinished,
  onChangeTutorialEnabled,
}) {
  // ------------------------------------------------------------------------
  // CAMERA STATE (purely visual; does not affect rules)
  // ------------------------------------------------------------------------
  const [zoomLevel, setZoomLevel] = useState(0.6);
  const [cameraRotation, setCameraRotation] = useState(0);
  const [showSettings, setShowSettings] = useState(false);
  const [language, setLanguage] = useState("en");
  const [audioVolume, setAudioVolume] = useState(100);
  const [showCoordinates, setShowCoordinates] = useState(true);
  const [cameraPos, setCameraPos] = useState({
    x: 0,
    y: 0,
    z: 0,
    fov: 55,
  });

  // ------------------------------------------------------------------------
  // TUTORIAL ENGINE STATE
  // ------------------------------------------------------------------------
  const [tutorialEnabled, setTutorialEnabled] = useState(enableTutorial);
  const [isTutorialActive, setIsTutorialActive] = useState(enableTutorial);
  const [tutorialStep, setTutorialStep] = useState(enableTutorial ? 0 : -1);

  /**
   * tutorialExpectedClick:
   *   null => tutorial not listening for clicks
   *   { owner: "player" | "enemy", zone: "hand" | "field" }
   */
  const [tutorialExpectedClick, setTutorialExpectedClick] = useState(null);
  const [tutorialHint, setTutorialHint] = useState("");

  // For the zoomed duel overlay (step 7)
  const [duelAttacker, setDuelAttacker] = useState(null);
  const [duelDefender, setDuelDefender] = useState(null);
  const [showDuelOverlay, setShowDuelOverlay] = useState(false);

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
      // Step 2–4: user must click a HAND card
      expected = { owner: "player", zone: "hand" };
    } else if (tutorialStep === 5) {
      // Step 5: click your own field creature = attacker
      expected = { owner: "player", zone: "field" };
    } else if (tutorialStep === 6) {
      // Step 6: click enemy creature = target
      expected = { owner: "enemy", zone: "field" };
    }

    setTutorialExpectedClick(expected);

    // Debug: see what tutorial is expecting
    if (expected) {
      console.log(
        "[Tutorial] Step",
        tutorialStep,
        "expects click =>",
        expected
      );
    } else {
      console.log("[Tutorial] Step", tutorialStep, "does not expect clicks.");
    }
  }, [tutorialStep, tutorialEnabled, isTutorialActive]);

  // ========================================================================
  // 2) Progress tutorial based on ACTUAL creatures on the field
  // ========================================================================
  useEffect(() => {
    if (!tutorialEnabled || !isTutorialActive) return;

    // Some decks use fixed 3-slot arrays with nulls; strip those out.
    const fieldCount = (playerField || []).filter(
      (u) => u !== null && u !== undefined
    ).length;

    if (tutorialStep === 2 && fieldCount >= 1) {
      console.log(
        "[Tutorial] Detected",
        fieldCount,
        "creature(s) on field → advancing to Step 3."
      );
      setTutorialStep(3);
    } else if (tutorialStep === 3 && fieldCount >= 2) {
      console.log(
        "[Tutorial] Detected",
        fieldCount,
        "creatures on field → advancing to Step 4."
      );
      setTutorialStep(4);
    } else if (tutorialStep === 4 && fieldCount >= 3) {
      console.log(
        "[Tutorial] Detected",
        fieldCount,
        "creatures on field → advancing to Step 5 (choose attacker)."
      );
      setTutorialStep(5);
    }
  }, [playerField, tutorialStep, tutorialEnabled, isTutorialActive]);

  // ========================================================================
  // 3) Gated click handler – the ONLY place we forward clicks to parent
  // ========================================================================
  const handleCardClick = (info) => {
    console.log("[Click] Raw click from 3D scene:", info);
    console.log(
      "[Click] Tutorial active?",
      isTutorialActive,
      "| step:",
      tutorialStep,
      "| expects:",
      tutorialExpectedClick
    );

    // If tutorial is disabled or finished, just forward everything
    if (!tutorialEnabled || !isTutorialActive) {
      console.log("[Click] Tutorial inactive → forwarding to parent.");
      onCardClick?.(info);
      return;
    }

    // If this step doesn't expect interaction, ignore click
    if (!tutorialExpectedClick) {
      console.log(
        "[Click] Tutorial step",
        tutorialStep,
        "is not expecting clicks → ignoring."
      );
      return;
    }

    const matchesOwner =
      info && info.owner === tutorialExpectedClick.owner;
    const matchesZone = info && info.zone === tutorialExpectedClick.zone;

    if (!matchesOwner || !matchesZone) {
      console.log(
        "[Click] Wrong zone/owner. expected=",
        tutorialExpectedClick,
        "got=",
        info
      );
      setTutorialHint("That's not where the tutorial is pointing. Try again.");
      return;
    }

    // If we reach this point, click is ACCEPTED by the tutorial.
    setTutorialHint("");

    // ---------------------- Step-specific logic -------------------------- //
    // NOTE: none of this directly moves cards; it just forwards the click
    // to the parent and updates tutorial state where needed.

    // Step 5 – choose attacker (field card)
    if (tutorialStep === 5) {
      const attackerUnit = (playerField || []).find(
        (u) => u && u.id === info.unitId
      );
      if (attackerUnit) {
        setDuelAttacker({ ...attackerUnit });
      }
      console.log("[Click] Accepted attacker selection → forwarding to parent.");
      onCardClick?.(info);
      setTutorialStep(6); // wait for target
      return;
    }

    // Step 6 – choose defender (enemy field card)
    if (tutorialStep === 6) {
      const defenderUnit = (enemyField || []).find(
        (u) => u && u.id === info.unitId
      );
      if (defenderUnit) {
        setDuelDefender({ ...defenderUnit });
      }
      console.log("[Click] Accepted target selection → forwarding to parent.");
      onCardClick?.(info);
      setShowDuelOverlay(true);
      setTutorialStep(7); // next text panel explains clash
      return;
    }

    // Steps 2–4 – playing from HAND.
    // We simply forward clicks; the EFFECT (summon) must be implemented
    // by the parent battle logic. Tutorial progression is handled by
    // the useEffect that watches playerField length.
    if (tutorialStep === 2 || tutorialStep === 3 || tutorialStep === 4) {
      console.log(
        "[Click] Accepted hand click during step",
        tutorialStep,
        "→ forwarding to parent. Tutorial will advance once parent actually moves the card to the field."
      );
      onCardClick?.(info);
      return;
    }

    // Any other step (e.g. 0, 1, 7+, if we ever allow clicks there)
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
  // 5) Derived camera position (smooth-ish presets)
  // ========================================================================
  const baseDistance = 20;
  const distanceMultiplier = 3.0 - zoomLevel * 2.0;
  const cameraX =
    Math.sin(cameraRotation) * baseDistance * distanceMultiplier;
  const cameraZ =
    Math.cos(cameraRotation) * baseDistance * distanceMultiplier;
  const cameraY = 12 + (zoomLevel - 0.6) * 4;
  const cameraPosition = [cameraX, cameraY, cameraZ];
  const cameraFov = 60 - zoomLevel * 20;

  // ========================================================================
  // 6) RENDER
  // ========================================================================
  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      {/* -------------------------------------------------------------------
       * RIGHT PANEL – camera debug + settings + tutorial toggle
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
        {/* Coordinates debug block */}
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
            <div>X: {cameraPos.x.toFixed(3)}</div>
            <div>Y: {cameraPos.y.toFixed(3)}</div>
            <div>Z: {cameraPos.z.toFixed(3)}</div>
            <div
              style={{
                marginTop: 8,
                borderTop: "1px solid #4dd0ff",
                paddingTop: 8,
              }}
            >
              <div>FOV: {cameraPos.fov.toFixed(1)}°</div>
              <div>Zoom: {zoomLevel.toFixed(2)}</div>
              <div>
                Rotation: {(cameraRotation * (180 / Math.PI)).toFixed(1)}°
              </div>
              <div>
                Distance: {(distanceMultiplier * baseDistance).toFixed(2)}
              </div>
            </div>
          </div>
        )}

        {/* Zoom + rotation buttons */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            <button
              onClick={() => setZoomLevel(0.6)}
              title="Zoom Out - see full board"
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 6,
                backgroundColor: zoomLevel === 0.6 ? "#00ff41" : "#1a1a2e",
                border: `2px solid ${
                  zoomLevel === 0.6 ? "#00ff41" : "#4dd0ff"
                }`,
                color: zoomLevel === 0.6 ? "#000" : "#4dd0ff",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: "bold",
                boxShadow:
                  zoomLevel === 0.6
                    ? "0 0 15px #00ff41, inset 0 0 8px rgba(0,255,65,0.3)"
                    : "0 0 8px rgba(77,208,255,0.3)",
              }}
            >
              − ZOOM OUT
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              title="Default view"
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 6,
                backgroundColor: zoomLevel === 1 ? "#00ff41" : "#1a1a2e",
                border: `2px solid ${
                  zoomLevel === 1 ? "#00ff41" : "#ff9500"
                }`,
                color: zoomLevel === 1 ? "#000" : "#ff9500",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: "bold",
                boxShadow:
                  zoomLevel === 1
                    ? "0 0 15px #00ff41, inset 0 0 8px rgba(0,255,65,0.3)"
                    : "0 0 8px rgba(255,149,0,0.3)",
              }}
            >
              ◎ DEFAULT
            </button>
            <button
              onClick={() => setZoomLevel(1.5)}
              title="Zoom In - close to action"
              style={{
                width: "100%",
                padding: 10,
                borderRadius: 6,
                backgroundColor: zoomLevel === 1.5 ? "#00ff41" : "#1a1a2e",
                border: `2px solid ${
                  zoomLevel === 1.5 ? "#00ff41" : "#ff6b9d"
                }`,
                color: zoomLevel === 1.5 ? "#000" : "#ff6b9d",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: "bold",
                boxShadow:
                  zoomLevel === 1.5
                    ? "0 0 15px #00ff41, inset 0 0 8px rgba(0,255,65,0.3)"
                    : "0 0 8px rgba(255,107,157,0.3)",
              }}
            >
              + ZOOM IN
            </button>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <button
              onClick={() =>
                setCameraRotation((prev) => prev - Math.PI / 4)
              }
              title="Look left"
              style={{
                flex: 1,
                padding: 10,
                borderRadius: 6,
                backgroundColor: "#1a1a2e",
                border: "2px solid #ff6b6b",
                color: "#ff6b6b",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: "bold",
                boxShadow: "0 0 8px rgba(255,107,107,0.3)",
              }}
            >
              ◀ LEFT
            </button>
            <button
              onClick={() =>
                setCameraRotation((prev) => prev + Math.PI / 4)
              }
              title="Look right"
              style={{
                flex: 1,
                padding: 10,
                borderRadius: 6,
                backgroundColor: "#1a1a2e",
                border: "2px solid #6bcf7f",
                color: "#6bcf7f",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: "bold",
                boxShadow: "0 0 8px rgba(107,207,127,0.3)",
              }}
            >
              ▶ RIGHT
            </button>
          </div>
        </div>

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

            {/* Language (cosmetic) */}
            <div style={{ marginBottom: 12 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: "bold",
                  color: "#4dd0ff",
                  marginBottom: 6,
                }}
              >
                🌐 Language
              </div>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                style={{
                  width: "100%",
                  padding: 6,
                  backgroundColor: "#0f0f1e",
                  border: "2px solid #4dd0ff",
                  color: "#4dd0ff",
                  borderRadius: 4,
                  cursor: "pointer",
                  fontSize: 11,
                }}
              >
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="es">Español</option>
                <option value="de">Deutsch</option>
              </select>
            </div>

            {/* Audio volume slider – you can hook this into actual audio later */}
            <div style={{ marginBottom: 12 }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: "bold",
                  color: "#4dd0ff",
                  marginBottom: 6,
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>🔊 Audio {audioVolume}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={audioVolume}
                onChange={(e) =>
                  setAudioVolume(parseInt(e.target.value, 10))
                }
                style={{
                  width: "100%",
                  height: 5,
                  borderRadius: 3,
                  cursor: "pointer",
                }}
              />
            </div>

            {/* Coordinates toggle + reset camera */}
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
              <button
                onClick={() => {
                  setZoomLevel(0.6);
                  setCameraRotation(0);
                }}
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
                  marginBottom: 6,
                }}
              >
                Reset Camera
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
                When enabled, the first battle of Chapter 1 – Darkwood will be
                guided step by step. Once you're comfortable, turn this off.
              </div>
            </div>

            {/* Extra placeholders for "Abandon battle" / "Go home" buttons */}
            <div style={{ borderTop: "2px solid #ff9500", paddingTop: 12 }}>
              <button
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
          camera={{ position: cameraPosition, fov: cameraFov }}
          style={{ position: "relative", zIndex: 1 }}
        >
          {/* CameraController keeps cameraPos state updated for the debug panel */}
          <CameraController
            zoomLevel={zoomLevel}
            cameraRotation={cameraRotation}
            onCameraUpdate={setCameraPos}
          />

          {/* Full 3D scene contents */}
          <BattlefieldScene
            playerField={playerField}
            enemyField={enemyField}
            playerHand={playerHand}
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
            zoomLevel={zoomLevel}
            cameraRotation={cameraRotation}
            tutorialExpectedClick={tutorialExpectedClick}
            isTutorialActive={isTutorialActive}
            tutorialStep={tutorialStep}
          />

          {/* OrbitControls: mouse drag rotates, scroll zooms (limited by distance) */}
          <OrbitControls
            enablePan={false}
            maxPolarAngle={Math.PI * 0.48}
            minDistance={14 - (1 - zoomLevel) * 4}
            maxDistance={20 + (1 - zoomLevel) * 6}
            enableRotate={true}
            minAzimuthAngle={-Math.PI / 2}
            maxAzimuthAngle={Math.PI / 2}
          />
        </Canvas>
      </div>

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

      {showDuelOverlay && (
        <DuelOverlay
          attacker={duelAttacker}
          defender={duelDefender}
          onClose={() => setShowDuelOverlay(false)}
        />
      )}
    </div>
  );
}
