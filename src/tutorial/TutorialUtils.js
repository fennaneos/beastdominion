// src/tutorial/TutorialUtils.js
// Helper functions for tutorial battle state, damage resolution, and FX helpers.

export function initialTutorialState() {
  return {
    attackerSlot: null,
    targetSlot: null,
    attackExecuted: false,
  };
}

export function createTutorialDeck() {
  const mkCard = (id, name, atk, hp, description) => ({
    id,
    name,
    atk,
    hp,
    description,
  });

  const playerHand = [
    mkCard(
      "p1",
      "Woolen Initiate",
      1,
      3,
      "A timid sheep taking its first step into the arena."
    ),
    mkCard(
      "p2",
      "Meadow Guardian",
      2,
      4,
      "Protects the flock with steadfast horns and soft eyes."
    ),
    mkCard(
      "p3",
      "Thunder Ram",
      3,
      2,
      "Strikes fast, leaving sparks in the night air."
    ),
    mkCard(
      "p4",
      "Duskflock Watcher",
      2,
      3,
      "Guards the boundary between sunset and nightmare."
    ),
    mkCard(
      "p5",
      "Stormhoof Elder",
      3,
      3,
      "An old ram whose hooves still crackle with stormlight."
    ),
    mkCard(
      "p6",
      "Shepherd’s Chosen",
      4,
      2,
      "Personally blessed by the Ancient Shepherd."
    ),
  ];

  const enemyField = [
    mkCard(
      "e1",
      "Dunecrest Jackal",
      1,
      3,
      "A sly desert prowler testing your resolve."
    ),
    mkCard(
      "e2",
      "Bramble Wolf",
      2,
      4,
      "Teeth like thorns, eyes like burning amber."
    ),
    mkCard(
      "e3",
      "Gravepine Stalker",
      3,
      3,
      "Slips between roots and gravestones like smoke."
    ),
  ];

  return {
    playerHand,
    enemyField,
  };
}

export function resolveDamage(attackerCard, defenderCard) {
  if (!attackerCard || !defenderCard) {
    return {
      attackerDead: false,
      defenderDead: false,
      attackerDamage: 0,
      defenderDamage: attackerCard ? attackerCard.atk ?? 1 : 0,
    };
  }

  const atkA = attackerCard.atk ?? 1;
  const atkD = defenderCard.atk ?? 1;
  const hpA = attackerCard.hp ?? 1;
  const hpD = defenderCard.hp ?? 1;

  const newHpA = hpA - atkD;
  const newHpD = hpD - atkA;

  attackerCard.hp = newHpA;
  defenderCard.hp = newHpD;

  return {
    attackerDead: newHpA <= 0,
    defenderDead: newHpD <= 0,
    attackerDamage: atkD,
    defenderDamage: atkA,
  };
}

export function cloneBattleState(battle) {
  return JSON.parse(JSON.stringify(battle));
}

// Very small event emitter used by the controller.
export function createEmitter() {
  const listeners = {};
  return {
    on(type, fn) {
      (listeners[type] = listeners[type] || []).push(fn);
    },
    off(type, fn) {
      if (!listeners[type]) return;
      listeners[type] = listeners[type].filter((l) => l !== fn);
    },
    emit(type, payload) {
      (listeners[type] || []).forEach((fn) => fn(payload));
    },
  };
}

// Simple fire emitter for background embers
export class MedievalFireEmitter {
  constructor() {
    this.instances = [];
    const positions = [
      [-6.5, 0.05, -6],
      [6.5, 0.05, -6],
      [-6.5, 0.05, 6],
      [6.5, 0.05, 6],
    ];
    positions.forEach((p) => {
      for (let i = 0; i < 12; i++) {
        this.instances.push({
          x: p[0] + (Math.random() - 0.5) * 0.8,
          y: p[1] + Math.random() * 0.4,
          z: p[2] + (Math.random() - 0.5) * 0.8,
          vy: 0.4 + Math.random() * 0.6,
          alpha: 0.5 + Math.random() * 0.5,
        });
      }
    });
  }

  update(dt) {
    this.instances.forEach((p) => {
      p.y += p.vy * dt;
      p.alpha -= dt * 0.5;
      if (p.alpha <= 0) {
        p.y = 0.05 + Math.random() * 0.3;
        p.alpha = 0.8 + Math.random() * 0.2;
      }
    });
  }
}
