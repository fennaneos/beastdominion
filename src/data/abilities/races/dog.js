// ============================================================================
// DOG.JS — RACE ABILITIES
//
// The abilities in this file are automatically wired up to units of the
// corresponding race.
//
// The runtime invokes these abilities based on trigger conditions.
// ============================================================================

import { StatBuff, Cinematic } from "../core";
import { TRIGGERS } from "../triggers";

export default {
  "Pack Hunter": {
    trigger: TRIGGERS.ON_SUMMON,
    condition: (unit, gameState) => {
      // Check if there are other allied dogs on the field
      const alliedDogs = gameState.getAlliesByRace(unit, "dog");
      return alliedDogs.length > 0;
    },
    effect: (unit, gameState) => {
      // Apply a temporary attack buff to the summoned dog
      const buffEffect = StatBuff.temporary(unit, "attack", 1);

      // Add a cinematic effect to visualize the buff
      const cinematicEffect = Cinematic.buffAnimation(
        unit,
        [unit],
        "attack",
        "yellow"
      );

      return [buffEffect, cinematicEffect];
    },
  },
  "Loyal Protector": {
    trigger: TRIGGERS.ON_ALLY_TAKES_DAMAGE,
    condition: (unit, gameState, context) => {
      // Check if the damaged ally is adjacent
      const adjacentAllies = gameState.getAdjacentAllies(unit);
      return adjacentAllies.includes(context.damagedAlly);
    },
    effect: (unit, gameState) => {
      // Grant this unit a temporary armor buff
      const buffEffect = StatBuff.temporary(unit, "armor", 1);

      // Add a cinematic effect
      const cinematicEffect = Cinematic.buffAnimation(
        unit,
        [unit],
        "armor",
        "blue"
      );

      return [buffEffect, cinematicEffect];
    },
  },
};
