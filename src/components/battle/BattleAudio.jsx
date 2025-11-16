// src/components/battle/BattleAudio.jsx
import React, { useState, useEffect } from "react";

// ============================================================================
// 3. AUDIO (simple background & sfx)
// ============================================================================
function BattleAudio({ phase, attackType }) {
  const [currentMusic, setCurrentMusic] = useState(null);

  const playMusic = (track) => {
    if (currentMusic === track) return;
    const audio = new Audio(`/music/${track}.mp3`);
    audio.volume = 0.3;
    audio.loop = true;
    audio.play().catch(() => {});
    setCurrentMusic(track);
  };

  const playAttackSound = (type) => {
    const soundMap = {
      bite: "/sfx/bite.mp3",
      firebreath: "/sfx/firebreath.mp3",
      pounce: "/sfx/pounce.mp3",
      slash: "/sfx/slash.mp3",
      magic: "/sfx/magic.mp3",
      heal: "/sfx/heal.mp3",
      levelup: "/sfx/levelup.mp3",
    };
    const soundFile = soundMap[type];
    if (soundFile) {
      const audio = new Audio(soundFile);
      audio.volume = 0.7;
      audio.play().catch(() => {});
    }
  };

  useEffect(() => {
    if (phase === "playerTurn") playMusic("battle_tense");
    else if (phase === "enemyTurn") playMusic("battle_threatening");
    else if (phase === "victory") playMusic("victory_theme");
    else if (phase === "defeat") playMusic("defeat_theme");
  }, [phase]);

  useEffect(() => {
    if (attackType) playAttackSound(attackType);
  }, [attackType]);

  return null;
}


export default BattleAudio;