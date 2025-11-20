// ============================================================================
// TutorialController.js  (FINAL WORKING VERSION – MATCHES TutorialUtils.js)
// ============================================================================

// safe clone
const clone = (obj) => JSON.parse(JSON.stringify(obj || {}));

// ----------------------------------------------------------------------------
// Very small event bus
// ----------------------------------------------------------------------------
class MiniBus {
  constructor() { this.listeners = {}; }
  on(e, fn) {
    (this.listeners[e] ||= []).push(fn);
  }
  off(e, fn) {
    if (!this.listeners[e]) return;
    this.listeners[e] = this.listeners[e].filter((f) => f !== fn);
  }
  emit(e, data) {
    (this.listeners[e] || []).forEach((fn) => fn(data));
  }
}

// ----------------------------------------------------------------------------
// Tutorial steps
// ----------------------------------------------------------------------------
const TUTORIAL_STEPS = [
  { id: "intro_arena", text: "This is the Darkwood arena.", highlight: [] },
  { id: "explain_hand", text: "These are your beasts in hand.", highlight: ["hand_0"] },
  { id: "play_card_1", text: "Summon your first Sheep.", highlight: ["hand_0"] },
  { id: "play_card_2", text: "Summon another.", highlight: ["hand_0"] },
  { id: "play_card_3", text: "Summon another.", highlight: ["hand_0"] },

  { id: "enemy_waiting", text: "The enemy lurks...", highlight: [], autoContinue: true },
  { id: "battle_begins", text: "Battle begins!", highlight: [], autoContinue: true },

  { id: "choose_attacker", text: "Choose an attacker.", highlight: ["player_field_any"] },
  { id: "choose_target", text: "Choose an enemy.", highlight: ["enemy_field_any"] },

  { id: "attack_result", text: "Both take damage.", highlight: [], autoContinue: true },
  { id: "explain_death", text: "Creatures with 0 HP die.", highlight: [] },

  { id: "replace_creature", text: "Replace your fallen Sheep.", highlight: ["hand_0"] },

  { id: "loop_more_attacks", text: "Attack again.", highlight: ["player_field_any"] },

  { id: "final", text: "Tutorial complete!", highlight: [] },
];

// ============================================================================
// MAIN CONTROLLER
// ============================================================================
export class TutorialController {
  constructor() {
    this.bus = new MiniBus();
    this.currentStepIndex = 0;
  }

  // --------------------------------------------------------------
  on(e, fn) { this.bus.on(e, fn); }
  off(e, fn) { this.bus.off(e, fn); }
  emit(e, p) { this.bus.emit(e, p); }

  // --------------------------------------------------------------
  getCurrentStep() {
    return TUTORIAL_STEPS[this.currentStepIndex];
  }

  start(tutorialState, battleState) {
    this.emit("step", this.getCurrentStep());
    this.emit("battle", battleState);
  }

  // --------------------------------------------------------------
  nextStep(battle, tutorial) {
    this.currentStepIndex++;
    const step = this.getCurrentStep();

    if (!step) return true;

    this.emit("step", step);

    if (step.autoContinue) {
      setTimeout(() => {
        this.nextStep(battle, tutorial);
      }, 900);
    }

    return false;
  }

  // --------------------------------------------------------------
  // FIXED: bootstrapBattle now matches TutorialUtils.createTutorialDeck() keys
  // --------------------------------------------------------------
  bootstrapBattle(deck) {
    if (!deck || !Array.isArray(deck.playerHand) || !Array.isArray(deck.enemyField)) {
      console.error("❌ bootstrapBattle received invalid deck:", deck);
      return {
        hand: [],
        field: [null, null, null],
        enemy: [null, null, null],
      };
    }

    return {
      hand: clone(deck.playerHand),       // FIXED
      field: [null, null, null],
      enemy: clone(deck.enemyField),      // FIXED
    };
  }

  // --------------------------------------------------------------
  // CARD CLICK HANDLING
  // --------------------------------------------------------------
  handleCardClick(info, battle, tutorial) {
    const step = this.getCurrentStep();

    // --------------------------------------
    // PLAY CARD STEPS
    // --------------------------------------
    if (step.id.startsWith("play_card")) {
      if (info.owner !== "player" || info.zone !== "hand") return null;

      const hand = clone(battle.hand);
      const field = clone(battle.field);

      const idx = hand.findIndex((c) => c.id === info.unitId);
      if (idx === -1) return null;

      const slot = field.findIndex((s) => !s);
      if (slot === -1) return null;

      field[slot] = hand[idx];
      hand.splice(idx, 1);

      const newBattle = { ...battle, hand, field };

      this.emit("battle", newBattle);
      this.nextStep(newBattle, tutorial);

      return { battle: newBattle, tutorial };
    }

    // --------------------------------------
    // SELECT ATTACKER
    // --------------------------------------
    if (step.id === "choose_attacker" && info.owner === "player" && info.zone === "field") {
      tutorial.selectedAttacker = info.unitId;

      this.nextStep(battle, tutorial);
      return { battle, tutorial };
    }

    // --------------------------------------
    // SELECT TARGET
    // --------------------------------------
    if (step.id === "choose_target" && info.owner === "enemy" && info.zone === "field") {
      tutorial.selectedTarget = info.unitId;

      this.nextStep(battle, tutorial);
      return { battle, tutorial };
    }

    return null;
  }

  // --------------------------------------------------------------
  // ATTACK RESOLUTION
  // --------------------------------------------------------------
  executeAttack(battle, tutorial) {
    const atkId = tutorial.selectedAttacker;
    const tgtId = tutorial.selectedTarget;
    if (!atkId || !tgtId) return null;

    const field = clone(battle.field);
    const enemy = clone(battle.enemy);

    const a = field.findIndex((u) => u && u.id === atkId);
    const d = enemy.findIndex((u) => u && u.id === tgtId);
    if (a === -1 || d === -1) return null;

    const atk = field[a];
    const def = enemy[d];

    // FIXED: uses hp/atk from TutorialUtils.js
    const newAtkHP = Math.max(0, atk.hp - def.atk);
    const newDefHP = Math.max(0, def.hp - atk.atk);

    field[a] = { ...atk, hp: newAtkHP };
    enemy[d] = { ...def, hp: newDefHP };

    const newBattle = { ...battle, field, enemy };

    this.emit("battle", newBattle);
    this.nextStep(newBattle, tutorial);

    return { battle: newBattle, tutorial };
  }
}
