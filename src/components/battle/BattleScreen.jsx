// src/components/battle/BattleScreen.jsx
/**
 * ============================================================================
 * BATTLESCREEN - High-level battle controller (2D UI + 3D battlefield)
 * ============================================================================
 *
 * RESPONSIBILITIES
 * ----------------
 * 1. Owns the battle STATE:
 *    - player hand / field / graveyard
 *    - enemy field / graveyard
 *    - battle phase & turn
 *    - selected attacker / target
 *    - simple damage resolution + KO → graveyard
 *
 * 2. Sends that state down into <Battlefield3D />
 *    - Battlefield3D is purely a VIEW of whatever we store here.
 *
 * 3. Receives click events back from <Battlefield3D />
 *    - onCardClick({ unitId, owner: "player"|"enemy", zone: "hand"|"field" })
 *    - Here we decide *what that means* in terms of game rules.
 *
 * 4. Handles a *very simple* battle loop:
 *    - When player clicks a card in HAND and there is an empty front slot,
 *      the card is summoned to the first empty slot.
 *      (This is what the tutorial needs for steps 2–4.)
 *    - When battlePhase === "selectAttacker":
 *        click your field card → chosen as attacker.
 *    - When battlePhase === "selectTarget":
 *        click enemy field card → resolve one exchange of damage.
 *
 * NOTE
 * ----
 * All game rules here are deliberately simple and easy to replace.
 * You can swap out card data, phases, and damage logic with your real system,
 * as long as you keep the *prop shapes* passed to <Battlefield3D />.
 * ============================================================================
 */

import React, { useMemo, useState } from "react";
import Battlefield3D from "./Battlefield3D.jsx";

// ---------------------------------------------------------------------------
// 1. Helper: create a unit/card object
//    (You can delete this and plug in your own card data instead.)
// ---------------------------------------------------------------------------
let nextId = 1;
function createUnit(partial) {
  return {
    id: partial.id ?? `u_${nextId++}`,
    name: partial.name ?? "Unnamed Beast",
    cost: partial.cost ?? 1,
    attack: partial.attack ?? 1,
    health: partial.health ?? 1,
    maxHealth: partial.maxHealth ?? partial.health ?? 1,
    race: partial.race ?? "beast",
    rarity: partial.rarity ?? "common",
    stars: partial.stars ?? 1,
    text: partial.text ?? "",
    image: partial.image ?? null,
    imageTop: partial.imageTop ?? null,
    // anything extra can stay in partial
    ...partial,
  };
}

// ---------------------------------------------------------------------------
// 2. Initial debug setup
//    Replace this section with however you actually build a battle.
// ---------------------------------------------------------------------------
const INITIAL_PLAYER_HAND = [
  createUnit({
    name: "Chainborn Whelp",
    race: "dragon",
    attack: 2,
    health: 3,
    maxHealth: 3,
    rarity: "common",
  }),
  createUnit({
    name: "Nightprowler",
    race: "wolf",
    attack: 2,
    health: 2,
    maxHealth: 2,
    rarity: "rare",
  }),
  createUnit({
    name: "Embertrail Hound",
    race: "dog",
    attack: 3,
    health: 2,
    maxHealth: 2,
    rarity: "rare",
  }),
  createUnit({
    name: "Redridge Hound",
    race: "dog",
    attack: 4,
    health: 4,
    maxHealth: 4,
    rarity: "epic",
  }),
];

const INITIAL_ENEMY_FIELD = [
  createUnit({
    name: "Dunecrest King",
    race: "dragon",
    attack: 5,
    health: 5,
    maxHealth: 5,
    rarity: "epic",
  }),
  null,
  null,
];

// ---------------------------------------------------------------------------
// 3. BattleScreen component
// ---------------------------------------------------------------------------
export default function BattleScreen() {
  // ---- Core board state ----------------------------------------------------
  const [playerHand, setPlayerHand] = useState(INITIAL_PLAYER_HAND);
  const [playerField, setPlayerField] = useState([null, null, null]);
  const [enemyField, setEnemyField] = useState(INITIAL_ENEMY_FIELD);
  const [playerGraveyard, setPlayerGraveyard] = useState([]);
  const [enemyGraveyard, setEnemyGraveyard] = useState([]);

  // ---- Battle flow + animation state --------------------------------------
  const [isPlayerTurn, setIsPlayerTurn] = useState(true);

  // phases: "summonOrAttack", "selectTarget", "resolving", "enemyTurn"
  const [battlePhase, setBattlePhase] = useState("summonOrAttack");

  const [selectedAttackerId, setSelectedAttackerId] = useState(null);
  const [selectedTargetId, setSelectedTargetId] = useState(null);
  const [attackingUnitId, setAttackingUnitId] = useState(null);
  const [dyingUnits, setDyingUnits] = useState([]);

  const [attackAnimations, setAttackAnimations] = useState([]);
  const [damageEffects, setDamageEffects] = useState([]);

  // Simple text log on the right panel
  const [logLines, setLogLines] = useState([]);

  // Helper to push to log
  const pushLog = (text) => {
    setLogLines((prev) => [...prev, text]);
  };

  // -------------------------------------------------------------------------
  // 4. Game helpers: look up units by id
  // -------------------------------------------------------------------------
  const findUnitOnField = (owner, unitId) => {
    if (owner === "player") {
      const index = playerField.findIndex((u) => u && u.id === unitId);
      return index === -1 ? null : { owner, index, unit: playerField[index] };
    } else {
      const index = enemyField.findIndex((u) => u && u.id === unitId);
      return index === -1 ? null : { owner, index, unit: enemyField[index] };
    }
  };

  // -------------------------------------------------------------------------
  // 5. Summon: move card from hand → first empty player field slot
  // -------------------------------------------------------------------------
  const summonFromHandToField = (unitId) => {
    setPlayerHand((prevHand) => {
      const idxInHand = prevHand.findIndex((u) => u && u.id === unitId);
      if (idxInHand === -1) return prevHand; // nothing to do

      const card = prevHand[idxInHand];

      setPlayerField((prevField) => {
        const slotIndex = prevField.findIndex((slot) => slot == null);
        if (slotIndex === -1) {
          // no room; leave hand unchanged
          pushLog("No empty frontline slot to summon onto.");
          return prevField;
        }

        const newField = [...prevField];
        newField[slotIndex] = card;
        pushLog(`You summoned ${card.name} onto slot ${slotIndex + 1}.`);
        return newField;
      });

      // remove card from hand
      const newHand = [...prevHand];
      newHand.splice(idxInHand, 1);
      return newHand;
    });
  };

  // -------------------------------------------------------------------------
  // 6. Attack resolution: very simple exchange of damage
  // -------------------------------------------------------------------------
  const resolveAttack = (attackerInfo, defenderInfo) => {
    const { unit: attacker, owner: attackerOwner, index: attackerIndex } =
      attackerInfo;
    const { unit: defender, owner: defenderOwner, index: defenderIndex } =
      defenderInfo;

    const damageToDefender = attacker.attack ?? 0;
    const damageToAttacker = defender.attack ?? 0;

    pushLog(
      `You: ${attacker.name} hit ${defender.name} for ${damageToDefender} (and took ${damageToAttacker} in return).`
    );

    // Trigger a simple attack animation in 3D
    setAttackAnimations([
      {
        id: `atk_${Date.now()}`,
        attackerId: attacker.id,
        targetId: defender.id,
        fromOwner: attackerOwner,
        toOwner: defenderOwner,
      },
    ]);

    // Trigger damage number effects for both cards
    setDamageEffects([
      {
        id: `dmg_def_${Date.now()}`,
        targetId: defender.id,
        damage: damageToDefender,
        type: "damage",
      },
      {
        id: `dmg_att_${Date.now() + 1}`,
        targetId: attacker.id,
        damage: damageToAttacker,
        type: "damage",
      },
    ]);

    // Mark attacker as currently attacking for wiggle anim
    setAttackingUnitId(attacker.id);

    // Apply HP changes
    const attackerNewHp = Math.max((attacker.health ?? 0) - damageToAttacker, 0);
    const defenderNewHp = Math.max((defender.health ?? 0) - damageToDefender, 0);

    // Update both fields immutably
    setPlayerField((prev) => {
      if (attackerOwner !== "player") return prev;
      const next = [...prev];
      next[attackerIndex] = { ...attacker, health: attackerNewHp };
      return next;
    });

    setEnemyField((prev) => {
      if (defenderOwner !== "enemy") return prev;
      const next = [...prev];
      next[defenderIndex] = { ...defender, health: defenderNewHp };
      return next;
    });

    // KO logic → graveyard
    const unitsToDie = [];
    if (attackerNewHp <= 0) unitsToDie.push(attacker.id);
    if (defenderNewHp <= 0) unitsToDie.push(defender.id);

    if (unitsToDie.length > 0) {
      setDyingUnits((prev) => [...prev, ...unitsToDie]);
    }

    // Move dead units into graveyards & clear board slots
    setPlayerField((prev) => {
      const next = [...prev];
      unitsToDie.forEach((id) => {
        const idx = next.findIndex((u) => u && u.id === id);
        if (idx !== -1) {
          setPlayerGraveyard((gyPrev) => [...gyPrev, next[idx]]);
          next[idx] = null;
        }
      });
      return next;
    });

    setEnemyField((prev) => {
      const next = [...prev];
      unitsToDie.forEach((id) => {
        const idx = next.findIndex((u) => u && u.id === id);
        if (idx !== -1) {
          setEnemyGraveyard((gyPrev) => [...gyPrev, next[idx]]);
          next[idx] = null;
        }
      });
      return next;
    });

    // Reset transient selection / animation state after a short delay
    setTimeout(() => {
      setAttackAnimations([]);
      setDamageEffects([]);
      setAttackingUnitId(null);
      setSelectedAttackerId(null);
      setSelectedTargetId(null);
      setBattlePhase("summonOrAttack");
    }, 700);
  };

  // Called by Battlefield3D when a burning death animation finishes
  const handleDeathComplete = (unitId) => {
    setDyingUnits((prev) => prev.filter((id) => id !== unitId));
  };

  // -------------------------------------------------------------------------
  // 7. REACTION TO 3D CLICKS
  // -------------------------------------------------------------------------
  const handle3DCardClick = (info) => {
    console.log("[BattleScreen] onCardClick from 3D:", info);
    if (!info) return;

    const { owner, zone, unitId } = info;

    // -----------------------------------------------------------------------
    // A. Summon from hand: as long as it's your turn, any hand click will try
    //    to move the card onto the first empty field slot.
    //    (This is what the tutorial's steps 2–4 rely on.)
    // -----------------------------------------------------------------------
    if (owner === "player" && zone === "hand" && isPlayerTurn) {
      summonFromHandToField(unitId);
      // We do NOT change phase here. The tutorial inside Battlefield3D will
      // see the field change and advance its internal tutorialStep.
      return;
    }

    // -----------------------------------------------------------------------
    // B. Player chooses attacker from their field
    // -----------------------------------------------------------------------
    if (
      owner === "player" &&
      zone === "field" &&
      isPlayerTurn &&
      battlePhase === "summonOrAttack"
    ) {
      const infoOnField = findUnitOnField(owner, unitId);
      if (!infoOnField) return;

      setSelectedAttackerId(unitId);
      setSelectedTargetId(null);
      setBattlePhase("selectTarget");
      pushLog(`You chose ${infoOnField.unit.name} as the attacker.`);
      return;
    }

    // -----------------------------------------------------------------------
    // C. Player chooses enemy target
    // -----------------------------------------------------------------------
    if (
      owner === "enemy" &&
      zone === "field" &&
      isPlayerTurn &&
      battlePhase === "selectTarget" &&
      selectedAttackerId
    ) {
      const attackerInfo = findUnitOnField("player", selectedAttackerId);
      const defenderInfo = findUnitOnField("enemy", unitId);
      if (!attackerInfo || !defenderInfo) return;

      setSelectedTargetId(unitId);
      setBattlePhase("resolving");
      resolveAttack(attackerInfo, defenderInfo);
      return;
    }

    // Anything else (e.g. clicking own field when wrong phase) just logs
    console.log("[BattleScreen] Click ignored for current phase:", battlePhase);
  };

  // -------------------------------------------------------------------------
  // 8. Derived stats for the right panel
  // -------------------------------------------------------------------------
  const battleStats = useMemo(() => {
    const totalDamageDealt = 0; // you can track this for real later
    const totalDamageTaken = 0;
    const cardsDefeated =
      playerGraveyard.length + enemyGraveyard.length || 0;

    return {
      totalDamageDealt,
      totalDamageTaken,
      cardsDefeated,
      duration: 0,
      perfectVictory: false,
      experienceGained: 0,
    };
  }, [playerGraveyard, enemyGraveyard]);

  // -------------------------------------------------------------------------
  // 9. RENDER
  // -------------------------------------------------------------------------
  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        width: "100vw",
        background: "radial-gradient(circle at top, #1b1020, #06040a)",
        color: "#f5f5f5",
        fontFamily: "Georgia, serif",
      }}
    >
      {/* LEFT: 3D BATTLEFIELD ************************************************/}
      <div
        style={{
          flex: "0 0 70%",
          position: "relative",
          overflow: "hidden",
          padding: "16px 16px 16px 16px",
        }}
      >
        <Battlefield3D
          playerField={playerField}
          enemyField={enemyField}
          playerHand={playerHand}
          playerGraveyard={playerGraveyard}
          enemyGraveyard={enemyGraveyard}
          onCardClick={handle3DCardClick}
          selectedAttackerId={selectedAttackerId}
          selectedTargetId={selectedTargetId}
          attackingUnitId={attackingUnitId}
          dyingUnits={dyingUnits}
          onDeathComplete={handleDeathComplete}
          attackAnimations={attackAnimations}
          damageEffects={damageEffects}
          battlePhase={battlePhase}
          isPlayerTurn={isPlayerTurn}
          enableTutorial={true} // you can wire this to a setting later
        />
      </div>

      {/* RIGHT: 2D INFO PANEL ************************************************/}
      <div
        style={{
          flex: "0 0 30%",
          borderLeft: "1px solid rgba(255,255,255,0.1)",
          padding: "16px 20px",
          background: "#050509",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Top header --------------------------------------------------------*/}
        <div
          style={{
            padding: "8px 12px",
            borderRadius: 999,
            border: "1px solid rgba(255,255,255,0.15)",
            marginBottom: 16,
            textAlign: "center",
            fontSize: 13,
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            color: "#f6e0b5",
          }}
        >
          Battle prototype – Darkwood
        </div>

        {/* Turn + Phase ------------------------------------------------------*/}
        <div style={{ marginBottom: 12, fontSize: 13 }}>
          <div>Turn: {isPlayerTurn ? "You" : "Enemy"}</div>
          <div>Phase: {battlePhase}</div>
          <div style={{ marginTop: 4, fontSize: 12, opacity: 0.8 }}>
            {battlePhase === "summonOrAttack" &&
              "Your turn – click a hand card to summon, or a field card to attack."}
            {battlePhase === "selectTarget" &&
              "Choose an enemy creature to attack."}
            {battlePhase === "resolving" &&
              "Resolving the clash..."}
          </div>
        </div>

        {/* Graveyards --------------------------------------------------------*/}
        <div style={{ marginBottom: 12, fontSize: 13 }}>
          <div style={{ fontWeight: "bold", marginBottom: 4 }}>Graveyard</div>
          <div>Yours: {playerGraveyard.length} cards</div>
          <div>Enemy: {enemyGraveyard.length} cards</div>
        </div>

        {/* Simple battle stats -----------------------------------------------*/}
        <div style={{ marginBottom: 12, fontSize: 13 }}>
          <div style={{ fontWeight: "bold", marginBottom: 4 }}>
            Battle Stats
          </div>
          <div>Damage Dealt: {battleStats.totalDamageDealt}</div>
          <div>Damage Taken: {battleStats.totalDamageTaken}</div>
          <div>Cards Defeated: {battleStats.cardsDefeated}</div>
        </div>

        {/* Log ---------------------------------------------------------------*/}
        <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
          <div style={{ fontWeight: "bold", marginBottom: 4, fontSize: 13 }}>
            Log
          </div>
          <div
            style={{
              flex: 1,
              background: "rgba(5,5,12,0.9)",
              borderRadius: 8,
              padding: 8,
              fontSize: 12,
              overflowY: "auto",
              border: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {logLines.length === 0 && (
              <div style={{ opacity: 0.5 }}>No actions yet.</div>
            )}
            {logLines.map((line, idx) => (
              <div key={idx} style={{ marginBottom: 4 }}>
                • {line}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom controls ---------------------------------------------------*/}
        <div style={{ marginTop: 12 }}>
          <button
            onClick={() => {
              // quick debug reset
              setPlayerHand(INITIAL_PLAYER_HAND);
              setPlayerField([null, null, null]);
              setEnemyField(INITIAL_ENEMY_FIELD);
              setPlayerGraveyard([]);
              setEnemyGraveyard([]);
              setBattlePhase("summonOrAttack");
              setSelectedAttackerId(null);
              setSelectedTargetId(null);
              setAttackingUnitId(null);
              setDyingUnits([]);
              setAttackAnimations([]);
              setDamageEffects([]);
              setLogLines([]);
            }}
            style={{
              width: "100%",
              padding: "8px 12px",
              marginTop: 4,
              borderRadius: 999,
              border: "1px solid rgba(255,255,255,0.2)",
              background: "transparent",
              color: "#f5f5f5",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            RESET BATTLE
          </button>
        </div>
      </div>
    </div>
  );
}
