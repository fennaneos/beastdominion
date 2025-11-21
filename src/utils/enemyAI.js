// ============================================================================
// enemyAI.js — v2.0 Smart AI
// Plays like a basic real opponent
// ============================================================================

export class EnemyAI {
  constructor(gameState, abilityExecutor) {
    this.gameState = gameState;
    this.exec = abilityExecutor;
  }

  playTurn() {
    const enemyUnits = this.gameState.getUnits("enemy");
    const playerUnits = this.gameState.getUnits("player");

    // If no monsters on field → summon if possible
    if (enemyUnits.length < 3) {
      this.summonIfPossible();
      return;
    }

    // Otherwise perform best attack
    this.performBestAttack();
  }

  summonIfPossible() {
    const hand = this.gameState.enemyHand;
    if (hand.length === 0) return;

    const open = this.gameState.getOpenSlots("enemy");
    if (open.length === 0) return;

    const slot = open[0];

    const card = hand[0];
    this.gameState.summonToField("enemy", slot, card);

    this.exec.onSummon(card);
  }

  performBestAttack() {
    const enemyUnits = this.gameState.getUnits("enemy");
    const playerUnits = this.gameState.getUnits("player");

    if (!enemyUnits.length || !playerUnits.length) return;

    // Pick highest attack enemy unit
    const attacker = [...enemyUnits].sort((a, b) => b.attack - a.attack)[0];

    // Pick lowest HP player unit
    const target = [...playerUnits].sort((a, b) => a.hp - b.hp)[0];

    this.exec.onAttack(attacker, target);

    this.gameState.resolveCombat(attacker, target);
  }
}
