import "./MonsterCard.css";

export default function MonsterCard({
  card,
  size = "normal",
  isLeveling = false,
  className = "",
  ...handlers
}) {
  const {
    name,
    cost,
    attack,
    health,
    race,
    rarity,
    stars,
    text,
    image,     // background art (rectangular)
    imageTop,  // no-background overlay art (optional – used e.g. lvl3)
    abilityName,
  } = card;

  const rootClass =
    `bd-card bd-card--${size} bd-card--${rarity} bd-card--race-${race}` +
    (isLeveling ? " bd-card--leveling" : "") +
    (className ? " " + className : "");

  const MAX_STARS = 5;
  const dots = Array.from({ length: MAX_STARS });

  const mainAbility = abilityName || "Spiteful Growth";
  const rulesText = text || "";

  const hasOverlay = !!imageTop;

  return (
    <div className={rootClass} {...handlers}>
      <div className="bd-card__inner">
        {/* ===== TOP BANNER ===== */}
        <div className="bd-card__banner">
          {/* Race ribbon */}
          <div className="bd-card__race-ribbon">
            <div className="bd-card__race-icon">
              {race ? race[0].toUpperCase() : "?"}
            </div>
          </div>

          {/* Name + stars */}
          <div className="bd-card__title-area">
            <div className="bd-card__name">{name}</div>
            <div className="bd-card__stars">
              {dots.map((_, i) => (
                <span
                  key={i}
                  className={
                    "bd-card__star-dot" +
                    (i < stars ? " bd-card__star-dot--filled" : "")
                  }
                />
              ))}
            </div>
          </div>

          {/* Cost orb */}
          <div className="bd-card__cost-orb">
            <span>{cost}</span>
          </div>
        </div>

        {/* ===== ART & TEXT ===== */}
        <div className="bd-card__art-wrap">
          {/* CASE 1: card has overlay art (e.g. chainbornwhelp lvl3) */}
          {hasOverlay && image && (
            <>
              <div
                className="bd-card__art-bg bd-card__art-bg--dimmed"
                style={{ backgroundImage: `url(${image})` }}
              />
              <img
                src={imageTop}
                className="bd-card__art-top"
                alt={name}
              />
            </>
          )}

          {/* CASE 2: normal card, no overlay → old behaviour */}
          {!hasOverlay && image && (
            <img src={image} className="bd-card__art" alt={name} />
          )}

          {/* CASE 3: no art at all → placeholder */}
          {!image && !hasOverlay && (
            <div className="bd-card__art bd-card__art--placeholder">
              {race?.toUpperCase() || "MONSTER"}
            </div>
          )}

          {/* Gradient + rules text */}
          <div className="bd-card__art-gradient" />

          <div className="bd-card__ability">
            <div className="bd-card__ability-name">{mainAbility}</div>
            <div className="bd-card__ability-text">{rulesText}</div>
          </div>
        </div>

        {/* ===== BOTTOM STATS ===== */}
        <div className="bd-card__bottom">
          <div className="bd-card__stat bd-card__stat--attack">
            <span className="bd-card__stat-label">ATK</span>
            <span className="bd-card__stat-value">{attack}</span>
          </div>
          <div className="bd-card__stat bd-card__stat--health">
            <span className="bd-card__stat-label">HP</span>
            <span className="bd-card__stat-value">{health}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
