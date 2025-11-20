// src/components/play/CampaignScreen.jsx
import { useState } from "react";
import "./CampaignScreen.css";

/**
 * CampaignScreen
 *
 * Props:
 *  - gold, shards
 *  - onStartBattle({ chapterId, levelId, chapter, level })
 *  - onStartTutorial()
 *  - onSkipTutorial()   ★ NEW
 *  - progress: {
 *      [chapterId]: {
 *        maxUnlockedLevel: number,
 *        completedLevels: number[]
 *      }
 *    }
 */

// Helper: Darkwood levels (id 0 is tutorial)
function generateDarkwoodLevels() {
  const xs = [25, 42, 18, 40, 20, 40, 20, 40, 62, 62, 62, 62];
  const ys = [88, 80, 70, 60, 52, 42, 32, 22, 52, 70, 88, 30];

  return Array.from({ length: 12 }).map((_, idx) => ({
    id: idx,
    label: idx === 0 ? "T" : idx,
    x: xs[idx] ?? 30,
    y: ys[idx] ?? 70,
  }));
}

// Standard 1..11 levels
function generateStandardLevels() {
  const xs = [25, 42, 18, 40, 20, 40, 20, 40, 62, 62, 62];
  const ys = [88, 80, 70, 60, 52, 42, 32, 22, 52, 70, 88];

  return Array.from({ length: 11 }).map((_, idx) => ({
    id: idx + 1,
    label: idx + 1,
    x: xs[idx],
    y: ys[idx],
  }));
}

const BASE_CAMPAIGN_CHAPTERS = [
  {
    id: "darkwood",
    index: 1,
    name: "Darkwood",
    difficulty: "Easy",
    description:
      "The West of the Isles of the Sun, where cold rain gnaws at ancient pines. " +
      "Wolves, spirits and stranger beasts watch every intruder from the undergrowth.",
    recommendedPower: 71,
    staminaCost: 6,
    rewards: [
      "Complete the mission",
      "Win with no less than 25% of each monster's health",
      "Win with 2 monsters in team",
    ],
    enemies: [
      { id: "spirit1", name: "River Sprite", power: 24 },
      { id: "spirit2", name: "Moonling", power: 24 },
      { id: "boss", name: "Darkwood Warden", power: 23 },
    ],
    levels: generateDarkwoodLevels(),
  },
  {
    id: "embercliffs",
    index: 2,
    name: "Ember Cliffs",
    difficulty: "Normal",
    description:
      "Jagged volcanic ridges and rivers of slow, crawling lava. Only the bravest beasts climb these paths.",
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
    levels: generateStandardLevels(),
  },
  {
    id: "frozendepths",
    index: 3,
    name: "Frozen Depths",
    difficulty: "Hard",
    description:
      "Beneath the oldest glaciers, something ancient and hungry stirs. " +
      "The cold alone can kill a careless summoner.",
    recommendedPower: 260,
    staminaCost: 10,
    rewards: [
      "Complete the mission",
      "Win with only 3 cards in deck",
      "Win without using abilities",
    ],
    enemies: [
      { id: "wisp", name: "Ice Wisp", power: 70 },
      { id: "golem", name: "Frost Golem", power: 90 },
      { id: "tyrant", name: "Glacier Tyrant", power: 100 },
    ],
    levels: generateStandardLevels(),
  },
];

export default function CampaignScreen({
  gold,
  shards,
  onStartBattle,
  onStartTutorial,
  onSkipTutorial,       // ★ NEW
  progress = {},
}) {
  const [activeChapterId, setActiveChapterId] = useState(
    BASE_CAMPAIGN_CHAPTERS[0].id
  );

  const [selectedLevelId, setSelectedLevelId] = useState(
    BASE_CAMPAIGN_CHAPTERS[0].levels[0].id
  );

  // Apply saved progress
  const decorateChapterWithProgress = (chapter) => {
    const chapterProgress = progress[chapter.id] || {
      maxUnlockedLevel: 1,          // ★ Level 1 unlocked by default
      completedLevels: [],
    };

    const decoratedLevels = chapter.levels.map((level) => {
      const isTutorial = chapter.id === "darkwood" && level.id === 0;

      const unlocked = isTutorial
        ? true
        : level.id <= (chapterProgress.maxUnlockedLevel ?? 0);

      const completed =
        chapterProgress.completedLevels?.includes(level.id) ?? false;

      const isCurrent =
        unlocked &&
        level.id === (chapterProgress.maxUnlockedLevel ?? 0);

      return { ...level, unlocked, completed, current: isCurrent };
    });

    return { ...chapter, levels: decoratedLevels };
  };

  const rawActive =
    BASE_CAMPAIGN_CHAPTERS.find((c) => c.id === activeChapterId) ??
    BASE_CAMPAIGN_CHAPTERS[0];
  const activeChapter = decorateChapterWithProgress(rawActive);

  const selectedLevel =
    activeChapter.levels.find((l) => l.id === selectedLevelId && l.unlocked) ??
    activeChapter.levels.find((l) => l.unlocked) ??
    activeChapter.levels[0];

  // Handle selecting chapter
  const handleSelectChapter = (chapterId) => {
    const chapter = BASE_CAMPAIGN_CHAPTERS.find((c) => c.id === chapterId);
    if (!chapter) return;

    const decorated = decorateChapterWithProgress(chapter);
    const firstUnlocked =
      decorated.levels.find((l) => l.unlocked) ?? decorated.levels[0];

    setActiveChapterId(chapterId);
    setSelectedLevelId(firstUnlocked.id);
  };

  const handleSelectLevel = (level) => {
    if (!level.unlocked) return;
    setSelectedLevelId(level.id);
  };

  const handleStartFight = () => {
    const isTutorial =
      activeChapter.id === "darkwood" && selectedLevel.id === 0;

    if (isTutorial) {
      if (onStartTutorial) onStartTutorial();
      return;
    }

    if (onStartBattle) {
      onStartBattle({
        chapterId: activeChapter.id,
        levelId: selectedLevel.id,
        chapter: activeChapter,
        level: selectedLevel,
      });
    }
  };

  return (
    <div className="campaign-screen">
      {/* Top row */}
      <div className="campaign-header-row">
        <button className="campaign-back-btn">⟵ BACK</button>
        <div className="campaign-header-spacer" />
        <button className="campaign-home-btn">
          <span className="campaign-home-icon">⌂</span>
          <span>HOME</span>
        </button>
      </div>

      <div className="campaign-layout">
        {/* LEFT MAP AREA */}
        <div className="campaign-map-column">
          <div className="campaign-world-strip">
            {BASE_CAMPAIGN_CHAPTERS.map((chapter) => (
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
                <div className="campaign-world-icon">{chapter.index}</div>
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
                      <span className="campaign-node-label">{level.label}</span>
                    </div>
                    <div className="campaign-node-stars">
                      {[0, 1, 2].map((i) => (
                        <span key={i} className="campaign-node-star">
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Decorative paths */}
              <div className="campaign-path campaign-path--left" />
              <div className="campaign-path campaign-path--right" />
            </div>
          </div>
        </div>

        {/* RIGHT INFO PANEL */}
        <div className="campaign-info-column">
          <div className="campaign-chapter-header">
            <div className="campaign-chapter-tag">
              Chapter {activeChapter.index}
            </div>
            <h1 className="campaign-chapter-title">{activeChapter.name}</h1>
            <div className="campaign-difficulty">
              <span className="campaign-skull">💀</span>
              <span>{activeChapter.difficulty}</span>
              <span className="campaign-difficulty-label">CURRENT</span>
            </div>
          </div>

          <p className="campaign-description">{activeChapter.description}</p>

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
                  <div key={enemy.id} className="campaign-enemy-card">
                    <div className="campaign-enemy-avatar">
                      {enemy.name[0]}
                    </div>
                    <div className="campaign-enemy-text">
                      <div className="campaign-enemy-name">{enemy.name}</div>
                      <div className="campaign-enemy-meta">
                        Power {enemy.power}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Team preview */}
          <section className="campaign-team-section">
            <div className="campaign-team-header">
              <div>
                <div className="campaign-team-title">Team #1</div>
                <div className="campaign-team-power">
                  Power {activeChapter.recommendedPower}
                </div>
              </div>
              <button className="campaign-edit-btn">Edit team</button>
            </div>
            <div className="campaign-team-slots">
              <div className="campaign-team-slot campaign-team-slot--filled">
                1
              </div>
              <div className="campaign-team-slot campaign-team-slot--empty">+</div>
              <div className="campaign-team-slot campaign-team-slot--empty">+</div>
            </div>
          </section>

          {/* Bottom bar */}
          <div className="campaign-bottom-bar">
            <div className="campaign-resource-info">
              <span>Gold: {gold}</span>
              <span>Shards: {shards}</span>
              <span>Stamina cost: {activeChapter.staminaCost}</span>
            </div>

            <div className="campaign-start-buttons">

              {/* ★ SKIP TUTORIAL BUTTON — appears only on level 0 */}
              {selectedLevel?.id === 0 &&
                activeChapter.id === "darkwood" && (
                  <button
                    className="campaign-btn campaign-btn--secondary"
                    onClick={onSkipTutorial}
                  >
                    Skip Tutorial
                  </button>
                )}

              <button
                className="campaign-btn campaign-btn--primary"
                onClick={handleStartFight}
                disabled={!selectedLevel?.unlocked}
              >
                {selectedLevel?.id === 0 ? "Begin Tutorial" : "Start fight"}
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
