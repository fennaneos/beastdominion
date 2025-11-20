// src/components/battle/BattlefieldAnime2D2.jsx
/**
 * ============================================================================
 *  BATTLEFIELD ANIME 2D v2
 *  --------------------------------------------------------------------------
 *  This file is SELF-CONTAINED: layout, logic, and CSS injection.
 *
 *  What it does (current demo rules):
 *  - Creates a tiny 6-card deck for PLAYER and ENEMY (can be replaced by props).
 *  - At game start, DEALS 6 cards to each hand one by one, with:
 *      • slide-in animation
 *      • flip from back → front
 *      • optional sound (see `DEAL_SOUND_URL`)
 *  - Shows:
 *      • ENEMY HAND (top)       – readonly
 *      • ENEMY FIELD (3 slots)  – enemies placed there
 *      • PLAYER FIELD (3 slots) – your monsters
 *      • PLAYER HAND (bottom)   – drag/drop or tap-select
 *
 *  INTERACTION:
 *  - Drag a card from PLAYER HAND and drop on a FIELD SLOT:
 *      • slot glows GREEN if legal (your turn & empty)
 *      • slot glows RED if illegal (occupied or not your turn)
 *      • Mobile fallback: tap a hand card (green frame), then tap a slot.
 *
 *  TURN SYSTEM:
 *  - 60 seconds per turn (UI at top-center).
 *  - If timer reaches 0 → automatic end turn → opponent’s turn.
 *  - Hand remains visible during enemy turn; interactions are disabled.
 *  - Very simple enemy AI:
 *      • when it’s ENEMY turn, if it has a field creature,
 *        it will randomly attack one of your field creatures after ~1s.
 *
 *  COMBAT:
 *  - Click one of YOUR FIELD cards → it glows (blue).
 *  - All enemy field cards show a sword-arrow badge above them.
 *  - Click an enemy field card:
 *      • its arrow turns GREEN (others stay grey).
 *  - Click the big FIGHT button (swords) on the RIGHT:
 *      • if attacker+target are selected and it’s your turn:
 *          - both creatures deal damage to each other simultaneously
 *          - floating damage numbers (-X) pop over each target
 *          - cards with HP <= 0 die and disappear (go to graveyard internally)
 *
 *  STYLING:
 *  - Recreates a colorful TCG-like board:
 *      • soft anime background
 *      • rounded slots
 *      • glowing highlights
 *  - All CSS is injected once into <head> so you don’t need a separate .css file.
 *
 *  HOW TO INTEGRATE WITH YOUR REAL GAME:
 *  - Replace `createDemoDeck()` with your own deck builder using cards from cards.js
 *  - OR pass `initialPlayerDeck` / `initialEnemyDeck` via props:
 *      <BattlefieldAnime2D2
 *          initialPlayerDeck={myUnits}
 *          initialEnemyDeck={theirUnits}
 *      />
 *    where each unit is: { id, name, attack, hp, image } (you can also add any extra fields).
 *
 *  Dependencies:
 *      import React from "react";
 *      (OPTIONAL) import MonsterCard from "../card/MonsterCard.jsx";  // see CARD_VIEW below
 *  No react-three-fiber, no Drei hooks; this is pure DOM + CSS.
 * ============================================================================
 */

import React, { useEffect, useMemo, useRef, useState } from "react";
// If you want to render your fancy card frame, uncomment this and edit CARD_VIEW below:
// import MonsterCard from "../card/MonsterCard.jsx";

// Optional: path to your card-deal sound (will fail silently if not found)
const DEAL_SOUND_URL = "/sounds/card-deal.mp3";

// ---------------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------------

const TURN_DURATION = 60; // seconds
const MAX_FIELD_SLOTS = 3;
const INITIAL_HAND_SIZE = 6;

/**
 * Creates a tiny demo deck. Replace with real data later.
 */
function createDemoDeck(owner) {
  const animals = [
    { name: "Redridge Hound", atk: 3, hp: 5 },
    { name: "Moonfang Wolf", atk: 4, hp: 4 },
    { name: "Skyridge Hawk", atk: 2, hp: 3 },
    { name: "Gravelback Bear", atk: 5, hp: 6 },
    { name: "Sandwhisper Viper", atk: 3, hp: 2 },
    { name: "Ashen Boar", atk: 2, hp: 4 },
    { name: "Ironclaw Lynx", atk: 4, hp: 3 },
    { name: "Stormscale Drake", atk: 6, hp: 5 },
  ];

  return animals.map((a, idx) => ({
    id: `${owner}_${idx}_${Math.random().toString(36).slice(2, 7)}`,
    owner,
    name: a.name,
    attack: a.atk,
    hp: a.hp,
    maxHp: a.hp,
    // you can plug your real card frame or image here
    image: null,
  }));
}

/**
 * Card renderer abstraction: here we keep it simple.
 * Plug MonsterCard or your own component if you want a richer frame.
 */
function CardView({ card, compact = false }) {
  if (!card) return null;

  const atk = card.attack;
  const hp = card.hp;

  return (
    <div className={`bd2-card ${compact ? "bd2-card--compact" : ""}`}>
      <div className="bd2-card-inner">
        <div className="bd2-card-title">{card.name}</div>
        <div className="bd2-card-artshell">
          {/* Replace with <MonsterCard card={card} size={compact ? "small" : "normal"} /> */}
          <div className="bd2-card-art-fallback" />
        </div>
        <div className="bd2-card-stats">
          <div className="bd2-stat bd2-stat--atk">{atk}</div>
          <div className="bd2-stat bd2-stat--hp">{hp}</div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function BattlefieldAnime2D2({
  initialPlayerDeck,
  initialEnemyDeck,
}) {
  // Inject CSS once
  useEffect(() => {
    if (document.getElementById("bd2-style")) return;
    const style = document.createElement("style");
    style.id = "bd2-style";
    style.textContent = CSS_TEXT;
    document.head.appendChild(style);
  }, []);

  // Build decks
  const [playerDeck, setPlayerDeck] = useState(
    () => initialPlayerDeck || createDemoDeck("player")
  );
  const [enemyDeck, setEnemyDeck] = useState(
    () => initialEnemyDeck || createDemoDeck("enemy")
  );

  const [playerHand, setPlayerHand] = useState([]);
  const [enemyHand, setEnemyHand] = useState([]);
  const [playerField, setPlayerField] = useState(Array(MAX_FIELD_SLOTS).fill(null));
  const [enemyField, setEnemyField] = useState(Array(MAX_FIELD_SLOTS).fill(null));

  const [dealingIndex, setDealingIndex] = useState(0);
  const [isDealing, setIsDealing] = useState(true);

  const [currentPlayer, setCurrentPlayer] = useState("player");
  const [turnSeconds, setTurnSeconds] = useState(TURN_DURATION);

  const [selectedHandCardId, setSelectedHandCardId] = useState(null); // for tap-to-summon
  const [draggingCard, setDraggingCard] = useState(null); // { owner, from: "hand", index }

  const [selectedAttackerId, setSelectedAttackerId] = useState(null);
  const [selectedTargetId, setSelectedTargetId] = useState(null);

  // damage FX: array of { id, owner, amount }
  const [damageFx, setDamageFx] = useState([]);

  const [hoverFieldSlot, setHoverFieldSlot] = useState(null); // { owner, index, legal }

  const fightButtonRef = useRef(null);

  // Preload deal sound (optional)
  const dealSound = useMemo(() => {
    try {
      return new Audio(DEAL_SOUND_URL);
    } catch {
      return null;
    }
  }, []);

  // ---------------------------------------------------------------------------
  // Initial dealing: reveal 6 cards for each player, one by one
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!isDealing) return;
    if (dealingIndex >= INITIAL_HAND_SIZE) {
      setIsDealing(false);
      return;
    }

    const timeout = setTimeout(() => {
      setPlayerDeck((prev) => {
        if (!prev.length) return prev;
        const [top, ...rest] = prev;
        setPlayerHand((h) => [...h, { ...top, faceUp: true, justDealt: true }]);
        return rest;
      });

      setEnemyDeck((prev) => {
        if (!prev.length) return prev;
        const [top, ...rest] = prev;
        setEnemyHand((h) => [...h, { ...top, faceUp: false, justDealt: true }]);
        return rest;
      });

      // play sound
      if (dealSound) {
        try {
          dealSound.currentTime = 0;
          dealSound.play().catch(() => {});
        } catch {}
      }

      setDealingIndex((i) => i + 1);
    }, 350);

    return () => clearTimeout(timeout);
  }, [dealingIndex, isDealing, dealSound]);

  // Auto-flip enemy cards after deal (for demo we flip them too)
  useEffect(() => {
    if (!enemyHand.length) return;
    const timeout = setTimeout(() => {
      setEnemyHand((prev) =>
        prev.map((c) => (c.faceUp ? c : { ...c, faceUp: true }))
      );
    }, 800);
    return () => clearTimeout(timeout);
  }, [enemyHand.length]);

  // ---------------------------------------------------------------------------
  // TURN TIMER
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (isDealing) return; // don't start timer before dealing complete

    const interval = setInterval(() => {
      setTurnSeconds((s) => {
        if (s <= 1) {
          // auto end turn
          endTurn();
          return TURN_DURATION;
        }
        return s - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isDealing, currentPlayer]);

  // ---------------------------------------------------------------------------
  // Simple enemy AI: when it's enemy turn, auto-attack once after a delay
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (currentPlayer !== "enemy" || isDealing) return;

    if (!enemyField.some(Boolean)) return; // nothing to attack with

    const timeout = setTimeout(() => {
      const enemyUnits = enemyField
        .map((u, i) => ({ unit: u, index: i }))
        .filter((x) => x.unit);

      const playerUnits = playerField
        .map((u, i) => ({ unit: u, index: i }))
        .filter((x) => x.unit);

      if (!enemyUnits.length || !playerUnits.length) {
        endTurn();
        return;
      }

      const attacker = enemyUnits[Math.floor(Math.random() * enemyUnits.length)];
      const target = playerUnits[Math.floor(Math.random() * playerUnits.length)];

      performAttack("enemy", attacker.index, "player", target.index);
      // After AI attack, immediately end turn
      setTimeout(() => endTurn(), 700);
    }, 1000);

    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPlayer, enemyField, playerField, isDealing]);

  // ---------------------------------------------------------------------------
  // Summoning: move card from player hand to field
  // ---------------------------------------------------------------------------

  const canPlayerSummonToSlot = (slotIndex) => {
    if (currentPlayer !== "player") return false;
    if (isDealing) return false;
    if (playerField[slotIndex]) return false;
    return true;
  };

  const summonHandCardToSlot = (handIndex, slotIndex) => {
    setPlayerHand((prevHand) => {
      if (!prevHand[handIndex]) return prevHand;
      const card = prevHand[handIndex];

      if (!canPlayerSummonToSlot(slotIndex)) return prevHand;

      setPlayerField((prevField) => {
        const next = [...prevField];
        next[slotIndex] = card;
        return next;
      });

      const nextHand = [...prevHand];
      nextHand.splice(handIndex, 1);
      return nextHand;
    });

    setSelectedHandCardId(null);
  };

  // ---------------------------------------------------------------------------
  // Drag & drop handlers
  // ---------------------------------------------------------------------------

  const handleHandDragStart = (owner, index) => {
    if (owner !== "player") return;
    if (currentPlayer !== "player" || isDealing) return;
    setDraggingCard({ owner, from: "hand", index });
    setSelectedHandCardId(null);
  };

  const handleFieldDragOver = (owner, index, event) => {
    event.preventDefault();
    if (!draggingCard) return;

    if (owner !== "player") {
      setHoverFieldSlot({ owner, index, legal: false });
      return;
    }

    const legal = canPlayerSummonToSlot(index);
    setHoverFieldSlot({ owner, index, legal });
  };

  const handleFieldDrop = (owner, index, event) => {
    event.preventDefault();
    if (!draggingCard) return;

    if (draggingCard.owner === "player" && draggingCard.from === "hand") {
      const legal = owner === "player" && canPlayerSummonToSlot(index);
      if (legal) {
        summonHandCardToSlot(draggingCard.index, index);
      }
    }
    setDraggingCard(null);
    setHoverFieldSlot(null);
  };

  const handleFieldDragLeave = () => {
    setHoverFieldSlot(null);
  };

  // ---------------------------------------------------------------------------
  // Click interaction for field cards (select attacker / target)
  // ---------------------------------------------------------------------------

  const handlePlayerFieldClick = (slotIndex) => {
    const unit = playerField[slotIndex];
    if (!unit) return;
    if (currentPlayer !== "player") return;

    setSelectedAttackerId(unit.id);
    setSelectedTargetId(null);
  };

  const handleEnemyFieldClick = (slotIndex) => {
    const unit = enemyField[slotIndex];
    if (!unit) return;
    if (currentPlayer !== "player") return;
    if (!selectedAttackerId) return;

    setSelectedTargetId(unit.id);
  };

  // ---------------------------------------------------------------------------
  // Fight button
  // ---------------------------------------------------------------------------

  const handleFightClick = () => {
    if (currentPlayer !== "player" || isDealing) return;
    if (!selectedAttackerId || !selectedTargetId) return;

    const atkIndex = playerField.findIndex((u) => u && u.id === selectedAttackerId);
    const defIndex = enemyField.findIndex((u) => u && u.id === selectedTargetId);
    if (atkIndex === -1 || defIndex === -1) return;

    performAttack("player", atkIndex, "enemy", defIndex);
    // optionally end turn after a short delay
    setTimeout(() => endTurn(), 700);
  };

  // ---------------------------------------------------------------------------
  // Core attack logic: both sides take damage simultaneously
  // ---------------------------------------------------------------------------

  const performAttack = (attackerOwner, attackerSlot, defenderOwner, defenderSlot) => {
    const isPlayerAttacker = attackerOwner === "player";

    const atkField = isPlayerAttacker ? playerField : enemyField;
    const defField = isPlayerAttacker ? enemyField : playerField;

    const atkUnit = atkField[attackerSlot];
    const defUnit = defField[defenderSlot];
    if (!atkUnit || !defUnit) return;

    const dmgToDef = atkUnit.attack;
    const dmgToAtk = defUnit.attack;

    // FX
    const fxEntries = [];
    if (dmgToDef > 0) {
      fxEntries.push({
        id: `${defUnit.id}-${Date.now()}`,
        owner: defenderOwner,
        amount: -dmgToDef,
      });
    }
    if (dmgToAtk > 0) {
      fxEntries.push({
        id: `${atkUnit.id}-${Date.now()}`,
        owner: attackerOwner,
        amount: -dmgToAtk,
      });
    }
    setDamageFx((prev) => [...prev, ...fxEntries]);

    // Apply HP changes
    const applyDamage = (owner, slotIndex, amount) => {
      if (owner === "player") {
        setPlayerField((prev) => {
          const unit = prev[slotIndex];
          if (!unit) return prev;
          const newHp = Math.max(unit.hp + amount, 0);
          const updated = { ...unit, hp: newHp };
          const next = [...prev];
          next[slotIndex] = newHp <= 0 ? null : updated;
          return next;
        });
      } else {
        setEnemyField((prev) => {
          const unit = prev[slotIndex];
          if (!unit) return prev;
          const newHp = Math.max(unit.hp + amount, 0);
          const updated = { ...unit, hp: newHp };
          const next = [...prev];
          next[slotIndex] = newHp <= 0 ? null : updated;
          return next;
        });
      }
    };

    applyDamage(defenderOwner, defenderSlot, -dmgToDef);
    applyDamage(attackerOwner, attackerSlot, -dmgToAtk);

    // Clear FX after short delay
    setTimeout(() => {
      setDamageFx((prev) =>
        prev.filter(
          (fx) =>
            !fxEntries.some(
              (e) => e.id === fx.id && e.owner === fx.owner && e.amount === fx.amount
            )
        )
      );
    }, 600);
  };

  // ---------------------------------------------------------------------------
  // Turn control
  // ---------------------------------------------------------------------------

  const endTurn = () => {
    setCurrentPlayer((p) => (p === "player" ? "enemy" : "player"));
    setTurnSeconds(TURN_DURATION);
    setSelectedAttackerId(null);
    setSelectedTargetId(null);
    setSelectedHandCardId(null);
    setDraggingCard(null);
    setHoverFieldSlot(null);
  };

  const handleEndTurnClick = () => {
    if (isDealing) return;
    endTurn();
  };

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------

  const renderFieldSlot = (owner, slotIndex, unit) => {
    const isPlayer = owner === "player";
    const hover =
      hoverFieldSlot &&
      hoverFieldSlot.owner === owner &&
      hoverFieldSlot.index === slotIndex
        ? hoverFieldSlot
        : null;

    const classes = ["bd2-field-slot", isPlayer ? "bd2-field-slot--player" : "bd2-field-slot--enemy"];

    if (hover) {
      classes.push(hover.legal ? "bd2-field-slot--hover-legal" : "bd2-field-slot--hover-illegal");
    }

    const isAttacker = unit && unit.id === selectedAttackerId;
    const isTarget = unit && unit.id === selectedTargetId;

    if (unit) {
      if (isAttacker) classes.push("bd2-field-slot--attacker");
      if (isTarget) classes.push("bd2-field-slot--target");
    } else {
      // blinking empty player slots at start to invite summoning
      if (!unit && isPlayer && !isDealing && dealingIndex >= INITIAL_HAND_SIZE) {
        classes.push("bd2-field-slot--empty-blink");
      }
    }

    const damageFxForUnit = unit
      ? damageFx.filter((fx) => fx.owner === owner && fx.id.startsWith(unit.id))
      : [];

    const showArrowBadge =
      unit &&
      ((currentPlayer === "player" && owner === "enemy" && selectedAttackerId) ||
        (currentPlayer === "enemy" && owner === "player")); // for AI we could also show, but not needed

    const arrowSelected = unit && unit.id === selectedTargetId;

    const onClick =
      owner === "player"
        ? () => handlePlayerFieldClick(slotIndex)
        : () => handleEnemyFieldClick(slotIndex);

    return (
      <div
        key={`${owner}-slot-${slotIndex}`}
        className={classes.join(" ")}
        onClick={unit ? onClick : undefined}
        onDragOver={(e) => handleFieldDragOver(owner, slotIndex, e)}
        onDrop={(e) => handleFieldDrop(owner, slotIndex, e)}
        onDragLeave={handleFieldDragLeave}
      >
        {unit ? (
          <>
            <CardView card={unit} />
            {damageFxForUnit.map((fx) => (
              <div key={fx.id} className="bd2-damage-fx">
                {fx.amount}
              </div>
            ))}
          </>
        ) : (
          <div className="bd2-empty-circle" />
        )}

        {showArrowBadge && (
          <div
            className={
              "bd2-arrow-badge " + (arrowSelected ? "bd2-arrow-badge--selected" : "")
            }
          >
            {/* simple sword icon with arrow feel */}
            <span>⚔</span>
          </div>
        )}
      </div>
    );
  };

  const renderHandCard = (owner, card, index) => {
    const isPlayer = owner === "player";
    const selected = isPlayer && card.id === selectedHandCardId;

    const classes = ["bd2-hand-card", isPlayer ? "bd2-hand-card--player" : "bd2-hand-card--enemy"];
    if (selected) classes.push("bd2-hand-card--selected");
    if (card.justDealt) classes.push("bd2-hand-card--dealt");

    const handleClick = () => {
      if (!isPlayer) return;
      if (currentPlayer !== "player" || isDealing) return;
      setSelectedHandCardId((prev) => (prev === card.id ? null : card.id));
      setDraggingCard(null);
    };

    return (
      <div
        key={card.id}
        className={classes.join(" ")}
        draggable={isPlayer && currentPlayer === "player" && !isDealing}
        onDragStart={() => handleHandDragStart(owner, index)}
        onClick={handleClick}
      >
        <CardView card={card} compact />
      </div>
    );
  };

  const handleFieldSlotClickForSummon = (owner, index) => {
    if (owner !== "player") return;
    if (!selectedHandCardId) return;

    const handIndex = playerHand.findIndex((c) => c.id === selectedHandCardId);
    if (handIndex === -1) return;

    if (canPlayerSummonToSlot(index)) {
      summonHandCardToSlot(handIndex, index);
    }
  };

  // For tap-to-summon, overlay a transparent click target on empty slots
  const clickableEmptyOverlay = (owner, slotIndex) => {
    if (owner !== "player") return null;
    const isEmpty = !playerField[slotIndex];
    if (!isEmpty) return null;

    return (
      <button
        type="button"
        className="bd2-empty-click-overlay"
        onClick={() => handleFieldSlotClickForSummon(owner, slotIndex)}
      />
    );
  };

  // ---------------------------------------------------------------------------
  // JSX
  // ---------------------------------------------------------------------------

  return (
    <div className="bd2-wrapper">
      {/* Background */}
      <div className="bd2-bg" />

      {/* Turn & timer */}
      <div className="bd2-top-bar">
        <div className="bd2-turn-indicator">
          {currentPlayer === "player" ? "Your Turn" : "Enemy Turn"}
        </div>
        <div className="bd2-timer">
          {turnSeconds}s
          <button className="bd2-endturn-btn" onClick={handleEndTurnClick}>
            End Turn
          </button>
        </div>
      </div>

      {/* Enemy hand */}
      <div className="bd2-hand-row bd2-hand-row--enemy">
        <div className="bd2-row-label">Enemy Hand</div>
        <div className="bd2-hand-scroller">
          {enemyHand.map((card, i) => renderHandCard("enemy", card, i))}
        </div>
      </div>

      {/* Enemy field */}
      <div className="bd2-field-row bd2-field-row--enemy">
        <div className="bd2-row-label">Enemy Field</div>
        <div className="bd2-field-strip">
          {enemyField.map((unit, i) => renderFieldSlot("enemy", i, unit))}
        </div>
      </div>

      {/* Player field */}
      <div className="bd2-field-row bd2-field-row--player">
        <div className="bd2-row-label">Your Field</div>
        <div className="bd2-field-strip">
          {playerField.map((unit, i) => (
            <div key={`player-slot-wrap-${i}`} className="bd2-field-slot-wrap">
              {renderFieldSlot("player", i, unit)}
              {clickableEmptyOverlay("player", i)}
            </div>
          ))}
        </div>
      </div>

      {/* Player hand */}
      <div className="bd2-hand-row bd2-hand-row--player">
        <div className="bd2-row-label">Your Hand</div>
        <div className="bd2-hand-scroller">
          {playerHand.map((card, i) => renderHandCard("player", card, i))}
        </div>
      </div>

      {/* Fight button: right side sword dial */}
      <button
        type="button"
        ref={fightButtonRef}
        className={
          "bd2-fight-button " +
          (currentPlayer === "player" && selectedAttackerId && selectedTargetId
            ? "bd2-fight-button--ready"
            : "")
        }
        onClick={handleFightClick}
      >
        <div className="bd2-fight-inner">
          <span className="bd2-fight-icon">⚔</span>
        </div>
        <div className="bd2-fight-label">FIGHT</div>
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CSS injected into the document head
// ---------------------------------------------------------------------------

const CSS_TEXT = `
.bd2-wrapper {
  position: relative;
  width: 100%;
  height: calc(100vh - 100px);
  overflow: hidden;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Inter", sans-serif;
  color: #fff;
}

/* Background – anime / sea board feeling */
.bd2-bg {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 15% 0%, #7ad5ff 0, transparent 55%),
    radial-gradient(circle at 85% 100%, #5b8dff 0, transparent 55%),
    radial-gradient(circle at 50% 50%, #273a4c 0, #05070e 75%);
  filter: saturate(1.2);
}

/* Top bar */
.bd2-top-bar {
  position: absolute;
  top: 6px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  gap: 24px;
  z-index: 10;
  pointer-events: none;
}

.bd2-turn-indicator,
.bd2-timer {
  pointer-events: auto;
  padding: 6px 16px;
  border-radius: 999px;
  background: linear-gradient(135deg, rgba(9,12,28,0.9), rgba(32,37,68,0.9));
  border: 1px solid rgba(255,255,255,0.2);
  box-shadow: 0 0 12px rgba(0,0,0,0.7);
  font-size: 14px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.bd2-turn-indicator {
  color: #ffe6b0;
}

.bd2-timer {
  display: flex;
  align-items: center;
  gap: 8px;
}

.bd2-endturn-btn {
  padding: 3px 10px;
  border-radius: 999px;
  border: 1px solid rgba(255,255,255,0.4);
  background: radial-gradient(circle at 0 0, #ffb54d, #a34c1e);
  color: #220c02;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  cursor: pointer;
}

/* Rows */
.bd2-hand-row,
.bd2-field-row {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.bd2-hand-row--enemy {
  margin-top: 56px;
}
.bd2-field-row--enemy {
  margin-top: 26px;
}
.bd2-field-row--player {
  margin-top: 18px;
}
.bd2-hand-row--player {
  margin-top: 20px;
}

/* Labels */
.bd2-row-label {
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  color: #ffe9c2;
  text-shadow: 0 0 5px rgba(0,0,0,0.9);
  margin-bottom: 6px;
}

/* Field strip */
.bd2-field-strip {
  display: grid;
  grid-template-columns: repeat(3, 190px);
  gap: 16px;
}

/* Field slots */
.bd2-field-slot-wrap {
  position: relative;
}

.bd2-field-slot {
  width: 190px;
  height: 250px;
  border-radius: 20px;
  padding: 4px;
  background: radial-gradient(circle at 50% 15%, rgba(255,255,255,0.08), transparent 80%);
  border: 2px solid rgba(255,255,255,0.08);
  box-shadow: 0 0 12px rgba(0,0,0,0.6);
  position: relative;
  overflow: visible;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease, background 0.15s ease;
}

.bd2-field-slot--player {
  box-shadow: 0 0 16px rgba(108,220,255,0.25);
}

.bd2-field-slot--enemy {
  box-shadow: 0 0 16px rgba(255,138,102,0.25);
}

/* Hover states for drag targets */
.bd2-field-slot--hover-legal {
  border-color: #82ffb0;
  box-shadow: 0 0 22px rgba(146,255,185,0.8);
  transform: translateY(-4px);
}
.bd2-field-slot--hover-illegal {
  border-color: #ff5566;
  box-shadow: 0 0 22px rgba(255,80,80,0.75);
}

/* Blinking empty player slots inviting summon */
@keyframes bd2-slot-blink {
  0%, 100% { box-shadow: 0 0 16px rgba(108,220,255,0.3); }
  50% { box-shadow: 0 0 22px rgba(146,255,185,0.8); }
}
.bd2-field-slot--empty-blink {
  animation: bd2-slot-blink 1.4s ease-in-out infinite;
}

/* Attacker / target highlights */
.bd2-field-slot--attacker {
  border-color: #6dd6ff;
  box-shadow: 0 0 26px rgba(131,229,255,0.85);
}
.bd2-field-slot--target {
  border-color: #8bff88;
  box-shadow: 0 0 26px rgba(182,255,180,0.9);
}

/* Empty circle placeholder */
.bd2-empty-circle {
  width: 82px;
  height: 82px;
  border-radius: 999px;
  border: 2px dashed rgba(255,255,255,0.25);
  margin: 0 auto;
  margin-top: 64px;
  box-shadow: 0 0 12px rgba(0,0,0,0.6);
}

/* Tap-to-summon overlay */
.bd2-empty-click-overlay {
  position: absolute;
  inset: 0;
  background: transparent;
  border: none;
  cursor: pointer;
}

/* Hand rows */
.bd2-hand-scroller {
  display: flex;
  gap: 10px;
  justify-content: center;
  max-width: 80vw;
  padding: 4px 10px;
}

/* Hand cards */
.bd2-hand-card {
  width: 120px;
  height: 170px;
  border-radius: 15px;
  padding: 2px;
  background: rgba(0,0,0,0.4);
  border: 1px solid rgba(255,255,255,0.15);
  box-shadow: 0 0 10px rgba(0,0,0,0.7);
  cursor: pointer;
  transition: transform 0.12s ease, box-shadow 0.12s ease, border-color 0.12s ease;
  position: relative;
}

.bd2-hand-card--player:hover {
  transform: translateY(-6px);
  box-shadow: 0 0 18px rgba(255,255,255,0.35);
}
.bd2-hand-card--selected {
  border-color: #78ffb7;
  box-shadow: 0 0 20px rgba(150,255,200,0.85);
}

/* Deal animation */
@keyframes bd2-deal-in {
  0% { transform: translateY(40px) scale(0.7); opacity: 0; }
  60% { opacity: 1; }
  100% { transform: translateY(0) scale(1); opacity: 1; }
}
.bd2-hand-card--dealt {
  animation: bd2-deal-in 0.28s ease-out;
}

/* Card frame */
.bd2-card {
  width: 100%;
  height: 100%;
  border-radius: 14px;
  background: radial-gradient(circle at 0 0, #fef8d8, #554134);
  position: relative;
  overflow: hidden;
  box-shadow: inset 0 0 0 2px rgba(0,0,0,0.4);
}
.bd2-card--compact {
  font-size: 11px;
}
.bd2-card-inner {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 6px;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}
.bd2-card-title {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #3a2312;
  text-shadow: 0 1px 0 rgba(255,255,255,0.4);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 4px;
}
.bd2-card-artshell {
  flex: 1;
  border-radius: 8px;
  overflow: hidden;
  background: radial-gradient(circle at 50% 0, #fefefe, #8893af);
  margin-bottom: 4px;
  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.35);
}
.bd2-card-art-fallback {
  width: 100%;
  height: 100%;
  background: linear-gradient(135deg, #f9e0a0, #f7a36a);
}
.bd2-card-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.bd2-stat {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 800;
  color: #222;
  box-shadow: 0 0 4px rgba(0,0,0,0.6);
}
.bd2-stat--atk {
  background: radial-gradient(circle at 0 0, #ffefb3, #ff7b54);
}
.bd2-stat--hp {
  background: radial-gradient(circle at 0 0, #f5ffe1, #7ce673);
}

/* Damage FX */
@keyframes bd2-damage-pop {
  0% { transform: translate(-50%, -20px) scale(0.7); opacity: 0; }
  40% { opacity: 1; }
  100% { transform: translate(-50%, -60px) scale(1.1); opacity: 0; }
}
.bd2-damage-fx {
  position: absolute;
  left: 50%;
  top: 40%;
  transform: translate(-50%, -60px);
  font-size: 24px;
  font-weight: 900;
  color: #ffdd44;
  text-shadow: 0 0 8px rgba(0,0,0,0.9);
  animation: bd2-damage-pop 0.6s ease-out forwards;
}

/* Arrow badges over potential targets */
.bd2-arrow-badge {
  position: absolute;
  top: -16px;
  left: 50%;
  transform: translateX(-50%);
  width: 32px;
  height: 24px;
  border-radius: 999px;
  background: radial-gradient(circle at 0 0, #ffe0b8, #c73f3f);
  box-shadow: 0 0 10px rgba(0,0,0,0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  border: 2px solid rgba(0,0,0,0.5);
}
.bd2-arrow-badge span {
  transform: translateY(1px);
}
.bd2-arrow-badge--selected {
  background: radial-gradient(circle at 0 0, #e7ffcc, #42b463);
}

/* Fight button (right side) */
.bd2-fight-button {
  position: absolute;
  right: 24px;
  top: 50%;
  transform: translateY(-50%);
  width: 96px;
  height: 120px;
  border-radius: 60px;
  border: none;
  background: none;
  padding: 0;
  cursor: pointer;
  z-index: 10;
}
.bd2-fight-inner {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 0, #ffefd3, #bd422a);
  box-shadow:
    0 0 16px rgba(0,0,0,0.9),
    inset 0 0 8px rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}
.bd2-fight-icon {
  font-size: 34px;
  text-shadow: 0 0 4px rgba(0,0,0,0.9);
}
.bd2-fight-label {
  margin-top: 4px;
  text-align: center;
  font-size: 11px;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  color: #fbe5c0;
}
.bd2-fight-button--ready .bd2-fight-inner {
  animation: bd2-fight-pulse 1.2s ease-in-out infinite;
}
@keyframes bd2-fight-pulse {
  0%, 100% { box-shadow: 0 0 18px rgba(255,255,255,0.7), inset 0 0 8px rgba(0,0,0,0.7); }
  50% { box-shadow: 0 0 30px rgba(255,255,255,1), inset 0 0 8px rgba(0,0,0,0.7); }
}

/* Responsive tweaks */
@media (max-width: 1024px) {
  .bd2-field-strip {
    grid-template-columns: repeat(3, 150px);
  }
  .bd2-field-slot {
    width: 150px;
    height: 210px;
  }
  .bd2-hand-card {
    width: 100px;
    height: 150px;
  }
  .bd2-wrapper {
    height: calc(100vh - 80px);
  }
}
`;
