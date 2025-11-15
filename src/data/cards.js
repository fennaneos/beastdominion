// src/data/cards.js

export const RACES = [
  "all",
  "demon",
  "wolf",
  "dog",
  "lion",
  "serpent",
  "cat",
  "beast",
  "dragon",
  "elemental",
  "fae",
  "titan",
  "construct",
  "undead",
  "celestial",
  "insectoid",
  "goblin"
];

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
  // ========= CHAINBORN WHELP (1 → 3) =========
  {
    id: "chainborn",
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

    // Power unlocks at max level.
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
      "src/assets/chainbornwhelp-lvl3-nobg.png" // silhouette overflow on max level
    ],

    image: "src/assets/chainbornwhelp-lvl1.png"
  },

  // ========= NIGHTPROWLER (1 → 5 gothic lone wolf) =========
  {
    id: "nightprowler",
    name: "Nightprowler",
    race: "wolf",
    rarity: "rare",
    maxLevel: 5,
    level: 1,
    stars: 1,

    // Dark wolf that scales up as a solo hunter.
    baseAttack: 2,
    baseHealth: 3,
    attackPerLevel: 1,
    healthPerLevel: 2,
    cost: 2,

    // Power kicks in from level 3 upward.
    unlockLevel: 3,
    abilityName: "Lone Moonhunt",
    text: "If this has no adjacent allies, it has +2 Attack and ignores the first damage it would take each turn. At Night, double this card's Attack.",

    detail: "A gothic shadow with cold blue eyes that hates the warmth of company.",
    lore: "It prowls the dead hours between heartbeats, stronger the further it strays from any pack.",
    bundle: ["Solitary Hunt", "Lunar Ascendance"],

    // Your 5 generated wolf images:
    imagesByLevel: [
      "src/assets/nightprowler-lvl1.png",
      "src/assets/nightprowler-lvl2.png",
      "src/assets/nightprowler-lvl3.png",
      "src/assets/nightprowler-lvl4.png",
      "src/assets/nightprowler-lvl5.png"
    ],
    topImagesByLevel: [
      null,
      null,
      null,
      null,
      "src/assets/nightprowler-lvl5-nobg.png" // export a no-bg version if you like
    ],

    image: "src/assets/nightprowler-lvl1.png"
  },

  {
  id: "embertrail-hound",
  name: "Embertrail Hound",
  race: "dog",
  rarity: "rare",
  maxLevel: 3,
  level: 1,
  stars: 2,

  baseAttack: 2,
  baseHealth: 4,
  attackPerLevel: 1,
  healthPerLevel: 2,
  cost: 2,

  unlockLevel: 3,
  abilityName: "Pack Devotion",
  text: "If this has at least 1 adjacent ally, both it and that ally gain +1 Attack this turn. When this reaches max level, adjacent Dogs gain +1 Health permanently.",

  detail: "It never runs alone — it just runs back for whoever fell behind.",
  lore: "Desert caravans tie their hope to Embertrail collars. The hounds always find the way home, even through burning storms.",
  bundle: ["Faithful Pack", "Guiding Bark"],

  imagesByLevel: [
    "src/assets/embertrailhound-lvl1.png",
    "src/assets/embertrailhound-lvl2.png",
    "src/assets/embertrailhound-lvl3.png"
  ],
  topImagesByLevel: [
    null,
    null,
    "src/assets/embertrailhound-lvl3-nobg.png"
  ],

  image: "src/assets/embertrailhound-lvl1.png"
},
// ========= REDRIDGE HOUND (DOG – 2-level evolution) =========
{
  id: "redridge-hound",
  name: "Redridge Hound",
  race: "dog",
  rarity: "common",
  maxLevel: 2,
  level: 1,
  stars: 2,

  baseAttack: 2,
  baseHealth: 6,
  attackPerLevel: 1,
  healthPerLevel: 2,
  cost: 2,

  unlockLevel: 2,
  abilityName: "Loyal Guardian",
  text: "When this is alone on your board, it gains Taunt until it takes damage.",

  detail: "A desert-bred hound known for its unshakeable devotion.",
  lore: "Redridge Hounds train by racing sandstorms. Only the ones who return learn to guard caravans.",
  bundle: ["Loyal Guardian", "Sand Sentinel"],

  imagesByLevel: [
    "src/assets/redridgehound-lvl1.png", // the level 1 image you generated
    "src/assets/redridgehound-lvl2.png"  // the level 2 image you generated
  ],
  topImagesByLevel: [
    null,
    "src/assets/redridgehound-lvl2-nobg.png" 
  ],

  image: "src/assets/redridgehound-lvl1.png"
},
// ========= FLAREPAW VANGUARD (DOG – 5-level evolution, fire theme) =========
{
  id: "flarepaw-vanguard",
  name: "Flarepaw Vanguard",
  race: "dog",
  rarity: "epic",
  maxLevel: 5,
  level: 1,
  stars: 3,

  baseAttack: 3,
  baseHealth: 6,
  attackPerLevel: 1,
  healthPerLevel: 2,
  cost: 3,

  unlockLevel: 3,
  abilityName: "Kindled Resolve",
  text: "After this survives damage, it gains +1 temporary Attack this turn. At Level 5, adjacent allies take 1 less damage.",

  detail:
    "A desert guardian whose paws flicker with harmless ember trails when it runs.",
  lore:
    "Fire Dogs are not born—they are tempered. The Vanguard learned to shepherd caravans by melting the fangs of sand vipers with a single growl.",
  bundle: ["Desert Embercall", "Kindled Resolve"],

  imagesByLevel: [
    "src/assets/flarepaw-lvl1.png",  // gentle embers
    "src/assets/flarepaw-lvl2.png",  // small flame flares
    "src/assets/flarepaw-lvl3.png",  // brighter legs, glowing paws
    "src/assets/flarepaw-lvl4.png",  // crackling embers around stance
    "src/assets/flarepaw-lvl5.png"   // fully empowered fire dog
  ],

  topImagesByLevel: [
    null,
    null,
    null,
    null,
    "src/assets/flarepaw-lvl5-nobg.png" // silhouette for overflow (you can make a cutout later)
  ],

  image: "src/assets/flarepaw-lvl1.png"
},

// ========= IRONJAW ROTTWEILER (DOG – 2-level evolution) =========
{
  id: "ironjaw-rottweiler",
  name: "Ironjaw Rottweiler",
  race: "dog",
  rarity: "rare",
  maxLevel: 2,
  level: 1,
  stars: 2,

  baseAttack: 3,
  baseHealth: 7,
  attackPerLevel: 1,
  healthPerLevel: 2,
  cost: 2,

  unlockLevel: 2,
  abilityName: "Bulwark Bite",
  text: "The first time this attacks each battle, it gains +1 Armor this turn. At max level, its first attack also applies -1 Attack to the target until next turn.",

  detail:
    "A heavily built desert guardian bred to hold the line until reinforcements arrive.",
  lore:
    "Its jaws can snap bone, but its true strength is endurance. Ironjaws are trusted even by caravan captains who trust nothing else.",
  bundle: ["Bulwark Bite", "Sand Shield"],

  imagesByLevel: [
    "src/assets/ironjawrottweiler-lvl1.png", // calm, defensive
    "src/assets/ironjawrottweiler-lvl2.png"  // aggressive guardian stance
  ],

  topImagesByLevel: [
    null,
    null
  ],

  image: "src/assets/ironjawrottweiler-lvl1.png"
},



  // ========= SANDWHISKER (CAT – 1 → 3 malicious hunter) =========
  {
    id: "sandwhisker",
    name: "Sandwhisker Stalker",
    race: "cat",
    rarity: "rare",
    maxLevel: 3,
    level: 1,
    stars: 2,

    baseAttack: 3,
    baseHealth: 5,
    attackPerLevel: 2,
    healthPerLevel: 2,
    cost: 2,

    // Unlock at final level for big “Power Unlocked” moment.
    unlockLevel: 3,
    abilityName: "Predator’s Cruelty",
    text: "When this damages a wounded enemy, deal 1 extra damage to it. If this overkills a unit, gain +1 Attack this battle.",

    detail: "A silent shadow that toys with its prey before the kill.",
    lore: "Sandwhiskers learn to pin their own tail in the sand—just to practice the feeling of something struggling.",
    bundle: ["Silent Step", "Cruel Games"],

    imagesByLevel: [
      "src/assets/sandwhisker-lvl1.png",
      "src/assets/sandwhisker-lvl2.png",
      "src/assets/sandwhisker-lvl3.png"
    ],
    topImagesByLevel: [
      null,
      null,
      "src/assets/sandwhisker-lvl3-nobg.png"
    ],

    image: "src/assets/sandwhisker-lvl1.png"
  },

  // ========= EMERALD COIL (SERPENT – 1 → 3 treacherous poison) =========
  {
    id: "emerald-coil",
    name: "Emerald Coil",
    race: "serpent",
    rarity: "rare",
    maxLevel: 3,
    level: 1,
    stars: 2,

    baseAttack: 2,
    baseHealth: 5,
    attackPerLevel: 1,
    healthPerLevel: 2,
    cost: 2,

    unlockLevel: 3,
    abilityName: "Treacherous Venom",
    text: "When this attacks, it may instead deal 1 Poison damage to any unit. Poisoned units take 1 damage at end of each turn.",

    detail: "It waits beneath loose sand, striking at friend or foe if the odds look good.",
    lore: "Caravans fear it not for the bite, but for the way it slithers between sleeping guards and their captains.",
    bundle: ["Desert Venom", "Silent Betrayal"],

    imagesByLevel: [
      "src/assets/emeraldcoil-lvl1.png",
      "src/assets/emeraldcoil-lvl2.png",
      "src/assets/emeraldcoil-lvl3.png"
    ],
    topImagesByLevel: [
      null,
      null,
      "src/assets/emeraldcoil-lvl3-nobg.png"
    ],

    image: "src/assets/emeraldcoil-lvl1.png"
  },

  // ========= DUNECREST KING (LION – 1 → 3 pride dominance) =========
  {
    id: "dunecrest-king",
    name: "Dunecrest King",
    race: "lion",
    rarity: "legendary",
    maxLevel: 3,
    level: 1,
    stars: 3,

    baseAttack: 5,
    baseHealth: 10,
    attackPerLevel: 2,
    healthPerLevel: 3,
    cost: 5,

    unlockLevel: 3,
    abilityName: "Pride’s Dominion",
    text: "Other Lions you control have +1/+1. When this attacks, give all other Lions +1 Attack this turn.",

    detail: "The dunes shift around his paws, bowing like subjects.",
    lore: "Every pride in the desert claims descent from the Dunecrest King. None dare test the claim while he is watching.",
    bundle: ["Pride’s Roar", "Sunlit Charge"],

    imagesByLevel: [
      "src/assets/dunecrestking-lvl1.png",
      "src/assets/dunecrestking-lvl2.png",
      "src/assets/dunecrestking-lvl3.png"
    ],
    topImagesByLevel: [
      null,
      null,
      "src/assets/dunecrestking-lvl3.png"
    ],

    image: "src/assets/dunecrestking-lvl1.png"
  }
];
