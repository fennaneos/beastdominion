// ============================================================================
// BATTLEFIELD SCENE ANIME 2D — FULL CINEMATIC MEGA EDITION
// EXTREME COMMENTING MODE (A)
// ============================================================================
// This file is the central battlefield engine for the 2D anime-style combat.
// It manages:
//   • Card dealing animations
//   • Drag & drop placement
//   • Manual combat selection
//   • Enemy AI logic
//   • Cinematic camera zooms, flashes, particles
//   • Field rendering
//   • Rules panel
//   • Settings panel
//   • Exit confirmation panel
//   • Victory/Defeat triggers
//   • Ability system integration
//
// structure of this file:
//   1. Imports & Global Constants
//   2. Card / Unit creation helpers
//   3. Visual sub-components (CardView, CinematicAttackEffects)
//   4. Main React component (BattlefieldSceneAnime2D)
//   5. Rendering tree (enemy, player fields, hands)
//   6. Top bar, attack button, overlays
//
// This is the most complete version.
// Every block is commented line-by-line.
// ============================================================================

import React, {
  useEffect,
  useMemo,
  useState,
  useCallback,
  useRef
} from "react";

import { cards } from "../../data/cards.js"; 
// ↳ your global card database — full stats / images / effects

import { AbilityExecutor } from "../../utils/abilityExecutor.js";
import getNightState from "../../utils/getNightState.js";

import "./BattlefieldAnime2D.css";
// ↳ contains all visual effects: zoom, particles, smoke, slot glow...

// ============================================================================
// SECTION 1 — GAME CONSTANTS & GLOBAL SETTINGS
// ============================================================================

// How long a turn lasts in seconds
const TURN_DURATION = 60;

// Number of field slots (3 = "Hearthstone style" 3-lane layout)
const MAX_FIELD_SLOTS = 3;

// How many cards are dealt at start
const INITIAL_HAND_SIZE = 6;

// ============================================================================
// SECTION 2 — UNIT CREATION HELPERS
// These helpers take an entry from cards.js and produce a full "battle unit".
// A "unit" is a live instance of a card on the battlefield (unique ID, hp, etc).
// ============================================================================

/**
 * createUnit()
 * ------------------------------------------------------------
 * Takes a base card (from cards.js) and creates a unit instance.
 * Adds:
 *  • unique ID with owner prefix
 *  • normalized stats (attack, hp, race, stars, etc.)
 *  • image reference
 *  • owner side ("player" or "enemy")
 *  • ability-related properties
 */
function createUnit(cardData, owner) {
  return {
    id: `${cardData.id || "unit"}_${owner}_${Math.random()
      .toString(36)
      .slice(2, 7)}`,            // unique identifier per unit instance

    name: cardData.name ?? "Unnamed Beast",
    attack: Number(cardData.attack ?? cardData.baseAttack ?? 1),
    hp: Number(cardData.health ?? cardData.baseHealth ?? 1),
    maxHp: Number(cardData.health ?? cardData.baseHealth ?? 1),

    race: cardData.race ?? "beast",
    rarity: cardData.rarity ?? "common",
    stars: cardData.stars ?? 1,
    cost: cardData.cost ?? 1,
    text: cardData.text ?? "",   // for future effect system ("on hit", "on death")
    abilityId: cardData.abilityId || null, // Card-specific ability ID

    owner,
    image: cardData.image,       // full art image (string path)

    // Ability-related properties
    hasAttackedBefore: false,
    hasRevived: false,
    isStealthed: false,
    disabled: false,
    dodgeNextAttack: false,
    tempBuffs: [],
    permBuffs: [],
    poison: [],
    
    // Display properties for UI
    displayAttack: Number(cardData.attack ?? cardData.baseAttack ?? 1),
    displayHealth: Number(cardData.health ?? cardData.baseHealth ?? 1),

    // Additional flags for animations:
    faceUp: true,
    justDealt: false,
  };
}

/**
 * createCatCard()
 * ------------------------------------------------------------
 * Utility used only when generating demo decks for the enemy.
 * It finds one of your Sandwhisker cards by name or ID,
 * otherwise generates a fallback beast with placeholder stats.
 */
function createCatCard(i, owner) {
  const found = cards.find(c =>
    `${c.id}`.toLowerCase().includes("sandwhisker")
  );

  return createUnit(
    found || {
      id: `sandwhisker_${i}`,
      name: "Sandwhisker Stalker",
      attack: 2,
      health: 3,
      race: "beast",
      rarity: "common",
      image: "/src/assets/sandwhisker-lvl1.png",
    },
    owner
  );
}

/**
 * createDemoDeck()
 * ------------------------------------------------------------
 * If no deck is passed from the parent:
 *  • the player gets the first 6 cards from cards.js
 *  • the enemy gets 6 Sandwhiskers
 *
 * If a deck is provided:
 *  • each card is cloned as a unique unit
 */
function createDemoDeck(owner, providedDeck) {
  if (owner === "enemy") {
    return Array.from({ length: INITIAL_HAND_SIZE }, (_, i) =>
      createCatCard(i, "enemy")
    );
  }

  const deck = providedDeck?.length
    ? providedDeck                  // use provided deck
    : cards.slice(0, INITIAL_HAND_SIZE); // fallback: first 6 cards in DB

  return deck.map((card, i) =>
    createUnit({ ...card, id: `${card.id}_${i}` }, "player")
  );
}

/* ============================================================================
   ENHANCED CARD VIEW COMPONENT (updated to show fire while dying)
============================================================================ */
function CardView({ card, isAnimating = false, isDying = false }) {
  if (!card) return null;

  // Calculate display values with buffs
  const attackBuff = card.tempBuffs && card.tempBuffs.filter(b => b.stat === 'attack').reduce((sum, b) => sum + b.amount, 0);
  const healthBuff = card.tempBuffs && card.tempBuffs.filter(b => b.stat === 'health').reduce((sum, b) => sum + b.amount, 0);
  
  const displayAttack = card.displayAttack || card.attack + attackBuff;
  const displayHealth = card.displayHealth || card.hp + healthBuff;

  // show hp using available fields (hp preferred)
  const hpValue = Number(card.hp ?? card.displayHealth ?? card.maxHp ?? 0);

  return (
    <div className={`battlefield-card ${isAnimating ? 'attacker-3d' : ''} ${isDying ? 'card-death' : ''}`}>
      <div className="battlefield-card-inner">
        <div className="card-header">
          <div className="card-title">{card.name}</div>
          <div className="card-rarity">{card.rarity}</div>
        </div>

        <div className="card-art">
          {card.image ? (
            <img
              src={card.image}
              alt={card.name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            <div className="card-creature">{card.race}</div>
          )}
        </div>

        <div className="card-stats">
          <div className="card-stat card-stat--atk">
            ⚔ {displayAttack}
            {attackBuff > 0 && (
              <div className="card-buff">+{attackBuff}</div>
            )}
          </div>

          <div className="card-stat card-stat--hp">
            ❤ {hpValue}
            {healthBuff > 0 && (
              <div className="card-buff">+{healthBuff}</div>
            )}
          </div>
        </div>

        {/* Status indicators */}
        {card.poison && card.poison.length > 0 && (
          <div className="card-poison"></div>
        )}
        
        {card.isStealthed && (
          <div className="card-stealth"></div>
        )}
        
        {card.disabled && (
          <div className="card-disabled"></div>
        )}

        {/* Fire dying overlay */}
        {isDying && (
          <div className="fire-anim" aria-hidden>
            <div className="flame f1" />
            <div className="flame f2" />
            <div className="flame f3" />
          </div>
        )}
      </div>
    </div>
  );
}

/* ============================================================================
   CINEMATIC ATTACK EFFECTS COMPONENT
   Enhanced to show damage numbers for both attacker and defender
============================================================================ */

function CinematicAttackEffects({ attacker, target, damage, defenderDamage, onComplete }) {
  const [particles, setParticles] = useState([]);
  const [showLightning, setShowLightning] = useState(false);
  const [showImpact, setShowImpact] = useState(false);
  const [showDamage, setShowDamage] = useState(false);
  const [showAttackerDamage, setShowAttackerDamage] = useState(false);
  const [showRipples, setShowRipples] = useState(false);
  const [showCharge, setShowCharge] = useState(false);
  const [showFlash, setShowFlash] = useState(false);

  useEffect(() => {
    // Show charge effect before attack
    setShowCharge(true);
    setTimeout(() => setShowCharge(false), 800);

    // Create enhanced particles
    const energyParticles = [...Array(25)].map((_, i) => ({
      id: Math.random(),
      type: 'energy',
      startX: attacker.x,
      startY: attacker.y,
      midX: (target.x - attacker.x) * 0.5 + (Math.random() - 0.5) * 120,
      midY: (target.y - attacker.y) * 0.5 + (Math.random() - 0.5) * 120,
      endX: target.x + (Math.random() - 0.5) * 60,
      endY: target.y + (Math.random() - 0.5) * 60,
      delay: i * 0.015,
      size: 8 + Math.random() * 10
    }));

    const sparkParticles = [...Array(20)].map((_, i) => ({
      id: Math.random(),
      type: 'spark',
      startX: attacker.x,
      startY: attacker.y,
      midX: (target.x - attacker.x) * 0.6,
      midY: (target.y - attacker.y) * 0.6 - 60,
      endX: target.x + (Math.random() - 0.5) * 100,
      endY: target.y + (Math.random() - 0.5) * 100,
      delay: 0.1 + i * 0.025,
      size: 6 + Math.random() * 8
    }));

    setParticles([...energyParticles, ...sparkParticles]);

    // Show lightning bolt
    setTimeout(() => setShowLightning(true), 400);
    setTimeout(() => setShowLightning(false), 700);

    // Screen flash on impact
    setTimeout(() => setShowFlash(true), 600);
    setTimeout(() => setShowFlash(false), 800);

    // Show impact effect
    setTimeout(() => setShowImpact(true), 550);
    setTimeout(() => setShowImpact(false), 1400);

    // Show damage ripples
    setTimeout(() => setShowRipples(true), 650);
    setTimeout(() => setShowRipples(false), 2200);

    // Show enhanced damage number for defender
    setTimeout(() => setShowDamage(true), 700);
    setTimeout(() => setShowDamage(false), 2400);
    
    // Show damage number for attacker (counter-attack)
    if (defenderDamage > 0) {
      setTimeout(() => setShowAttackerDamage(true), 800);
      setTimeout(() => setShowAttackerDamage(false), 2500);
    }

    // Complete animation
    const timer = setTimeout(() => {
      onComplete();
    }, 1800);

    return () => clearTimeout(timer);
  }, [attacker, target, damage, defenderDamage, onComplete]);

  const lightningPath = showLightning ? {
    x1: attacker.x,
    y1: attacker.y,
    x2: target.x,
    y2: target.y,
    length: Math.sqrt(Math.pow(target.x - attacker.x, 2) + Math.pow(target.y - attacker.y, 2)),
    angle: Math.atan2(target.y - attacker.y, target.x - attacker.x) * 180 / Math.PI
  } : null;

  return (
    <>
      {/* Energy Charge Effect */}
      {showCharge && (
        <div
          className="energy-charge"
          style={{
            left: `${attacker.x}px`,
            top: `${attacker.y}px`,
          }}
        />
      )}

      {/* Screen Flash */}
      {showFlash && <div className="screen-flash" />}

      {/* Damage Ripples */}
      {showRipples && [...Array(3)].map((_, i) => (
        <div
          key={i}
          className="damage-ripple"
          style={{
            left: `${target.x}px`,
            top: `${target.y}px`,
            animationDelay: `${i * 0.2}s`
          }}
        />
      ))}

      {/* Cinematic Attack Container */}
      <div className="cinematic-attack">
        {/* Energy Orb at attacker */}
        <div
          className="energy-orb"
          style={{
            left: `${attacker.x - 30}px`,
            top: `${attacker.y - 30}px`,
          }}
        />

        {/* Lightning Bolt */}
        {showLightning && lightningPath && (
          <div
            className="lightning-bolt"
            style={{
              left: `${lightningPath.x1}px`,
              top: `${lightningPath.y1}px`,
              height: `${lightningPath.length}px`,
              transform: `rotate(${lightningPath.angle + 90}deg)`,
            }}
          />
        )}

        {/* Multi-layered Particles */}
        <div className="particle-layer">
          {particles.map(particle => (
            <div
              key={particle.id}
              className={`attack-particle particle-${particle.type}`}
              style={{
                '--start-x': `${particle.startX}px`,
                '--start-y': `${particle.startY}px`,
                '--mid-x': `${particle.midX}px`,
                '--mid-y': `${particle.midY}px`,
                '--end-x': `${particle.endX}px`,
                '--end-y': `${particle.endY}px`,
                left: `${particle.startX}px`,
                top: `${particle.startY}px`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                animationDelay: `${particle.delay}s`
              }}
            />
          ))}
        </div>

        {/* Epic Impact Effect */}
        {showImpact && (
          <div
            className="epic-impact"
            style={{
              left: `${target.x}px`,
              top: `${target.y}px`,
            }}
          >
            <div className="impact-shockwave" />
            <div className="impact-core" />
            <div className="impact-sparks" />
          </div>
        )}

        {/* Enhanced Damage Number for Defender */}
        {showDamage && (
          <div
            className="damage-number-enhanced"
            style={{
              left: `${target.x}px`,
              top: `${target.y}px`
            }}
          >
            -{damage}
          </div>
        )}
        
        {/* Damage Number for Attacker (Counter-attack) */}
        {showAttackerDamage && (
          <div
            className="damage-number-enhanced"
            style={{
              left: `${attacker.x}px`,
              top: `${attacker.y}px`
            }}
          >
            -{defenderDamage}
          </div>
        )}
      </div>
    </>
  );
}

/* ============================================================================
   MAIN COMPONENT
============================================================================ */

export default function BattlefieldSceneAnime({
  initialPlayerDeck,
  initialEnemyDeck,
  levelInfo,
  onExitBattle,
  onBattleComplete,
}) {

  /* RULE BOOK */
  const [rulesOpen, setRulesOpen] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  /* SETTINGS PANEL */
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState({
    sound: true,
    music: true,
    language: "en",
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  });

  /* ABILITY SYSTEM STATE */
  const [abilityExecutor, setAbilityExecutor] = useState(null);
  const [cinematicEffects, setCinematicEffects] = useState([]);
  const [isNight, setIsNight] = useState(getNightState());
  const abilityExecutorRef = useRef(null);

  /* STATE */
  const [playerDeck] = useState(() =>
    createDemoDeck("player", initialPlayerDeck)
  );
  const [enemyDeck] = useState(() =>
    createDemoDeck("enemy", initialEnemyDeck)
  );

  const [playerHand, setPlayerHand] = useState([]);
  const [enemyHand, setEnemyHand] = useState([]);

  const [playerField, setPlayerField] = useState([null, null, null]);
  const [enemyField, setEnemyField] = useState([null, null, null]);

  const [currentPlayer, setCurrentPlayer] = useState("player");
  // stable ref to avoid stale closures in callbacks
  const currentPlayerRef = useRef(currentPlayer);
  useEffect(() => { currentPlayerRef.current = currentPlayer; }, [currentPlayer]);

  // Refs for fields so AbilityExecutor gameState reads up-to-date arrays
  const playerFieldRef = useRef(playerField);
  const enemyFieldRef = useRef(enemyField);
  useEffect(() => { playerFieldRef.current = playerField; }, [playerField]);
  useEffect(() => { enemyFieldRef.current = enemyField; }, [enemyField]);
  
  const [turnSeconds, setTurnSeconds] = useState(60);
  const [battlePhase, setBattlePhase] = useState("setup");
  const [showBattleBanner, setShowBattleBanner] = useState(false);
  const [hasAttackedThisTurn, setHasAttackedThisTurn] = useState(false);

  const [selectedHandCardId, setSelectedHandCardId] = useState(null);
  const [selectedAttackerId, setSelectedAttackerId] = useState(null);
  const [selectedTargetId, setSelectedTargetId] = useState(null);

  const [draggingCard, setDraggingCard] = useState(null);
  const [hoverFieldSlot, setHoverFieldSlot] = useState(null);
  const [draggedCardData, setDraggedCardData] = useState(null);

  const [isDealing, setIsDealing] = useState(true);
  const [dealIndex, setDealIndex] = useState(0);

  const [attackAnimation, setAttackAnimation] = useState(null);
  const [animatingSlots, setAnimatingSlots] = useState({ attacker: null, target: null });
  const [screenShake, setScreenShake] = useState(false);

  // NEW: Enhanced visual effects state
  const [comboCount, setComboCount] = useState(0);
  const [isZooming, setIsZooming] = useState(false);
  const [dyingCards, setDyingCards] = useState(new Set());
  const [envParticles, setEnvParticles] = useState([]);
  const [glowTrails, setGlowTrails] = useState([]);

  // Battle result state (victory / defeat overlay & reward)
  const [battleResult, setBattleResult] = useState(null); // 'victory' | 'defeat' | null
  const [rewardGold, setRewardGold] = useState(0);
  const [showRewardAnim, setShowRewardAnim] = useState(false);

  // Initialize ability executor once and let gameState read from refs
  useEffect(() => {
    const gameState = {
      getAllUnits: () => [...(playerFieldRef.current || []).filter(Boolean), ...(enemyFieldRef.current || []).filter(Boolean)],
      getAllUnitsForPlayer: owner => (owner === 'player' ? (playerFieldRef.current || []) : (enemyFieldRef.current || [])).filter(Boolean),
      // allow abilities to push VFX into component cinematicEffects
      queueVFX: effect => { if (effect) setCinematicEffects(prev => [...prev, effect]); },
      clearQueuedCinematics: () => setCinematicEffects([]),
      getAdjacentUnits: unit => {
        const field = unit.owner === 'player' ? (playerFieldRef.current || []) : (enemyFieldRef.current || []);
        const idx = field.findIndex(u => u?.id === unit.id);
        if (idx === -1) return [];
        return [field[idx - 1], field[idx + 1]].filter(Boolean);
      },
      getAdjacentSlots: unit => {
        const field = unit.owner === 'player' ? (playerFieldRef.current || []) : (enemyFieldRef.current || []);
        const idx = field.findIndex(u => u?.id === unit.id);
        const slots = [];
        if (idx > 0) slots.push({ index: idx - 1, unit: field[idx - 1] });
        if (idx < field.length - 1) slots.push({ index: idx + 1, unit: field[idx + 1] });
        return slots;
      },
      displayMessage: (message) => {
        const messageEl = document.createElement('div');
        messageEl.className = 'ability-message';
        messageEl.textContent = message;
        document.body.appendChild(messageEl);
        setTimeout(() => {
          messageEl.style.opacity = '0';
          setTimeout(() => { try { document.body.removeChild(messageEl); } catch {} }, 2000);
        }, 100);
      },
      drawCards: (count) => { console.log(`Drawing ${count} cards`); },
      stealCards: (count) => { console.log(`Stealing ${count} cards`); },
      summonToken: (token) => { console.log(`Summoning token: ${token.name}`); },
      applyCinematic: (effect) => {
        const messageEl = document.createElement('div');
        messageEl.className = 'ability-message';
        messageEl.textContent = effect.message;
        document.body.appendChild(messageEl);
        setTimeout(() => {
          messageEl.style.opacity = '0';
          setTimeout(() => { try { document.body.removeChild(messageEl); } catch {} }, 2000);
        }, 100);
      },
      isNight
    };

    const executor = new AbilityExecutor(gameState);
    setAbilityExecutor(executor);
    abilityExecutorRef.current = executor;
    console.log("Ability executor initialized:", executor);
    setTimeout(() => { if (executor && typeof executor.markAsInitialized === 'function') executor.markAsInitialized(); }, 100);
  }, []); // run once on mount

  // Update night state periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const nightState = getNightState();
      setIsNight(nightState);
      if (abilityExecutorRef.current) {
        abilityExecutorRef.current.gameState.isNight = nightState;
      }
    }, 60000); // Check every minute
    
    return () => clearInterval(interval);
  }, []);

  // Update card hand layout
  useEffect(() => {
    const cards = document.querySelectorAll(".hand-row--player .hand-card");
    if (!cards.length) return;

    const total = cards.length;

    cards.forEach((card, index) => {
      card.style.setProperty("--index", index);
      card.style.setProperty("--total", total);
      card.style.zIndex = 10 + index; // make sure cards don't hide each other
    });
  }, [playerHand]);   // <-- must depend on hand array

  const dealSound = useMemo(() => new Audio("/sounds/card-deal.mp3"), []);
  const attackSound = useMemo(() => new Audio("/sounds/attack.mp3"), []);
  const hitSound = useMemo(() => new Audio("/sounds/hit.mp3"), []);

  /* TIMER COUNTDOWN */
  useEffect(() => {
    if (battlePhase !== "battle") return;

    const timer = setInterval(() => {
      setTurnSeconds(prev => {
        if (prev <= 1) {
          endTurn();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentPlayer, battlePhase]);

  /* CHECK IF BATTLE SHOULD BEGIN */
  useEffect(() => {
    const playerFieldCount = playerField.filter(u => u !== null).length;
    const enemyFieldCount = enemyField.filter(u => u !== null).length;

    if (battlePhase === "setup" && playerFieldCount >= 3 && enemyFieldCount >= 3) {
      setShowBattleBanner(true);
      setBattlePhase("battle");

      setTimeout(() => {
        setShowBattleBanner(false);
      }, 3000);
    }
  }, [playerField, enemyField, battlePhase]);

  /* DEAL CARDS */
  useEffect(() => {
    if (!isDealing) return;

    if (dealIndex >= 6) {
      setIsDealing(false);
      return;
    }

    const t = setTimeout(() => {
      const p = playerDeck[dealIndex];
      const e = enemyDeck[dealIndex];

      if (p)
        setPlayerHand(h => [...h, { ...p, faceUp: true, justDealt: true }]);

      if (e)
        setEnemyHand(h => [...h, { ...e, faceUp: false, justDealt: true }]);

      dealSound.currentTime = 0;
      dealSound.play().catch(() => { });

      setDealIndex(i => i + 1);
    }, 330);

    return () => clearTimeout(t);
  }, [dealIndex, isDealing, playerDeck, enemyDeck]);

  useEffect(() => {
    if (!enemyHand.length) return;
    const t = setTimeout(() => {
      setEnemyHand(h => h.map(c => ({ ...c, faceUp: true })));
    }, 900);
    return () => clearTimeout(t);
  }, [enemyHand.length]);

  /* DRAG & DROP */
  const canPlayerSummonToSlot = useCallback(
    slotIndex => {
      return (
        currentPlayer === "player" &&
        !isDealing &&
        playerField[slotIndex] === null
      );
    },
    [currentPlayer, isDealing, playerField]
  );

  const handleHandDragStart = (owner, handIndex, e) => {
    if (owner !== "player") return;
    if (currentPlayer !== "player") return;
    if (isDealing) return;

    const card = playerHand[handIndex];
    if (!card) return;

    // Add glow trail when dragging starts
    setGlowTrails(trails => [...trails, {
      id: card.id,
      x: e.clientX,
      y: e.clientY,
      opacity: 0.8
    }]);

    setDraggingCard(handIndex);
    setDraggedCardData({ owner: "player", handIndex, card });
    setSelectedHandCardId(card.id);

    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", JSON.stringify({ owner: "player", handIndex }));
  };

  const handleDragEnd = (e) => {
    setDraggingCard(null);
    setHoverFieldSlot(null);
    setDraggedCardData(null);
    setGlowTrails([]);
  };

  const handleFieldDragOver = (owner, slotIndex, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (owner !== "player") return;

    e.dataTransfer.dropEffect = "move";

    const legal = canPlayerSummonToSlot(slotIndex);

    setHoverFieldSlot({
      owner,
      index: slotIndex,
      legal,
    });
  };

  const handleFieldDragLeave = (owner, slotIndex) => {
    if (hoverFieldSlot && hoverFieldSlot.owner === owner && hoverFieldSlot.index === slotIndex) {
      setHoverFieldSlot(null);
    }
  };

/**
 * handleFieldDrop()
 * ------------------------------------------------------------
 * Handles the drop event when a player drags a card from hand onto a field slot.
 * This function validates the drop, places the unit on the field, removes it from hand,
 * and triggers any on-summon abilities.
 * 
 * @param {string} owner - The owner of the field slot ("player" or "enemy")
 * @param {number} slotIndex - The index of the field slot (0, 1, or 2)
 * @param {DragEvent} e - The drag event object
 */
const handleFieldDrop = (owner, slotIndex, e) => {
  // Prevent browser's default drop behavior
  e.preventDefault();
  
  // Stop the event from bubbling up to parent elements
  e.stopPropagation();

  // SECURITY CHECK: Only allow drops on player's field
  if (owner !== "player") return;

  // EXTRACT DRAG DATA: Try to get card data from the drag event
  let data = null;
  try {
    // Parse the JSON string that was set during drag start
    data = JSON.parse(e.dataTransfer.getData("text/plain"));
  } catch {
    // Fallback: If parsing fails, use the data stored in component state
    data = draggedCardData;
  }

  // VALIDATION: Ensure we have valid data and it belongs to the player
  if (!data || data.owner !== "player") return;

  // VALIDATION: Check if the player can legally summon to this slot
  if (!canPlayerSummonToSlot(slotIndex)) return;

  // GET CARD TO PLACE: Extract the card from the player's hand
  const handIndex = data.handIndex;
  const cardToPlace = playerHand[handIndex];

  // SAFETY CHECK: Ensure the card exists in the hand
  if (!cardToPlace) return;

  // CREATE UNIT: Make a copy of the card data to create a new unit instance
  const newUnit = { ...cardToPlace };
  
  // PLACE UNIT ON FIELD: Update the player's field state
  setPlayerField(f => {
    const next = [...f]; // Create a copy of the current field array
    next[slotIndex] = newUnit; // Place the new unit in the specified slot
    return next; // Return the updated field array
  });

  // REMOVE CARD FROM HAND: Update the player's hand state
  setPlayerHand(h => {
    const next = [...h]; // Create a copy of the current hand array
    next.splice(handIndex, 1); // Remove the card at the hand index
    return next; // Return the updated hand array
  });

  // TRIGGER ABILITIES: Process any on-summon abilities for the new unit
  if (abilityExecutorRef.current) {
    console.log("Triggering summon ability for:", newUnit); // Debug log
    
    // Execute the summon ability processing
    abilityExecutorRef.current.processSummon(newUnit);
    
    // Log the unit after abilities are processed
    console.log("Unit after abilities:", newUnit); // Debug log
    
    // GET CINEMATIC EFFECTS: Retrieve any visual effects from the ability system
    const effects = abilityExecutorRef.current.getCinematicEffects();
    console.log("Got cinematic effects:", effects); // Debug log
    
    // Filter out text effects, only keep particle effects
    const particleEffects = effects.filter(effect => effect.type === 'particles');
    console.log("Filtered particle effects:", particleEffects); // Debug log
    
    // Set the filtered effects in the component state
    setCinematicEffects(particleEffects);
    
    // FORCE UI UPDATE: Trigger a re-render to show updated stats from abilities
    // This ensures that any stat changes from abilities are immediately visible
    setTimeout(() => {
      console.log("Forcing UI update to show buffed stats"); // Debug log
      console.log("Player field after update:", playerField); // Debug log
      setPlayerField(f => [...f]); // Force re-render by creating a new array reference
    }, 100);
    
    // CLEANUP: Clear cinematic effects after they've been displayed
    setTimeout(() => {
      console.log("Clearing cinematic effects"); // Debug log
      abilityExecutorRef.current.clearCinematicEffects();
      setCinematicEffects([]); // Clear the effects in component state
    }, 2000); // 2 seconds is enough for particle effects
  }

  // RESET DRAG STATE: Clean up all drag-related state variables
  setDraggingCard(null); // Clear the dragging card index
  setHoverFieldSlot(null); // Clear the hover state for field slots
  setSelectedHandCardId(null); // Deselect any cards in hand
  setDraggedCardData(null); // Clear the stored drag data
};

  /* FIELD CLICKS */
  const handlePlayerFieldClick = slot => {
    if (currentPlayer !== "player" || battlePhase !== "battle") return;
    const u = playerField[slot];
    if (!u) return;
    setSelectedAttackerId(prev => (prev === u.id ? null : u.id));
    setSelectedTargetId(null);
  };

  const handleEnemyFieldClick = slot => {
    if (currentPlayer !== "player" || battlePhase !== "battle") return;
    const u = enemyField[slot];
    if (!u) return;
    if (selectedAttackerId) setSelectedTargetId(u.id);
  };

  /* GET SLOT CENTER POSITION */
  // FIXED: Use fixed positions instead of window.innerHeight to prevent field separation
  const getSlotCenter = (owner, slot) => {
    const slotWidth = 140;
    const gap = 20;
    const startX = (window.innerWidth - (slotWidth * 3 + gap * 2)) / 2;
    const x = startX + slot * (slotWidth + gap) + slotWidth / 2;
    // FIXED: Use fixed Y positions instead of window.innerHeight
    const y = owner === "player" ? window.innerHeight - 260 : 260;
    return { x, y };
  };

  /* CINEMATIC ATTACK LOGIC */
  const performAttack = useCallback(
    (atkOwner, atkSlot, defOwner, defSlot) => {
      const atkField = atkOwner === "player" ? playerField : enemyField;
      const defField = atkOwner === "player" ? enemyField : playerField;

      const attacker = atkField[atkSlot];
      const defender = defField[defSlot];
      if (!attacker || !defender) return;

      // compute positions
      const attackerPos = getSlotCenter(atkOwner, atkSlot);
      const targetPos = getSlotCenter(defOwner, defSlot);

      // set animating slots and cinematic attack animation so effects render
      setAnimatingSlots({ attacker: `${atkOwner}-${atkSlot}`, target: `${defOwner}-${defSlot}` });
      
      // FIXED: Include defenderDamage in attack animation
      setAttackAnimation({ 
        attacker: { owner: atkOwner, slot: atkSlot, unit: attacker, pos: attackerPos }, 
        target: { owner: defOwner, slot: defSlot, unit: defender, pos: targetPos }, 
        damage: attacker.attack,
        defenderDamage: defender.attack
      });
      
      setScreenShake(true); setTimeout(() => setScreenShake(false), 800);
      setComboCount(c => c + 1); setTimeout(() => setComboCount(0), 3000);
      
      // allow ability system to prepare VFX
      if (abilityExecutorRef.current) {
        try { abilityExecutorRef.current.processBeforeDamage(attacker, defender); } catch {}
        try { setCinematicEffects(abilityExecutorRef.current.getCinematicEffects() || []); } catch {}
      }

      // play attack sound
      attackSound.currentTime = 0; attackSound.play().catch(()=>{});

      setTimeout(() => {
        hitSound.currentTime = 0; hitSound.play().catch(()=>{});

        // compute current HP in a safe way
        const defCurrentHp = Number(defender.hp ?? defender.displayHealth ?? defender.maxHp ?? 0);
        const atkCurrentHp = Number(attacker.hp ?? attacker.displayHealth ?? attacker.maxHp ?? 0);

        const dmgToDef = attacker.attack;
        const dmgToAtk = defender.attack;

        // apply to defender (safe hp math)
        const newDefHp = defCurrentHp - dmgToDef;
        if (defOwner === "player") {
          setPlayerField(f => {
            const n = [...f];
            if (newDefHp <= 0) {
              setDyingCards(s => new Set([...s, defender.id]));
              setTimeout(()=> setDyingCards(s => { const ns=new Set(s); ns.delete(defender.id); return ns; }), 1500);
            }
            n[defSlot] = newDefHp <= 0 ? null : { ...defender, hp: newDefHp };
            return n;
          });
        } else {
          setEnemyField(f => {
            const n = [...f];
            if (newDefHp <= 0) {
              setDyingCards(s => new Set([...s, defender.id]));
              setTimeout(()=> setDyingCards(s => { const ns=new Set(s); ns.delete(defender.id); return ns; }), 1500);
            }
            n[defSlot] = newDefHp <= 0 ? null : { ...defender, hp: newDefHp };
            return n;
          });
        }

        // apply to attacker
        const newAtkHp = atkCurrentHp - dmgToAtk;
        if (atkOwner === "player") {
          setPlayerField(f => {
            const n = [...f];
            if (newAtkHp <= 0) {
              setDyingCards(s => new Set([...s, attacker.id]));
              setTimeout(()=> setDyingCards(s => { const ns=new Set(s); ns.delete(attacker.id); return ns; }), 1500);
            }
            n[atkSlot] = newAtkHp <= 0 ? null : { ...attacker, hp: newAtkHp };
            return n;
          });
        } else {
          setEnemyField(f => {
            const n = [...f];
            if (newAtkHp <= 0) {
              setDyingCards(s => new Set([...s, attacker.id]));
              setTimeout(()=> setDyingCards(s => { const ns=new Set(s); ns.delete(attacker.id); return ns; }), 1500);
            }
            n[atkSlot] = newAtkHp <= 0 ? null : { ...attacker, hp: newAtkHp };
            return n;
          });
        }

        // Process after damage abilities
        if (abilityExecutorRef.current) {
          try { abilityExecutorRef.current.processAfterDamage(attacker, defender); } catch {}
          try { setCinematicEffects(abilityExecutorRef.current.getCinematicEffects() || []); } catch {}
          setTimeout(()=> { try{ abilityExecutorRef.current.clearCinematicEffects(); }catch{}; setCinematicEffects([]); }, 3000);
        }

        // cleanup & release lock / stop anims
        setTimeout(() => {
          setAttackAnimation(null);
          setAnimatingSlots({ attacker: null, target: null });
          setSelectedAttackerId(null);
          setSelectedTargetId(null);
          setHasAttackedThisTurn(true);
        }, 500);
      }, 600);
    },
    [playerField, enemyField, attackSound, hitSound]
  );

  /* ENEMY AI */
  useEffect(() => {
    if (currentPlayer !== "enemy") return;

    if (battlePhase === "setup") {
      const enemyFieldCount = enemyField.filter(u => u !== null).length;

      if (enemyFieldCount < 3 && enemyHand.length > 0) {
        const emptySlots = enemyField.map((u, i) => u === null ? i : -1).filter(i => i >= 0);
        if (emptySlots.length > 0) {
          const cardToPlay = enemyHand[0];
          const targetSlot = emptySlots[0];

          // Create unit and place on field
          const newUnit = { ...cardToPlay };
          setEnemyField(f => {
            const next = [...f];
            next[targetSlot] = newUnit;
            return next;
          });

          setEnemyHand(h => {
            const next = [...h];
            next.splice(0, 1);
            return next;
          });

          // Trigger on-summon abilities
          if (abilityExecutorRef.current) {
            abilityExecutorRef.current.processSummon(newUnit);
          }

          setTimeout(() => {
            setCurrentPlayer("player");
          }, 1000);
          return;
        }
      } else {
        setTimeout(() => {
          setCurrentPlayer("player");
        }, 1000);
        return;
      }
    }

    if (battlePhase === "battle") {
      // First: if there are empty slots (including slots freed by dying cards)
      // fill them from enemy hand before performing attacks.
      const emptySlots = enemyField.map((u, i) => (u === null ? i : -1)).filter(i => i >= 0);
      if (emptySlots.length > 0 && enemyHand.length > 0) {
        const placeCount = Math.min(emptySlots.length, enemyHand.length);
        const toPlace = enemyHand.slice(0, placeCount);

        setEnemyField(prev => {
          const next = [...prev];
          for (let i = 0; i < placeCount; i++) {
            const slotIndex = emptySlots[i];
            next[slotIndex] = { ...toPlace[i] };
          }
          return next;
        });

        setEnemyHand(prev => prev.slice(placeCount));

        // Trigger on-summon for placed units
        if (abilityExecutorRef.current) {
          toPlace.forEach(unit => {
            try { abilityExecutorRef.current.processSummon({ ...unit }); } catch (e) { /* ignore */ }
          });
        }

        // After summoning, pass turn back to player
        setTimeout(() => {
          setCurrentPlayer("player");
          setHasAttackedThisTurn(false);
        }, 900);

        return;
      }

      // Otherwise, perform attack as before
      const enemyUnits = enemyField.map((u, i) => ({ u, i })).filter(x => x.u);
      const playerUnits = playerField.map((u, i) => ({ u, i })).filter(x => x.u);

      if (!enemyUnits.length || !playerUnits.length) {
        setTimeout(() => {
          setCurrentPlayer("player");
        }, 1000);
        return;
      }

      const attacker = [...enemyUnits].sort((a, b) => b.u.attack - a.u.attack)[0];
      const target = [...playerUnits].sort((a, b) => a.u.hp - b.u.hp)[0];

      setTimeout(() => {
        performAttack("enemy", attacker.i, "player", target.i);
      }, 800);

      setTimeout(() => {
        setCurrentPlayer("player");
        setHasAttackedThisTurn(false);
      }, 2500);
    }
  }, [currentPlayer, battlePhase, enemyField, playerField, enemyHand, dyingCards]);

  /* END-OF-BATTLE DETECTION */
  useEffect(() => {
    // avoid deciding while initial dealing is happening or during setup
    if (isDealing) return;
    if (battlePhase === "setup") return;
    if (battleResult) return;

    const playerEmpty = playerField.every(s => s === null) && playerHand.length === 0;
    const enemyEmpty = enemyField.every(s => s === null) && enemyHand.length === 0;

    if (playerEmpty || enemyEmpty) {
      const result = enemyEmpty ? "victory" : "defeat";
      setBattleResult(result);
      setBattlePhase("ended");

      if (result === "victory") {
        const base = 100;
        const bonus = Math.floor(Math.random() * 120);
        const gold = base + bonus;
        setRewardGold(gold);
        setShowRewardAnim(true);
        setTimeout(() => setShowRewardAnim(false), 3600);
        setTimeout(() => { try { onBattleComplete && onBattleComplete({ result, reward: gold }); } catch {} }, 2000);
      } else {
        setRewardGold(0);
        setTimeout(() => { try { onBattleComplete && onBattleComplete({ result, reward: 0 }); } catch {} }, 2000);
      }
    }
  }, [playerField, enemyField, playerHand.length, enemyHand.length, battlePhase, isDealing, battleResult, onBattleComplete]);

  /* END TURN */
  const endTurn = useCallback(() => {
    const owner = currentPlayerRef.current; // read latest owner
    if (abilityExecutorRef.current && typeof abilityExecutorRef.current.processTurnEnd === "function") {
      try { abilityExecutorRef.current.processTurnEnd(owner); } catch (e) { console.warn(e); }
      try { setCinematicEffects(abilityExecutorRef.current.getCinematicEffects() || []); } catch {}
      setTimeout(() => { try { abilityExecutorRef.current.clearCinematicEffects(); } catch {} setCinematicEffects([]); }, 3000);
    }

    setCurrentPlayer(prev => (prev === "player" ? "enemy" : "player"));
    setSelectedAttackerId(null);
    setSelectedTargetId(null);
    setSelectedHandCardId(null);
    setHasAttackedThisTurn(false);
    setTurnSeconds(TURN_DURATION);
  }, []); // stable, no deps

  // Process turn start abilities
  useEffect(() => {
    if (abilityExecutorRef.current) {
      abilityExecutorRef.current.processTurnStart(currentPlayer);
      
      // Update cinematic effects from ability executor
      setCinematicEffects(abilityExecutorRef.current.getCinematicEffects());
      
      // Clear cinematic effects after displaying them
      setTimeout(() => {
        abilityExecutorRef.current.clearCinematicEffects();
        setCinematicEffects([]);
      }, 3000);
    }
  }, [currentPlayer]);

  /* RENDER FIELD SLOT */
  const renderFieldSlot = (owner, slot, unit) => {
    const hovering =
      hoverFieldSlot &&
      hoverFieldSlot.owner === owner &&
      hoverFieldSlot.index === slot;

    const isLegal = hovering && hoverFieldSlot.legal;
    const isIllegal = hovering && !hoverFieldSlot.legal;
    const isAttacker = animatingSlots.attacker === `${owner}-${slot}`;
    const isTarget = animatingSlots.target === `${owner}-${slot}`;
    const isDying = unit && dyingCards.has(unit.id);

    // Check for buffs
    const hasAttackBuff = unit && unit.tempBuffs && unit.tempBuffs.some(b => b.stat === 'attack');
    const hasHealthBuff = unit && unit.tempBuffs && unit.tempBuffs.some(b => b.stat === 'health');
    const hasArmorBuff = unit && unit.tempBuffs && unit.tempBuffs.some(b => b.stat === 'armor');
    const isPoisoned = unit && unit.poison && unit.poison.length > 0;
    const isStealthed = unit && unit.isStealthed;
    const isDisabled = unit && unit.disabled;

    // Calculate buff values
    const attackBuffValue = unit && unit.tempBuffs && unit.tempBuffs
      .filter(b => b.stat === 'attack')
      .reduce((sum, b) => sum + b.amount, 0);
      
    const healthBuffValue = unit && unit.tempBuffs && unit.tempBuffs
      .filter(b => b.stat === 'health')
      .reduce((sum, b) => sum + b.amount, 0);
      
    const armorBuffValue = unit && unit.tempBuffs && unit.tempBuffs
      .filter(b => b.stat === 'armor')
      .reduce((sum, b) => sum + b.amount, 0);

    const className = [
      "field-slot",
      owner === "player" ? "field-slot--player" : "field-slot--enemy",
      isLegal && "field-slot--hover-legal",
      isIllegal && "field-slot--hover-illegal",
      unit && selectedAttackerId === unit.id && "field-slot--attacker",
      unit && selectedTargetId === unit.id && "field-slot--target",
      isTarget && "target-hit-3d",
      hasAttackBuff && "field-slot--buff-attack",
      hasHealthBuff && "field-slot--buff-health",
      hasArmorBuff && "field-slot--buff-armor",
      isPoisoned && "field-slot--poison",
      isStealthed && "field-slot--stealth",
      isDisabled && "field-slot--disabled"
    ].filter(Boolean).join(" ");

    return (
      <div
        key={`${owner}-slot-${slot}`}
        className={className}
        onDragOver={e => handleFieldDragOver(owner, slot, e)}
        onDrop={e => handleFieldDrop(owner, slot, e)}
        onDragLeave={() => handleFieldDragLeave(owner, slot)}
        onClick={() =>
          unit
            ? owner === "player"
              ? handlePlayerFieldClick(slot)
              : handleEnemyFieldClick(slot)
            : null
        }
      >
        {unit ? (
          <>
            <CardView card={unit} isAnimating={isAttacker} isDying={isDying} />
            
            {/* Buff indicators */}
            {hasAttackBuff && (
              <div className="buff-indicator buff-attack">+{attackBuffValue}</div>
            )}
            
            {hasHealthBuff && (
              <div className="buff-indicator buff-health">+{healthBuffValue}</div>
            )}
            
            {hasArmorBuff && (
              <div className="buff-indicator buff-armor">+{armorBuffValue}</div>
            )}
            
            {/* Status indicators */}
            {isPoisoned && <div className="status-indicator status-poison"></div>}
            {isStealthed && <div className="status-indicator status-stealth"></div>}
            {isDisabled && <div className="status-indicator status-disabled"></div>}
            
            {isTarget && <div className="afterglow" />}
          </>
        ) : (
          <div className="empty-slot">
            <div className="slot-rune">⚜</div>
          </div>
        )}
      </div>
    );
  };

  /* RENDER HAND CARD */
  const renderHandCard = (owner, c, index) => {
    const isPlayer = owner === "player";
    const isSelected = selectedHandCardId === c.id;
    const isDragging = draggingCard === index;

    return (
      <div
        key={`${owner}-hand-${c.id}`}
        className={[
          "hand-card",
          owner === "player" ? "hand-card--player" : "hand-card--enemy",
          c.justDealt && "hand-card--dealt",
          isSelected && "hand-card--selected",
          isDragging && "hand-card--dragging",
        ].filter(Boolean).join(" ")}
        style={{
          "--index": index,
          "--total": owner === "player" ? playerHand.length : enemyHand.length
        }}
        draggable={isPlayer && currentPlayer === "player" && !isDealing}
        onDragStart={e => handleHandDragStart(owner, index, e)}
        onDragEnd={handleDragEnd}
        onClick={() => {
          if (!isPlayer) return;
          if (currentPlayer !== "player") return;
          if (isDealing) return;
          setSelectedHandCardId(prev => (prev === c.id ? null : c.id));
        }}
      >
        <CardView card={c} />
      </div>
    );
  };

  // Render cinematic effect
  const renderCinematicEffect = (effect) => {
    console.log("Rendering cinematic effect:", effect); // Debug log
    
    // Render buff animation effect
    if (effect.type === 'buffAnimation') {
      return <BuffAnimation key={effect.id} effect={effect} />;
    }
    
    // Render particle effects
    if (effect.type === 'particles') {
      const particleCount = effect.count || 10; // Default to 10 if count is undefined
      console.log(`Rendering ${particleCount} ${effect.particleType} particles`); // Debug log
      
      return (
        <div key={effect.id} className="cinematic-particles">
          {[...Array(particleCount)].map((_, i) => (
            <div
              key={i}
              className="particle"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                backgroundColor: effect.particleType || 'white'
              }}
            />
          ))}
        </div>
      );
    }
    
    // Skip all text effects
    return null;
  };

  // New BuffAnimation component
  const BuffAnimation = ({ effect }) => {
    const [animationProgress, setAnimationProgress] = useState(0);
    
    useEffect(() => {
      // Start the animation
      const timer = setInterval(() => {
        setAnimationProgress(prev => {
          if (prev >= 100) {
            clearInterval(timer);
            return 100;
          }
          return prev + 5;
        });
      }, 50);
      
      return () => clearInterval(timer);
    }, []);
    
    // Get the position of the from unit
    const fromUnitPos = getSlotCenter(effect.fromUnit.owner, 
      playerField.findIndex(u => u?.id === effect.fromUnit.id));
    
    return (
      <>
        {effect.toUnits.map(toUnit => {
          // Get the position of the to unit
          const toUnitPos = getSlotCenter(toUnit.owner, 
            playerField.findIndex(u => u?.id === toUnit.id));
          
          // Calculate the path from from unit to to unit
          const dx = toUnitPos.x - fromUnitPos.x;
          const dy = toUnitPos.y - fromUnitPos.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Calculate the current position of the animation
          const currentX = fromUnitPos.x + (dx * animationProgress / 100);
          const currentY = fromUnitPos.y + (dy * animationProgress / 100);
          
          // Create a stat icon based on the stat type
          let statIcon = "⚔"; // Default to attack
          if (effect.stat === "health") statIcon = "❤";
          if (effect.stat === "armor") statIcon = "🛡";
          
          return (
            <div
              key={toUnit.id}
              className="buff-animation"
              style={{
                left: `${currentX}px`,
                top: `${currentY}px`,
                opacity: 1 - (animationProgress / 100),
                color: effect.color
              }}
            >
              {statIcon} +1
            </div>
          );
        })}
      </>
    );
  };

  // FULLSCREEN TOGGLE
  useEffect(() => {
    const btn = document.getElementById("fullscreen-toggle");
    if (!btn) return;

    btn.onclick = () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => console.log(err));
      } else {
        document.exitFullscreen().catch(err => console.log(err));
      }
    };
  }, []);

  /* ============================================================================
   NEW: visual helpers & state for damage overlays + injected CSS
   FIXED: Removed redundant damage overlays that were appearing when placing cards
  ============================================================================ */
  // FIXED: Removed damageOverlays state and showDamage function to prevent redundant damage numbers

  // inject minimal CSS for result panel, damage, fire if not present
  // FIXED: Updated CSS to prevent field separation during animations
  useEffect(() => {
    if (document.getElementById('bf-anime2d-inline-styles')) return;
    const css = `
/* Victory / Defeat — medieval parchment style */
.battle-result-overlay { position: fixed; inset:0; display:flex; align-items:center; justify-content:center; background: rgba(10,8,6,0.6); z-index:1400; }
.battle-result-panel {
  width: 560px; max-width:92%;
  padding:26px 28px;
  border-radius:14px;
  background:
    radial-gradient(1200px 300px at 10% 10%, rgba(255,235,200,0.06), transparent 10%),
    linear-gradient(180deg, #f8e9cf 0%, #e9d8b7 40%, #d9caa0 100%);
  box-shadow: 0 30px 80px rgba(0,0,0,0.7), inset 0 2px 0 rgba(255,255,255,0.15);
  color:#2b1f0f;
  text-align:center;
  border: 6px solid rgba(88,64,28,0.9);
  font-family: "Cinzel", "Georgia", serif;
  position:relative;
  overflow:visible;
}
/* ornament / crown */
.battle-result-panel::before {
  content: "✠";
  position:absolute;
  top:-28px;
  left:50%;
  transform:translateX(-50%);
  font-size:36px;
  color:#f2d186;
  text-shadow:0 6px 18px rgba(0,0,0,0.45);
}
/* title */
.result-title {
  font-size:34px;
  font-weight:900;
  margin:6px 0 8px;
  text-transform:uppercase;
  color:#2f1b00;
  letter-spacing:2px;
  text-shadow: 0 6px 18px rgba(255,220,120,0.06);
  background: linear-gradient(180deg, rgba(255,245,200,0.95), rgba(220,180,80,0.85));
  display:inline-block;
  padding:8px 18px;
  border-radius:8px;
  border: 1px solid rgba(120,80,30,0.18);
  box-shadow: 0 8px 24px rgba(60,30,0,0.25);
}
.result-victory { color:#5a2c00; }
.result-defeat { color:#4b0b0b; }

/* decorative divider below title */
.result-body { margin-top:10px; }

/* reward coins */
.reward-3d { display:flex; gap:10px; justify-content:center; margin:12px 0 6px; }
.coin { width:36px; height:36px; border-radius:50%; background: radial-gradient(circle at 30% 30%, #fff3be, #ffb84a); box-shadow: inset 0 -6px 10px rgba(0,0,0,0.15), 0 8px 26px rgba(0,0,0,0.45); transform: translateY(0); animation: coinPop 900ms ease; }
@keyframes coinPop { 0%{ transform: translateY(-28px) scale(.6); opacity:0 } 60%{ transform: translateY(6px) scale(1.06); opacity:1 } 100%{ transform: translateY(0) scale(1);} }
.gold-count { font-size:20px; font-weight:800; color:#4b2b00; margin-top:8px; text-shadow:0 4px 10px rgba(255,240,200,0.06); }

/* Cinematic attack damage number (on top of effects) */
.damage-number-enhanced {
  position: absolute;
  transform: translate(-50%,-50%);
  font-weight: 900;
  font-size: 28px;
  color: #ffdbdb;
  text-shadow: 0 6px 20px rgba(120,30,20,0.6), 0 0 10px rgba(255,120,80,0.12);
  z-index:2000;
  animation: dmgPop 900ms cubic-bezier(.2,.9,.2,1);
}
@keyframes dmgPop {
  0% { transform: translate(-50%,-50%) scale(1.15); opacity:1; }
  100% { transform: translate(-50%,-160%) scale(1.0); opacity:0; }
}

/* Fire dying animation on card */
.fire-anim { position:absolute; inset:6px; pointer-events:none; display:flex; align-items:flex-end; justify-content:center; z-index:50; }
.flame { width:18px; height:26px; background: radial-gradient(circle at 40% 30%, #fff1a8, #ff8b00); border-radius:50% 50% 30% 30%; opacity:0.95; transform-origin:center bottom; animation: flicker 900ms infinite; }
.flame.f2{ width:12px; height:18px; margin-left:6px; background: linear-gradient(180deg,#ffd98a,#ff6b00); animation-duration:760ms; }
.flame.f3{ width:10px; height:14px; margin-left:4px; background: linear-gradient(180deg,#ffd98a,#ff3b00); animation-duration:640ms; }
@keyframes flicker { 0%{ transform: translateY(0) scaleY(1) } 50%{ transform: translateY(-4px) scaleY(.92) } 100%{ transform: translateY(0) scaleY(1) } }

/* FIXED: Screen shake animation - contained to prevent field separation */
.screen-shake {
  animation: screenShake 0.5s ease-in-out;
}

@keyframes screenShake {
  0%, 100% { transform: translate(0, 0); }
  10% { transform: translate(-5px, -2px); }
  20% { transform: translate(5px, -2px); }
  30% { transform: translate(-3px, 2px); }
  40% { transform: translate(3px, 2px); }
  50% { transform: translate(-2px, -1px); }
  60% { transform: translate(2px, -1px); }
  70% { transform: translate(-1px, 1px); }
  80% { transform: translate(1px, 1px); }
  90% { transform: translate(-1px, 0); }
}

/* FIXED: Zoom animations - contained to prevent field separation */
.battlefield-scene--zoom-in {
  animation: zoomIn 0.8s ease-out forwards;
}

.battlefield-scene--zoom-out {
  animation: zoomOut 0.5s ease-in forwards;
}

@keyframes zoomIn {
  0% { transform: scale(1); }
  100% { transform: scale(1.05); }
}

@keyframes zoomOut {
  0% { transform: scale(1.05); }
  100% { transform: scale(1); }
}

`;
    const style = document.createElement('style');
    style.id = 'bf-anime2d-inline-styles';
    style.textContent = css;
    document.head.appendChild(style);
  }, []);

  return (
    <div className={`battlefield-scene ${screenShake ? 'screen-shake' : ''} ${battlePhase === 'battle' ? 'battlefield-bg--battle' : ''} ${isZooming ? 'battlefield-scene--zoom-in' : ''}`}>
      <div className="battle-top-buttons">
        {/* RULES BUTTON */}
        <button
          className="battle-btn rules-btn medieval-btn"
          onClick={() => setRulesOpen(true)}
          type="button"
        >
          📜
        </button>

        {/* SETTINGS BUTTON */}
        <button
          className="battle-btn settings-btn medieval-btn"
          onClick={() => setSettingsOpen(true)}
          type="button"
        >
          ⚙
        </button>

        {/* FULLSCREEN BUTTON */}
        <button
          className="battle-btn medieval-btn fullscreen-trigger"
          id="fullscreen-toggle"
          type="button"
        >
          ⛶
        </button>
        <button className="battle-btn exit-btn" onClick={() => setShowExitConfirm(true)}>⚔</button>
      </div>

      {showExitConfirm && (
        <div className="exit-overlay">
          <div className="exit-backdrop" onClick={() => setShowExitConfirm(false)} />

          <div className="exit-panel">
            <div className="exit-title">Abandon Battle?</div>

            <p className="exit-text">
              If you abandon the fight now, you will forfeit this match and return to the main menu.
              Are you certain you wish to retreat?
            </p>

            <div className="exit-buttons">
              <button
                className="exit-btn-confirm"
                onClick={() => {
                  setShowExitConfirm(false);
                  onExitBattle();  // ← calls App.jsx → handleExitBattle()
                }}
              >
                Yes, Abandon Battle
              </button>

              <button
                className="exit-btn-cancel"
                onClick={() => setShowExitConfirm(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {rulesOpen && (
        <div className="rules-overlay">
          <div className="rules-backdrop" onClick={() => setRulesOpen(false)} />

          <div className="rules-panel">
            <h1 className="rules-title">Battle Rules</h1>

            <div className="rules-scroll">
              <h2>1. Objective</h2>
              <p>
                Destroy all enemy monsters.  
                When a player has no monsters both on the field and in hand, defeat is immediate.
              </p>

              <h2>2. Summoning Phase</h2>
              <ul>
                <li>Each side fills up to 3 field slots.</li>
                <li>During your turn, drag a card from your hand onto an empty slot.</li>
                <li>You may summon <strong>multiple cards in one turn</strong> if your field has space.</li>
              </ul>

              <h2>3. Battle Phase</h2>
              <ul>
                <li>You can attack **once per turn**.</li>
                <li>Select your attacker by clicking your monster.</li>
                <li>Select a target by clicking any enemy monster.</li>
                <li>Press the large ATTACK button to confirm.</li>
              </ul>

              <h2>4. Combat Resolution</h2>
              <p>
                Both monsters strike each other simultaneously.
              </p>
              <ul>
                <li>Damage = monster's Attack.</li>
                <li>If HP ≤ 0 → monster dies with a death animation.</li>
                <li>A dead monster's slot becomes empty and can be used next turn.</li>
              </ul>

              <h2>5. End of Turn</h2>
              <ul>
                <li>Player press "End Turn" or timer reaches 0.</li>
                <li>Enemy AI then plays automatically.</li>
              </ul>

              <h2>6. Enemy Behavior</h2>
              <ul>
                <li>If field not full → enemy summons.</li>
                <li>If full → enemy performs 1 attack.</li>
                <li>If enemy has no monster on field but has cards → enemy must summon.</li>
              </ul>

              <h2>7. Victory & Defeat</h2>
              <ul>
                <li>If enemy loses all field monsters AND all hand monsters → enemy is defeated.</li>
                <li>If player loses all field & hand cards → defeat.</li>
              </ul>

              <h2>8. Special Behaviors (your universe)</h2>
              <ul>
                <li>Dogs gain +1 attack when allied with another dog.</li>
                <li>Wolves gain +1 attack when alone OR during night maps.</li>
                <li>Serpents have ambush bonus (coming soon).</li>
                <li>Lions gain courage when leading (coming soon).</li>
              </ul>

              <h2>9. Controls</h2>
              <ul>
                <li><strong>Drag & Drop</strong>: summon monsters.</li>
                <li><strong>Click</strong>: select attacker / target.</li>
                <li><strong>Attack Button</strong>: execute combat.</li>
                <li><strong>End Turn</strong>: pass to enemy.</li>
              </ul>
            </div>

            <button 
              className="rules-close-btn"
              onClick={() => setRulesOpen(false)}
            >
              Close Rules
            </button>
          </div>
        </div>
      )}

      {settingsOpen && (
        <div className="settings-overlay">
          <div className="settings-backdrop" onClick={() => setSettingsOpen(false)} />

          <div className="settings-panel">
            <h1 className="settings-title">Game Settings</h1>

            {/* SOUND */}
            <div className="settings-row">
              <span>Sound Effects</span>
              <button
                className="settings-toggle"
                onClick={() =>
                  setSettings(s => ({ ...s, sound: !s.sound }))
                }
              >
                {settings.sound ? "ON" : "OFF"}
              </button>
            </div>

            {/* MUSIC */}
            <div className="settings-row">
              <span>Music</span>
              <button
                className="settings-toggle"
                onClick={() =>
                  setSettings(s => ({ ...s, music: !s.music }))
                }
              >
                {settings.music ? "ON" : "OFF"}
              </button>
            </div>

            {/* LANGUAGE */}
            <div className="settings-row">
              <span>Language</span>
              <select
                className="settings-select"
                value={settings.language}
                onChange={e =>
                  setSettings(s => ({ ...s, language: e.target.value }))
                }
              >
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="ar">العربية</option>
              </select>
            </div>

            {/* TIMEZONE */}
            <div className="settings-row">
              <span>Timezone</span>
              <select
                className="settings-select"
                value={settings.timezone}
                onChange={e =>
                  setSettings(s => ({ ...s, timezone: e.target.value }))
                }
              >
                {Intl.supportedValuesOf("timeZone").map(tz => (
                  <option key={tz} value={tz}>{tz}</option>
                ))}
              </select>
            </div>

            <button
              className="settings-close-btn"
              onClick={() => setSettingsOpen(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* SCALE WRAPPER */}
      <div className="battlefield-scale-wrapper">
        {/* your whole content including top bar, enemy hand, fields, player hand */}
        <div className="battlefield-content">

          {/* BACKGROUND */}
          <div className="battlefield-bg" />

          {/* Environmental Particles */}
          <div className="env-particles">
            {envParticles.map(particle => (
              <div
                key={particle.id}
                className="env-particle"
                style={{
                  left: `${particle.x}%`,
                  top: `${particle.y}%`,
                  width: `${particle.size}px`,
                  height: `${particle.size}px`,
                  animationDelay: `${particle.delay}s`
                }}
              />
            ))}
          </div>

          {/* Background Distortion */}
          <div className="cinematic-layer">
            {attackAnimation && (
              <div
                className="bg-distortion"
                style={{
                  '--distort-x': `${attackAnimation.target.pos.x}px`,
                  '--distort-y': `${attackAnimation.target.pos.y}px`
                }}
              />
            )}
          </div>

          {/* Combo Counter */}
          {comboCount > 1 && (
            <div className="combo-counter">
              {comboCount}x COMBO!
            </div>
          )}

          {/* Glow Trails */}
          {glowTrails.map(trail => (
            <div
              key={trail.id}
              className="glow-trail"
              style={{
                left: `${trail.x - 70}px`,
                top: `${trail.y - 90}px`,
                opacity: trail.opacity
              }}
            />
          ))}

          {/* Cinematic Effects */}
          {cinematicEffects.map(effect => renderCinematicEffect(effect))}

          {/* Battle Banner */}
          {showBattleBanner && (
            <div className="battle-banner">Battle Begins</div>
          )}

          {/* Cinematic Attack Effects */}
          {attackAnimation && (
            <CinematicAttackEffects
              attacker={attackAnimation.attacker.pos}
              target={attackAnimation.target.pos}
              damage={attackAnimation.damage}
              defenderDamage={attackAnimation.defenderDamage}
              onComplete={() => { }}
            />
          )}

          {/* TOP BAR */}
          <div className="battlefield-top-bar">
            <div className="battlefield-phase">
              Phase: {isDealing ? "Dealing" : battlePhase === "setup" ? "Setup" : "Battle"}
            </div>

            <div className="battlefield-turn-indicator">
              {isDealing ? "Preparing..." : currentPlayer === "player" ? "PLAYER TURN" : "ENEMY TURN"}
            </div>

            <div className="battlefield-timer">
              {battlePhase === "battle" && <span>{turnSeconds}s</span>}
              {currentPlayer === "player" && (
                <button className="endturn-btn" onClick={endTurn}>
                  End Turn
                </button>
              )}
            </div>
          </div>

          <div className="enemy-stack">
            {/* ENEMY HAND */}
            <div className="battlefield-row hand-row--enemy">
              <div className="hand-scroller">
                {enemyHand.map((c, i) => renderHandCard("enemy", c, i))}
              </div>
            </div>

            {/* ENEMY FIELD */}
            <div className="battlefield-row field-row--enemy">
              <div className="field-strip">
                {enemyField.map((u, i) => renderFieldSlot("enemy", i, u))}
              </div>
            </div>
          </div>

          <div className="player-stack">
            {/* PLAYER FIELD */}
            <div className="battlefield-row field-row--player">
              <div className="field-strip">
                {playerField.map((u, i) => renderFieldSlot("player", i, u))}
              </div>
            </div>

            {/* PLAYER HAND */}
            <div className="battlefield-row hand-row--player">
              <div className="hand-scroller">
                {playerHand.map((c, i) => renderHandCard("player", c, i))}
              </div>
            </div>
          </div>

          {/* ATTACK BUTTON */}
          {currentPlayer === "player" && battlePhase === "battle" && (
            <button
              className={[
                "fight-button",
                selectedAttackerId && selectedTargetId && !hasAttackedThisTurn
                  ? "fight-button--ready"
                  : "fight-button--disabled",
              ].filter(Boolean).join(" ")}
              onClick={() => {
                if (hasAttackedThisTurn) return;

                const atkSlot = playerField.findIndex(u => u?.id === selectedAttackerId);
                const defSlot = enemyField.findIndex(u => u?.id === selectedTargetId);
                if (atkSlot !== -1 && defSlot !== -1) {
                  performAttack("player", atkSlot, "enemy", defSlot);
                }
              }}
            >
              <div className="fight-inner">
                <span className="fight-icon">⚔</span>
              </div>
              <div className="fight-label">ATTACK</div>
            </button>
          )}
        </div>
      </div>

      {/* VICTORY / DEFEAT OVERLAY */}
      {battleResult && (
        <div className="battle-result-overlay" role="dialog" aria-modal="true">
          <div className="battle-result-panel">
            <div className={`result-title ${battleResult === 'victory' ? 'result-victory' : 'result-defeat'}`}>
              {battleResult === 'victory' ? 'Victory!' : 'Defeat'}
            </div>

            <div className="result-body">
              {battleResult === 'victory' ? (
                <>
                  <div className="reward-3d">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} className="coin" style={{ '--i': i }} />
                    ))}
                  </div>
                  <div className="gold-count">+{rewardGold} Gold</div>
                </>
              ) : (
                <div className="defeat-message">Your forces were vanquished. Better luck next time.</div>
              )}
            </div>

            <div className="result-actions">
              <button
                className="result-btn result-btn-primary"
                onClick={() => {
                  try { onBattleComplete && onBattleComplete({ result: battleResult, reward: rewardGold }); } catch (e) {}
                  setBattleResult(null);
                  try { onExitBattle && onExitBattle(); } catch (e) {}
                }}
              >
                {battleResult === 'victory' ? 'Claim Reward & Exit' : 'Exit'}
              </button>

              <button
                className="result-btn result-btn-secondary"
                onClick={() => {
                  setBattleResult(null);
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}