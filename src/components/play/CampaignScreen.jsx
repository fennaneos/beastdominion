// src/components/play/CampaignScreen.jsx
import { useState } from "react";
import "./CampaignScreen.css";

const CAMPAIGN_CHAPTERS = [
  {
    id: "darkwood",
    index: 1,
    name: "Darkwood",
    difficulty: "Easy",
    description:
      "The West of the Isles of the Sun, known for its cold rains and deep coniferous forests. " +
      "Animals, beasts and other marine wildlife live here. For a long time after the Split, uninvited guests had not come.",
    recommendedPower: 71,
    staminaCost: 6,
    rewards: [
      "Complete the mission",
      "Win battle with no less than 25% of each monster's health",
      "Win with 2 monsters in team",
    ],
    enemies: [
      { id: "spirit1", name: "River Sprite", power: 24 },
      { id: "spirit2", name: "Moonling", power: 24 },
      { id: "boss", name: "Darkwood Warden", power: 23 },
    ],
    levels: [
      // x / y are percentages inside the map area (0–100).
      { id: 1, label: 1, x: 25, y: 88, unlocked: true, current: false },
      { id: 2, label: 2, x: 42, y: 80, unlocked: true, current: false },
      { id: 3, label: 3, x: 18, y: 70, unlocked: true, current: false },
      { id: 4, label: 4, x: 40, y: 60, unlocked: true, current: false },
      { id: 5, label: 5, x: 20, y: 52, unlocked: true, current: false },
      { id: 6, label: 6, x: 40, y: 42, unlocked: true, current: false },
      { id: 7, label: 7, x: 20, y: 32, unlocked: true, current: false },
      { id: 8, label: 8, x: 40, y: 22, unlocked: true, current: false },
      { id: 9, label: 9, x: 62, y: 52, unlocked: true, current: false },
      { id: 10, label: 10, x: 62, y: 70, unlocked: true, current: false },
      { id: 11, label: 11, x: 62, y: 88, unlocked: true, current: true }, // current node
    ],
  },
  {
    id: "embercliffs",
    index: 2,
    name: "Ember Cliffs",
    difficulty: "Normal",
    description:
      "Jagged volcanic ridges and lava rivers. Only the bravest monsters climb these paths.",
    recommendedPower: 150,
    staminaCost: 8,
    rewards: [
      "Complete the mission",
      "Win with no deaths in your team",
      "Win within 10 turns",
    ],
    enemies: [
      { id: "imp", name: "Lava Imp", power: 40 },
      { id: "hound", name: "Magma Hound", power: 55 },
      { id: "lord", name: "Flame Lord", power: 55 },
    ],
    levels: Array.from({ length: 11 }).map((_, idx) => ({
      id: idx + 1,
      label: idx + 1,
      x: [25, 42, 18, 40, 20, 40, 20, 40, 62, 62, 62][idx],
      y: [88, 80, 70, 60, 52, 42, 32, 22, 52, 70, 88][idx],
      unlocked: idx === 0,
      current: idx === 0,
    })),
  },
  {
    id: "frozendepths",
    index: 3,
    name: "Frozen Depths",
    difficulty: "Hard",
    description:
      "Beneath the old glaciers, something ancient and hungry stirs.",
    recommendedPower: 260,
    staminaCost: 10,
    rewards: [
      "Complete the mission",
      "Win with only 3 cards in deck",
      "Win battle without using abilities",
    ],
    enemies: [
      { id: "wisp", name: "Ice Wisp", power: 70 },
      { id: "golem", name: "Frost Golem", power: 90 },
      { id: "tyrant", name: "Glacier Tyrant", power: 100 },
    ],
    levels: Array.from({ length: 11 }).map((_, idx) => ({
      id: idx + 1,
      label: idx + 1,
      x: [25, 42, 18, 40, 20, 40, 20, 40, 62, 62, 62][idx],
      y: [88, 80, 70, 60, 52, 42, 32, 22, 52, 70, 88][idx],
      unlocked: idx === 0,
      current: idx === 0,
    })),
  },
];

export default function CampaignScreen({ gold, shards, onStartBattle }) {
  const [activeChapterId, setActiveChapterId] = useState(
    CAMPAIGN_CHAPTERS[0].id
  );
  const [selectedLevelId, setSelectedLevelId] = useState(
    CAMPAIGN_CHAPTERS[0].levels[0].id
  );

  const activeChapter =
    CAMPAIGN_CHAPTERS.find((c) => c.id === activeChapterId) ??
    CAMPAIGN_CHAPTERS[0];

  const selectedLevel =
    activeChapter.levels.find((l) => l.id === selectedLevelId) ??
    activeChapter.levels[0];

  const handleSelectChapter = (chapterId) => {
    const chapter = CAMPAIGN_CHAPTERS.find((c) => c.id === chapterId);
    if (!chapter) return;

    const firstUnlocked =
      chapter.levels.find((l) => l.unlocked) ?? chapter.levels[0];

    setActiveChapterId(chapterId);
    setSelectedLevelId(firstUnlocked.id);
  };

  const handleSelectLevel = (level) => {
    if (!level.unlocked) return;
    setSelectedLevelId(level.id);
  };

const handleStartFight = () => {
  if (!onStartBattle) return;

  onStartBattle({
    chapterId: activeChapter.id,
    levelId: selectedLevel.id,
    chapter: activeChapter,
    level: selectedLevel,
  });
};


  return (
    <div className="campaign-screen">
      <div className="campaign-header-row">
        <button className="campaign-back-btn">⟵ BACK</button>
        <div className="campaign-header-spacer" />
        <button className="campaign-home-btn">
          <span className="campaign-home-icon">⌂</span>
          <span>HOME</span>
        </button>
      </div>

      <div className="campaign-layout">
        {/* LEFT: world selector + map */}
        <div className="campaign-map-column">
          <div className="campaign-world-strip">
            {CAMPAIGN_CHAPTERS.map((chapter) => (
              <button
                key={chapter.id}
                className={
                  "campaign-world-pill" +
                  (chapter.id === activeChapterId
                    ? " campaign-world-pill--active"
                    : "")
                }
                onClick={() => handleSelectChapter(chapter.id)}
              >
                <div className="campaign-world-icon">
                  {chapter.index}
                </div>
              </button>
            ))}
          </div>

          <div className="campaign-map-wrapper">
            <div className="campaign-map-bg" />
            <div className="campaign-map">
              {activeChapter.levels.map((level) => {
                const isSelected = level.id === selectedLevel.id;
                const isCurrent = !!level.current;
                const isLocked = !level.unlocked;

                return (
                  <div
                    key={level.id}
                    className={
                      "campaign-node" +
                      (isSelected ? " campaign-node--selected" : "") +
                      (isCurrent ? " campaign-node--current" : "") +
                      (isLocked ? " campaign-node--locked" : "")
                    }
                    style={{
                      left: `${level.x}%`,
                      top: `${level.y}%`,
                    }}
                    onClick={() => handleSelectLevel(level)}
                  >
                    <div className="campaign-node-diamond">
                      <span className="campaign-node-label">
                        {level.label}
                      </span>
                    </div>
                    <div className="campaign-node-stars">
                      {[0, 1, 2].map((i) => (
                        <span
                          key={i}
                          className="campaign-node-star"
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* simple dotted vertical path just for style */}
              <div className="campaign-path campaign-path--left" />
              <div className="campaign-path campaign-path--right" />
            </div>
          </div>
        </div>

        {/* RIGHT: chapter + level info */}
        <div className="campaign-info-column">
          <div className="campaign-chapter-header">
            <div className="campaign-chapter-tag">
              Chapter {activeChapter.index}
            </div>
            <h1 className="campaign-chapter-title">
              {activeChapter.name}
            </h1>
            <div className="campaign-difficulty">
              <span className="campaign-skull">💀</span>
              <span>{activeChapter.difficulty}</span>
              <span className="campaign-difficulty-label">
                CURRENT
              </span>
            </div>
          </div>

          <p className="campaign-description">
            {activeChapter.description}
          </p>

          <div className="campaign-info-row">
            <section className="campaign-section campaign-section--wide">
              <h3>Your reward</h3>
              <ul className="campaign-rewards">
                {activeChapter.rewards.map((r, idx) => (
                  <li key={idx} className="campaign-reward-item">
                    <span className="campaign-reward-icon">✦</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="campaign-section campaign-section--enemies">
              <div className="campaign-section-heading">
                <h3>Enemies</h3>
                <span className="campaign-enemy-power">
                  {activeChapter.recommendedPower}
                </span>
              </div>
              <div className="campaign-enemy-list">
                {activeChapter.enemies.map((enemy) => (
                  <div
                    key={enemy.id}
                    className="campaign-enemy-card"
                  >
                    <div className="campaign-enemy-avatar">
                      {enemy.name[0]}
                    </div>
                    <div className="campaign-enemy-text">
                      <div className="campaign-enemy-name">
                        {enemy.name}
                      </div>
                      <div className="campaign-enemy-meta">
                        Power {enemy.power}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <section className="campaign-team-section">
            <div className="campaign-team-header">
              <div>
                <div className="campaign-team-title">
                  Team #1
                </div>
                <div className="campaign-team-power">
                  Power {activeChapter.recommendedPower}
                </div>
              </div>
              <button className="campaign-edit-btn">
                Edit team
              </button>
            </div>
            <div className="campaign-team-slots">
              <div className="campaign-team-slot campaign-team-slot--filled">
                1
              </div>
              <div className="campaign-team-slot campaign-team-slot--empty">
                +
              </div>
              <div className="campaign-team-slot campaign-team-slot--empty">
                +
              </div>
            </div>
          </section>

          <div className="campaign-bottom-bar">
            <div className="campaign-resource-info">
              <span>Gold: {gold}</span>
              <span>Shards: {shards}</span>
              <span>Stamina cost: {activeChapter.staminaCost}</span>
            </div>
            <div className="campaign-start-buttons">
              <button
                className="campaign-btn campaign-btn--primary"
                onClick={handleStartFight}
              >
                Start fight
              </button>
              <button className="campaign-btn campaign-btn--secondary">
                Auto
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
