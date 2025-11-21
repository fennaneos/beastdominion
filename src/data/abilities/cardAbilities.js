// ============================================================================
// CARDABILITIES.JS — CARD-SPECIFIC ABILITIES (FINAL VERSION)
// ============================================================================

import { TRIGGERS } from "./triggers.js";
import { StatBuff, Cinematic, AbilityUtils } from "./core.js";

export const cardAbilities = {
  // ========================================================================
  // DOG — EMBERTRAIL HOUND — Aura buff
  // ========================================================================
  embertrail_aura: {
    trigger: TRIGGERS.ON_TURN_START,
    condition: unit => unit.id.includes("embertrailhound"),
    effect: (unit, gameState) => {
      const adjacent = gameState.getAdjacentUnits(unit)
        .filter(u => u.owner === unit.owner);
    Consolelog("Embertrail Hound adjacent allies:", adjacent); // Debug log

      const fx = adjacent.map(ally =>
        StatBuff.temporary(ally, "attack", 1)
      );

      if (adjacent.length > 0) {
        fx.push(
          Cinematic.text(`${unit.name} — EMBERTRAIL AURA!`, "orange"),
          Cinematic.particles("orange", 15)
        );
      }

      return fx;
    }
  },

  // ========================================================================
  // DOG — BRIGHTFANG — On summon buff
  // ========================================================================
  brightfang_summon: {
    trigger: TRIGGERS.ON_SUMMON,
    condition: u => u.id.includes("brightfang"),
    effect: unit => [
      StatBuff.temporary(unit, "attack", 1),
      Cinematic.text(`${unit.name} — BRIGHT FANG!`, "yellow"),
      Cinematic.particles("yellow", 10)
    ]
  },

  // ========================================================================
  // DOG — IRONJAW — Armor on first attack
  // ========================================================================
  ironjaw_armor: {
    trigger: TRIGGERS.ON_FIRST_ATTACK,
    condition: u => u.id.includes("ironjaw"),
    effect: unit => [
      StatBuff.temporary(unit, "armor", 1),
      Cinematic.text(`${unit.name} — IRON JAW!`, "silver"),
      Cinematic.particles("silver", 12)
    ]
  },

  // ========================================================================
  // DOG — FLAREPAW — Permanent attack when surviving damage
  // ========================================================================
  flarepaw_survival: {
    trigger: TRIGGERS.ON_AFTER_DAMAGE,
    condition: u => u.id.includes("flarepaw"),
    effect: unit => {
      if (unit.hp > 0) {
        return [
          StatBuff.permanent(unit, "attack", 1),
          Cinematic.text(`${unit.name} — SURVIVAL INSTINCT!`, "red"),
          Cinematic.particles("red", 15)
        ];
      }
      return [];
    }
  },

  // ========================================================================
  // DOG — SOLARBITE — AOE wolf-like team buff
  // ========================================================================
  solarbite_pack: {
    trigger: TRIGGERS.ON_ATTACK,
    condition: u => u.id.includes("solarbite"),
    effect: (unit, gameState) => {
      const allies = gameState.getAllUnitsForPlayer(unit.owner);

      const fx = [];

      allies.forEach(ally => {
        if (ally.id !== unit.id) {
          fx.push(StatBuff.temporary(ally, "attack", 1));
          fx.push(StatBuff.temporary(ally, "health", 1));
        }
      });

      fx.push(
        Cinematic.text(`${unit.name} — SOLAR PACK!`, "gold"),
        Cinematic.particles("gold", 20)
      );

      return fx;
    }
  },

  // ========================================================================
  // WOLF — NIGHTPROWLER — Lone predator at turn start
  // ========================================================================
  nightprowler_lone: {
    trigger: TRIGGERS.ON_TURN_START,
    condition: u => u.id.includes("nightprowler"),
    effect: (unit, gameState) => {
      const adjacent = gameState.getAdjacentUnits(unit)
        .filter(u => u.owner === unit.owner);

      if (adjacent.length === 0) {
        return [
          StatBuff.temporary(unit, "attack", 1),
          Cinematic.text(`${unit.name} — LONE HUNTER!`, "darkblue"),
          Cinematic.particles("darkblue", 10)
        ];
      }
      return [];
    }
  },

  // ========================================================================
  // WOLF — SHADOWPELT — Bonus damage vs wounded
  // ========================================================================
  shadowpelt_wounded: {
    trigger: TRIGGERS.ON_ATTACK,
    condition: u => u.id.includes("shadowpelt"),
    effect: (unit, gameState, target) => {
      if (target && target.hp < target.maxHp) {
        return [
          StatBuff.temporary(unit, "attack", 1),
          Cinematic.text(`${unit.name} — WOUNDED PREDATOR!`, "purple"),
          Cinematic.particles("purple", 12)
        ];
      }
      return [];
    }
  },

  // ========================================================================
  // WOLF — ALPHAFANG — Buff adjacent wolves
  // ========================================================================
  alphafang_pack: {
    trigger: TRIGGERS.ON_TURN_START,
    condition: u => u.id.includes("alphafang"),
    effect: (unit, gameState) => {
      const adjacentWolves = gameState.getAdjacentUnits(unit)
        .filter(u => u.owner === unit.owner && u.race === "wolf");

      const fx = adjacentWolves.map(w =>
        StatBuff.temporary(w, "attack", 1)
      );

      if (adjacentWolves.length > 0) {
        fx.push(
          Cinematic.text(`${unit.name} — ALPHA PACK!`, "gray"),
          Cinematic.particles("gray", 15)
        );
      }

      return fx;
    }
  },

  // ========================================================================
  // WOLF — MOONWARDEN — Team-wide heal on summon
  // ========================================================================
  moonwarden_heal: {
    trigger: TRIGGERS.ON_SUMMON,
    condition: u => u.id.includes("moonwarden"),
    effect: (unit, gameState) => {
      const allies = gameState.getAllUnitsForPlayer(unit.owner);

      const fx = allies
        .filter(a => a.id !== unit.id)
        .map(a => ({
          type: "heal",
          target: a,
          amount: 1,
          message: `${unit.name} heals ${a.name}!`
        }));

      fx.push(
        Cinematic.text(`${unit.name} — MOON HEALING!`, "lightblue"),
        Cinematic.particles("lightblue", 25)
      );

      return fx;
    }
  },

  // ========================================================================
  // WOLF — SPIRITCLAW — AOE buff on attack
  // ========================================================================
  spiritclaw_howl: {
    trigger: TRIGGERS.ON_ATTACK,
    condition: u => u.id.includes("spiritclaw"),
    effect: (unit, gameState) => {
      const wolves = gameState.getAllUnitsForPlayer(unit.owner)
        .filter(u => u.race === "wolf");

      const fx = [];

      wolves.forEach(w => {
        fx.push(StatBuff.temporary(w, "attack", 1));
        fx.push(StatBuff.temporary(w, "health", 1));
      });

      fx.push(
        Cinematic.text(`${unit.name} — SPIRIT HOWL!`, "white"),
        Cinematic.particles("white", 25)
      );

      return fx;
    }
  },

  // ========================================================================
  // WOLF — DREADFANG — Permanent attack buffs on kill
  // ========================================================================
  dreadfang_hunt: {
    trigger: TRIGGERS.ON_KILL,
    condition: u => u.id.includes("dreadfang"),
    effect: (unit, gameState) => {
      const wolves = gameState.getAllUnitsForPlayer(unit.owner)
        .filter(u => u.race === "wolf");

      const fx = wolves.map(w =>
        StatBuff.permanent(w, "attack", 1)
      );

      fx.push(
        Cinematic.text(`${unit.name} — BLOODTHIRST!`, "red"),
        Cinematic.particles("red", 20)
      );

      return fx;
    }
  },

  // ========================================================================
  // LIONS — ROARERS, GUARDIANS, KINGS
  // ========================================================================
  sunecho_roar: {
    trigger: TRIGGERS.ON_ATTACK,
    condition: u => u.id.includes("sunecho"),
    effect: (unit, gameState) => {
      const allies = gameState.getAllUnitsForPlayer(unit.owner);

      const fx = allies.map(a =>
        StatBuff.temporary(a, "attack", 1)
      );

      fx.push(
        Cinematic.text(`${unit.name} — SUN ROAR!`, "orange"),
        Cinematic.particles("orange", 18)
      );

      return fx;
    }
  },

  sunback_protect: {
    trigger: TRIGGERS.ON_SUMMON,
    condition: u => u.id.includes("sunback"),
    effect: (unit, gameState) => {
      const adjacentAllies = gameState.getAdjacentUnits(unit)
        .filter(a => a.owner === unit.owner);

      const fx = adjacentAllies.map(a =>
        StatBuff.temporary(a, "health", 1)
      );

      if (fx.length > 0) {
        fx.push(
          Cinematic.text(`${unit.name} — PROTECTIVE ROAR!`, "brown"),
          Cinematic.particles("brown", 12)
        );
      }

      return fx;
    }
  },

  dunecrest_king: {
    trigger: TRIGGERS.ON_TURN_START,
    condition: u => u.id.includes("dunecrest"),
    effect: (unit, gameState) => {
      const lions = gameState.getAllUnitsForPlayer(unit.owner)
        .filter(u => u.race === "lion");

      const fx = [];

      lions.forEach(l => {
        fx.push(StatBuff.temporary(l, "attack", 1));
        fx.push(StatBuff.temporary(l, "health", 1));
      });

      fx.push(
        Cinematic.text(`${unit.name} — KING'S PRIDE!`, "gold"),
        Cinematic.particles("gold", 25)
      );

      return fx;
    }
  },

  // ========================================================================
  // SERPENTS — POISON, STEALTH, DISABLE, PETRIFY
  // ========================================================================
  poison_strike: {
    trigger: TRIGGERS.ON_ATTACK,
    condition: u => u.id.includes("venom") || u.id.includes("poison"),
    effect: (unit, gameState, target) => [
      {
        type: "poison",
        target,
        damage: 1,
        duration: 2,
        message: `${unit.name} poisons ${target.name}!`
      },
      Cinematic.text(`${unit.name} — POISON STRIKE!`, "green"),
      Cinematic.particles("green", 12)
    ]
  },

  shadow_viper_stealth: {
    trigger: TRIGGERS.ON_TURN_START,
    condition: u => u.id.includes("shadowviper"),
    effect: unit => [
      { type: "stealth", target: unit, message: `${unit.name} enters stealth.` },
      Cinematic.text(`${unit.name} — SHADOW VEIL!`, "darkgreen"),
      Cinematic.particles("darkgreen", 10)
    ]
  },

  constrictor_squeeze: {
    trigger: TRIGGERS.ON_AFTER_DAMAGE,
    condition: u => u.id.includes("constrictor"),
    effect: (unit, gameState, target) => {
      if (!target || target.hp <= 0) return [];

      return [
        {
          type: "disable",
          target,
          duration: 1,
          message: `${target.name} is constricted!`
        },
        Cinematic.text(`${unit.name} — CONSTRICT!`, "purple"),
        Cinematic.particles("purple", 15)
      ];
    }
  },

  basilisk_gaze: {
    trigger: TRIGGERS.ON_ATTACK,
    condition: u => u.id.includes("basilisk"),
    effect: (unit, gameState, target) => {
      if (target && target.hp <= 5) {
        return [
          { type: "destroy", target, message: `${target.name} is petrified!` },
          Cinematic.text(`${unit.name} — PETRIFYING GAZE!`, "gray"),
          Cinematic.particles("gray", 20)
        ];
      }
      return [];
    }
  },

  // ========================================================================
  // CATS — DODGE, STEALTH ATTACK, NINE LIVES, THEFT
  // ========================================================================
  agile_dodge: {
    trigger: TRIGGERS.ON_BEFORE_DAMAGE,
    condition: u => u.id.includes("sandwhisker") || u.id.includes("agile"),
    effect: unit => {
      if (Math.random() < 0.25) {
        return [
          { type: "dodge", target: unit, message: `${unit.name} dodges!` },
          Cinematic.text(`${unit.name} — AGILE DODGE!`, "cyan"),
          Cinematic.particles("cyan", 15)
        ];
      }
      return [];
    }
  },

  nine_lives: {
    trigger: TRIGGERS.ON_DEATH,
    condition: u => u.id.includes("nine") || u.id.includes("lives"),
    effect: unit => {
      if (!unit.hasRevived) {
        return [
          { type: "revive", target: unit, health: unit.maxHp },
          Cinematic.text(`${unit.name} — NINE LIVES!`, "white"),
          Cinematic.particles("white", 25)
        ];
      }
      return [];
    }
  },

  stealth_attack: {
    trigger: TRIGGERS.ON_ATTACK,
    condition: u => u.id.includes("stealth") || u.id.includes("shadow"),
    effect: unit => {
      if (unit.isStealthed) {
        return [
          StatBuff.temporary(unit, "attack", 3),
          Cinematic.text(`${unit.name} — STEALTH ATTACK!`, "darkgray"),
          Cinematic.particles("darkgray", 15)
        ];
      }
      return [];
    }
  },

  cat_burglar: {
    trigger: TRIGGERS.ON_ATTACK,
    condition: u => u.id.includes("burglar") || u.id.includes("thief"),
    effect: () => [
      { type: "stealCard", count: 1, message: "Stole a card!" },
      Cinematic.text(`CAT BURGLAR!`, "black"),
      Cinematic.particles("black", 12)
    ]
  }
};
