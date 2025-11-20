// ============================================================================
// BattleController.jsx (CLEAN FINAL VERSION)
// Central battle logic + state + input plumbing
// One single battlefield renderer: BattlefieldSceneHybrid
// ============================================================================

import React, { useState, useEffect, useCallback } from "react";
import BattlefieldScene from "./BattlefieldScene_.jsx";

export default function BattleController() {
  // --------------------------------------------------------------------------
  // INITIAL DECKS (simple test configuration)
  // --------------------------------------------------------------------------

  const createCat = (id, owner) => ({
    id,
    name: "Wild Cat",
    race: "cat",
    attack: 2,
    hp: 3,
    currentHp: 3,
    owner,
    image: "/images/cards/sandwhisker-lvl1.png",
  });

  // 6-player starter cards
  const initialPlayerHand = [
    createCat("p1", "player"),
    createCat("p2", "player"),
    createCat("p3", "player"),
    createCat("p4", "player"),
    createCat("p5", "player"),
    createCat("p6", "player"),
  ];

  // 6 enemy cards
  const initialEnemyHand = [
    createCat("e1", "enemy"),
    createCat("e2", "enemy"),
    createCat("e3", "enemy"),
    createCat("e4", "enemy"),
    createCat("e5", "enemy"),
    createCat("e6", "enemy"),
  ];

  // --------------------------------------------------------------------------
  // STATE
  // --------------------------------------------------------------------------
  const [playerHand, setPlayerHand] = useState(initialPlayerHand);
  const [enemyHand, setEnemyHand] = useState(initialEnemyHand);

  const [playerField, setPlayerField] = useState([null, null, null]);
  const [enemyField, setEnemyField] = useState([null, null, null]);

  const [isPlayerTurn, setIsPlayerTurn] = useState(true);

  const [selectedAttackerId, setSelectedAttackerId] = useState(null);
  const [selectedTargetId, setSelectedTargetId] = useState(null);

  const [attackAnimations, setAttackAnimations] = useState([]);
  const [damageEffects, setDamageEffects] = useState([]);
  const [dyingUnits, setDyingUnits] = useState([]);
  const [attackingUnitId, setAttackingUnitId] = useState(null);

  // --------------------------------------------------------------------------
  // ON CARD CLICK
  // --------------------------------------------------------------------------
  const onCardClick = (unitId, zone, owner) => {
    if (!isPlayerTurn) return;

    // Selecting attacker
    if (zone === "field" && owner === "player") {
      setSelectedAttackerId(unitId);
      setSelectedTargetId(null);
    }

    // Selecting target (enemy field)
    if (zone === "field" && owner === "enemy") {
      if (!selectedAttackerId) return;
      setSelectedTargetId(unitId);
    }
  };

  // --------------------------------------------------------------------------
  // SUMMON: drop card from hand → field
  // --------------------------------------------------------------------------
  const onDropOnField = (unitId, slotIndex, owner) => {
    if (!isPlayerTurn) return;
    if (owner !== "player") return;

    const card = playerHand.find((c) => c.id === unitId);
    if (!card) return;
    if (playerField[slotIndex]) return;

    const newHand = playerHand.filter((c) => c.id !== unitId);
    const newField = [...playerField];
    newField[slotIndex] = { ...card };

    setPlayerHand(newHand);
    setPlayerField(newField);
  };

  // --------------------------------------------------------------------------
  // ATTACK RESOLUTION
  // --------------------------------------------------------------------------
  const resolveAttack = useCallback(() => {
    if (!selectedAttackerId || !selectedTargetId) return;

    const attackerSlot = playerField.findIndex((u) => u && u.id === selectedAttackerId);
    const targetSlot = enemyField.findIndex((u) => u && u.id === selectedTargetId);

    if (attackerSlot === -1 || targetSlot === -1) return;

    const attacker = playerField[attackerSlot];
    const target = enemyField[targetSlot];

    setAttackingUnitId(attacker.id);

    // Animation
    setAttackAnimations([
      {
        unitId: attacker.id,
        from: attackerSlot,
        to: targetSlot,
        owner: "player",
      },
    ]);

    setTimeout(() => {
      // Damage results
      const updatedEnemy = [...enemyField];
      updatedEnemy[targetSlot] = {
        ...target,
        currentHp: target.currentHp - attacker.attack,
      };

      setEnemyField(updatedEnemy);

      setDamageEffects([{ unitId: target.id }]);

      // death check
      if (target.currentHp - attacker.attack <= 0) {
        setDyingUnits([target.id]);
        setTimeout(() => {
          const f = [...updatedEnemy];
          f[targetSlot] = null;
          setEnemyField(f);
        }, 500);
      }

      // cleanup
      setTimeout(() => {
        setAttackingUnitId(null);
        setAttackAnimations([]);
        setDamageEffects([]);
        setDyingUnits([]);
        setSelectedAttackerId(null);
        setSelectedTargetId(null);
      }, 650);
    }, 450);
  }, [
    selectedAttackerId,
    selectedTargetId,
    playerField,
    enemyField,
  ]);

  // --------------------------------------------------------------------------
  // ATTACK CONFIRM BUTTON
  // --------------------------------------------------------------------------
  const onAttackConfirm = () => {
    if (!selectedAttackerId || !selectedTargetId) return;
    resolveAttack();
  };

  // --------------------------------------------------------------------------
  // END TURN
  // --------------------------------------------------------------------------
  const onEndTurn = () => {
    setIsPlayerTurn(false);

    // Basic enemy auto-attack (stub)
    setTimeout(() => {
      setIsPlayerTurn(true);
    }, 1500);
  };

  // --------------------------------------------------------------------------
  // RENDER
  // --------------------------------------------------------------------------
  return (
    <BattlefieldScene
      playerHand={playerHand}
      enemyHand={enemyHand}
      playerField={playerField}
      enemyField={enemyField}
      isPlayerTurn={isPlayerTurn}
      selectedAttackerId={selectedAttackerId}
      selectedTargetId={selectedTargetId}
      attackingUnitId={attackingUnitId}
      attackAnimations={attackAnimations}
      damageEffects={damageEffects}
      dyingUnits={dyingUnits}
      onCardClick={onCardClick}
      onDropOnField={onDropOnField}
      onAttackConfirm={onAttackConfirm}
      onEndTurn={onEndTurn}
    />
  );
}
