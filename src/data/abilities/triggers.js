// ============================================================================
// TRIGGERS.JS — FULL DEFINITIVE TRIGGER SET (FINAL VERSION)
// ============================================================================

export const TRIGGERS = {
  ON_BATTLE_START: "onBattleStart",

  ON_SUMMON: "onSummon",
  ON_ENEMY_SUMMON: "onEnemySummon",

  ON_TURN_START: "onTurnStart",
  ON_TURN_END: "onTurnEnd",

  ON_ATTACK: "onAttack",
  ON_FIRST_ATTACK: "onFirstAttack",

  ON_BEFORE_DAMAGE: "onBeforeDamage",
  ON_AFTER_DAMAGE: "onAfterDamage",
  ON_ALLY_TAKES_DAMAGE: "onAllyTakesDamage",

  ON_KILL: "onKill",
  ON_DEATH: "onDeath",

  ON_ATTACK_WOUNDED: "onAttackWounded",

  ON_ADJACENT_ALLY: "onAdjacentAlly",
  ON_NO_ADJACENT_ALLY: "onNoAdjacentAlly",

  ON_NIGHT_START: "onNightStart",
  ON_NIGHT_END: "onNightEnd",

  ON_CARD_DRAW: "onCardDraw"
};

// ============================================================================
// PRIORITY ORDER — Higher number = earlier execution
// ============================================================================
export const TRIGGER_PRIORITY = {
  [TRIGGERS.ON_BATTLE_START]: 300,

  [TRIGGERS.ON_NIGHT_START]: 250,
  [TRIGGERS.ON_NIGHT_END]: 240,

  [TRIGGERS.ON_TURN_START]: 200,

  [TRIGGERS.ON_SUMMON]: 180,
  [TRIGGERS.ON_ENEMY_SUMMON]: 170,

  [TRIGGERS.ON_ATTACK]: 150,
  [TRIGGERS.ON_FIRST_ATTACK]: 140,
  [TRIGGERS.ON_ATTACK_WOUNDED]: 130,

  [TRIGGERS.ON_BEFORE_DAMAGE]: 120,
  [TRIGGERS.ON_AFTER_DAMAGE]: 110,
  [TRIGGERS.ON_ALLY_TAKES_DAMAGE]: 105,

  [TRIGGERS.ON_KILL]: 100,
  [TRIGGERS.ON_DEATH]: 90,

  [TRIGGERS.ON_CARD_DRAW]: 50,

  [TRIGGERS.ON_ADJACENT_ALLY]: 20,
  [TRIGGERS.ON_NO_ADJACENT_ALLY]: 20,

  [TRIGGERS.ON_TURN_END]: 10
};
