// ============================================================================
// LION.JS — RACE ABILITIES
// ============================================================================

import { StatBuff, Cinematic } from "../core";
import { TRIGGERS } from "../triggers";

export default {
  "King of the Pride": {
    trigger: TRIGGERS.ON_SUMMON,
    condition: (unit, gameState) => {
      // This ability triggers for all lions on summon
      return true;
    },
    effect: (unit, gameState) => {
      // Apply a temporary health buff to all allied lions
      const alliedLions = gameState.getAlliesByRace(unit, "lion");
      const buffEffects = alliedLions.map((lion) =>
        StatBuff.temporary(lion, "health", 1)
      );

      // Add a cinematic effect
      const cinematicEffect = Cinematic.buffAnimation(
        unit,
        alliedLions,
        "health",
        "goldenrod"
      );

      return [...buffEffects, cinematicEffect];
    },
  },
  "Courageous Roar": {
    trigger: TRIGGERS.ON_ATTACK,
    condition: (unit, gameState) => {
      // This ability triggers for all lions on attack
      return true;
    },
    effect: (unit, gameState) => {
      // Apply a temporary attack buff to all allied lions
      const alliedLions = gameState.getAlliesByRace(unit, "lion");
      const buffEffects = alliedLions.map((lion) =>
        StatBuff.temporary(lion, "attack", 1)
      );

      // Add a cinematic effect
      const cinematicEffect = Cinematic.buffAnimation(
        unit,
        alliedLions,
        "attack",
        "orange"
      );

      return [...buffEffects, cinematicEffect];
    },
  },
};
