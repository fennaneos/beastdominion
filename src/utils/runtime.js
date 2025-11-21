// ============================================================================
// ABILITY RUNTIME.JS — Central hub for all ability processing
// ============================================================================

// Make sure to import the updated dogs.js file
import dogAbilities from "../data/abilities/races/dog.js";
import wolfAbilities from "../data/abilities/races/wolf.js";
import lionAbilities from "../data/abilities/races/lion.js";
import serpentAbilities from "../data/abilities/races/serpent.js";
import catAbilities from "../data/abilities/races/cat.js";
import { TRIGGERS } from "../data/abilities/triggers.js";

// Create a registry of all race abilities
const raceAbilities = {
  dog: dogAbilities,
  wolf: wolfAbilities,
  lion: lionAbilities,
  serpent: serpentAbilities,
  cat: catAbilities
};

// Create a map of trigger to abilities for faster lookup
const triggerToAbilities = {};

// Initialize the trigger map
Object.entries(raceAbilities).forEach(([race, raceData]) => {
  if (!raceData || !raceData.abilities) return;
  
  Object.entries(raceData.abilities).forEach(([abilityId, ability]) => {
    const trigger = ability.trigger;
    if (!triggerToAbilities[trigger]) {
      triggerToAbilities[trigger] = [];
    }
    triggerToAbilities[trigger].push({
      race,
      abilityId,
      ...ability
    });
  });
});

// In runtime.js, update the getAllUnitsForPlayer function
export function createAbilityRuntime(gameState) {
  return {
    // Process all abilities for a specific trigger
    invoke(trigger, unit, context = {}) {
      const abilities = triggerToAbilities[trigger] || [];
      const effects = [];
      
      // Add null check for unit
      if (!unit) {
        console.log(`Unit is null, skipping ${trigger}`); // Debug log
        return effects;
      }
      
      console.log(`Invoking trigger ${trigger} for unit ${unit.name} (race: ${unit.race})`); // Debug log
      
      abilities.forEach(ability => {
        // Check if this ability applies to this unit
        if (ability.condition && !ability.condition(unit, gameState, context)) {
          console.log(`Ability ${ability.abilityId} condition met`); // Debug log
          
          // Apply the ability effect
          const abilityEffects = ability.effect(unit, gameState, context);
          if (abilityEffects) {
            console.log(`Ability ${ability.abilityId} produced effects:`, abilityEffects); // Debug log
            effects.push(...abilityEffects);
          }
        } else {
          console.log(`Ability ${ability.abilityId} condition not met`); // Debug log
        }
      });
      
      return effects;
    },
    
    // Get all units for a player
    getAllUnitsForPlayer(owner) {
      // This is the key fix - we need to get the current field state
      const playerField = owner === 'player' ? gameState.playerField : gameState.enemyField;
      const allUnits = playerField.filter(u => u !== null);
      
      console.log(`Getting all units for ${owner}:`, allUnits); // Debug log
      return allUnits;
    },
    
    // Get adjacent units
    getAdjacentUnits(unit) {
      // This is the key fix - we need to get the current field state
      const field = unit.owner === 'player' ? gameState.playerField : gameState.enemyField;
      const index = field.findIndex(u => u?.id === unit.id);
      
      if (index === -1) return [];
      
      const adjacent = [];
      
      // Check left neighbor
      if (index > 0 && field[index - 1]) {
        adjacent.push(field[index - 1]);
      }
      
      // Check right neighbor
      if (index < field.length - 1 && field[index + 1]) {
        adjacent.push(field[index + 1]);
      }
      
      console.log(`Getting adjacent units for ${unit.name} at index ${index}:`, adjacent); // Debug log
      return adjacent;
    },
    
    // Start turn processing
    startTurnProcessing() {
      // Reset any temporary state if needed
    },
    
    // Get all abilities for a race
    getAbilitiesForRace(race) {
      return raceAbilities[race]?.abilities || {};
    }
  };
}