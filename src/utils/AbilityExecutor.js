// ============================================================================
// ABILITYEXECUTOR.JS — Linking battlefield ↔ runtime abilities
// ============================================================================

import { createAbilityRuntime } from "./runtime.js";
import { TRIGGERS } from "../data/abilities/triggers.js";

export class AbilityExecutor {
  constructor(gameState) {
    this.gameState = gameState;
    this.runtime = createAbilityRuntime(gameState);
    this.cinematicEffects = [];
    this.isInitialized = false; // Add this flag
  }
  
  // Add a method to mark as initialized
  markAsInitialized() {
    this.isInitialized = true;
  }
  
  // Update onTurnStart to check initialization flag
  onTurnStart(unit) {
    // Don't process during initialization
    if (!this.isInitialized) return;
    
    const effects = this.runtime.invoke(TRIGGERS.ON_TURN_START, unit, {});
    this.processEffects(effects);
  }
  // Get cinematic effects for rendering
  getCinematicEffects() {
    return this.cinematicEffects;
  }

  // Clear cinematic effects
  clearCinematicEffects() {
    this.cinematicEffects = [];
  }

  // Add a cinematic effect
  addCinematicEffect(effect) {
    console.log("Adding cinematic effect:", effect); // Debug log
    this.cinematicEffects.push({
      id: Math.random().toString(36).substr(2, 9),
      ...effect
    });
  }

  // Process effects returned by abilities
  // Process effects returned by abilities
// Process effects returned by abilities
processEffects(effects) {
  console.log("Processing effects:", effects); // Debug log
  if (!effects || !Array.isArray(effects)) return;
  
  effects.forEach(effect => {
    if (!effect) return;
    
    switch (effect.type) {
      case "damage":
        // Apply damage effect
        if (effect.target && effect.amount) {
          // Apply damage to target
          if (effect.target.hp) {
            effect.target.hp -= effect.amount;
          }
        }
        break;
        
      case "statBuff":
        // Apply stat buff
        if (effect.target && effect.stat && effect.amount) {
          console.log(`Applying ${effect.amount} ${effect.stat} buff to ${effect.target.name}`); // Debug log
          
          if (!effect.target.tempBuffs) {
            effect.target.tempBuffs = [];
          }
          
          // Add the buff to the unit
          effect.target.tempBuffs.push({
            stat: effect.stat,
            amount: effect.amount,
            duration: effect.duration || 1
          });
          
          // Update display values immediately
          this.updateUnitDisplayStats(effect.target);
        }
        break;
        
      case "buffAnimation":
        // Add buff animation effect
        if (effect.fromUnit && effect.toUnits && effect.toUnits.length > 0) {
          console.log(`Adding buff animation from ${effect.fromUnit.name} to ${effect.toUnits.length} units`); // Debug log
          this.addCinematicEffect({
            type: 'buffAnimation',
            fromUnit: effect.fromUnit,
            toUnits: effect.toUnits,
            stat: effect.stat || "attack",
            color: effect.color || "yellow"
          });
        }
        break;
        
      case "cinematic":
        // Only add particle effects, skip all text messages
        if (effect.particleType || effect.particles) {
          console.log(`Adding particle effect: ${effect.particleType}, count: ${effect.particles}`); // Debug log
          this.addCinematicEffect({
            type: 'particles',
            particleType: effect.particleType || 'white',
            count: effect.particles || 10
          });
        }
        // Skip ALL text effects, regardless of their properties
        break;

      case "poison":
        if (effect.target) {
          if (!effect.target.poison) {
            effect.target.poison = [];
          }
          effect.target.poison.push({
            damage: effect.damage,
            duration: effect.duration,
          });
        }
        break;

      case "stealth":
        if (effect.target) {
          effect.target.isStealthed = true;
        }
        break;

      case "revive":
        if (effect.target) {
          effect.target.hp = effect.health;
          effect.target.hasRevived = true;
        }
        break;
        
      default:
        // Handle any other effect types
        // Skip text effects by checking if it has text/message property but no particleType/particles
        if ((effect.text || effect.message) && !(effect.particleType || effect.particles)) {
          console.log("Skipping text effect:", effect); // Debug log
          return; // Skip text-only effects
        }
        
        // Add particle effects
        if (effect.particleType || effect.particles) {
          this.addCinematicEffect({
            type: 'particles',
            particleType: effect.particleType || 'white',
            count: effect.particles || 10
          });
        }
        break;
    }
  });
}  
  // Update unit display stats based on buffs
// Update unit display stats based on buffs
updateUnitDisplayStats(unit) {
  if (!unit) return;
  
  // Calculate total attack buff
  const attackBuff = unit.tempBuffs && unit.tempBuffs
    .filter(b => b.stat === 'attack')
    .reduce((sum, b) => sum + b.amount, 0);
  
  // Calculate total health buff
  const healthBuff = unit.tempBuffs && unit.tempBuffs
    .filter(b => b.stat === 'health')
    .reduce((sum, b) => sum + b.amount, 0);
  
  // Calculate total armor buff
  const armorBuff = unit.tempBuffs && unit.tempBuffs
    .filter(b => b.stat === 'armor')
    .reduce((sum, b) => sum + b.amount, 0);
  
  // Update display values
  unit.displayAttack = unit.attack + attackBuff;
  unit.displayHealth = unit.hp + healthBuff;
  
  console.log(`Updated ${unit.name} display stats - Attack: ${unit.displayAttack} (base: ${unit.attack} + ${attackBuff}), Health: ${unit.displayHealth} (base: ${unit.hp} + ${healthBuff}), Armor: ${armorBuff}`); // Debug log
}

  // Turn Start
  onTurnStart(unit) {
    const effects = this.runtime.invoke(TRIGGERS.ON_TURN_START, unit, {});
    this.processEffects(effects);
  }

  // Summon
  onSummon(unit) {
    const effects = this.runtime.invoke(TRIGGERS.ON_SUMMON, unit, {});
    this.processEffects(effects);
  }

  // Attack
  onAttack(attacker, target) {
    const effects = this.runtime.invoke(TRIGGERS.ON_ATTACK, attacker, { target });
    this.processEffects(effects);
  }

  // First attack
  onFirstAttack(attacker) {
    const effects = this.runtime.invoke(TRIGGERS.ON_FIRST_ATTACK, attacker, {});
    this.processEffects(effects);
  }

  // Damage resolution
  onDamage(target, amount, attacker) {
    const beforeEffects = this.runtime.invoke(TRIGGERS.ON_BEFORE_DAMAGE, target, { attacker });
    this.processEffects(beforeEffects);
    
    // Apply damage in battlefield
    
    const afterEffects = this.runtime.invoke(TRIGGERS.ON_AFTER_DAMAGE, target, { attacker });
    this.processEffects(afterEffects);
  }

  // Death
  onDeath(unit) {
    const effects = this.runtime.invoke(TRIGGERS.ON_DEATH, unit, {});
    this.processEffects(effects);
  }

  // Kill trigger
  onKill(killer, victim) {
    const effects = this.runtime.invoke(TRIGGERS.ON_KILL, killer, { victim });
    this.processEffects(effects);
  }

  onAllyTakesDamage(damagedAlly, attacker) {
    const effects = this.runtime.invoke(TRIGGERS.ON_ALLY_TAKES_DAMAGE, damagedAlly, { attacker });
    this.processEffects(effects);
  }

  // Process turn start for a player
  processTurnStart(player) {
    // Find all units for this player
    const units = this.gameState.getAllUnitsForPlayer(player);
    // Trigger onTurnStart for each unit
    units.forEach(unit => {
      this.onTurnStart(unit);
    });
  }

  // Process summon for a unit
  processSummon(unit) {
    this.onSummon(unit);
    
    // Add cinematic effect for summon
    this.addCinematicEffect({
      type: 'text',
      text: `${unit.name} summoned!`,
      color: '#4CAF50'
    });
  }

  // Process before damage
  processBeforeDamage(attacker, defender) {
    const effects = this.runtime.invoke(TRIGGERS.ON_BEFORE_DAMAGE, defender, { attacker });
    this.processEffects(effects);
  }

  // Process after damage
  processAfterDamage(attacker, defender) {
    const effects = this.runtime.invoke(TRIGGERS.ON_AFTER_DAMAGE, defender, { attacker });
    this.processEffects(effects);
    
    // Check if defender died
    if (defender.hp <= 0) {
      this.onDeath(defender);
      this.onKill(attacker, defender);
      
      // Add cinematic effect for death
      this.addCinematicEffect({
        type: 'text',
        text: `${defender.name} defeated!`,
        color: '#F44336'
      });
    }
  }

  // Process turn end for a player
  processTurnEnd(player) {
    // Find all units for this player
    const units = this.gameState.getAllUnitsForPlayer(player);
    
    // Trigger turn end for each unit
    units.forEach(unit => {
      this.runtime.invoke(TRIGGERS.ON_TURN_END, unit, {});
    });
    
    // Decrement buff durations and remove expired buffs
    units.forEach(unit => {
      if (unit.tempBuffs) {
        unit.tempBuffs = unit.tempBuffs.filter(buff => {
          if (buff.duration !== undefined) {
            buff.duration--;
            return buff.duration > 0;
          }
          return true; // Permanent buffs stay
        });
        
        // Update display values after buff changes
        this.updateUnitDisplayStats(unit);
      }
    });
  }
}
