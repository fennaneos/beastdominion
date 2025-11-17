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
 *
 * 4. Handles a simple battle loop:
 *    - Click hand card → summon to first empty slot.
 *    - Click your field card → choose attacker.
 *    - Click enemy field card → resolve one attack exchange.
 *
 * 5. Detects when the battle is over:
 *    - Enemy has no creatures left → Victory.
 *    - Player has no hand AND no field creatures → Defeat.
 *    - Shows medieval Victory/Defeat panel and can notify parent via
 *      onBattleComplete(result, levelInfo).
 * ============================================================================
 */

import React, { useMemo, useState, useEffect } from "react";
import Battlefield3D from "./Battlefield3D.jsx";
import TutorialOverlay from "./TutorialOverlay.jsx"; // currently managed in Battlefield3D
import "./BattleScreen.css";
import "./TutorialOverlay.css";

/* ------------------------------------------------------------------------- */
/* 1. Helper: create a unit/card object                                      */
/* ------------------------------------------------------------------------- */

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
    owner: partial.owner ?? "player",
    ...partial,
  };
}

/* ------------------------------------------------------------------------- */
/* 2. Helper: evolve a deck card for battle based on upgrades                */
/* ------------------------------------------------------------------------- */

function evolveCardForBattle(card, upgradesMap = {}) {
  const steps = upgradesMap[card.id] || 0;
  const baseLevel = card.level ?? card.stars ?? 1;
  const maxLevel = card.maxLevel ?? 5;
  const level = Math.min(baseLevel + steps, maxLevel);

  const atkBase = card.baseAttack ?? card.attack ?? 1;
  const hpBase = card.baseHealth ?? card.health ?? 1;
  const atkPer = card.attackPerLevel ?? 1;
  const hpPer = card.healthPerLevel ?? 1;
  const delta = level - baseLevel;

  return {
    ...card,
    level,
    attack: atkBase + delta * atkPer,
    health: hpBase + delta * hpPer,
  };
}

/* ------------------------------------------------------------------------- */
/* 3. Initial demo setup (used for tutorial / fallback)                      */
/* ------------------------------------------------------------------------- */

const INITIAL_PLAYER_HAND = [
  createUnit({
    name: "Chainborn Whelp",
    race: "dragon",
    attack: 2,
    health: 3,
    maxHealth: 3,
    rarity: "common",
    image: "/src/assets/chainbornwhelp-lvl1.png",
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

// Two enemy cards for tutorial/demo
const INITIAL_ENEMY_FIELD = [
  createUnit({
    name: "Redridge Hound",
    race: "dog",
    attack: 4,
    health: 2,
    maxHealth: 4,
    rarity: "epic",
  }),
  createUnit({
    name: "Redridge Hound",
    race: "dog",
    attack: 4,
    health: 2,
    maxHealth: 4,
    rarity: "epic",
  }),
  null,
];

/* ------------------------------------------------------------------------- */
/* 4. BattleScreen component                                                 */
/* ------------------------------------------------------------------------- */

export default function BattleScreen({
  playerDeck = [],
  upgrades = {},
  levelInfo,
  onExitBattle,
  onBattleComplete,
}) {
  // Tutorial = only Darkwood chapter level 0
  const isTutorial =
    levelInfo?.chapterId === "darkwood" &&
    (levelInfo?.levelId === 0 || levelInfo?.level?.id === 0);

  /**
   * Build initial units for the player based on the real deck and upgrades.
   */
  const buildUnitsFromDeck = () => {
    const deckToUse = isTutorial && playerDeck.length === 0 ? null : playerDeck;

    if (!deckToUse || deckToUse.length === 0) {
      return {
        hand: INITIAL_PLAYER_HAND,
        field: [null, null, null],
      };
    }

    const toUnit = (card) => {
      const evolved = evolveCardForBattle(card, upgrades);
      return createUnit({
        name: evolved.name,
        cost: evolved.cost,
        attack: evolved.attack,
        health: evolved.health,
        maxHealth: evolved.health,
        race: evolved.race,
        rarity: evolved.rarity,
        stars: evolved.stars,
        text: evolved.text,
        image: evolved.image,
        imageTop: evolved.imageTop,
        owner: "player",
        sourceCardId: evolved.id,
        level: evolved.level,
      });
    };

    const deckUnits = deckToUse.map(toUnit);
    const handSize = Math.min(3, deckUnits.length);
    const hand = deckUnits.slice(0, handSize);

    return {
      hand,
      field: [null, null, null],
    };
  };

  /* ----- Core board state ------------------------------------------------ */

  const [playerHand, setPlayerHand] = useState(() => buildUnitsFromDeck().hand);
  const [playerField, setPlayerField] = useState(
    () => buildUnitsFromDeck().field
  );

  const [enemyField, setEnemyField] = useState(() => INITIAL_ENEMY_FIELD);
  const [playerGraveyard, setPlayerGraveyard] = useState([]);
  const [enemyGraveyard, setEnemyGraveyard] = useState([]);

  /* ----- Battle flow + animation state ---------------------------------- */

  const [isPlayerTurn, setIsPlayerTurn] = useState(true);
  const [battlePhase, setBattlePhase] = useState("summonOrAttack");

  const [selectedAttackerId, setSelectedAttackerId] = useState(null);
  const [selectedTargetId, setSelectedTargetId] = useState(null);
  const [attackingUnitId, setAttackingUnitId] = useState(null);
  const [dyingUnits, setDyingUnits] = useState([]);

  const [attackAnimations, setAttackAnimations] = useState([]);
  const [damageEffects, setDamageEffects] = useState([]);

  const [logLines, setLogLines] = useState([]);

  const [battleResult, setBattleResult] = useState(null);
  const [hasReportedResult, setHasReportedResult] = useState(false);

  const pushLog = (text) => {
    setLogLines((prev) => [...prev, text]);
  };

  // Rebuild units if deck/upgrades change
  useEffect(() => {
    const { hand, field } = buildUnitsFromDeck();
    setPlayerHand(hand);
    setPlayerField(field);
    setPlayerGraveyard([]);
    setSelectedAttackerId(null);
    setBattlePhase("summonOrAttack");
    pushLog("A new deck has been loaded for this battle.");
  }, [playerDeck, upgrades]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ----------------------------------------------------------------------- */
  /* Helpers: find unit, summon, resolve attack, death animations            */
  /* ----------------------------------------------------------------------- */

  const findUnitOnField = (owner, unitId) => {
    if (owner === "player") {
      const index = playerField.findIndex((u) => u && u.id === unitId);
      return index === -1 ? null : { owner, index, unit: playerField[index] };
    } else {
      const index = enemyField.findIndex((u) => u && u.id === unitId);
      return index === -1 ? null : { owner, index, unit: enemyField[index] };
    }
  };

  const summonFromHandToField = (unitId) => {
    setPlayerHand((prevHand) => {
      const idxInHand = prevHand.findIndex((u) => u && u.id === unitId);
      if (idxInHand === -1) return prevHand;

      const card = prevHand[idxInHand];

      setPlayerField((prevField) => {
        const slotIndex = prevField.findIndex((slot) => slot == null);
        if (slotIndex === -1) {
          pushLog("No empty frontline slot to summon onto.");
          return prevField;
        }

        const newField = [...prevField];
        newField[slotIndex] = card;
        pushLog(`You summoned ${card.name} onto slot ${slotIndex + 1}.`);
        return newField;
      });

      const newHand = [...prevHand];
      newHand.splice(idxInHand, 1);
      return newHand;
    });
  };

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

    setAttackAnimations([
      {
        id: `atk_${Date.now()}`,
        attackerId: attacker.id,
        targetId: defender.id,
        fromOwner: attackerOwner,
        toOwner: defenderOwner,
      },
    ]);

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

    setAttackingUnitId(attacker.id);

    const attackerNewHp = Math.max((attacker.health ?? 0) - damageToAttacker, 0);
    const defenderNewHp = Math.max((defender.health ?? 0) - damageToDefender, 0);

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

    const unitsToDie = [];
    if (attackerNewHp <= 0) unitsToDie.push(attacker.id);
    if (defenderNewHp <= 0) unitsToDie.push(defender.id);

    if (unitsToDie.length > 0) {
      setDyingUnits((prev) => [...prev, ...unitsToDie]);
    }

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

    setTimeout(() => {
      setAttackAnimations([]);
      setDamageEffects([]);
      setAttackingUnitId(null);
      setSelectedAttackerId(null);
      setSelectedTargetId(null);
      setBattlePhase("summonOrAttack");
    }, 700);
  };

  const handleDeathComplete = (unitId) => {
    setDyingUnits((prev) => prev.filter((id) => id !== unitId));
  };

  /* ----------------------------------------------------------------------- */
  /* Click handler from 3D                                                   */
  /* ----------------------------------------------------------------------- */

  const handle3DCardClick = (info) => {
    if (battleResult) return;
    if (!info) return;

    const { owner, zone, unitId } = info;

    if (owner === "player" && zone === "hand" && isPlayerTurn) {
      summonFromHandToField(unitId);
      return;
    }

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
  };

  /* ----------------------------------------------------------------------- */
  /* Detect battle end                                                       */
  /* ----------------------------------------------------------------------- */

  useEffect(() => {
    if (battleResult) return;

    const playerAlive =
      playerField.some((slot) => slot != null) || playerHand.length > 0;
    const enemyAlive = enemyField.some((slot) => slot != null);

    if (!enemyAlive && playerAlive) {
      setBattleResult("victory");
    } else if (!playerAlive && enemyAlive) {
      setBattleResult("defeat");
    }
  }, [playerField, playerHand, enemyField, battleResult]);

  useEffect(() => {
    if (!battleResult || hasReportedResult) return;
    if (typeof onBattleComplete === "function") {
      onBattleComplete(battleResult, levelInfo);
    }
    setHasReportedResult(true);
  }, [battleResult, hasReportedResult, onBattleComplete, levelInfo]);

  /* ----------------------------------------------------------------------- */
  /* Derived stats + reset                                                   */
  /* ----------------------------------------------------------------------- */

  const battleStats = useMemo(() => {
    const totalDamageDealt = 0;
    const totalDamageTaken = 0;
    const cardsDefeated =
      (playerGraveyard?.length || 0) + (enemyGraveyard?.length || 0);
    return {
      totalDamageDealt,
      totalDamageTaken,
      cardsDefeated,
      duration: 0,
      perfectVictory: false,
      experienceGained: 0,
    };
  }, [playerGraveyard, enemyGraveyard]);

  const handleResetBattle = () => {
    const { hand, field } = buildUnitsFromDeck();
    setPlayerHand(hand);
    setPlayerField(field);
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
    setBattleResult(null);
    setHasReportedResult(false);
  };

  /* ----------------------------------------------------------------------- */
  /* Render                                                                  */
  /* ----------------------------------------------------------------------- */

  return (
    <div
      className="battle-screen-container"
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
          levelInfo={levelInfo}
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

        <div style={{ marginBottom: 12, fontSize: 13 }}>
          <div>Turn: {isPlayerTurn ? "You" : "Enemy"}</div>
          <div>Phase: {battlePhase}</div>
          <div style={{ marginTop: 4, fontSize: 12, opacity: 0.8 }}>
            {battlePhase === "summonOrAttack" &&
              "Your turn – click a hand card to summon, or a field card to attack."}
            {battlePhase === "selectTarget" &&
              "Choose an enemy creature to attack."}
            {battlePhase === "resolving" && "Resolving the clash..."}
          </div>
        </div>

        <div style={{ marginBottom: 12, fontSize: 13 }}>
          <div style={{ fontWeight: "bold", marginBottom: 4 }}>Graveyard</div>
          <div>Yours: {playerGraveyard.length} cards</div>
          <div>Enemy: {enemyGraveyard.length} cards</div>
        </div>

        <div style={{ marginBottom: 12, fontSize: 13 }}>
          <div style={{ fontWeight: "bold", marginBottom: 4 }}>
            Battle Stats
          </div>
          <div>Damage Dealt: {battleStats.totalDamageDealt}</div>
          <div>Damage Taken: {battleStats.totalDamageTaken}</div>
          <div>Cards Defeated: {battleStats.cardsDefeated}</div>
        </div>

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

        <div style={{ marginTop: 12 }}>
          <button
            onClick={handleResetBattle}
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

      {/* VICTORY / DEFEAT OVERLAY ********************************************/}
      {battleResult && (
        <div className="battle-result-overlay">
          <div className="battle-result-panel">
            <div className="battle-result-header">
              {battleResult === "victory" ? "Victory" : "Defeat"}
            </div>

            <p className="battle-result-text">
              {battleResult === "victory"
                ? "Your beasts stand triumphant. Bards will sing of this clash in smoky taverns."
                : "Your forces have fallen. The wilds do not forgive weakness… but they reward those who return stronger."}
            </p>

            <div className="battle-result-actions">
              <button
                className="battle-result-btn battle-result-btn-primary"
                onClick={onExitBattle}
              >
                {battleResult === "victory" ? "Return to Map" : "Retreat to Camp"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
