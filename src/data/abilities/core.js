// ============================================================================
// CORE.JS — EFFECT TEMPLATES AND HELPERS (FINAL VERSION)
// Beast Dominion v4 Ability Engine
// ============================================================================

/**
 * Generic Buff Templates
 * ---------------------------------------------------------
 * The runtime expects:
 *   { type: "tempBuff" | "permBuff", stat, amount, target?, unit?, duration }
 */

// TEMPORARY BUFF (lasts 1 full turn unless specified)
export const StatBuff = {
  temporary: (unit, stat, amount, duration = 1) => ({
    type: "tempBuff",
    target: unit,
    stat,
    amount,
    duration,
    message: `${unit.name} gains +${amount} ${stat} temporarily!`
  }),

  permanent: (unit, stat, amount) => ({
    type: "permBuff",
    target: unit,
    stat,
    amount,
    message: `${unit.name} permanently gains +${amount} ${stat}!`
  }),

    temporary: (unit, stat, amount, duration = 1) => ({
    type: "statBuff",
    target: unit,
    stat,
    amount,
    duration
  }),
  
  permanent: (unit, stat, amount) => ({
    type: "statBuff",
    target: unit,
    stat,
    amount,
    permanent: true
  })
};

/**
 * Healing Templates
 */
export const Heal = {
  single: (unit, amount) => ({
    type: "heal",
    target: unit,
    amount,
    message: `${unit.name} restores ${amount} Health!`
  }),

  aoe: (units, amount) => ({
    type: "aoeHeal",
    targets: units,
    amount,
    message: `All allies restore ${amount} Health!`
  })
};

/**
 * Damage Templates
 */
export const Damage = {
  single: (unit, amount) => ({
    type: "damage",
    target: unit,
    amount,
    message: `${unit.name} takes ${amount} damage!`
  }),

  aoe: (units, amount) => ({
    type: "aoeDamage",
    targets: units,
    amount,
    message: `All enemies take ${amount} damage!`
  })
};

/**
 * Summoning
 */
export const Summon = {
  token: (tokenName, atk, hp, count = 1) => ({
    type: "summon",
    count,
    token: { name: tokenName, attack: atk, health: hp },
    message: `Summon ${count} × ${tokenName} (${atk}/${hp})`
  })
};

/**
 * Cinematic Templates
 * These are consumed by runtime.js → applyCinematic()
 */
export const Cinematic = {
  text: (message, color = "white", size = "medium") => ({
    type: "cinematic",
    effect: "text",
    message,
    color,
    size
  }),

  particles: (color = "white", count = 10) => ({
    type: "cinematic",
    effect: "particles",
    particleType: color,
    count
  }),

  flash: (color = "white", duration = 300) => ({
    type: "cinematic",
    effect: "flash",
    color,
    duration
  }),

    // New buff animation effect
  buffAnimation: (fromUnit, toUnits, stat = "attack", color = "yellow") => ({
    type: "buffAnimation",
    fromUnit,
    toUnits,
    stat,
    color
  }),
  
  damage: (target, amount, message = null) => ({
    type: "damage",
    target,
    amount,
    message: message || `${target.name} takes ${amount} damage`
  })
  
};

/**
 * Ability Utility Functions
 * These are SAFE and guaranteed to exist in your engine
 */
export const AbilityUtils = {
  isWounded: unit => unit.hp < unit.maxHp,

  isNight: state => state.isNight === true,

  getAdjacentAllies(unit, gameState) {
    return gameState
      .getAdjacentUnits(unit)
      .filter(u => u.owner === unit.owner);
  },

  getAlliesByRace(unit, race, gameState) {
    return gameState
      .getAllUnitsForPlayer(unit.owner)
      .filter(u => u.race === race && u.id !== unit.id);
  },

  getWoundedEnemies(gameState, owner) {
    return gameState
      .getAllUnits()
      .filter(u => u.owner !== owner && u.hp < u.maxHp);
  }
};


