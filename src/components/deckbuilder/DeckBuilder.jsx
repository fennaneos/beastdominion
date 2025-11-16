// src/components/deckbuilder/DeckBuilder.jsx
// Main screen for both "Deck Builder" and "Collection" tabs.
// - In "deck" mode: shows collection grid + current deck sidebar.
// - In "collection" mode: shows only the grid (no sidebar) and is meant
//   to display all cards (including locked ones in the future).

import { useMemo, useState } from "react";
import { cards, RACES, RARITIES, STARS } from "../../data/cards.js";
import MonsterCard from "../card/MonsterCard.jsx";
import CardInspect from "../inspect/CardInspect.jsx";
import "./DeckBuilder.css";

/* ======================================================================= */
/*  SFX (Sound Effects) configuration                                      */
/* ======================================================================= */
/*
  Put these files under: public/sfx/

  public/sfx/ui-click-soft.wav
    - Very short (<120ms), gentle "tick" or "tap".
    - Used for navigation: opening/closing panels, soft UI.

  public/sfx/ui-bubble-click.wav
    - Slightly chunkier "bubble" / "pop".
    - Used for actions that change state: add/remove/clear deck, start match, etc.

  public/sfx/level-up.mp3
    - Rewarding level-up sound.
    - Used on EVERY successful level-up.
*/

const SFX_UI_SOFT = "/sfx/ui-click-soft.wav";
const SFX_UI_BUBBLE = "/sfx/ui-bubble-click.wav";
const SFX_LEVEL_UP = "/sfx/level-up.mp3";

/**
 * Generic helper: plays any sound URL at a given volume.
 * - Creates a fresh Audio object each time so sounds don't cut off.
 * - Fails silently if Audio or autoplay is blocked.
 */
function playSfx(url, volume = 1) {
  if (!url) return;
  try {
    const audio = new Audio(url);
    audio.volume = volume;
    audio.play().catch(() => {
      // Ignore autoplay / focus errors in dev.
    });
  } catch {
    // Ignore in non-audio environments.
  }
}

/** Soft UI tick – use for navigation / non-destructive UI. */
function playUiSoft() {
  playSfx(SFX_UI_SOFT, 0.7);
}

/** Bubble click – use for state-changing actions (add/remove/clear/test/export). */
function playUiBubble() {
  playSfx(SFX_UI_BUBBLE, 0.85);
}

/** Level-up sound – use on every successful level-up. */
function playLevelUpSound() {
  playSfx(SFX_LEVEL_UP, 0.8);
}

/* ======================================================================= */
/*  Deck constants                                                          */
/* ======================================================================= */

// Maximum number of cards allowed in a deck.
const MAX_DECK_CARDS = 6;

// Base gold cost for the *first* level up.
// Second level costs 2×, third 3×, etc.
const BASE_LEVEL_COST = 100;

// Where we persist/export a deck locally.
const STORAGE_KEY = "bd-saved-deck-v1";

/* ======================================================================= */
/*  Helper: compute effective level                                         */
/* ======================================================================= */
/**
 * Compute effective level for a card, given how many upgrade steps
 * were purchased for its id.
 */
function getEffectiveLevel(baseCard, upgradeSteps) {
  // Cards can define a starting "level" or use "stars" as their base level.
  const baseLevel = baseCard.level ?? baseCard.stars ?? 1;

  // Cards may define "maxLevel" (e.g. 3 for Whelp); default to 5 if omitted.
  const maxLevel = baseCard.maxLevel ?? 5;

  // Clamp: base + upgrades must never exceed maxLevel.
  return Math.min(baseLevel + upgradeSteps, maxLevel);
}

/* ======================================================================= */
/*  Helper: build display version of a card                                 */
/* ======================================================================= */
/**
 * Returns a new "display card" object:
 * - Level + stats scaled by upgrades.
 * - Art chosen per level (background + no-bg overlay).
 * - Ability text hidden if not yet unlocked.
 */
// Replace your current getDisplayCard with this:

function getDisplayCard(baseCard, upgradesMap) {
  const upgradeSteps = upgradesMap[baseCard.id] || 0;

  const level = getEffectiveLevel(baseCard, upgradeSteps);
  const maxLevel = baseCard.maxLevel ?? 5;
  const baseLevel = baseCard.level ?? baseCard.stars ?? 1;

  const atkBase = baseCard.baseAttack ?? baseCard.attack;
  const hpBase = baseCard.baseHealth ?? baseCard.health;
  const atkPer = baseCard.attackPerLevel ?? 1;
  const hpPer = baseCard.healthPerLevel ?? 1;
  const delta = level - baseLevel;

  const attack = atkBase + delta * atkPer;
  const health = hpBase + delta * hpPer;

  // ----- art by level -----
  let image = baseCard.image;
  if (Array.isArray(baseCard.imagesByLevel) && baseCard.imagesByLevel.length) {
    const idx = Math.min(level, baseCard.imagesByLevel.length) - 1;
    image = baseCard.imagesByLevel[idx] || baseCard.imagesByLevel[0];
  }

  let imageTop = null;
  if (Array.isArray(baseCard.topImagesByLevel) && baseCard.topImagesByLevel.length) {
    const idx = Math.min(level, baseCard.topImagesByLevel.length) - 1;
    imageTop = baseCard.topImagesByLevel[idx] || null;
  }

  const unlockLevel = baseCard.unlockLevel ?? 1;
  const abilityUnlocked = level >= unlockLevel;
  const text = abilityUnlocked ? baseCard.text : "";

  return {
    ...baseCard,
    level,
    maxLevel,
    stars: level,
    attack,
    health,
    image,
    imageTop,
    text,
  };
}

/* ======================================================================= */
/*  Main Component                                                          */
/* ======================================================================= */

export default function DeckBuilder({ mode, gold, setGold }) {
  /* ----- UI state -------------------------------------------------------- */

  const [search, setSearch] = useState("");
  const [raceFilter, setRaceFilter] = useState("all");
  const [rarityFilter, setRarityFilter] = useState("all");
  const [starFilter, setStarFilter] = useState("all");

  // Deck is stored just as an array of card ids (duplicates allowed).
  const [deck, setDeck] = useState([]);

  // Upgrades: { [cardId]: extraLevels }.
  const [upgrades, setUpgrades] = useState({});

  // Inspect panel open / closed + which card is currently inspected.
  const [inspectOpen, setInspectOpen] = useState(false);
  const [inspectCardId, setInspectCardId] = useState(cards[0]?.id ?? null);

  // Used to mark a card as "recently leveled" so CSS can pulse it, if desired.
  const [recentlyLeveledId, setRecentlyLeveledId] = useState(null);

  // Which card (if any) is currently showing the full-screen "Power Unlocked"
  // animation overlay.
  const [unlockCardId, setUnlockCardId] = useState(null);

  // Generic mini-modal for Test Hand, Deck saved, Deck loaded, etc.
  // modal = { title, message?, lines? }
  const [modal, setModal] = useState(null);

  /* ----- tiny helpers bound to local state ------------------------------ */

  const getUpgradeSteps = (cardId) => upgrades[cardId] || 0;

  const getLevelCost = (cardId) => {
    const steps = getUpgradeSteps(cardId);
    // 1st upgrade = BASE_LEVEL_COST, 2nd = 2×, etc.
    return BASE_LEVEL_COST * (steps + 1);
  };

  /* ----------------------------------------------------------------------- */
  /*  Derived state                                                          */
  /* ----------------------------------------------------------------------- */

  // How many copies of each card id exist in the deck.
  const deckCounts = useMemo(() => {
    const map = {};
    for (const id of deck) {
      map[id] = (map[id] || 0) + 1;
    }
    return map;
  }, [deck]);

  // Cards visible in the main grid (filters + evolved stats/art).
  const filteredCards = useMemo(() => {
    return cards
      .filter((card) => {
        if (raceFilter !== "all" && card.race !== raceFilter) return false;
        if (rarityFilter !== "all" && card.rarity !== rarityFilter) return false;
        if (starFilter !== "all" && card.stars !== starFilter) return false;
        if (
          search.trim() &&
          !card.name.toLowerCase().includes(search.trim().toLowerCase())
        ) {
          return false;
        }
        return true;
      })
      .map((card) => getDisplayCard(card, upgrades));
  }, [raceFilter, rarityFilter, starFilter, search, upgrades]);

  // Turn the deckCounts map into an array of { card, count } objects
  // used in the right-hand sidebar.
  const deckCards = useMemo(
    () =>
      Object.entries(deckCounts).map(([id, count]) => ({
        card: cards.find((c) => c.id === id),
        count,
      })),
    [deckCounts]
  );

  /* ----------------------------------------------------------------------- */
  /*  Inspect panel helpers                                                  */
  /* ----------------------------------------------------------------------- */

  const openInspect = (cardId) => {
    setInspectCardId(cardId);
    setInspectOpen(true);
    // Soft click – navigation / open panel.
    playUiSoft();
  };

  const closeInspect = () => {
    // Close the big inspect panel.
    setInspectOpen(false);
    // Also ensure any unlock overlay or level highlight is cleared.
    setUnlockCardId(null);
    setRecentlyLeveledId(null);
    // Soft click – closing panel.
    playUiSoft();
  };

  // Raw definition of whatever card is inspected (unevolved).
  const inspectedBaseCard =
    cards.find((c) => c.id === inspectCardId) ?? cards[0];

  // How many extra levels we bought for the inspected card.
  const inspectedUpgrades = getUpgradeSteps(inspectedBaseCard.id);

  // How many copies of that card are currently in the deck.
  const inspectedInDeck = deckCounts[inspectedBaseCard.id] || 0;

  // Display version (stats + art + ability) used by the center card in
  // the inspect panel.
  const inspectedDisplayCard = getDisplayCard(inspectedBaseCard, upgrades);

  /* ----------------------------------------------------------------------- */
  /*  Deck actions                                                           */
  /* ----------------------------------------------------------------------- */

  const handleAddToDeck = (cardId) => {
    if (mode !== "deck") return; // collection mode = no deck edit
    if (deck.length >= MAX_DECK_CARDS) return; // deck full
    setDeck((prev) => [...prev, cardId]);
    // Bubble click – impactful action (add card).
    playUiBubble();
  };

  const handleRemoveFromDeck = (cardId) => {
    setDeck((prev) => {
      const index = prev.indexOf(cardId);
      if (index === -1) return prev;
      const copy = [...prev];
      copy.splice(index, 1);
      return copy;
    });
    // Bubble click – impactful action (remove card).
    playUiBubble();
  };

  const handleLevelUp = (cardId) => {
    const baseCard = cards.find((c) => c.id === cardId);
    if (!baseCard) return;

    const currentLevel = getEffectiveLevel(baseCard, getUpgradeSteps(cardId));
    const maxLevel = baseCard.maxLevel ?? 5;
    if (currentLevel >= maxLevel) return;

    const cost = getLevelCost(cardId);
    if (gold < cost) return;

    const newLevel = Math.min(currentLevel + 1, maxLevel);
    const unlockLevel = baseCard.unlockLevel ?? maxLevel;

    setGold((g) => g - cost);
    setUpgrades((prev) => ({
      ...prev,
      [cardId]: (prev[cardId] || 0) + 1,
    }));

    // bounce animation (CSS can use .bd-card--leveling based on recentlyLeveledId)
    setRecentlyLeveledId(cardId);
    setTimeout(() => {
      setRecentlyLeveledId((prev) => (prev === cardId ? null : prev));
    }, 700);

    // 🔊 play sound EVERY time a level-up actually succeeds
    playLevelUpSound();

    // full-screen unlock effect WHEN ability just unlocked (e.g. Whelp Lv3)
    if (newLevel >= unlockLevel && currentLevel < unlockLevel) {
      setUnlockCardId(cardId);
    }
  };

  // Clear current deck.
  const handleClearDeck = () => {
    setDeck([]);
    playUiBubble();
  };

  // Simple stub: show a random "starting hand" from the current deck
  // inside a small modal.
  const handleTestHand = () => {
    playUiBubble();
    if (deck.length === 0) {
      setModal({
        title: "Test Hand",
        message: "Your deck is empty – add some cards first!",
      });
      return;
    }

    const uniqueIds = Array.from(new Set(deck));
    const handSize = Math.min(3, uniqueIds.length);
    const sample = uniqueIds
      .sort(() => Math.random() - 0.5)
      .slice(0, handSize)
      .map((id) => {
        const base = cards.find((c) => c.id === id);
        const display = getDisplayCard(base, upgrades);
        return `${display.name} (Lvl ${display.level})`;
      });

    setModal({
      title: "Test Hand",
      lines: sample,
    });
  };

  // Export deck to localStorage (for later import).
  const handleExportDeck = () => {
    playUiBubble();
    if (deck.length === 0) {
      setModal({
        title: "Deck saved",
        message: "Deck is empty – nothing to save yet.",
      });
      return;
    }

    try {
      const payload = { deck, upgrades };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      setModal({
        title: "Deck saved",
        message:
          "Your current deck has been saved locally. You can import it later from this device.",
      });
    } catch {
      setModal({
        title: "Error",
        message: "Could not save deck (local storage not available).",
      });
    }
  };

  // Import deck from localStorage.
  const handleImportDeck = () => {
    playUiBubble();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        setModal({
          title: "Import deck",
          message:
            "No saved deck found on this device. Export a deck first, then import.",
        });
        return;
      }
      const payload = JSON.parse(raw);
      if (!Array.isArray(payload.deck)) {
        throw new Error("Invalid deck payload");
      }
      setDeck(payload.deck);
      if (payload.upgrades && typeof payload.upgrades === "object") {
        setUpgrades(payload.upgrades);
      }
      setModal({
        title: "Deck loaded",
        message: "Your saved deck has been loaded into the builder.",
      });
    } catch {
      setModal({
        title: "Error",
        message: "Saved deck is corrupted or could not be loaded.",
      });
    }
  };

  /* ----------------------------------------------------------------------- */
  /*  Drag & drop from collection -> deck sidebar                            */
  /* ----------------------------------------------------------------------- */

  const handleCardDragStart = (cardId, event) => {
    // Encode the card id into the drag payload.
    event.dataTransfer.setData("text/plain", cardId);
    // Nice little feedback.
    playUiSoft();
  };

  const handleDeckDragOver = (event) => {
    // Required for drop to fire.
    event.preventDefault();
  };

  const handleDeckDrop = (event) => {
    event.preventDefault();
    const cardId = event.dataTransfer.getData("text/plain");
    if (cardId) {
      handleAddToDeck(cardId);
    }
  };

  /* ----------------------------------------------------------------------- */
  /*  Misc derived data for render                                           */
  /* ----------------------------------------------------------------------- */

  const deckIsFull = deck.length >= MAX_DECK_CARDS;
  const title = mode === "deck" ? "Deck Builder" : "Collection Browser";

  // The card whose power was just unlocked; used in the full-screen overlay.
  const unlockCard =
    unlockCardId != null
      ? getDisplayCard(cards.find((c) => c.id === unlockCardId), upgrades)
      : null;

  // In collection mode we hide the right sidebar entirely.
  const showSidebar = mode === "deck";

  /* ----------------------------------------------------------------------- */
  /*  Render                                                                 */
  /* ----------------------------------------------------------------------- */

  return (
    <div
      className={
        "deckbuilder-root" +
        (deckIsFull ? " deckbuilder-root--full" : "")
      }
    >
      <div
        className={
          "deckbuilder-main" +
          (showSidebar ? "" : " deckbuilder-main--collection")
        }
      >
        {/* ---------------------- COLLECTION GRID (left) ------------------- */}
        <section className="deckbuilder-collection">
          <header className="deckbuilder-header">
            <div className="deckbuilder-title">
              <h2>{title}</h2>
              <span className="deckbuilder-subtitle">
                {mode === "deck"
                  ? "Tap a card to inspect it, then add it to your 6-card deck."
                  : "Browse your full collection with filters."}
              </span>
            </div>

            <div className="deckbuilder-filters">
              {/* Search text field */}
              <input
                type="text"
                className="db-input db-input--search"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              {/* Race filter */}
              <div className="db-select-wrap">
                <select
                  className="db-input db-input--select"
                  value={raceFilter}
                  onChange={(e) => setRaceFilter(e.target.value)}
                >
                  {RACES.map((r) => (
                    <option key={r} value={r}>
                      {r === "all" ? "All races" : r}
                    </option>
                  ))}
                </select>
                <span className="db-select-arrow">▼</span>
              </div>

              {/* Rarity filter */}
              <div className="db-select-wrap">
                <select
                  className="db-input db-input--select"
                  value={rarityFilter}
                  onChange={(e) => setRarityFilter(e.target.value)}
                >
                  {RARITIES.map((r) => (
                    <option key={r} value={r}>
                      {r === "all" ? "All rarities" : r}
                    </option>
                  ))}
                </select>
                <span className="db-select-arrow">▼</span>
              </div>

              {/* Stars filter */}
              <div className="db-select-wrap">
                <select
                  className="db-input db-input--select"
                  value={starFilter}
                  onChange={(e) =>
                    setStarFilter(
                      e.target.value === "all"
                        ? "all"
                        : Number(e.target.value)
                    )
                  }
                >
                  {STARS.map((s) => (
                    <option key={s} value={s}>
                      {s === "all" ? "All stars" : `${s}★`}
                    </option>
                  ))}
                </select>
                <span className="db-select-arrow">▼</span>
              </div>
            </div>
          </header>

          {/* Card grid for the current filters */}
          <div className="deckbuilder-cardgrid">
            {filteredCards.map((displayCard) => (
              <MonsterCard
                key={displayCard.id}
                card={displayCard}
                onClick={() => openInspect(displayCard.id)}
                isLeveling={displayCard.id === recentlyLeveledId}
                // Drag from collection area into deck sidebar:
                draggable={mode === "deck"}
                onDragStart={(e) =>
                  handleCardDragStart(displayCard.id, e)
                }
              />
            ))}
          </div>
        </section>

        {/* ---------------------- DECK SIDEBAR (right) --------------------- */}
        {showSidebar && (
          <aside className="deckbuilder-sidebar">
            <header className="deckbuilder-sidebar-header">
              <div>
                <h3>Current Deck</h3>
                <span className="deckbuilder-sidebar-caption">
                  Tap a card to inspect, or use the X to remove.
                  <br />
                  Tip: you can also drag cards from the left panel here.
                </span>
              </div>
              <span
                className={
                  "deckbuilder-deckcount" +
                  (deckIsFull ? " deckbuilder-deckcount--full" : "")
                }
              >
                {deck.length}/{MAX_DECK_CARDS}
              </span>
            </header>

            {/* List of cards in the deck (also a drop target) */}
            <div
              className="deckbuilder-sidebar-body"
              onDragOver={handleDeckDragOver}
              onDrop={handleDeckDrop}
            >
              {deckCards.length === 0 && (
                <p className="deckbuilder-empty">
                  No cards yet. Drag cards here or use the Add button in
                  the inspector.
                </p>
              )}

              {deckCards.map(({ card, count }) => {
                const level = getEffectiveLevel(
                  card,
                  getUpgradeSteps(card.id)
                );
                const cost = getLevelCost(card.id);

                return (
                  <div key={card.id} className="deckbuilder-deckrow">
                    <button
                      className="deckbuilder-deckrow-main"
                      onClick={() => openInspect(card.id)}
                    >
                      <span className="deckbuilder-deckrow-count">
                        {count}×
                      </span>
                      <span className="deckbuilder-deckrow-name">
                        {card.name}
                      </span>
                      <span
                        className={
                          "deckbuilder-deckrow-rarity deckbuilder-deckrow-rarity--" +
                          card.rarity
                        }
                      >
                        {card.rarity}
                      </span>
                      <span className="deckbuilder-deckrow-meta">
                        {card.cost} • {card.race} • Lvl {level}
                      </span>
                    </button>

                    <button
                      className="deckbuilder-deckrow-remove"
                      onClick={() => handleRemoveFromDeck(card.id)}
                    >
                      ✕
                    </button>

                    <div className="deckbuilder-deckrow-upgrade">
                      <span className="deckbuilder-deckrow-upgrade-cost">
                        Lv cost: {cost}
                      </span>
                      <button
                        className="deckbuilder-deckrow-upgrade-btn"
                        onClick={() => handleLevelUp(card.id)}
                        disabled={gold < cost}
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <footer className="deckbuilder-sidebar-footer">
              <button
                className="db-button db-button--ghost"
                onClick={handleClearDeck}
              >
                Clear Deck
              </button>
            </footer>
          </aside>
        )}
      </div>

      {/* ---------------------- BOTTOM BAR --------------------------------- */}
      <footer className="deckbuilder-bottombar">
        <button
          className="db-button db-button--outline"
          onClick={() => {
            // placeholder – will later open the real match screen
            playUiBubble(); // Play button = slightly juicier click.
            setModal({
              title: "Start Match",
              message:
                "Match gameplay is not implemented yet – this button is a stub for now.",
            });
          }}
        >
          Start Match
        </button>
        <button
          className="db-button db-button--outline"
          onClick={handleTestHand}
        >
          Test Hand
        </button>
        <button
          className="db-button db-button--outline"
          onClick={handleExportDeck}
        >
          Export Deck
        </button>
        <button
          className="db-button db-button--outline"
          onClick={handleImportDeck}
        >
          Import Deck
        </button>
      </footer>

      {/* ---------------------- Inspect overlay ---------------------------- */}
      <CardInspect
        open={inspectOpen}
        card={inspectedDisplayCard} // evolved stats + art (+ imageTop)
        baseCard={inspectedBaseCard} // raw definition for evolutions row
        upgrades={inspectedUpgrades}
        inDeckCount={inspectedInDeck}
        gold={gold}
        onClose={closeInspect}
        onAddToDeck={() => handleAddToDeck(inspectedBaseCard.id)}
        onRemoveFromDeck={() => handleRemoveFromDeck(inspectedBaseCard.id)}
        onLevelUp={() => handleLevelUp(inspectedBaseCard.id)}
      />

      {/* ---------------------- Power Unlocked overlay --------------------- */}
      {unlockCard && (
        <div
          className="db-unlock-overlay"
          onClick={() => {
            setUnlockCardId(null);
            playUiSoft(); // Soft click when closing unlock popup.
          }}
        >
          <div
            className="db-unlock-inner"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="db-unlock-title">Power Unlocked!</div>
            {/* Big animated card in the center */}
            <MonsterCard card={unlockCard} size="large" isLeveling />
            <p className="db-unlock-text">{unlockCard.text}</p>
            <button
              className="db-button db-unlock-close"
              onClick={() => {
                setUnlockCardId(null);
                playUiSoft();
              }}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* ---------------------- Generic modal (Test hand, Deck saved, etc.) */}
      {modal && (
        <div
          className="db-modal-overlay"
          onClick={() => setModal(null)}
        >
          <div
            className="db-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="db-modal-title">{modal.title}</h3>
            {modal.message && (
              <p className="db-modal-message">{modal.message}</p>
            )}
            {modal.lines && (
              <ul className="db-modal-list">
                {modal.lines.map((line, idx) => (
                  <li key={idx}>{line}</li>
                ))}
              </ul>
            )}
            <button
              className="db-button db-modal-close"
              onClick={() => {
                setModal(null);
                playUiSoft();
              }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
