// src/components/deckbuilder/DeckBuilder.jsx
// Version A — RESTORED ORIGINAL LAYOUT + FIRESTORE SYNC

import { useMemo, useState } from "react";
import { cards, RACES, RARITIES, STARS } from "../../data/cards.js";
import MonsterCard from "../card/MonsterCard.jsx";
import CardInspect from "../inspect/CardInspect.jsx";
import DeckNameModal from "../ui/DeckNameModal.jsx";

import "./DeckBuilder.css";

/* ======================================================================= */
/*  SFX (Sound Effects) configuration                                      */
/* ======================================================================= */
const SFX_UI_SOFT = "/sfx/ui-click-soft.wav";
const SFX_UI_BUBBLE = "/sfx/ui-bubble-click.wav";
const SFX_LEVEL_UP = "/sfx/level-up.mp3";

function playSfx(url, volume = 1) {
  try {
    const a = new Audio(url);
    a.volume = volume;
    a.play();
  } catch {}
}

const playUiSoft = () => playSfx(SFX_UI_SOFT, 0.7);
const playUiBubble = () => playSfx(SFX_UI_BUBBLE, 0.85);
const playLevelUpSound = () => playSfx(SFX_LEVEL_UP, 0.8);

/* ======================================================================= */
/*  CONSTANTS                                                              */
/* ======================================================================= */
const MAX_DECK = 6;
const BASE_LEVEL_COST = 100;

/* ======================================================================= */
/*  Card Level Helpers                                                     */
/* ======================================================================= */

function getBaseLevel(baseCard) {
  return 1; // FORCE level 1 start EVERY TIME
}

function getEffectiveLevel(baseCard, upgradeSteps) {
  const base = getBaseLevel(baseCard);
  const max = baseCard.maxLevel ?? 5;
  return Math.min(base + upgradeSteps, max);
}

function getDisplayCard(baseCard, upgrades) {
  const steps = upgrades[baseCard.id] || 0;
  const base = getBaseLevel(baseCard);
  const max = baseCard.maxLevel ?? 5;

  const level = Math.min(base + steps, max);
  const delta = level - base;

  const attack =
    (baseCard.baseAttack ?? baseCard.attack) +
    delta * (baseCard.attackPerLevel ?? 1);

  const health =
    (baseCard.baseHealth ?? baseCard.health) +
    delta * (baseCard.healthPerLevel ?? 1);

  let image = baseCard.image;
  if (Array.isArray(baseCard.imagesByLevel) && baseCard.imagesByLevel.length) {
    const idx = Math.min(level, baseCard.imagesByLevel.length) - 1;
    image = baseCard.imagesByLevel[idx];
  }

  return {
    ...baseCard,
    level,
    attack,
    health,
    image,
  };
}

/* ======================================================================= */
/*  MAIN COMPONENT — VERSION A                                             */
/* ======================================================================= */

export default function DeckBuilder({
  mode,           // "deck" or "collection"
  userData,       // Firestore data { deck:[], upgrades:{}, gold }
  updateUserData, // Firestore writer
}) {
  const deckIds = userData.deck || [];
  const upgrades = userData.upgrades || {};
  const gold = userData.gold ?? 0;

  /* ======================================================================= */
  /*  UI STATE                                                               */
  /* ======================================================================= */
  const [search, setSearch] = useState("");
  const [raceFilter, setRaceFilter] = useState("all");
  const [rarityFilter, setRarityFilter] = useState("all");
  const [starFilter, setStarFilter] = useState("all");

  const [inspectOpen, setInspectOpen] = useState(false);
  const [inspectId, setInspectId] = useState(cards[0]?.id);

  const [recentlyUpgraded, setRecentlyUpgraded] = useState(null);
  const [unlockCardId, setUnlockCardId] = useState(null);

  const [modal, setModal] = useState(null);
  const [isNameModalOpen, setIsNameModalOpen] = useState(false);

  /* ======================================================================= */
  /*  FILTERED CARDS                                                         */
  /* ======================================================================= */

  const filteredCards = useMemo(() => {
    return cards
      .filter((c) => {
        if (raceFilter !== "all" && c.race !== raceFilter) return false;
        if (rarityFilter !== "all" && c.rarity !== rarityFilter) return false;
        if (starFilter !== "all" && c.stars !== starFilter) return false;
        if (search && !c.name.toLowerCase().includes(search.toLowerCase()))
          return false;
        return true;
      })
      .map((c) => getDisplayCard(c, upgrades));
  }, [search, raceFilter, rarityFilter, starFilter, upgrades]);

  /* ======================================================================= */
  /*  DECK CARDS                                                             */
  /* ======================================================================= */
  const deckCards = deckIds
    .map((id) => cards.find((c) => c.id === id))
    .filter(Boolean);

  const deckCounts = useMemo(() => {
    const map = {};
    for (const card of deckCards) {
      map[card.id] = (map[card.id] || 0) + 1;
    }
    return map;
  }, [deckCards]);

  /* ======================================================================= */
  /*  INSPECTION                                                             */
  /* ======================================================================= */
  const openInspect = (id) => {
    setInspectId(id);
    setInspectOpen(true);
    playUiSoft();
  };

  const closeInspect = () => {
    setInspectOpen(false);
    setRecentlyUpgraded(null);
    setUnlockCardId(null);
  };

  const baseCard = cards.find((c) => c.id === inspectId);
  const displayCard = baseCard ? getDisplayCard(baseCard, upgrades) : null;
  const upgradeSteps = upgrades[inspectId] || 0;
  const inDeckCount = deckCounts[inspectId] || 0;

  /* ======================================================================= */
  /*  FIRESTORE-ACTION FUNCTIONS                                             */
  /* ======================================================================= */

const addToDeck = async (cardId) => {
  console.log("addToDeck triggered", { mode, deckIds, cardId });

  if (mode !== "deck") {
    console.warn("❌ addToDeck ignored: mode is not 'deck'");
    return;
  }

  if (deckIds.length >= MAX_DECK) {
    console.warn("❌ addToDeck ignored: deck is full");
    return;
  }

  const newDeck = [...deckIds, cardId];
  console.log("Updating deck →", newDeck);

  playUiBubble();
  await updateUserData({ deck: newDeck });
};

  const removeFromDeck = async (cardId) => {
    playUiBubble();
    const idx = deckIds.indexOf(cardId);
    if (idx === -1) return;

    const newDeck = [...deckIds];
    newDeck.splice(idx, 1);
    await updateUserData({ deck: newDeck });
  };

  const clearDeck = async () => {
    playUiBubble();
    await updateUserData({ deck: [] });
  };

  const levelUp = async (cardId) => {
    const card = cards.find((c) => c.id === cardId);
    if (!card) return;

    const steps = upgrades[cardId] || 0;
    const currentLevel = getEffectiveLevel(card, steps);
    const maxLevel = card.maxLevel ?? 5;
    if (currentLevel >= maxLevel) return;

    const cost = BASE_LEVEL_COST * (steps + 1);
    if (gold < cost) return;

    playLevelUpSound();

    const newUpgrades = {
      ...upgrades,
      [cardId]: steps + 1,
    };

    await updateUserData({
      gold: gold - cost,
      upgrades: newUpgrades,
    });

    setRecentlyUpgraded(cardId);
    setTimeout(() => {
      setRecentlyUpgraded((prev) => (prev === cardId ? null : prev));
    }, 650);
  };

  /* ======================================================================= */
  /*  EXPORT / IMPORT = Save deck to Firestore                              */
  /* ======================================================================= */

  const handleExportDeck = () => {
    if (deckIds.length === 0) {
      setModal({
        title: "Deck Saved",
        message: "Deck is empty — nothing to save.",
      });
      return;
    }
    setIsNameModalOpen(true);
  };

  const handleConfirmExport = async (deckName) => {
    await updateUserData({
      deckName,
      deck: deckIds,
      upgrades,
    });

    setModal({
      title: "Deck Saved",
      message: `Deck "${deckName}" saved to Firestore.`,
    });

    setIsNameModalOpen(false);
  };

  const handleImportDeck = async () => {
    // Firestore load already done by useUserData
    setModal({
      title: "Deck Loaded",
      message: "Your deck was loaded from Firestore.",
    });
  };

  /* ======================================================================= */
  /*  TEST HAND                                                              */
  /* ======================================================================= */

  const handleTestHand = () => {
    playUiBubble();
    if (deckIds.length === 0) {
      setModal({
        title: "Test Hand",
        message: "Your deck is empty.",
      });
      return;
    }

    const unique = Array.from(new Set(deckIds));
    const handSize = Math.min(3, unique.length);

    const sample = unique
      .sort(() => Math.random() - 0.5)
      .slice(0, handSize)
      .map((id) => {
        const c = cards.find((x) => x.id === id);
        const d = getDisplayCard(c, upgrades);
        return `${d.name} (Lvl ${d.level})`;
      });

    setModal({
      title: "Test Hand",
      lines: sample,
    });
  };

  /* ======================================================================= */
  /*  UNLOCK POPUP                                                           */
  /* ======================================================================= */

  const unlockCard =
    unlockCardId != null
      ? getDisplayCard(cards.find((c) => c.id === unlockCardId), upgrades)
      : null;

  /* ======================================================================= */
  /*  RENDER START                                                           */
  /* ======================================================================= */

  return (
    <div className="deckbuilder-root">
      <div
        className={
          "deckbuilder-main" +
          (mode === "collection"
            ? " deckbuilder-main--collection"
            : "")
        }
      >
        {/* =========================== LEFT — COLLECTION ==================== */}
        <section className="deckbuilder-collection">
          <header className="deckbuilder-header">
            <div className="deckbuilder-title">
              <h2>{mode === "deck" ? "Deck Builder" : "Collection"}</h2>
              <span className="deckbuilder-subtitle">
                {mode === "deck"
                  ? "Tap a card to inspect it, then add it to your 6-card deck."
                  : "Browse your collection with filters."}
              </span>
            </div>

            <div className="deckbuilder-filters">
              <input
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
                      {r}
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
                      {r}
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
            {filteredCards.map((card) => (
              <MonsterCard
                key={card.id}
                card={card}
                onClick={() => openInspect(card.id)}
                isLeveling={recentlyUpgraded === card.id}
              />
            ))}
          </div>
        </section>

        {/* =========================== RIGHT — DECK SIDEBAR ================= */}
        {mode === "deck" && (
          <aside className="deckbuilder-sidebar">
            <header className="deckbuilder-sidebar-header">
              <div>
                <h3>Current Deck</h3>
                <span className="deckbuilder-sidebar-caption">
                  Tap a card to inspect, or press X to remove.
                </span>
              </div>

              <span className="deckbuilder-deckcount">
                {deckIds.length}/{MAX_DECK}
              </span>
            </header>

            <div className="deckbuilder-sidebar-body">
              {deckCards.length === 0 && (
                <p className="deckbuilder-empty">
                  No cards yet. Add some from the left.
                </p>
              )}

              {deckCards.map((card, i) => {
                const lvl = getEffectiveLevel(card, upgrades[card.id] || 0);
                const cost =
                  BASE_LEVEL_COST * ((upgrades[card.id] || 0) + 1);

                return (
                  <div key={`${card.id}-${i}`} className="deckbuilder-deckrow">
                    <button
                      className="deckbuilder-deckrow-main"
                      onClick={() => openInspect(card.id)}
                    >
                      <span className="deckbuilder-deckrow-count">
                        {deckCounts[card.id]}×
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
                        {card.cost} • {card.race} • Lvl {lvl}
                      </span>
                    </button>

                    <button
                      className="deckbuilder-deckrow-remove"
                      onClick={() => removeFromDeck(card.id)}
                    >
                      ✕
                    </button>

                    <div className="deckbuilder-deckrow-upgrade">
                      <span className="deckbuilder-deckrow-upgrade-cost">
                        {cost}
                      </span>
                      <button
                        className="deckbuilder-deckrow-upgrade-btn"
                        disabled={gold < cost}
                        onClick={() => levelUp(card.id)}
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <footer className="deckbuilder-sidebar-footer">
              <button className="db-button db-button--ghost" onClick={clearDeck}>
                Clear Deck
              </button>
            </footer>
          </aside>
        )}
      </div>

      {/* ======================= BOTTOM BAR ============================== */}
      <footer className="deckbuilder-bottombar">
        <button
          className="db-button db-button--outline"
          onClick={() =>
            setModal({
              title: "Start Match",
              message: "Match gameplay not implemented.",
            })
          }
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
          Save Deck
        </button>

        <button
          className="db-button db-button--outline"
          onClick={handleImportDeck}
        >
          Load Deck
        </button>
      </footer>

      {/* ======================= INSPECT OVERLAY ========================== */}
      <CardInspect
        open={inspectOpen}
        card={displayCard}
        baseCard={baseCard}
        upgrades={upgradeSteps}
        inDeckCount={inDeckCount}
        gold={gold}
        onClose={closeInspect}
        onAddToDeck={() => addToDeck(inspectId)}
        onRemoveFromDeck={() => removeFromDeck(inspectId)}
        onLevelUp={() => levelUp(inspectId)}
      />

      {/* ======================= UNLOCK OVERLAY =========================== */}
      {unlockCard && (
        <div
          className="db-unlock-overlay"
          onClick={() => setUnlockCardId(null)}
        >
          <div className="db-unlock-inner" onClick={(e) => e.stopPropagation()}>
            <div className="db-unlock-title">Power Unlocked!</div>
            <MonsterCard card={unlockCard} size="large" isLeveling />
            <p className="db-unlock-text">{unlockCard.text}</p>
            <button
              className="db-button db-unlock-close"
              onClick={() => setUnlockCardId(null)}
            >
              Continue
            </button>
          </div>
        </div>
      )}

      {/* ======================= GENERIC MODAL ============================ */}
      {modal && (
        <div className="db-modal-overlay" onClick={() => setModal(null)}>
          <div className="db-modal" onClick={(e) => e.stopPropagation()}>
            <h3 className="db-modal-title">{modal.title}</h3>
            {modal.message && (
              <p className="db-modal-message">{modal.message}</p>
            )}
            {modal.lines && (
              <ul className="db-modal-list">
                {modal.lines.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            )}
            <button
              className="db-button db-modal-close"
              onClick={() => setModal(null)}
            >
              OK
            </button>
          </div>
        </div>
      )}

      {/* ======================= DECK NAME MODAL ========================== */}
      <DeckNameModal
        isOpen={isNameModalOpen}
        onClose={() => setIsNameModalOpen(false)}
        onConfirm={handleConfirmExport}
        initialName="My Deck"
      />
    </div>
  );
}
