// src/components/deckbuilder/DeckBuilder.jsx
// Main screen for both "Deck Builder" and "Collection" tabs.
// - In "deck" mode: shows collection grid + current deck sidebar.
// - In "collection" mode: shows only the grid (no sidebar).

import { useMemo, useState } from "react";
import { cards, RACES, RARITIES, STARS } from "../../data/cards.js";
import MonsterCard from "../card/MonsterCard.jsx";
import CardInspect from "../inspect/CardInspect.jsx";
import DeckNameModal from "../ui/DeckNameModal.jsx";

import "./DeckBuilder.css";

/* ======================================================================= */
/*  SFX (Sound Effects) configuration                                      */
/* ======================================================================= */
/*
  public/sfx/ui-click-soft.wav
  public/sfx/ui-bubble-click.wav
  public/sfx/level-up.mp3
*/

const SFX_UI_SOFT = "/sfx/ui-click-soft.wav";
const SFX_UI_BUBBLE = "/sfx/ui-bubble-click.wav";
const SFX_LEVEL_UP = "/sfx/level-up.mp3";

function playSfx(url, volume = 1) {
  if (!url) return;
  try {
    const audio = new Audio(url);
    audio.volume = volume;
    audio.play().catch(() => {});
  } catch {
    // ignore
  }
}

function playUiSoft() {
  playSfx(SFX_UI_SOFT, 0.7);
}

function playUiBubble() {
  playSfx(SFX_UI_BUBBLE, 0.85);
}

function playLevelUpSound() {
  playSfx(SFX_LEVEL_UP, 0.8);
}

/* ======================================================================= */
/*  Deck constants                                                          */
/* ======================================================================= */

const MAX_DECK_CARDS = 6;
const BASE_LEVEL_COST = 100;
const STORAGE_KEY = "bd-saved-deck-v1";

/* ======================================================================= */
/*  Helper: compute effective level                                         */
/* ======================================================================= */

function getEffectiveLevel(baseCard, upgradeSteps) {
  const baseLevel = baseCard.level ?? baseCard.stars ?? 1;
  const maxLevel = baseCard.maxLevel ?? 5;
  return Math.min(baseLevel + upgradeSteps, maxLevel);
}

/* ======================================================================= */
/*  Helper: build display version of a card                                 */
/* ======================================================================= */

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

  // art by level
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

export default function DeckBuilder({
  mode,
  gold,
  setGold,
  // Controlled deck & upgrades (from App.jsx) – used in "deck" mode
  playerDeck,
  onDeckChange,
  upgrades: externalUpgrades,
  onUpgradesChange,
  // Optional props we ignore here but App may pass:
  collectionCards,
  onShowTooltip,
  onHideTooltip,
}) {
  /* ----- controlled vs uncontrolled deck / upgrades --------------------- */

  const deckIsControlled = typeof onDeckChange === "function";
  const upgradesAreControlled = typeof onUpgradesChange === "function";

  // Internal state only used when not controlled (e.g. collection mode).
  const [internalDeck, setInternalDeck] = useState(playerDeck || []);
  const [internalUpgrades, setInternalUpgrades] = useState(externalUpgrades || {});

  // Deck is an array of CARD OBJECTS (NOT ids)
  const deck = deckIsControlled ? (playerDeck || []) : internalDeck;
  const setDeck = (updater) => {
    const next =
      typeof updater === "function" ? updater(deck) : updater;
    if (deckIsControlled) {
      onDeckChange(next);
    } else {
      setInternalDeck(next);
    }
  };

  // Upgrades is a map: { [cardId]: steps }
  const upgrades = upgradesAreControlled ? (externalUpgrades || {}) : internalUpgrades;
  const setUpgrades = (updater) => {
    const next =
      typeof updater === "function" ? updater(upgrades) : updater;
    if (upgradesAreControlled) {
      onUpgradesChange(next);
    } else {
      setInternalUpgrades(next);
    }
  };

  /* ----- UI state -------------------------------------------------------- */

  const [search, setSearch] = useState("");
  const [raceFilter, setRaceFilter] = useState("all");
  const [rarityFilter, setRarityFilter] = useState("all");
  const [starFilter, setStarFilter] = useState("all");
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);

  const [inspectOpen, setInspectOpen] = useState(false);
  const [inspectCardId, setInspectCardId] = useState(cards[0]?.id ?? null);

  const [recentlyLeveledId, setRecentlyLeveledId] = useState(null);
  const [unlockCardId, setUnlockCardId] = useState(null);

  // Generic mini-modal for Test Hand, Deck saved, Deck loaded, etc.
  // modal = { title, message?, lines? }
  const [modal, setModal] = useState(null);

  /* ----- tiny helpers bound to current upgrades -------------------------- */

  const getUpgradeSteps = (cardId) => upgrades[cardId] || 0;

  const getLevelCost = (cardId) => {
    const steps = getUpgradeSteps(cardId);
    return BASE_LEVEL_COST * (steps + 1);
  };

  /* ----------------------------------------------------------------------- */
  /*  Derived state                                                          */
  /* ----------------------------------------------------------------------- */

  // deckCounts: { cardId: count }, using deck as array of card objects
  const deckCounts = useMemo(() => {
    const map = {};
    for (const cardObj of deck) {
      if (!cardObj || !cardObj.id) continue;
      const id = cardObj.id;
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

  // Deck sidebar: [{ card, count }]
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
    playUiSoft();
  };

  const closeInspect = () => {
    setInspectOpen(false);
    setUnlockCardId(null);
    setRecentlyLeveledId(null);
    playUiSoft();
  };

  const inspectedBaseCard =
    cards.find((c) => c.id === inspectCardId) ?? cards[0];

  const inspectedUpgrades = getUpgradeSteps(inspectedBaseCard.id);
  const inspectedInDeck = deckCounts[inspectedBaseCard.id] || 0;
  const inspectedDisplayCard = getDisplayCard(inspectedBaseCard, upgrades);

  /* ----------------------------------------------------------------------- */
  /*  Deck actions                                                           */
  /* ----------------------------------------------------------------------- */

  const handleAddToDeck = (cardId) => {
    if (mode !== "deck") return; // collection mode = read-only
    if (deck.length >= MAX_DECK_CARDS) return;

    const baseCard = cards.find((c) => c.id === cardId);
    if (!baseCard) return;

    setDeck((prev) => [...prev, baseCard]);
    playUiBubble();
  };

  const handleRemoveFromDeck = (cardId) => {
    setDeck((prev) => {
      const idx = prev.findIndex((c) => c && c.id === cardId);
      if (idx === -1) return prev;
      const copy = [...prev];
      copy.splice(idx, 1);
      return copy;
    });
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

    setRecentlyLeveledId(cardId);
    setTimeout(() => {
      setRecentlyLeveledId((prev) => (prev === cardId ? null : prev));
    }, 700);

    playLevelUpSound();

    if (newLevel >= unlockLevel && currentLevel < unlockLevel) {
      setUnlockCardId(cardId);
    }
  };

  const handleClearDeck = () => {
    setDeck([]);
    playUiBubble();
  };

  const handleTestHand = () => {
    playUiBubble();
    if (deck.length === 0) {
      setModal({
        title: "Test Hand",
        message: "Your deck is empty – add some cards first!",
      });
      return;
    }

    const uniqueIds = Array.from(new Set(deck.map((c) => c.id)));
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

  const handleExportDeck = () => {
    playUiBubble();
    if (deck.length === 0) {
      setModal({
        title: "Deck saved",
        message: "Deck is empty – nothing to save yet.",
      });
      return;
    }
    setIsNameModalOpen(true);
  };

  const handleConfirmExport = (deckName) => {
    // deck is array of card objects → export IDs
    const deckIds = deck.map((card) => card.id);
    const payload = { deckName, deck: deckIds, upgrades };

    console.log("Attempting to save deck:", payload);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
      console.log("Save successful.");
      setModal({
        title: "Deck Saved",
        message: `Deck "${deckName}" has been saved and is now your active deck.`,
      });
    } catch (error) {
      console.error("Failed to save deck:", error);
      setModal({
        title: "Error",
        message: `Could not save deck. Reason: ${error.message}`,
      });
    } finally {
      setIsNameModalOpen(false);
    }
  };

  const handleCancelExport = () => {
    setIsNameModalOpen(false);
  };

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

      // Convert saved IDs back to card objects
      const reconstructedDeck = payload.deck
        .map((id) => cards.find((c) => c.id === id))
        .filter(Boolean);

      setDeck(reconstructedDeck);
      if (payload.upgrades && typeof payload.upgrades === "object") {
        setUpgrades(payload.upgrades);
      }

      setModal({
        title: "Deck loaded",
        message: "Your saved deck has been loaded into the builder.",
      });
    } catch (error) {
      console.error(error);
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
    event.dataTransfer.setData("text/plain", cardId);
    playUiSoft();
  };

  const handleDeckDragOver = (event) => {
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

  const unlockCard =
    unlockCardId != null
      ? getDisplayCard(cards.find((c) => c.id === unlockCardId), upgrades)
      : null;

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
              <input
                type="text"
                className="db-input db-input--search"
                placeholder="Search..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

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

          <div className="deckbuilder-cardgrid">
            {filteredCards.map((displayCard) => (
              <MonsterCard
                key={displayCard.id}
                card={displayCard}
                onClick={() => openInspect(displayCard.id)}
                isLeveling={displayCard.id === recentlyLeveledId}
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
                if (!card) return null;
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
            playUiBubble();
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
        card={inspectedDisplayCard}
        baseCard={inspectedBaseCard}
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
            playUiSoft();
          }}
        >
          <div
            className="db-unlock-inner"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="db-unlock-title">Power Unlocked!</div>
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

      {/* ---------------------- Generic modal ------------------------------ */}
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

      {/* ---------------------- Deck name modal ---------------------------- */}
      <DeckNameModal
        isOpen={isNameModalOpen}
        onClose={handleCancelExport}
        onConfirm={handleConfirmExport}
        initialName="My Awesome Deck"
      />
    </div>
  );
}
