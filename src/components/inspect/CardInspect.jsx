// src/components/inspect/CardInspect.jsx
import MonsterCard from "../card/MonsterCard.jsx";
import "./CardInspect.css";

export default function CardInspect({
  open,
  card,
  baseCard,
  upgrades,
  inDeckCount,
  gold,
  onClose,
  onAddToDeck,
  onRemoveFromDeck,
  onLevelUp,
}) {
  if (!open || !card) return null;

  const currentLevel = card.level ?? card.stars ?? 1;
  const maxLevel = card.maxLevel ?? 3;

  return (
    <div className="ci-backdrop" onClick={onClose}>
      <div className="ci-modal" onClick={(e) => e.stopPropagation()}>
        <header className="ci-header">
          <h2>{card.name}</h2>
          <button className="ci-close" onClick={onClose}>
            ✕
          </button>
        </header>

        {/* scrollable content area */}
        <div className="ci-body">
          {/* LEFT – text details */}
          <aside className="ci-column ci-column--left">
            <h3 className="ci-section-title">Card details</h3>
            <div className="ci-textblock">
              <p>
                <strong>Race:</strong> {card.race}
              </p>
              <p>
                <strong>Rarity:</strong> {card.rarity}
              </p>
              <p>
                <strong>Stars:</strong> {card.stars}
              </p>
              <p>
                <strong>Power:</strong> {currentLevel}/{maxLevel}
              </p>
            </div>

            <h4 className="ci-subtitle">Effect</h4>
            <p className="ci-effect">{card.detail}</p>

            {card.bundle?.length ? (
              <>
                <h4 className="ci-subtitle">Related abilities</h4>
                <ul className="ci-list">
                  {card.bundle.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </>
            ) : null}
          </aside>

          {/* CENTER – big card + evolutions row */}
          <section className="ci-column ci-column--center">
            <div className="ci-main-card-wrap">
              <MonsterCard card={card} size="large" />
            </div>

            <div className="ci-evolutions">
              {baseCard?.evolutions?.map((evo, idx) => {
                const evoCard = evo.displayCard;
                const locked = evo.locked;
                return (
                  <div
                    key={evoCard.id}
                    className={
                      "ci-evo-slot" + (locked ? " ci-evo-slot--locked" : "")
                    }
                  >
                    <MonsterCard
                      card={evoCard}
                      size="normal"
                      className="ci-evo-card"
                    />
                    <div className="ci-evo-label">Lvl {idx + 1}</div>
                  </div>
                );
              })}
            </div>

            <div className="ci-owned">Owned in deck: {inDeckCount}</div>
          </section>

          {/* RIGHT – lore / story */}
          <aside className="ci-column ci-column--right">
            <h3 className="ci-section-title">Story</h3>
            <p className="ci-story">{card.lore}</p>
          </aside>
        </div>

        {/* FOOTER – actions */}
        <footer className="ci-footer">
          <button
            className="ci-btn ci-btn--ghost"
            onClick={onRemoveFromDeck}
            disabled={inDeckCount === 0}
          >
            Remove from deck
          </button>
          <button className="ci-btn" onClick={onAddToDeck}>
            Add to deck
          </button>
          <button
            className="ci-btn"
            onClick={onLevelUp}
            disabled={gold <= 0 || currentLevel >= maxLevel}
          >
            Level up (uses gold)
          </button>
          <span className="ci-gold">Gold: {gold}</span>
        </footer>
      </div>
    </div>
  );
}
