// ============================================================================
// SERPENT.JS — RACE ABILITIES
// ============================================================================

import { Damage, Cinematic } from "../core";
import { TRIGGERS } from "../triggers";

export default {
  "Poisonous Bite": {
    trigger: TRIGGERS.ON_ATTACK,
    condition: (unit, gameState) => {
      // This ability triggers for all serpents on attack
      return true;
    },
    effect: (unit, gameState, context) => {
      // Apply poison to the target
      const poisonEffect = {
        type: "poison",
        target: context.target,
        damage: 1,
        duration: 2,
      };

      // Add a cinematic effect
      const cinematicEffect = Cinematic.particles("green", 10);

      return [poisonEffect, cinematicEffect];
    },
  },
  "Ambush": {
    trigger: TRIGGERS.ON_SUMMON,
    condition: (unit, gameState) => {
      // This ability triggers for all serpents on summon
      return true;
    },
    effect: (unit, gameState) => {
      // Deal 1 damage to a random enemy
      const enemies = gameState.getEnemies(unit);
      const target = enemies[Math.floor(Math.random() * enemies.length)];
      const damageEffect = Damage.single(target, 1);

      // Add a cinematic effect
      const cinematicEffect = Cinematic.flash("purple", 300);

      return [damageEffect, cinematicEffect];
    },
  },
};
