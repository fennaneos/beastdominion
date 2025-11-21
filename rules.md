1. Folder Structure (Final Target Architecture)
src/
  App.jsx
  index.jsx
  main.css

  /battle
      BattlefieldScene.jsx
      BattlefieldCinematicFX.jsx
      BattlefieldParticles.js
      Battlefield.css

  /card
      MonsterCard.jsx
      CardFrame.jsx
      CardTooltip.jsx

  /data
      cards.js                                  <-- 20 to 500 cards
      /abilities
          runtime.js                             <-- ability executor
          triggers.js                            <-- onHit, onSummon, etc
          core.js                                <-- effect templates
          races/
             dog.js
             wolf.js
             lion.js
             serpent.js
             undead.js
             demon.js
             fae.js
             elemental.js
             cat.js
             beast.js

  /tutorial
      TutorialScreen.jsx
      TutorialData.js
      TutorialOverlay.jsx

  /utils
      computeCardStats.js
      getNightState.js                           <-- timezone-based night mode
      abilityExecutor.js
      deepclone.js

  /audio
      *.wav / *.mp3 placeholders


This structure separates:

View layer (components)

Data layer (cards + expansions)

Logic layer (battle + ability engine)

Effect layer (VFX, animations)

Tutorial (independent module)

Utility logic (time checks, stat computation, cloning)

2. Core Gameplay Rules (FINAL)
2.1 Game Objective

Destroy all opposing monsters.
You lose when:

Your field is empty

AND your hand is empty

Same for enemy.

2.2 Turn Flow

Each turn consists of:

Summon Phase

Player may drag cards from hand to field

Only empty slots

Up to 3 monsters on field

Attack Phase

Exactly one attack per turn

Click attacker → click target → press ATTACK

Combat is simultaneous damage

End Phase

Timer (60s) or manually “End Turn”

Enemy plays instantly

2.3 Combat

Attacker deals: attack

Defender deals: attack simultaneously

Monsters killed by HP ≤ 0 vanish with death animations

Slot becomes free

2.4 Enemy AI

Enemy always:

In setup: plays cards to fill field

In battle:

Chooses strongest attacker

Target = lowest HP enemy unit

AI is deterministic for now but can be upgraded to difficulty modes.

3. The Ability Engine (THE HEART OF THE GAME)

The ability system is completely modular, race-based, and triggered by events.

3.1 Ability Trigger Events

All abilities are based on triggers, defined in data/abilities/triggers.js:

onSummon(unit, state)

onAttack(attacker, defender, state)

onBeforeDamage(attacker, defender, state)

onAfterDamage(attacker, defender, state)

onDeath(unit, state)

onTurnStart(owner, state)

onTurnEnd(owner, state)

onNightStart(state)

onNightEnd(state)

3.2 Race Ability Files

Each race defines its behavior:

Example: /abilities/races/wolf.js

export default {
  race: "wolf",
  onSummon(unit, state) {
    // Lone wolf rule
    const allies = state.getAllies(unit);
    if (allies.length === 0) unit.attack += 1;
  },
  onTurnStart(unit, state) {
    if (state.isNight) unit.attack += 1;
  },
}


Each race module exports only the triggers it uses.

3.3 Ability Runtime

runtime.js collects:

all race files

all triggers

ability executor

BattlefieldScene calls:

import { AbilityRuntime } from "../../data/abilities/runtime.js";

AbilityRuntime.invoke("onSummon", unit, gameState);


This isolates game logic from UI.

3.4 How Ability Effects Display

BattlefieldScene triggers:

Cinematic pop-up texts like:

“WOLF — LONE PREDATOR +1 ATK”

“DOG — PACK ATTACK TRIGGERED!”

Special attack variations

Combo meter boost

Color-coded flashes

Extra VFX

4. Night Mode Logic

Night mode is based on local timezone.

Utility: /utils/getNightState.js

export default function getNightState() {
  const hour = new Date().getHours();
  return hour >= 20 || hour < 6;
}


BattlefieldScene loads this once per match.

Abilities can check:

if (state.isNight)

5. Cards System
5.1 Card Structure

Each card in cards.js:

{
  id: "bloodsnout",
  name: "Bloodsnout Hunter",
  race: "wolf",
  rarity: "common",
  stars: 2,
  level: 1,
  maxLevel: 3,
  baseAttack: 3,
  baseHealth: 5,
  attackPerLevel: 1,
  healthPerLevel: 2,
  cost: 2,
  text: "",
  abilityId: "wolf_lone_predator",     // ability link
  imagesByLevel: [...],
  image: ...
}

5.2 Card Power Ranking System

Before each card definition, add:

// POWER RANK: 42/500


Ranking uses attack + health + ability strength + rarity.

5.3 Card Distribution

For 500-card set:

Common: 60% (~300 cards)

Rare: 25% (~125 cards)

Epic: 10% (~50 cards)

Legendary: 5% (~25 cards)

Star distribution:

1★ common

2★ common rare

3★ rare

4★ epic

5★ legendary

Races have realistic behavior:

Dogs → pack

Wolves → lone + night

Snakes → betrayal strikes

Lions → courage when leading

Hyenas → opportunist damage

Demons → high risk high damage

Cats → evade or stealth

Elementals → conditional abilities

Undead → revive chance

6. Deck System

Deck = exactly 6 cards.

DeckBuilder must allow:

Filtering

Search

Leveling

Add/remove

Save to Firestore or localStorage

Test hand

BattlefieldScene loads:

initialPlayerDeck = loadDeck()

7. Combat Engine Integration

BattlefieldScene connects to ability engine:

Example flow:

Player summons → runtime.onSummon()

Player attacks → runtime.onAttack()

Damage passes → runtime.onBeforeDamage()

Apply damage

runtime.onAfterDamage()

Death → runtime.onDeath()

All effects stack and produce cinematic text.

8. Cinematic Effects (V4)

Includes:

Lightning attack

Shockwave

Particle swarms

Smoke trails

Color-coded race effects

Combo counter

Runes under field slots

Screen shake

Background distortion

Abilities modify animations:

“PACK ATTACK” → double-hit

“NIGHT FANGS” → blue glowing claws

“SERPENT STRIKE” → fast dash

“LION ROAR” → radial shockwave buff

9. Tutorial System

Tutorial must cover:

How to summon

How to select attacker

How to select target

How to end turn

How to understand effects

Simple scripted enemy behavior

Tutorial has:

Highlighted elements

Arrows

Overlay steps

Text box

10. Roadmap – FINAL STEPS TO FINISH PROJECT
Stage 1 — Reconstruct Missing Files

Recreate:

BattlefieldScene.jsx (full version)

Ability runtime

12-card test deck

MonsterCard

DeckBuilder

Tutorial

Using this README as the blueprint.

Stage 2 — Build Core Engine

Implement race abilities

Implement triggers

Implement AbilityRuntime

Integrate into battle engine

Stage 3 — Add Cinematic Engine

Integrate previous combo animation

Enhance with race-specific variations

Add cinematic text events

Add night-mode color filters

Stage 4 — Expand Card Database

Generate 500 cards

Respect rarity %, stars %, races

Add power ranking

Add abilityId links

Stage 5 — Balance Pass

Run simulations

Adjust ability multipliers

Adjust base stats

Stage 6 — UI Polish

Medieval buttons

Overlay parchment

Fullscreen

Battle arena spacing

Mobile layout adjustments

Stage 7 — Final Integration to Repo

Use GitHub UI manually or ZIP base64.

11. How Future Cards Will Be Generated

You have a deterministic card generator spec:

Choose race → behavior rules

Choose rarity → stat multiplier

Choose stars → maxLevel

Choose ability → from race file

Generate image placeholders

Add power ranking comment

Future additions:

Procedural name generator

Procedural ability variants

Procedural animations

12. How Rules Stay Synced with Effects

Every effect must satisfy these constraints:

1. All effects must be triggered by an event

(no passive background modifiers without triggers)

2. All ability code lives ONLY in race files

Battle engine never hardcodes behavior.

3. Every ability effect must have a cinematic message

Examples:

“DOG — PACK ATTACK: +1 DAMAGE”

“WOLF — NIGHTFANGS: +1 ATK”

“SERPENT — AMBUSH STRIKE: priority hit”

4. Race abilities must never produce unbounded power

All bonuses must be:

small

conditional

rare

non-stacking infinitely














------------------------
2. CORE GAME LOOP

Each match proceeds in 3 phases:

2.1 Setup Phase

Player receives 6 cards with deal animation

Enemy receives 6 cards

Player and enemy place 3 cards each onto the board

When both fields contain 3 units, the game auto-transitions to Battle Phase

2.2 Battle Phase

Each turn consists of:

Turn Start

Apply ON_TURN_START triggers

Reset selectable units

Refresh temporary effects if applicable

Begin 60-second timer

Player has full input control

Player Actions

Selectable actions:

Summon (if any cards left in hand)

Select attacker

Select target

Press ATTACK button

Resolve attack with full cinematic pipeline

Attack Resolution

Both units strike:

Attacker deals attack damage to defender

Defender deals counter-damage

Apply:

Dodge

Disable

Stealth

Poison

Permanent buffs

Temporary buffs

On-Hit triggers

On-Kill triggers

On-Damage triggers

Turn End

Apply ON_END_OF_TURN triggers

Decrement buff and poison durations

Process effects that expire

Switch turn to enemy AI

2.3 End Phase

Victory occurs when:

All 3 enemy slots are empty

Defeat occurs when:

All 3 player slots are empty

frontend/
  components/
    battle/
      BattlefieldAnime2D.jsx
      BattlefieldScene3D.jsx
      CardMesh.jsx
      MedievalGraveyard.jsx
    card/
      MonsterCard.jsx
      CardTooltip.jsx
  data/
    cards.js
    abilities/
      triggers.js
      core.js
      cardAbilities.js
      races/
        dog.js
        wolf.js
        lion.js
        serpent.js
        cat.js
  utils/
    runtime.js
    abilityExecutor.js
    getNightState.js
    enemyAI.js
  assets/
    backgrounds/
    sounds/
    cards/
