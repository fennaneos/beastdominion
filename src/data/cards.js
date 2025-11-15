// src/data/cards.js

export const RACES = ["all", "demon", "wolf"];
export const RARITIES = ["all", "common", "rare", "epic", "legendary"];
export const STARS = ["all", 1, 2, 3, 4, 5];

/**
 * Extra evolution fields:
 *  - level: base level of the card
 *  - maxLevel: max level for this card
 *  - unlockLevel: level at which ability text is available
 *  - imagesByLevel: art for each level (1-indexed)
 *  - baseAttack/baseHealth: stats at level 1
 *  - attackPerLevel/healthPerLevel: how much stats increase per level
 */

export const cards = [
  // ========= CHAINBORN WHELP (3-level evolution) =========
{
  id: "chainborn-lvl1",
  name: "Chainborn Whelp",
  race: "demon",
  rarity: "common",
  maxLevel: 3,
  level: 1,
  stars: 1,

  baseAttack: 2,
  baseHealth: 5,
  attackPerLevel: 1,
  healthPerLevel: 2,
  cost: 1,

  unlockLevel: 3,
  abilityName: "Spiteful Growth",
  text: "When this survives damage, it gains +1 Attack (max +3).",

  detail:
    "The lowest demons of the pit play with broken shackles like toys, dreaming of the day they fit real ones on mortals.",
  lore:
    "Forged in the back alleys of the underworld, Chainborn Whelps are used as living locks. Their chains remember every prison they have guarded.",
  bundle: ["Emerging Chains", "Dungeon Clatter"],

  imagesByLevel: [
    "src/assets/chainbornwhelp-lvl1.png",
    "src/assets/chainbornwhelp-lvl2.png",
    "src/assets/chainbornwhelp-lvl3.png"
  ],
  topImagesByLevel: [
    null,
    null,
    "src/assets/chainbornwhelp-lvl3-nobg.png" // no background
  ],

  image: "src/assets/chainbornwhelp-lvl1.png"
},



  // ========= OTHER CHAINBORN CARDS (keep as separate demons) =========
  {
    id: "chainborn-lvl2",
    name: "Chainborn Brute",
    race: "demon",
    rarity: "rare",
    stars: 2,
    cost: 3,
    attack: 4,
    health: 8,
    text: "If you control another Demon, this has +1/+1.",
    detail: "Grows stronger with every ally that drags a chain beside him.",
    lore: "Once a jailer of kings, the Brute now delights in turning his keys on anyone foolish enough to bargain with Hell.",
    bundle: ["Iron Discipline"],
    image: null, // placeholder until you have art
  },
  {
    id: "chainborn-lvl3",
    name: "Chainborn Enforcer",
    race: "demon",
    rarity: "rare",
    stars: 3,
    cost: 4,
    attack: 6,
    health: 9,
    text: "Enemies damaged by this lose 1 Attack until your next turn.",
    detail: "Every strike wraps a phantom shackle around the victim's arms.",
    lore: "The Enforcer remembers every oath ever broken in his presence. Each memory is another link in an endless chain.",
    bundle: ["Phantom Shackles"],
    image: null,
  },
  {
    id: "chainborn-lvl4",
    name: "Towering Jailor",
    race: "demon",
    rarity: "epic",
    stars: 4,
    cost: 5,
    attack: 7,
    health: 11,
    text: "Taunt. When played, stun a random enemy for 1 turn.",
    detail:
      "Whole armies have learned that you do not walk past the Jailor—you walk away.",
    lore: "Stories say his first prisoner was himself. Every new captive makes his chains a little looser.",
    bundle: ["Unyielding Watch"],
    image: null,
  },
  {
    id: "chainborn-lvl5",
    name: "Chainsunder Overlord",
    race: "demon",
    rarity: "legendary",
    stars: 5,
    cost: 7,
    attack: 10,
    health: 14,
    text: "When this attacks, destroy all enemy units with 3 or less Health.",
    detail:
      "He doesn't break chains. He breaks whatever the chains were meant to protect.",
    lore: "Once the master of a thousand prisons, the Overlord finally turned his keys on the heavens themselves.",
    bundle: ["Cataclysmic Break"],
    image: null,
  },

  // ========= NIGHTPROWLER (wolves) – unchanged =========
  {
    id: "nightprowler-lvl1",
    evoGroupId: "nightprowler",
    level: 1,
    maxLevel: 5,
    unlockLevel: 2,
    name: "Nightprowler Cub",
    race: "wolf",
    rarity: "common",
    stars: 1,
    cost: 1,
    attack: 1,
    health: 3,
    abilityName: "Solitary Instinct",
    text: "If this has no adjacent allies, it has +1 Attack.",
    detail: "Small, hungry, and convinced it doesn't need a pack.",
    lore: "Raised under a moonless sky, the cub never learned to howl—only to stalk.",
    bundle: ["Solitary Hunt"],
    image: null,
  },
  {
    id: "nightprowler-lvl2",
    evoGroupId: "nightprowler",
    level: 2,
    maxLevel: 5,
    unlockLevel: 2,
    name: "Nightprowler Scout",
    race: "wolf",
    rarity: "rare",
    stars: 2,
    cost: 2,
    attack: 3,
    health: 4,
    abilityName: "Solitary Instinct",
    text: "If this has no adjacent allies, it has +1 Attack and ignores the first damage it would take each turn.",
    detail: "Pads silently between the trees; enemies only hear the last step.",
    lore: "Scouts map the edges of the world by scent alone, bringing back stories of cities that sleep too soundly.",
    bundle: ["Shadowed Paths"],
    image: null,
  },
  {
    id: "nightprowler-lvl3",
    evoGroupId: "nightprowler",
    level: 3,
    maxLevel: 5,
    unlockLevel: 3,
    name: "Nightprowler Stalker",
    race: "wolf",
    rarity: "rare",
    stars: 3,
    cost: 3,
    attack: 4,
    health: 5,
    abilityName: "Ambush Hunt",
    text: "Ambush: The first time this attacks, it strikes before its target.",
    detail: "By the time you see its eyes, your fate is already decided.",
    lore: "Hunters claim every forest has a Stalker. No hunter claims to have met the same one twice.",
    bundle: ["Moonlit Strike"],
    image: null,
  },
  {
    id: "nightprowler-lvl4",
    evoGroupId: "nightprowler",
    level: 4,
    maxLevel: 5,
    unlockLevel: 4,
    name: "Nightprowler Alpha",
    race: "wolf",
    rarity: "epic",
    stars: 4,
    cost: 4,
    attack: 5,
    health: 7,
    abilityName: "Pack Howl",
    text: "Other Wolves you control have +1 Attack.",
    detail: "One growl from the Alpha can silence an entire battlefield.",
    lore: "Alphas do not rule with teeth, but with the promise of what their teeth could do.",
    bundle: ["Pack Howl"],
    image: null,
  },
  {
    id: "nightprowler-lvl5",
    evoGroupId: "nightprowler",
    level: 5,
    maxLevel: 5,
    unlockLevel: 5,
    name: "Nightprowler Apex",
    race: "wolf",
    rarity: "legendary",
    stars: 5,
    cost: 6,
    attack: 7,
    health: 9,
    abilityName: "Lunar Ascendance",
    text: "At Night, double this card's Attack.",
    detail: "Where its shadow passes, even the moon hides behind clouds.",
    lore: "The Apex does not chase the moon. It hunts alongside it.",
    bundle: ["Lunar Ascendance"],
    image: null,
  },
];
