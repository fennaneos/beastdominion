// src/components/battle/BattleScreen.jsx
/**
 * ============================================================================
 * BATTLESCREEN v2
 *  - 6 vs 6 total units (6 in hand each)
 *  - Up to 3 on the battlefield per side
 *  - Medieval 3D TCG flow with:
 *      • Player chooses attacker
 *      • Arrows show all enemy targets
 *      • Player chooses target
 *      • Click ATTACK to resolve
 *  - Both cards take damage equal to the opponent’s attack
 *  - When a side has **no cards left in hand AND on field**, it loses
 * ============================================================================
 */

import React, { useEffect, useState } from "react";
import Battlefield3D from "./Battlefield3D.jsx";
import "./BattleScreen.css";
import BattlefieldAnime2D from "./BattlefieldAnime2D.jsx";
import sheepImg from "/src/assets/sheep.jpg";
import { cards } from "../../data/cards.js";

// ---------------------------------------------------------------------------
// ID + UNIT HELPERS
// ---------------------------------------------------------------------------
let nextUnitId = 1;

function createUnit(partial = {}) {
  return {
    id: partial.id ?? `u_${nextUnitId++}`,
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
    sourceCardId: partial.sourceCardId ?? null,
    ...partial,
  };
}

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

// Build up to 6 player units from deck IDs
function buildPlayerUnitsFromDeck(playerDeck = [], upgrades = {}) {
  if (!Array.isArray(playerDeck) || playerDeck.length === 0) return [];

  const deckCards = playerDeck
    .map((id) => cards.find((c) => c.id === id))
    .filter(Boolean);

  if (deckCards.length === 0) return [];

  return deckCards.slice(0, 6).map((card, index) => {
    const evolved = evolveCardForBattle(card, upgrades);

    return createUnit({
      id: `p_${card.id}_${index}_${nextUnitId++}`,
      name: evolved.name,
      cost: evolved.cost ?? card.cost ?? 1,
      attack: evolved.attack ?? card.attack ?? 1,
      health: evolved.health ?? card.health ?? 1,
      maxHealth: evolved.health ?? card.health ?? 1,
      race: evolved.race ?? card.race ?? "beast",
      rarity: evolved.rarity ?? card.rarity ?? "common",
      stars: evolved.stars ?? card.stars ?? 1,
      text: evolved.text ?? card.text ?? "",
      image: evolved.image ?? card.image ?? null,
      imageTop: evolved.imageTop ?? card.imageTop ?? null,
      owner: "player",
      sourceCardId: card.id,
    });
  });
}

// Build a 6-card enemy deck from levelInfo
function buildEnemyDeckFromLevel(levelInfo) {
  const chapterEnemies =
    levelInfo?.chapter?.enemies && Array.isArray(levelInfo.chapter.enemies)
      ? levelInfo.chapter.enemies
      : [];

  // Fallback generic enemies if level data is missing
  if (chapterEnemies.length === 0) {
    const generic = [];
    for (let i = 0; i < 6; i += 1) {
      generic.push(
        createUnit({
          id: `enemy_fallback_${i}_${nextUnitId++}`,
          name: `Wild Beast ${i + 1}`,
          attack: 2 + i,
          health: 2 + i,
          maxHealth: 2 + i,
          race: "beast",
          rarity: "common",
          owner: "enemy",
        })
      );
    }
    return generic;
  }

  const result = [];
  let idx = 0;

  while (result.length < 6) {
    const def = chapterEnemies[idx % chapterEnemies.length];
    const power = def.power ?? 4;

    result.push(
      createUnit({
        id: `enemy_${def.id || def.name}_${result.length}_${nextUnitId++}`,
        name: def.name,
        attack: Math.max(1, Math.round(power * 0.6)),
        health: Math.max(1, Math.round(power * 0.8)),
        maxHealth: Math.max(1, Math.round(power * 0.8)),
        race: def.race ?? "beast",
        rarity: "common",
        stars: 1,
        owner: "enemy",
        image: "/src/assets/default-enemy.png",
      })
    );

    idx += 1;
  }

  return result;
}

// ---------------------------------------------------------------------------
// TUTORIAL UNITS (Darkwood level 0)
// ---------------------------------------------------------------------------
function createTutorialSheep(i = 0) {
  return createUnit({
    id: `tutorial_sheep_${i}_${nextUnitId++}`,
    name: "Sheep",
    attack: 1,
    health: 1,
    maxHealth: 1,
    race: "beast",
    rarity: "common",
    stars: 1,
    image: sheepImg,
    owner: "player",
  });
}

function createTutorialEnemy(catCard) {
  if (!catCard) {
    return createUnit({
      id: `tutorial_enemy_fallback_${nextUnitId++}`,
      name: "Sandwhisker Stalker",
      attack: 2,
      health: 2,
      maxHealth: 2,
      race: "beast",
      rarity: "common",
      stars: 1,
      image: "/src/assets/sandwhisker-lvl1.png",
      owner: "enemy",
    });
  }

  return createUnit({
    id: `tutorial_enemy_${nextUnitId++}`,
    name: catCard.name,
    attack: catCard.baseAttack ?? catCard.attack ?? 2,
    health: catCard.baseHealth ?? catCard.health ?? 2,
    maxHealth: catCard.baseHealth ?? catCard.health ?? 2,
    race: catCard.race ?? "beast",
    rarity: catCard.rarity ?? "common",
    stars: catCard.stars ?? 1,
    image: catCard.image ?? "/src/assets/sandwhisker-lvl1.png",
    owner: "enemy",
  });
}

function buildTutorialInitialState() {
  const catCard = cards.find((c) =>
    (c.id ?? "").toLowerCase().includes("sandwhisker")
  );

  const enemyBoss = createTutorialEnemy(catCard);

  return {
    playerHand: [
      createTutorialSheep(1),
      createTutorialSheep(2),
      createTutorialSheep(3),
    ],
    enemyHand: [],
    playerField: [null, null, null],
    enemyField: [enemyBoss, null, null],
    playerGraveyard: [],
    enemyGraveyard: [],
  };
}

function buildNormalInitialState(playerDeck, upgrades, levelInfo) {
  const playerUnits = buildPlayerUnitsFromDeck(playerDeck, upgrades);
  const enemyUnits = buildEnemyDeckFromLevel(levelInfo);

  return {
    playerHand: playerUnits,
    enemyHand: enemyUnits,
    playerField: [null, null, null],
    enemyField: [null, null, null],
    playerGraveyard: [],
    enemyGraveyard: [],
  };
}

// ---------------------------------------------------------------------------
// MAIN COMPONENT
// ---------------------------------------------------------------------------
export default function BattleScreen({
  playerDeck = [],
  upgrades = {},
  levelInfo,
  onExitBattle,
  onBattleComplete,
}) {
  const isTutorial =
    levelInfo?.chapterId === "darkwood" &&
    (levelInfo?.levelId === 0 || levelInfo?.level?.id === 0);

  // -----------------------------------------------------------------------
  // BATTLE STATE
  // -----------------------------------------------------------------------
  const [playerHand, setPlayerHand] = useState([]);
  const [enemyHand, setEnemyHand] = useState([]);
  const [playerField, setPlayerField] = useState([null, null, null]);
  const [enemyField, setEnemyField] = useState([null, null, null]);
  const [playerGraveyard, setPlayerGraveyard] = useState([]);
  const [enemyGraveyard, setEnemyGraveyard] = useState([]);

  const [isPlayerTurn, setIsPlayerTurn] = useState(true);

  // "playerPlacement" → summon from hand
  // "selectAttacker" → choose our attacker
  // "selectTarget"   → choose enemy target + press ATTACK
  // "playerAnimating"/"enemyAnimating" → attack FX
  // "result"         → battle over
  const [battlePhase, setBattlePhase] = useState("playerPlacement");

  const [selectedAttackerId, setSelectedAttackerId] = useState(null);
  const [selectedTargetId, setSelectedTargetId] = useState(null);

  const [attackAnimations, setAttackAnimations] = useState([]);
  const [damageEffects, setDamageEffects] = useState([]);
  const [attackingUnitId, setAttackingUnitId] = useState(null);
  const [dyingUnits, setDyingUnits] = useState([]);

  const [battleResult, setBattleResult] = useState(null);
  const [hasReportedResult, setHasReportedResult] = useState(false);

  // -----------------------------------------------------------------------
  // INITIALIZE / RESET WHEN DECK OR LEVEL CHANGES
  // -----------------------------------------------------------------------
  useEffect(() => {
    const initial = isTutorial
      ? buildTutorialInitialState()
      : buildNormalInitialState(playerDeck, upgrades, levelInfo);

    setPlayerHand(initial.playerHand);
    setEnemyHand(initial.enemyHand);
    setPlayerField(initial.playerField);
    setEnemyField(initial.enemyField);
    setPlayerGraveyard(initial.playerGraveyard);
    setEnemyGraveyard(initial.enemyGraveyard);

    setIsPlayerTurn(true);
    setBattlePhase("playerPlacement");
    setSelectedAttackerId(null);
    setSelectedTargetId(null);
    setAttackAnimations([]);
    setDamageEffects([]);
    setAttackingUnitId(null);
    setDyingUnits([]);
    setBattleResult(null);
    setHasReportedResult(false);
  }, [isTutorial, playerDeck, upgrades, levelInfo?.chapterId, levelInfo?.levelId]);

  // -----------------------------------------------------------------------
  // AUTO-DEPLOY ENEMY FRONTLINE ONCE PLAYER HAS 3 UNITS
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (battlePhase !== "playerPlacement") return;
    const playerOnField = playerField.filter((u) => u).length;
    if (playerOnField < 3) return;

    // Enemy already deployed? Then just move to attacker selection.
    const enemyAlreadyDeployed = enemyField.some((u) => u);
    if (enemyAlreadyDeployed) {
      setBattlePhase("selectAttacker");
      return;
    }

    // Deploy up to 3 enemies from enemyHand to field
    const newEnemyField = [...enemyField];
    const newEnemyHand = [...enemyHand];

    for (let i = 0; i < 3 && newEnemyHand.length > 0; i += 1) {
      if (!newEnemyField[i]) {
        newEnemyField[i] = newEnemyHand.shift();
      }
    }

    setEnemyField(newEnemyField);
    setEnemyHand(newEnemyHand);
    setBattlePhase("selectAttacker");
    setIsPlayerTurn(true);
  }, [battlePhase, playerField, enemyField, enemyHand]);

  // -----------------------------------------------------------------------
  // CLICK HANDLER FROM 3D SCENE
  // -----------------------------------------------------------------------
  const handle3DCardClick = (info) => {
    if (battleResult) return;

    const { owner, zone, unitId, isTargetSelection } = info;

    // No input while enemy is acting
    if (!isPlayerTurn && !isTutorial) return;
    if (battlePhase === "playerAnimating" || battlePhase === "enemyAnimating") {
      return;
    }

    // 1) SUMMON FROM HAND DURING PLACEMENT
    if (
      owner === "player" &&
      zone === "hand" &&
      battlePhase === "playerPlacement"
    ) {
      // Only allow up to 3 creatures on field
      const occupied = playerField.filter((u) => u).length;
      if (occupied >= 3) return;

      setPlayerHand((prevHand) => {
        const idx = prevHand.findIndex((u) => u.id === unitId);
        if (idx === -1) return prevHand;

        const card = prevHand[idx];
        const newHand = [...prevHand];
        newHand.splice(idx, 1);

        setPlayerField((prevField) => {
          const slot = prevField.findIndex((s) => !s);
          if (slot === -1) return prevField;
          const nf = [...prevField];
          nf[slot] = card;
          return nf;
        });

        return newHand;
      });

      return;
    }

    // 2) CHOOSE ATTACKER (our field card)
    if (
      owner === "player" &&
      zone === "field" &&
      (battlePhase === "selectAttacker" || battlePhase === "selectTarget")
    ) {
      // Re-click same attacker = deselect
      if (selectedAttackerId === unitId && battlePhase === "selectAttacker") {
        setSelectedAttackerId(null);
        setSelectedTargetId(null);
        return;
      }

      setSelectedAttackerId(unitId);
      setSelectedTargetId(null);
      setBattlePhase("selectTarget");
      return;
    }

    // 3) CHOOSE TARGET (enemy field card) — we do NOT auto-attack here
    const isEnemyFieldClick =
      owner === "enemy" && zone === "field" && battlePhase === "selectTarget";

    if (isEnemyFieldClick || isTargetSelection) {
      setSelectedTargetId(unitId);
      // stay in "selectTarget" until ATTACK button is pressed
      return;
    }
  };

  // -----------------------------------------------------------------------
  // ATTACK RESOLUTION
  // -----------------------------------------------------------------------
  const queueAttack = (attackerOwner, attackerId, targetId) => {
    if (!attackerId || !targetId) return;

    setBattlePhase(attackerOwner === "player" ? "playerAnimating" : "enemyAnimating");
    setAttackingUnitId(attackerId);
    setAttackAnimations([{ attackerId, targetId }]);
    setDamageEffects([]); // optional in case you later add numeric damage pops

    // After medieval swoosh, apply damage
    setTimeout(() => {
      resolveAttack(attackerOwner, attackerId, targetId);
    }, 800);
  };

  const resolveAttack = (attackerOwner, attackerId, targetId) => {
    // Work on local copies
    let newPlayerField = [...playerField];
    let newEnemyField = [...enemyField];
    let newPlayerGraveyard = [...playerGraveyard];
    let newEnemyGraveyard = [...enemyGraveyard];

    const findIn = (field, id) => {
      const idx = field.findIndex((u) => u && u.id === id);
      return idx === -1 ? { idx: -1, unit: null } : { idx, unit: field[idx] };
    };

    let atkInfo;
    let defInfo;

    if (attackerOwner === "player") {
      atkInfo = findIn(newPlayerField, attackerId);
      defInfo = findIn(newEnemyField, targetId);
    } else {
      atkInfo = findIn(newEnemyField, attackerId);
      defInfo = findIn(newPlayerField, targetId);
    }

    if (!atkInfo.unit || !defInfo.unit) {
      // Target or attacker disappeared (edge case)
      setAttackAnimations([]);
      setAttackingUnitId(null);
      setBattlePhase("selectAttacker");
      setSelectedAttackerId(null);
      setSelectedTargetId(null);
      return;
    }

    const atk = atkInfo.unit;
    const def = defInfo.unit;

    const dmgToDef = atk.attack;
    const dmgToAtk = def.attack;

    const newDefHp = Math.max(def.health - dmgToDef, 0);
    const newAtkHp = Math.max(atk.health - dmgToAtk, 0);

    // Apply HP + move dead to graveyard immediately
    if (attackerOwner === "player") {
      // attacker on player field
      if (newAtkHp <= 0) {
        newPlayerGraveyard.push(atk);
        newPlayerField[atkInfo.idx] = null;
      } else {
        newPlayerField[atkInfo.idx] = { ...atk, health: newAtkHp };
      }

      // defender on enemy field
      if (newDefHp <= 0) {
        newEnemyGraveyard.push(def);
        newEnemyField[defInfo.idx] = null;
      } else {
        newEnemyField[defInfo.idx] = { ...def, health: newDefHp };
      }
    } else {
      // attacker on enemy field
      if (newAtkHp <= 0) {
        newEnemyGraveyard.push(atk);
        newEnemyField[atkInfo.idx] = null;
      } else {
        newEnemyField[atkInfo.idx] = { ...atk, health: newAtkHp };
      }

      // defender on player field
      if (newDefHp <= 0) {
        newPlayerGraveyard.push(def);
        newPlayerField[defInfo.idx] = null;
      } else {
        newPlayerField[defInfo.idx] = { ...def, health: newDefHp };
      }
    }

    // Commit new state
    setPlayerField(newPlayerField);
    setEnemyField(newEnemyField);
    setPlayerGraveyard(newPlayerGraveyard);
    setEnemyGraveyard(newEnemyGraveyard);

    setAttackAnimations([]);
    setDamageEffects([]);
    setAttackingUnitId(null);
    setSelectedAttackerId(null);
    setSelectedTargetId(null);

    // Count "alive" cards: hand + field; graveyard are dead
    const playerAlive =
      newPlayerField.some((u) => u) || playerHand.length > 0;
    const enemyAlive =
      newEnemyField.some((u) => u) || enemyHand.length > 0;

    if (!enemyAlive && playerAlive) {
      setBattleResult("victory");
      setBattlePhase("result");
      return;
    }

    if (!playerAlive && enemyAlive) {
      setBattleResult("defeat");
      setBattlePhase("result");
      return;
    }

    // No one dead yet → next turn
    if (attackerOwner === "player") {
      // Enemy's turn next
      setIsPlayerTurn(false);
      setBattlePhase("enemyAnimating"); // temporary; AI decides immediately
    } else {
      // Back to player
      setIsPlayerTurn(true);

      const fieldCount = newPlayerField.filter((u) => u).length;
      if (fieldCount === 0 && playerHand.length > 0) {
        setBattlePhase("playerPlacement");
      } else if (fieldCount > 0) {
        setBattlePhase("selectAttacker");
      } else {
        setBattlePhase("result");
      }
    }
  };

  // -----------------------------------------------------------------------
  // SIMPLE ENEMY AI
  // -----------------------------------------------------------------------
  const runEnemyTurn = () => {
    if (battleResult) return;

    let newEnemyField = [...enemyField];
    let newEnemyHand = [...enemyHand];
    let newPlayerField = [...playerField];

    // Auto-summon enemies into empty slots
    for (let i = 0; i < 3 && newEnemyHand.length > 0; i += 1) {
      if (!newEnemyField[i]) {
        newEnemyField[i] = newEnemyHand.shift();
      }
    }

    setEnemyField(newEnemyField);
    setEnemyHand(newEnemyHand);

    const enemyAttackers = newEnemyField.filter((u) => u);
    const playerTargets = newPlayerField.filter((u) => u);

    // If no attack possible, pass turn back to player
    if (enemyAttackers.length === 0 || playerTargets.length === 0) {
      const fieldCount = newPlayerField.filter((u) => u).length;
      setIsPlayerTurn(true);
      if (fieldCount === 0 && playerHand.length > 0) {
        setBattlePhase("playerPlacement");
      } else if (fieldCount > 0) {
        setBattlePhase("selectAttacker");
      }
      return;
    }

    // Very simple AI: first attacker vs first target
    const attacker = enemyAttackers[0];
    const target = playerTargets[0];

    setSelectedAttackerId(attacker.id);
    setSelectedTargetId(target.id);
    queueAttack("enemy", attacker.id, target.id);
  };

  // When it becomes enemy's turn, let AI act once
  useEffect(() => {
    if (battleResult) return;
    if (!isPlayerTurn && battlePhase === "enemyAnimating") {
      runEnemyTurn();
    }
  }, [isPlayerTurn, battlePhase, battleResult, enemyField, enemyHand, playerField, playerHand]);

  // -----------------------------------------------------------------------
  // ATTACK BUTTON (from 3D scene)
  // -----------------------------------------------------------------------
  const handleAttackConfirm = () => {
    if (battleResult) return;
    if (!isPlayerTurn) return;
    if (battlePhase !== "selectTarget") return;
    if (!selectedAttackerId || !selectedTargetId) return;

    queueAttack("player", selectedAttackerId, selectedTargetId);
  };

  // -----------------------------------------------------------------------
  // OPTIONAL: ON DEATH COMPLETE (if CardMesh ever uses dyingUnits)
  // Currently we handle removal instantly in resolveAttack, so this is a no-op.
  // -----------------------------------------------------------------------
  const handleDeathComplete = () => {};

  // -----------------------------------------------------------------------
  // NOTIFY PARENT WHEN BATTLE ENDS (ONCE)
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (battleResult && !hasReportedResult) {
      const reward = battleResult === "victory" ? 150 : 0;
      onBattleComplete?.(battleResult, levelInfo, reward);
      setHasReportedResult(true);
    }
  }, [battleResult, hasReportedResult, onBattleComplete, levelInfo]);

  // -----------------------------------------------------------------------
  // RENDER
  // -----------------------------------------------------------------------
  return (
    <div className="battle-screen-container">
      <BattlefieldAnime2D
        levelInfo={levelInfo}
        playerField={playerField}
        enemyField={enemyField}
        playerHand={playerHand}
        enemyHand={enemyHand}
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
        onAttackConfirm={handleAttackConfirm}
      />

      {battleResult && (
        <div className="battle-result-overlay">
          <div className={`battle-result-panel ${battleResult}`}>
            <div className="battle-result-header">
              {battleResult === "victory" ? "Victory" : "Defeat"}
            </div>

            <p className="battle-result-text">
              {battleResult === "victory"
                ? "Your beasts stand victorious!"
                : "You have fallen—but will rise again."}
            </p>

            {battleResult === "victory" && (
              <div className="battle-result-rewards">
                <div className="battle-result-reward-label">Gold Earned</div>
                <div className="battle-result-gold-amount">+150</div>
              </div>
            )}

            <div className="battle-result-actions">
              <button className="battle-result-btn" onClick={onExitBattle}>
                Continue
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
