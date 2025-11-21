// ============================================================================
// WOLF.JS — RACE ABILITIES
// ============================================================================

import { StatBuff, Cinematic } from "../core";
import { TRIGGERS } from "../triggers";

export default {
  "Night Prowler": {
    trigger: TRIGGERS.ON_NIGHT_START,
    condition: (unit, gameState) => {
      // This ability triggers for all wolves at the start of the night
      return true;
    },
    effect: (unit, gameState) => {
      // Apply a temporary attack buff for the duration of the night
      const buffEffect = StatBuff.temporary(unit, "attack", 1, 999); // 999 duration for the whole night

      // Add a cinematic effect
      const cinematicEffect = Cinematic.buffAnimation(
        unit,
        [unit],
        "attack",
        "purple"
      );

      return [buffEffect, cinematicEffect];
    },
  },
  "Lone Wolf": {
    trigger: TRIGGERS.ON_TURN_START,
    condition: (unit, gameState) => {
      // Check if there are no adjacent allies
      const adjacentAllies = gameState.getAdjacentAllies(unit);
      return adjacentAllies.length === 0;
    },
    effect: (unit, gameState) => {
      // Apply a temporary attack buff for the turn
      const buffEffect = StatBuff.temporary(unit, "attack", 1);

      // Add a cinematic effect
      const cinematicEffect = Cinematic.buffAnimation(
        unit,
        [unit],
        "attack",
        "white"
      );

      return [buffEffect, cinematicEffect];
    },
  },
};
