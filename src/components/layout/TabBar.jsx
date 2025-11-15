export default function TabBar({ active, onChange }) {
  const tabs = [
    { id: "play", label: "Play" },
    { id: "collection", label: "Collection" },
    { id: "deck", label: "Deck Builder" },
  ];

  return (
    <nav className="tabbar">
      <div className="tabbar__inner">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={
              "tabbar__tab" + (tab.id === active ? " tabbar__tab--active" : "")
            }
            onClick={() => onChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </nav>
  );
}
