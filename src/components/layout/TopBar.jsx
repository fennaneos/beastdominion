export default function TopBar({ gold, shards }) {
  return (
    <header className="topbar">
      <div className="topbar__left">
        <div className="topbar__logo-circle">BD</div>
        <div>
          <div className="topbar__title">Beast Dominion</div>
          <div className="topbar__subtitle">Prototype Deck Builder</div>
        </div>
      </div>

      <div className="topbar__right">
        <div className="topbar__currency topbar__currency--gold">
          <span className="topbar__currency-label">Gold</span>
          <span className="topbar__currency-value">{gold}</span>
        </div>
        <div className="topbar__currency topbar__currency--gem">
          <span className="topbar__currency-label">Shards</span>
          <span className="topbar__currency-value">{shards}</span>
        </div>
      </div>
    </header>
  );
}
