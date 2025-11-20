// src/components/inspect/CardInspect.jsx
import MonsterCard from "../card/MonsterCard.jsx";
import "./CardInspect.css";

export default function CardInspect({
  open,
  card,          // display card (with computed stats)
  baseCard,      // raw base card
  upgrades,      // number of upgrade steps
  inDeckCount,   // how many copies currently in deck
  gold,
  onClose,
  onAddToDeck,
  onRemoveFromDeck,
  onLevelUp,
}) {
  if (!open || !card) return null;

  const currentLevel = card.level ?? 1;
  const maxLevel = card.maxLevel ?? 5;

  const levelUpDisabled = currentLevel >= maxLevel || gold <= 0;

  return (
    <div className="ci-backdrop" onClick={onClose}>
      <div className="ci-modal" onClick={(e) => e.stopPropagation()}>
        
        {/* HEADER */}
        <header className="ci-header">
          <h2>{card.name}</h2>
          <button className="ci-close" onClick={onClose}>✕</button>
        </header>

        {/* BODY */}
        <div className="ci-body">

          {/* LEFT COLUMN — DETAILS */}
          <aside className="ci-column ci-column--left">
            <h3 className="ci-section-title">Card details</h3>

            <div className="ci-textblock">
              <p><strong>Race:</strong> {card.race}</p>
              <p><strong>Rarity:</strong> {card.rarity}</p>
              <p><strong>Stars:</strong> {baseCard.stars}</p>
              <p><strong>Level:</strong> {currentLevel}/{maxLevel}</p>
              <p><strong>Attack:</strong> {card.attack}</p>
              <p><strong>Health:</strong> {card.health}</p>
            </div>

            {card.text && (
              <>
                <h4 className="ci-subtitle">Effect</h4>
                <p className="ci-effect">{card.text}</p>
              </>
            )}

            {Array.isArray(baseCard.related) && baseCard.related.length > 0 && (
              <>
                <h4 className="ci-subtitle">Related Abilities</h4>
                <ul className="ci-list">
                  {baseCard.related.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </>
            )}
          </aside>

          {/* CENTER COLUMN — BIG CARD */}
          <section className="ci-column ci-column--center">
            <div className="ci-main-card-wrap">
              <MonsterCard card={card} size="large" />
            </div>

            <div className="ci-owned">Owned in deck: {inDeckCount}</div>
          </section>

          {/* RIGHT COLUMN — STORY */}
          <aside className="ci-column ci-column--right">
            <h3 className="ci-section-title">Story</h3>
            <p className="ci-story">
              {baseCard.lore || "This creature's tale is not yet written..."}
            </p>
          </aside>

        </div>

        {/* FOOTER ACTIONS */}
        <footer className="ci-footer">
          <button
            className="ci-btn ci-btn--ghost"
            disabled={inDeckCount === 0}
            onClick={() => onRemoveFromDeck(baseCard.id)}
          >
            Remove
          </button>

          <button
            className="ci-btn"
            onClick={() => onAddToDeck(baseCard.id)}
          >
            Add
          </button>

          <button
            className="ci-btn"
            disabled={levelUpDisabled}
            onClick={() => onLevelUp(baseCard.id)}
          >
            Level Up
          </button>

          <span className="ci-gold">Gold: {gold}</span>
        </footer>

      </div>
    </div>
  );
}
