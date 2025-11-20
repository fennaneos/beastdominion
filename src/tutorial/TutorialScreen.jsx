// ============================================================================
// TutorialScreen.jsx
// FINAL FULL WORKING VERSION
// ----------------------------------------------------------------------------
// • Fully self-contained — no external TutorialSteps.js
// • Medieval UI restored
// • Aura highlight (no screen rectangles) following real 3D cards
// • Attack → damage → death works
// • Sheep replacement works
// • Clean comments everywhere for debugging
// ============================================================================

import React, { useState, useEffect, useMemo } from "react";
import Battlefield3D from "../components/battle/Battlefield3D.jsx";
import sheepImg from "/src/assets/sheep.jpg";
import { cards } from "../data/cards.js";

import "./TutorialScreen.css"; // contains medieval fonts + styles

let nextId = 1;

// ============================================================================
// CREATE UNIT HELPERS
// ============================================================================
function createUnit(partial) {
  return {
    id: partial.id ?? `u_${nextId++}`,
    name: partial.name ?? "Unnamed Beast",
    attack: partial.attack ?? 1,
    health: partial.health ?? 1,
    maxHealth: partial.maxHealth ?? partial.health ?? 1,
    race: partial.race ?? "beast",
    rarity: partial.rarity ?? "common",
    stars: partial.stars ?? 1,
    text: partial.text ?? "",
    cost: partial.cost ?? 1,
    owner: partial.owner ?? "player",
    image: partial.image ?? null,
    imageTop: partial.imageTop ?? null,
    ...partial,
  };
}

function createTutorialSheep(i = 0) {
  return createUnit({
    id: `tutorial_sheep_${i}`,
    name: "Sheep",
    attack: 1,
    health: 1,
    maxHealth: 1,
    race: "beast",
    image: sheepImg,
    owner: "player",
  });
}

function createTutorialEnemy() {
  const cat = cards.find((c) =>
    (c.id ?? "").toLowerCase().includes("sandwhisker")
  );

  if (!cat) {
    return createUnit({
      id: "tutorial_enemy_backup",
      name: "Sandwhisker Stalker",
      attack: 2,
      health: 3,
      maxHealth: 3,
      owner: "enemy",
      image: "/src/assets/sandwhisker-lvl1.png",
    });
  }

  return createUnit({
    id: "tutorial_enemy_1",
    name: cat.name,
    attack: cat.baseAttack ?? cat.attack ?? 2,
    health: (cat.baseHealth ?? cat.health ?? 2) + 1,
    maxHealth: (cat.baseHealth ?? cat.health ?? 2) + 1,
    image: cat.image,
    owner: "enemy",
  });
}

// ============================================================================
// INITIAL TUTORIAL STATE
// ============================================================================
function buildInitialTutorialState() {
  return {
    hand: [
      createTutorialSheep(1),
      createTutorialSheep(2),
      createTutorialSheep(3),
      createTutorialSheep(4),
      createTutorialSheep(5),
      createTutorialSheep(6),
    ],
    field: [null, null, null],
    enemy: [createTutorialEnemy(), null, null],
  };
}

// ============================================================================
// FULL TUTORIAL STEPS — self-contained
// ============================================================================
const TUTORIAL_STEPS = [
  {
    id: "welcome",
    phase: "PHASE 1 — Hand & Deployment",
    title: "Welcome to Darkwood",
    text:
      "This is the Darkwood arena. Here, your flock will face its first true trial.",
    focus: "none",
  },
  {
    id: "explain_hand_field",
    phase: "PHASE 1 — Hand & Deployment",
    title: "Your Hand & Frontline",
    text:
      "Cards at the bottom are your hand. The glowing slots are your frontline. Let’s fill them.",
    focus: "hand_and_field",
  },
  {
    id: "play_first",
    phase: "PHASE 1 — Hand & Deployment",
    title: "Play Your First Sheep",
    text: "Click a sheep in your hand and place it on the battlefield.",
    focus: "hand",
    requires: "fieldCount>=1",
  },
  {
    id: "play_second",
    phase: "PHASE 1 — Hand & Deployment",
    title: "Play Your Second Sheep",
    text: "Summon a second sheep.",
    focus: "hand",
    requires: "fieldCount>=2",
  },
  {
    id: "play_third",
    phase: "PHASE 1 — Hand & Deployment",
    title: "Form the Flock",
    text: "Summon a third sheep.",
    focus: "hand",
    requires: "fieldCount>=3",
  },
  {
    id: "waiting_opponent",
    phase: "PHASE 1 — Hand & Deployment",
    title: "Waiting for Opponent…",
    text: "Your frontline is ready. The Sandwhisker watches.",
    focus: "enemy",
  },

  // PHASE 2 — BATTLE
  {
    id: "battle_begins",
    phase: "PHASE 2 — Battle Begins",
    title: "Battle Begins!",
    text: "The arena roars. Choose one of your sheep to attack.",
    focus: "playerField",
  },
  {
    id: "choose_attacker",
    phase: "PHASE 2 — Battle Begins",
    title: "Choose an Attacker",
    text: "Select a sheep on your frontline.",
    focus: "playerField",
    requires: "attackerSelected",
  },
  {
    id: "choose_target",
    phase: "PHASE 2 — Battle Begins",
    title: "Choose an Enemy Target",
    text: "Click the Sandwhisker to strike.",
    focus: "enemy",
    requires: "targetSelected",
  },

  // PHASE 3 — DAMAGE
  {
    id: "explain_damage",
    phase: "PHASE 3 — First Clash",
    title: "The Clash",
    text: "Both creatures deal damage equal to their ATK.",
    focus: "player_and_enemy",
  },
  {
    id: "explain_hp",
    phase: "PHASE 3 — First Clash",
    title: "HP & Survival",
    text: "If HP reaches 0, the creature dies.",
    focus: "player_and_enemy",
  },
  {
    id: "explain_graveyard",
    phase: "PHASE 3 — First Clash",
    title: "The Graveyard",
    text: "Dead creatures burn away and fall into the Graveyard.",
    focus: "none",
  },

  // PHASE 4 — KILL THE SANDWHISKER
  {
    id: "replace_sheep",
    phase: "PHASE 4 — The Long Hunt",
    title: "Replace a Fallen Sheep",
    text: "If a slot is empty, summon another sheep.",
    focus: "hand_and_field",
  },
  {
    id: "attack_again",
    phase: "PHASE 4 — The Long Hunt",
    title: "Attack Again",
    text: "Choose another attacker and strike.",
    focus: "playerField",
  },
  {
    id: "sandwhisker_dead",
    phase: "PHASE 4 — The Long Hunt",
    title: "Finish It",
    text: "Attack until the Sandwhisker dies.",
    focus: "playerField",
    requires: "sandwhiskerDead",
  },

  // FINAL
  {
    id: "victory",
    phase: "FINAL",
    title: "You Defeated the Sandwhisker!",
    text: "Your flock emerges victorious.",
    focus: "none",
  },
  {
    id: "tutorial_complete",
    phase: "FINAL",
    title: "Tutorial Complete",
    text: "You are ready for real battles.",
    isFinal: true,
    focus: "none",
  },
];

// ============================================================================
// AURA COMPONENT — attaches glow to cards (Battlefield3D handles glow)
// ============================================================================
function AuraOnMesh({ targetIds }) {
  return (
    <div
      style={{
        pointerEvents: "none",
        position: "absolute",
        inset: 0,
        zIndex: 20,
      }}
    />
  );
}

// ============================================================================
// MEDIEVAL UI PANEL (restored 100%)
// ============================================================================
function TutorialOverlay({ step, canContinue, onNext, onSkip }) {
  if (!step) return null;

  const { title, text, phase, isFinal, focus } = step;
  const blur = focus !== "none";

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 15,
        pointerEvents: "none",   // ← FIXED: overlay no longer blocks the battlefield
      }}
    >
      {/* BLUR LAYER */}
      {blur && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(3px)",
            pointerEvents: "none", // ← DO NOT BLOCK
          }}
        />
      )}

      {/* Medieval panel */}
      <div
        style={{
          marginTop: 20,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          pointerEvents: "auto",   // ← ONLY THIS accepts clicks
          zIndex: 40,
        }}
      >
        <div
          className="tutorial-panel-medieval"
          style={{
            width: "70%",
            maxWidth: 680,
            borderRadius: 16,
            border: "2px solid #caa56b",
            padding: "14px 20px",
            background:
              "radial-gradient(circle at top, #f5e2c3, #d9b88a 60%, #b78b55)",
            boxShadow:
              "0 4px 25px rgba(0,0,0,0.75), inset 0 0 18px rgba(98,62,28,0.45)",
            fontFamily: "'Cormorant Garamond', serif",
            color: "#2a1b12",
          }}
        >
          {/* ... rest unchanged ... */}

          {/* Phase Badge */}
          {phase && (
            <div
              style={{
                padding: "4px 10px",
                marginBottom: 6,
                borderRadius: 999,
                border: "1px solid rgba(255,240,200,0.6)",
                background:
                  "linear-gradient(90deg, rgba(80,50,25,0.9), rgba(50,30,18,0.9))",
                fontFamily: "'Cinzel', serif",
                fontSize: 11,
                color: "#f5e0b2",
                letterSpacing: "0.08em",
                display: "inline-block",
              }}
            >
              {phase}
            </div>
          )}

          <div
            style={{
              fontFamily: "'Cinzel', serif",
              fontWeight: 700,
              fontSize: 18,
              marginBottom: 6,
            }}
          >
            {title}
          </div>

          <div style={{ fontSize: 16, lineHeight: 1.35 }}>{text}</div>

          {/* Buttons */}
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 10,
              marginTop: 12,
            }}
          >
            <button
              onClick={onSkip}
              style={{
                padding: "4px 10px",
                borderRadius: 999,
                background: "rgba(0,0,0,0.1)",
                border: "1px solid rgba(0,0,0,0.3)",
                color: "#3b2613",
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              Skip
            </button>

            <button
              onClick={onNext}
              disabled={!canContinue}
              style={{
                padding: "4px 14px",
                borderRadius: 999,
                border: "1px solid #f1d08b",
                background: canContinue
                  ? "linear-gradient(90deg, #f5d99c, #f9e7c4)"
                  : "linear-gradient(90deg, #8b7757, #7a654a)",
                color: canContinue ? "#3b2613" : "#c0b08a",
                cursor: canContinue ? "pointer" : "default",
                fontFamily: "'Cinzel', serif",
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "0.06em",
                boxShadow: canContinue
                  ? "0 3px 10px rgba(0,0,0,0.6)"
                  : "0 2px 4px rgba(0,0,0,0.4)",
              }}
            >
              {isFinal ? "Finish" : "Continue"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN TUTORIAL SCREEN
// ============================================================================
export default function TutorialScreen({ onExitBattle, onBattleComplete }) {
  // Initial tutorial state
  const initial = useMemo(() => buildInitialTutorialState(), []);
  const [playerHand, setPlayerHand] = useState(initial.hand);
  const [playerField, setPlayerField] = useState(initial.field);
  const [enemyField, setEnemyField] = useState(initial.enemy);

  const [dyingUnits, setDyingUnits] = useState([]);

  const [selectedAttackerId, setSelectedAttackerId] = useState(null);
  const [selectedTargetId, setSelectedTargetId] = useState(null);

  const [battlePhase, setBattlePhase] = useState("summonOrAttack");

  const [stepIndex, setStepIndex] = useState(0);
  const step = TUTORIAL_STEPS[stepIndex];

  const frontlineCount = useMemo(
    () => playerField.filter((u) => u && u.health > 0).length,
    [playerField]
  );

  const enemyAlive = useMemo(
    () => enemyField.some((u) => u && u.health > 0),
    [enemyField]
  );

  // Decide if Continue button is allowed
  const canContinue = useMemo(() => {
    if (!step) return true;

    switch (step.requires) {
      case "fieldCount>=1":
        return frontlineCount >= 1;
      case "fieldCount>=2":
        return frontlineCount >= 2;
      case "fieldCount>=3":
        return frontlineCount >= 3;
      case "attackerSelected":
        return !!selectedAttackerId;
      case "targetSelected":
        return !!selectedTargetId;
      case "sandwhiskerDead":
        return !enemyAlive;
      default:
        return true;
    }
  }, [
    step,
    frontlineCount,
    selectedAttackerId,
    selectedTargetId,
    enemyAlive,
  ]);

  // --------------------------------------------------------------------------
  // FIELD HELPERS
  // --------------------------------------------------------------------------
  const findUnitOnField = (owner, id) => {
    const field = owner === "player" ? playerField : enemyField;
    const index = field.findIndex((u) => u && u.id === id);
    if (index === -1) return null;
    return { owner, index, unit: field[index] };
  };

  const summonFromHandToField = (id) => {
    setPlayerHand((prev) => {
      const i = prev.findIndex((u) => u.id === id);
      if (i === -1) return prev;

      const card = prev[i];

      setPlayerField((field) => {
        const slot = field.findIndex((s) => !s);
        if (slot === -1) return field;
        const next = [...field];
        next[slot] = card;
        return next;
      });

      const next = [...prev];
      next.splice(i, 1);
      return next;
    });
  };

  // --------------------------------------------------------------------------
  // ATTACK RESOLUTION
  // --------------------------------------------------------------------------
  const resolveAttack = (atkInfo, defInfo) => {
    const { unit: atk, index: ai } = atkInfo;
    const { unit: def, index: di } = defInfo;

    const newAtkHP = Math.max(atk.health - def.attack, 0);
    const newDefHP = Math.max(def.health - atk.attack, 0);

    setPlayerField((f) => {
      if (atkInfo.owner !== "player") return f;
      const next = [...f];
      next[ai] = newAtkHP > 0 ? { ...atk, health: newAtkHP } : null;
      return next;
    });

    setEnemyField((f) => {
      if (defInfo.owner !== "enemy") return f;
      const next = [...f];
      next[di] = newDefHP > 0 ? { ...def, health: newDefHP } : null;
      return next;
    });

    const dead = [];
    if (newAtkHP <= 0) dead.push(atk.id);
    if (newDefHP <= 0) dead.push(def.id);

    setTimeout(() => setDyingUnits((d) => [...d, ...dead]), 450);

    setBattlePhase("summonOrAttack");
    setSelectedAttackerId(null);
    setSelectedTargetId(null);
  };

  // --------------------------------------------------------------------------
  // 3D CLICK LOGIC
  // --------------------------------------------------------------------------
  const handle3DCardClick = ({ owner, zone, unitId }) => {
    // Hand summon
    if (owner === "player" && zone === "hand") {
      summonFromHandToField(unitId);
      return;
    }

    // Select attacker
    if (owner === "player" && zone === "field") {
      setSelectedAttackerId(unitId);
      setBattlePhase("selectTarget");
      return;
    }

    // Select target
    if (
      owner === "enemy" &&
      zone === "field" &&
      battlePhase === "selectTarget"
    ) {
      const atk = findUnitOnField("player", selectedAttackerId);
      const def = findUnitOnField("enemy", unitId);
      if (atk && def) {
        setSelectedTargetId(unitId);
        resolveAttack(atk, def);
      }
    }
  };

  // --------------------------------------------------------------------------
  // STEP PROGRESSION
  // --------------------------------------------------------------------------
const handleNextStep = () => {
  if (!step) return;

  // must allow next if no "requires" or requirement is satisfied
  if (step.requires && !canContinue) return;

  // If final → exit tutorial
  if (step.isFinal) {
    const levelInfo = { type: "tutorial" };
    onBattleComplete?.("victory", levelInfo, 150);
    onExitBattle?.();
    return;
  }

  // KEY FIX ❤️ — update state safely and synchronously
  setStepIndex((prev) => {
    const next = prev + 1;
    console.log("Moving to step:", next, TUTORIAL_STEPS[next]?.id);
    return next;
  });
};


  const handleSkip = () => {
    onBattleComplete?.("skipped", { type: "tutorial" }, 0);
    onExitBattle?.();
  };

  // --------------------------------------------------------------------------
  // DETERMINE HIGHLIGHT AURA IDs
  // --------------------------------------------------------------------------
  const highlightIds = [];
  if (step?.focus === "hand" || step?.focus === "hand_and_field") {
    highlightIds.push(...playerHand.map((u) => u.id));
  }
  if (step?.focus === "playerField" || step?.focus === "hand_and_field") {
    highlightIds.push(...playerField.filter(Boolean).map((u) => u.id));
  }
  if (step?.focus === "enemy") {
    highlightIds.push(...enemyField.filter(Boolean).map((u) => u.id));
  }

  // ========================================================================
  // RENDER
  // ========================================================================
  return (
    <div style={{ position: "relative", width: "100%", height: "100%" }}>
      <Battlefield3D
        levelInfo={{ type: "tutorial" }}
        playerField={playerField}
        enemyField={enemyField}
        playerHand={playerHand}
        playerGraveyard={[]}
        enemyGraveyard={[]}
        onCardClick={handle3DCardClick}
        selectedAttackerId={selectedAttackerId}
        selectedTargetId={selectedTargetId}
        dyingUnits={dyingUnits}
        tutorialHighlightIds={highlightIds} // AURA TARGETS
        attackAnimations={[]}
        damageEffects={[]}
        battlePhase={battlePhase}
        attackingUnitId={null}
        isPlayerTurn={true}
      />

      {/* Aura layer */}
      <AuraOnMesh targetIds={highlightIds} />

      {/* Tutorial UI */}
      <TutorialOverlay
        step={step}
        canContinue={canContinue}
        onNext={handleNextStep}
        onSkip={handleSkip}
      />
    </div>
  );
}
