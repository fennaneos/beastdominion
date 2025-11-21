// ============================================================================
// CAT.JS — RACE ABILITIES
// ============================================================================

import { StatBuff, Cinematic } from "../core";
import { TRIGGERS } from "../triggers";

export default {
  "Stealthy Pounce": {
    trigger: TRIGGERS.ON_SUMMON,
    condition: (unit, gameState) => {
      // This ability triggers for all cats on summon
      return true;
    },
    effect: (unit, gameState) => {
      // Grant this unit stealth for one turn
      const stealthEffect = {
        type: "stealth",
        target: unit,
        duration: 1,
      };

      // Add a cinematic effect
      const cinematicEffect = Cinematic.flash("gray", 300);

      return [stealthEffect, cinematicEffect];
    },
  },
  "Nine Lives": {
    trigger: TRIGGERS.ON_DEATH,
    condition: (unit, gameState) => {
      // This ability triggers for all cats on death, one time only
      return !unit.hasRevived;
    },
    effect: (unit, gameState) => {
      // Revive this unit with 1 health
      const reviveEffect = {
        type: "revive",
        target: unit,
        health: 1,
      };

      // Add a cinematic effect
      const cinematicEffect = Cinematic.particles("white", 20);

      return [reviveEffect, cinematicEffect];
    },
  },
};
