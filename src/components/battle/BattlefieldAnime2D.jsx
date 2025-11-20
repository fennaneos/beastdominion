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
  useCallback
} from "react";

import { cards } from "../../data/cards.js"; 
// ↳ your global card database — full stats / images / effects

import "./BattlefieldAnime2D.css";
// ↳ contains all visual effects: zoom, particles, smoke, slot glow...


// ============================================================================
// SECTION 1 — GAME CONSTANTS & GLOBAL SETTINGS
// ============================================================================

// How long a turn lasts in seconds
const TURN_DURATION = 60;

// Number of field slots (3 = “Hearthstone style” 3-lane layout)
const MAX_FIELD_SLOTS = 3;

// How many cards are dealt at start
const INITIAL_HAND_SIZE = 6;


// ============================================================================
// SECTION 2 — UNIT CREATION HELPERS
// These helpers take an entry from cards.js and produce a full “battle unit”.
// A “unit” is a live instance of a card on the battlefield (unique ID, hp, etc).
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
 *  • text for future ability triggers
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

    owner,
    image: cardData.image,       // full art image (string path)

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
   ENHANCED CARD VIEW COMPONENT
============================================================================ */

function CardView({ card, isAnimating = false, isDying = false }) {
  if (!card) return null;

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
          <div className="card-stat card-stat--atk">⚔ {card.attack}</div>
          <div className="card-stat card-stat--hp">❤ {card.hp}</div>
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   CINEMATIC ATTACK EFFECTS COMPONENT
============================================================================ */

function CinematicAttackEffects({ attacker, target, damage, onComplete }) {
  const [particles, setParticles] = useState([]);
  const [showLightning, setShowLightning] = useState(false);
  const [showImpact, setShowImpact] = useState(false);
  const [showDamage, setShowDamage] = useState(false);
  const [showRipples, setShowRipples] = useState(false);
  const [showCharge, setShowCharge] = useState(false);
  const [showFlash, setShowFlash] = useState(false);

  useEffect(() => {
    // Show charge effect before attack
    setShowCharge(true);
    setTimeout(() => setShowCharge(false), 800);

    // Camera zoom in
    setTimeout(() => {
      const scene = document.querySelector('.battlefield-scene');
      if (scene) scene.classList.add('battlefield-scene--zoom-in');
    }, 200);

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

    // Show enhanced damage number
    setTimeout(() => setShowDamage(true), 700);
    setTimeout(() => setShowDamage(false), 2400);

    // Camera zoom out
    setTimeout(() => {
      const scene = document.querySelector('.battlefield-scene');
      if (scene) {
        scene.classList.remove('battlefield-scene--zoom-in');
        scene.classList.add('battlefield-scene--zoom-out');
        setTimeout(() => scene.classList.remove('battlefield-scene--zoom-out'), 500);
      }
    }, 1000);

    // Complete animation
    const timer = setTimeout(() => {
      onComplete();
    }, 1800);

    return () => clearTimeout(timer);
  }, [attacker, target, damage, onComplete]);

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

        {/* Enhanced Damage Number */}
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
  useEffect(() => {
  const cards = document.querySelectorAll(".hand-row--player .hand-card");
  if (!cards.length) return;

  const total = cards.length;

  cards.forEach((card, index) => {
    card.style.setProperty("--index", index);
    card.style.setProperty("--total", total);
    card.style.zIndex = 10 + index; // make sure cards don’t hide each other
  });
}, [playerHand]);   // <-- must depend on hand array


  const dealSound = useMemo(() => new Audio("/sounds/card-deal.mp3"), []);
  const attackSound = useMemo(() => new Audio("/sounds/attack.mp3"), []);
  const hitSound = useMemo(() => new Audio("/sounds/hit.mp3"), []);

  /* Initialize environmental particles */
  useEffect(() => {
    const particles = [...Array(15)].map((_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 8,
      size: 2 + Math.random() * 4
    }));
    setEnvParticles(particles);
  }, []);

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

  const handleFieldDrop = (owner, slotIndex, e) => {
    e.preventDefault();
    e.stopPropagation();

    if (owner !== "player") return;

    let data = null;
    try {
      data = JSON.parse(e.dataTransfer.getData("text/plain"));
    } catch {
      data = draggedCardData;
    }

    if (!data || data.owner !== "player") return;

    if (!canPlayerSummonToSlot(slotIndex)) return;

    const handIndex = data.handIndex;
    const cardToPlace = playerHand[handIndex];

    if (!cardToPlace) return;

    setPlayerField(f => {
      const next = [...f];
      next[slotIndex] = cardToPlace;
      return next;
    });

    setPlayerHand(h => {
      const next = [...h];
      next.splice(handIndex, 1);
      return next;
    });

    setDraggingCard(null);
    setHoverFieldSlot(null);
    setSelectedHandCardId(null);
    setDraggedCardData(null);
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
  const getSlotCenter = (owner, slot) => {
    const slotWidth = 140;
    const gap = 20;
    const startX = (window.innerWidth - (slotWidth * 3 + gap * 2)) / 2;
    const x = startX + slot * (slotWidth + gap) + slotWidth / 2;
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

      const attackerPos = getSlotCenter(atkOwner, atkSlot);
      const targetPos = getSlotCenter(defOwner, defSlot);

      setAnimatingSlots({ attacker: `${atkOwner}-${atkSlot}`, target: `${defOwner}-${defSlot}` });

      // Trigger screen shake
      setScreenShake(true);
      setTimeout(() => setScreenShake(false), 800);

      // Create cinematic attack animation
      setAttackAnimation({
        attacker: { owner: atkOwner, slot: atkSlot, unit: attacker, pos: attackerPos },
        target: { owner: defOwner, slot: defSlot, unit: defender, pos: targetPos },
        damage: attacker.attack
      });

      // Increment combo
      setComboCount(prev => prev + 1);
      setTimeout(() => setComboCount(0), 3000);

      attackSound.currentTime = 0;
      attackSound.play().catch(() => { });

      setTimeout(() => {
        hitSound.currentTime = 0;
        hitSound.play().catch(() => { });

        const dmgToDef = attacker.attack;
        const dmgToAtk = defender.attack;

        // Apply damage to defender
        if (defOwner === "player") {
          setPlayerField(f => {
            const next = [...f];
            const hp = defender.hp - dmgToDef;
            if (hp <= 0) {
              // Card death animation
              setDyingCards(cards => new Set([...cards, defender.id]));
              setTimeout(() => {
                setDyingCards(cards => {
                  const newSet = new Set(cards);
                  newSet.delete(defender.id);
                  return newSet;
                });
              }, 1500);
            }
            next[defSlot] = hp <= 0 ? null : { ...defender, hp };
            return next;
          });
        } else {
          setEnemyField(f => {
            const next = [...f];
            const hp = defender.hp - dmgToDef;
            if (hp <= 0) {
              setDyingCards(cards => new Set([...cards, defender.id]));
              setTimeout(() => {
                setDyingCards(cards => {
                  const newSet = new Set(cards);
                  newSet.delete(defender.id);
                  return newSet;
                });
              }, 1500);
            }
            next[defSlot] = hp <= 0 ? null : { ...defender, hp };
            return next;
          });
        }

        // Apply damage to attacker
        if (atkOwner === "player") {
          setPlayerField(f => {
            const next = [...f];
            const hp = attacker.hp - dmgToAtk;
            if (hp <= 0) {
              setDyingCards(cards => new Set([...cards, attacker.id]));
              setTimeout(() => {
                setDyingCards(cards => {
                  const newSet = new Set(cards);
                  newSet.delete(attacker.id);
                  return newSet;
                });
              }, 1500);
            }
            next[atkSlot] = hp <= 0 ? null : { ...attacker, hp };
            return next;
          });
        } else {
          setEnemyField(f => {
            const next = [...f];
            const hp = attacker.hp - dmgToAtk;
            if (hp <= 0) {
              setDyingCards(cards => new Set([...cards, attacker.id]));
              setTimeout(() => {
                setDyingCards(cards => {
                  const newSet = new Set(cards);
                  newSet.delete(attacker.id);
                  return newSet;
                });
              }, 1500);
            }
            next[atkSlot] = hp <= 0 ? null : { ...attacker, hp };
            return next;
          });
        }

        setTimeout(() => {
          setAttackAnimation(null);
          setAnimatingSlots({ attacker: null, target: null });
          setSelectedAttackerId(null);
          setSelectedTargetId(null);
          setHasAttackedThisTurn(true);
        }, 500);
      }, 600);
    },
    [playerField, enemyField]
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

          setEnemyField(f => {
            const next = [...f];
            next[targetSlot] = cardToPlay;
            return next;
          });

          setEnemyHand(h => {
            const next = [...h];
            next.splice(0, 1);
            return next;
          });

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
  }, [currentPlayer, battlePhase, enemyField, playerField, enemyHand]);

  /* END TURN */
  const endTurn = useCallback(() => {
    setCurrentPlayer(prev => (prev === "player" ? "enemy" : "player"));
    setSelectedAttackerId(null);
    setSelectedTargetId(null);
    setSelectedHandCardId(null);
    setHasAttackedThisTurn(false);
    setTurnSeconds(60);
  }, []);

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

    const className = [
      "field-slot",
      owner === "player" ? "field-slot--player" : "field-slot--enemy",
      isLegal && "field-slot--hover-legal",
      isIllegal && "field-slot--hover-illegal",
      unit && selectedAttackerId === unit.id && "field-slot--attacker",
      unit && selectedTargetId === unit.id && "field-slot--target",
      isTarget && "target-hit-3d"
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
      <div className="exit-title">Abandon the Battle?</div>

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
          <li>If HP ≤ 0 → the monster dies with a death animation.</li>
          <li>A dead monster's slot becomes empty and can be used next turn.</li>
        </ul>

        <h2>5. End of Turn</h2>
        <ul>
          <li>Player press “End Turn” or timer reaches 0.</li>
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
        {attackAnimation && (
          <div
            className="bg-distortion"
            style={{
              '--distort-x': `${attackAnimation.target.pos.x}px`,
              '--distort-y': `${attackAnimation.target.pos.y}px`
            }}
          />
        )}

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
    </div>
  );
}