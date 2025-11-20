// ============================================================================
// CARDS.JS — 100 CARD SET (PART 1 OF 2)
// Grouped by race / Balanced for new rarity & evolution rules
// Image Convention A
//
// COMMON maxLevel = 3
// RARE maxLevel = 3–4
// EPIC maxLevel = 3–5 (nobg at final level)
// LEGENDARY maxLevel = 4–5 (nobg at final level)
//
// PART 1 RACES:
// - Dogs        (10 cards)
// - Wolves      (10 cards)
// - Lions       (10 cards)
// - Serpents    (10 cards)
// - Cats        (10 cards)
// ============================================================================

export const RACES = [
  "all",
  "dog",
  "wolf",
  "lion",
  "serpent",
  "cat",
  "dragon",
  "goblin",
  "insectoid",
  "bear",
  "demon"
];

export const RARITIES = ["all", "common", "rare", "epic", "legendary"];
export const STARS = ["all", 1, 2, 3, 4, 5];

export const cards = [

/* ============================================================================
   DOGS — 10 CARDS
   ========================================================================== */

// 1 ────────────────────────────────────────────────────────────────
{
  id: "loyalpup",
  name: "Loyal Pup",
  race: "dog",
  rarity: "common",
  stars: 1,
  level: 1,
  maxLevel: 3,

  baseAttack: 1,
  baseHealth: 3,
  attackPerLevel: 1,
  healthPerLevel: 1,
  cost: 1,

  text: "",
  imagesByLevel: [
    "src/assets/loyalpup-lvl1.png",
    "src/assets/loyalpup-lvl2.png",
    "src/assets/loyalpup-lvl3.png"
  ],
  image: "src/assets/loyalpup-lvl1.png"
},

// 2 ────────────────────────────────────────────────────────────────
{
  id: "sandtracker",
  name: "Sand Tracker",
  race: "dog",
  rarity: "common",
  stars: 1,
  level: 1,
  maxLevel: 3,

  baseAttack: 2,
  baseHealth: 3,
  attackPerLevel: 1,
  healthPerLevel: 1,
  cost: 1,

  text: "",
  imagesByLevel: [
    "src/assets/sandtracker-lvl1.png",
    "src/assets/sandtracker-lvl2.png",
    "src/assets/sandtracker-lvl3.png"
  ],
  image: "src/assets/sandtracker-lvl1.png"
},

// 3 ────────────────────────────────────────────────────────────────
{
  id: "duneguard-dog",
  name: "Duneguard Dog",
  race: "dog",
  rarity: "common",
  stars: 2,
  level: 1,
  maxLevel: 3,

  baseAttack: 2,
  baseHealth: 4,
  attackPerLevel: 1,
  healthPerLevel: 2,
  cost: 2,

  text: "",
  imagesByLevel: [
    "src/assets/duneguarddog-lvl1.png",
    "src/assets/duneguarddog-lvl2.png",
    "src/assets/duneguarddog-lvl3.png"
  ],
  image: "src/assets/duneguarddog-lvl1.png"
},

// 4 ────────────────────────────────────────────────────────────────
{
  id: "ridgehowler",
  name: "Ridge Howler",
  race: "dog",
  rarity: "common",
  stars: 2,
  level: 1,
  maxLevel: 3,

  baseAttack: 3,
  baseHealth: 4,
  attackPerLevel: 1,
  healthPerLevel: 2,
  cost: 2,

  text: "",
  imagesByLevel: [
    "src/assets/ridgehowler-lvl1.png",
    "src/assets/ridgehowler-lvl2.png",
    "src/assets/ridgehowler-lvl3.png"
  ],
  image: "src/assets/ridgehowler-lvl1.png"
},

// 5 ────────────────────────────────────────────────────────────────
{
  id: "brightfang",
  name: "Brightfang",
  race: "dog",
  rarity: "rare",
  stars: 2,
  level: 1,
  maxLevel: 3,

  baseAttack: 3,
  baseHealth: 5,
  attackPerLevel: 1,
  healthPerLevel: 1,
  cost: 2,

  text: "When summoned, gain +1 Attack this turn.",
  imagesByLevel: [
    "src/assets/brightfang-lvl1.png",
    "src/assets/brightfang-lvl2.png",
    "src/assets/brightfang-lvl3.png"
  ],
  image: "src/assets/brightfang-lvl1.png"
},

// 6 ────────────────────────────────────────────────────────────────
{
  id: "embertrailhound",
  name: "Embertrail Hound",
  race: "dog",
  rarity: "rare",
  stars: 3,
  level: 1,
  maxLevel: 4,

  baseAttack: 2,
  baseHealth: 6,
  attackPerLevel: 1,
  healthPerLevel: 2,
  cost: 2,

  text: "Adjacent allies gain +1 Attack this turn.",
  imagesByLevel: [
    "src/assets/embertrailhound-lvl1.png",
    "src/assets/embertrailhound-lvl2.png",
    "src/assets/embertrailhound-lvl3.png",
    "src/assets/embertrailhound-lvl4.png"
  ],
  topImagesByLevel: [null, null, null, null],
  image: "src/assets/embertrailhound-lvl1.png"
},

// 7 ────────────────────────────────────────────────────────────────
{
  id: "redridgehound",
  name: "Redridge Hound",
  race: "dog",
  rarity: "common",
  stars: 2,
  level: 1,
  maxLevel: 3,

  baseAttack: 3,
  baseHealth: 5,
  attackPerLevel: 1,
  healthPerLevel: 1,
  cost: 2,

  text: "",
  imagesByLevel: [
    "src/assets/redridgehound-lvl1.png",
    "src/assets/redridgehound-lvl2.png",
    "src/assets/redridgehound-lvl3.png"
  ],
  image: "src/assets/redridgehound-lvl1.png"
},

// 8 ────────────────────────────────────────────────────────────────
{
  id: "ironjaw",
  name: "Ironjaw Rottweiler",
  race: "dog",
  rarity: "rare",
  stars: 3,
  level: 1,
  maxLevel: 4,

  baseAttack: 4,
  baseHealth: 7,
  attackPerLevel: 1,
  healthPerLevel: 2,
  cost: 3,

  text: "First time this attacks, it gains +1 Armor this turn.",
  imagesByLevel: [
    "src/assets/ironjaw-lvl1.png",
    "src/assets/ironjaw-lvl2.png",
    "src/assets/ironjaw-lvl3.png",
    "src/assets/ironjaw-lvl4.png"
  ],
  image: "src/assets/ironjaw-lvl1.png"
},

// 9 ────────────────────────────────────────────────────────────────
{
  id: "flarepaw",
  name: "Flarepaw Vanguard",
  race: "dog",
  rarity: "epic",
  stars: 4,
  level: 1,
  maxLevel: 5,

  baseAttack: 4,
  baseHealth: 7,
  attackPerLevel: 1,
  healthPerLevel: 2,
  cost: 3,

  text: "When this survives damage, gain +1 Attack.",
  imagesByLevel: [
    "src/assets/flarepaw-lvl1.png",
    "src/assets/flarepaw-lvl2.png",
    "src/assets/flarepaw-lvl3.png",
    "src/assets/flarepaw-lvl4.png",
    "src/assets/flarepaw-lvl5.png"
  ],
  topImagesByLevel: [
    null,
    null,
    null,
    null,
    "src/assets/flarepaw-lvl5-nobg.png"
  ],
  image: "src/assets/flarepaw-lvl1.png"
},

// 10 ────────────────────────────────────────────────────────────────
{
  id: "solarbite",
  name: "Solarbite Mastiff",
  race: "dog",
  rarity: "legendary",
  stars: 5,
  level: 1,
  maxLevel: 5,

  baseAttack: 5,
  baseHealth: 10,
  attackPerLevel: 2,
  healthPerLevel: 2,
  cost: 4,

  text: "Allies gain +1/+1 this turn when this attacks.",
  imagesByLevel: [
    "src/assets/solarbite-lvl1.png",
    "src/assets/solarbite-lvl2.png",
    "src/assets/solarbite-lvl3.png",
    "src/assets/solarbite-lvl4.png",
    "src/assets/solarbite-lvl5.png"
  ],
  topImagesByLevel: [
    null,
    null,
    null,
    null,
    "src/assets/solarbite-lvl5-nobg.png"
  ],
  image: "src/assets/solarbite-lvl1.png"
},


/* ============================================================================
   WOLVES — 10 CARDS  (includes Nightprowler)
   ========================================================================== */

// 11 ────────────────────────────────────────────────────────────────
{
  id: "snowcub",
  name: "Snowcub Scout",
  race: "wolf",
  rarity: "common",
  stars: 1,
  level: 1,
  maxLevel: 3,

  baseAttack: 1,
  baseHealth: 3,
  attackPerLevel: 1,
  healthPerLevel: 1,
  cost: 1,

  text: "",
  imagesByLevel: [
    "src/assets/snowcub-lvl1.png",
    "src/assets/snowcub-lvl2.png",
    "src/assets/snowcub-lvl3.png"
  ],
  image: "src/assets/snowcub-lvl1.png"
},

// 12 ────────────────────────────────────────────────────────────────
{
  id: "frosthowler",
  name: "Frost Howler",
  race: "wolf",
  rarity: "common",
  stars: 1,
  level: 1,
  maxLevel: 3,

  baseAttack: 2,
  baseHealth: 3,
  attackPerLevel: 1,
  healthPerLevel: 1,
  cost: 1,

  text: "",
  imagesByLevel: [
    "src/assets/frosthowler-lvl1.png",
    "src/assets/frosthowler-lvl2.png",
    "src/assets/frosthowler-lvl3.png"
  ],
  image: "src/assets/frosthowler-lvl1.png"
},

// 13 ────────────────────────────────────────────────────────────────
{
  id: "moonclaw",
  name: "Moonclaw Wolf",
  race: "wolf",
  rarity: "common",
  stars: 2,
  level: 1,
  maxLevel: 3,

  baseAttack: 3,
  baseHealth: 4,
  attackPerLevel: 1,
  healthPerLevel: 1,
  cost: 2,

  text: "",
  imagesByLevel: [
    "src/assets/moonclaw-lvl1.png",
    "src/assets/moonclaw-lvl2.png",
    "src/assets/moonclaw-lvl3.png"
  ],
  image: "src/assets/moonclaw-lvl1.png"
},

// 14 ────────────────────────────────────────────────────────────────
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
  imagesByLevel: [
    "src/assets/bloodsnout-lvl1.png",
    "src/assets/bloodsnout-lvl2.png",
    "src/assets/bloodsnout-lvl3.png"
  ],
  image: "src/assets/bloodsnout-lvl1.png"
},

// 15 — NIGHTPROWLER (Rebalanced Rare Wolf) ───────────────────────────
{
  id: "nightprowler",
  name: "Nightprowler",
  race: "wolf",
  rarity: "rare",
  stars: 3,
  level: 1,
  maxLevel: 4,

  baseAttack: 3,
  baseHealth: 4,
  attackPerLevel: 1,
  healthPerLevel: 2,
  cost: 2,

  text: "If this has no adjacent allies, it gains +1 Attack.",
  imagesByLevel: [
    "src/assets/nightprowler-lvl1.png",
    "src/assets/nightprowler-lvl2.png",
    "src/assets/nightprowler-lvl3.png",
    "src/assets/nightprowler-lvl4.png"
  ],
  image: "src/assets/nightprowler-lvl1.png"
},

// 16 ────────────────────────────────────────────────────────────────
{
  id: "shadowpelt",
  name: "Shadowpelt Stalker",
  race: "wolf",
  rarity: "rare",
  stars: 3,
  level: 1,
  maxLevel: 4,

  baseAttack: 3,
  baseHealth: 5,
  attackPerLevel: 1,
  healthPerLevel: 2,
  cost: 2,

  text: "When this attacks a wounded enemy, deal +1 damage.",
  imagesByLevel: [
    "src/assets/shadowpelt-lvl1.png",
    "src/assets/shadowpelt-lvl2.png",
    "src/assets/shadowpelt-lvl3.png",
    "src/assets/shadowpelt-lvl4.png"
  ],
  image: "src/assets/shadowpelt-lvl1.png"
},

// 17 ────────────────────────────────────────────────────────────────
{
  id: "alphafang",
  name: "Alphafang",
  race: "wolf",
  rarity: "epic",
  stars: 4,
  level: 1,
  maxLevel: 5,

  baseAttack: 4,
  baseHealth: 7,
  attackPerLevel: 1,
  healthPerLevel: 2,
  cost: 3,

  text: "Adjacent Wolves gain +1 Attack.",
  imagesByLevel: [
    "src/assets/alphafang-lvl1.png",
    "src/assets/alphafang-lvl2.png",
    "src/assets/alphafang-lvl3.png",
    "src/assets/alphafang-lvl4.png",
    "src/assets/alphafang-lvl5.png"
  ],
  topImagesByLevel: [
    null,
    null,
    null,
    null,
    "src/assets/alphafang-lvl5-nobg.png"
  ],
  image: "src/assets/alphafang-lvl1.png"
},

// 18 ────────────────────────────────────────────────────────────────
{
  id: "moonwarden",
  name: "Moonwarden Elder",
  race: "wolf",
  rarity: "epic",
  stars: 4,
  level: 1,
  maxLevel: 5,

  baseAttack: 4,
  baseHealth: 8,
  attackPerLevel: 2,
  healthPerLevel: 2,
  cost: 3,

  text: "When summoned, restore 1 Health to allies.",
  imagesByLevel: [
    "src/assets/moonwarden-lvl1.png",
    "src/assets/moonwarden-lvl2.png",
    "src/assets/moonwarden-lvl3.png",
    "src/assets/moonwarden-lvl4.png",
    "src/assets/moonwarden-lvl5.png"
  ],
  topImagesByLevel: [
    null,
    null,
    null,
    null,
    "src/assets/moonwarden-lvl5-nobg.png"
  ],
  image: "src/assets/moonwarden-lvl1.png"
},

// 19 ────────────────────────────────────────────────────────────────
{
  id: "spiritclaw",
  name: "Spiritclaw Alpha",
  race: "wolf",
  rarity: "legendary",
  stars: 5,
  level: 1,
  maxLevel: 5,

  baseAttack: 5,
  baseHealth: 10,
  attackPerLevel: 2,
  healthPerLevel: 2,
  cost: 4,

  text: "All Wolves gain +1/+1 when this attacks.",
  imagesByLevel: [
    "src/assets/spiritclaw-lvl1.png",
    "src/assets/spiritclaw-lvl2.png",
    "src/assets/spiritclaw-lvl3.png",
    "src/assets/spiritclaw-lvl4.png",
    "src/assets/spiritclaw-lvl5.png"
  ],
  topImagesByLevel: [
    null,
    null,
    null,
    null,
    "src/assets/spiritclaw-lvl5-nobg.png"
  ],
  image: "src/assets/spiritclaw-lvl1.png"
},

// 20 ────────────────────────────────────────────────────────────────
{
  id: "dreadfang",
  name: "Dreadfang Sovereign",
  race: "wolf",
  rarity: "legendary",
  stars: 5,
  level: 1,
  maxLevel: 5,

  baseAttack: 6,
  baseHealth: 10,
  attackPerLevel: 2,
  healthPerLevel: 3,
  cost: 4,

  text: "Your Wolves gain +1 Attack permanently after they defeat a unit.",
  imagesByLevel: [
    "src/assets/dreadfang-lvl1.png",
    "src/assets/dreadfang-lvl2.png",
    "src/assets/dreadfang-lvl3.png",
    "src/assets/dreadfang-lvl4.png",
    "src/assets/dreadfang-lvl5.png"
  ],
  topImagesByLevel: [
    null,
    null,
    null,
    null,
    "src/assets/dreadfang-lvl5-nobg.png"
  ],
  image: "src/assets/dreadfang-lvl1.png"
},


/* ============================================================================
   LIONS — 10 CARDS
   ========================================================================== */

// 21 ────────────────────────────────────────────────────────────────
{
  id: "cubrook",
  name: "Cubrook Lionet",
  race: "lion",
  rarity: "common",
  stars: 1,
  level: 1,
  maxLevel: 3,

  baseAttack: 1,
  baseHealth: 4,
  attackPerLevel: 1,
  healthPerLevel: 1,
  cost: 1,

  text: "",
  imagesByLevel: [
    "src/assets/cubrook-lvl1.png",
    "src/assets/cubrook-lvl2.png",
    "src/assets/cubrook-lvl3.png"
  ],
  image: "src/assets/cubrook-lvl1.png"
},

// 22 ────────────────────────────────────────────────────────────────
{
  id: "sandmane",
  name: "Sandmane Youth",
  race: "lion",
  rarity: "common",
  stars: 1,
  level: 1,
  maxLevel: 3,

  baseAttack: 2,
  baseHealth: 4,
  attackPerLevel: 1,
  healthPerLevel: 1,
  cost: 1,

  text: "",
  imagesByLevel: [
    "src/assets/sandmane-lvl1.png",
    "src/assets/sandmane-lvl2.png",
    "src/assets/sandmane-lvl3.png"
  ],
  image: "src/assets/sandmane-lvl1.png"
},

// 23 ────────────────────────────────────────────────────────────────
{
  id: "prideprowler",
  name: "Pride Prowler",
  race: "lion",
  rarity: "common",
  stars: 2,
  level: 1,
  maxLevel: 3,

  baseAttack: 3,
  baseHealth: 5,
  attackPerLevel: 1,
  healthPerLevel: 1,
  cost: 2,

  text: "",
  imagesByLevel: [
    "src/assets/prideprowler-lvl1.png",
    "src/assets/prideprowler-lvl2.png",
    "src/assets/prideprowler-lvl3.png"
  ],
  image: "src/assets/prideprowler-lvl1.png"
},

// 24 ────────────────────────────────────────────────────────────────
{
  id: "sunsentinelpup",
  name: "Sun Sentinel Cub",
  race: "lion",
  rarity: "common",
  stars: 2,
  level: 1,
  maxLevel: 3,

  baseAttack: 3,
  baseHealth: 6,
  attackPerLevel: 1,
  healthPerLevel: 2,
  cost: 2,

  text: "",
  imagesByLevel: [
    "src/assets/sunsentinel-lvl1.png",
    "src/assets/sunsentinel-lvl2.png",
    "src/assets/sunsentinel-lvl3.png"
  ],
  image: "src/assets/sunsentinel-lvl1.png"
},

// 25 ────────────────────────────────────────────────────────────────
{
  id: "sunecho",
  name: "Sunecho Roarer",
  race: "lion",
  rarity: "rare",
  stars: 3,
  level: 1,
  maxLevel: 4,

  baseAttack: 3,
  baseHealth: 6,
  attackPerLevel: 1,
  healthPerLevel: 2,
  cost: 2,

  text: "When this attacks, allies gain +1 Attack this turn.",
  imagesByLevel: [
    "src/assets/sunecho-lvl1.png",
    "src/assets/sunecho-lvl2.png",
    "src/assets/sunecho-lvl3.png",
    "src/assets/sunecho-lvl4.png"
  ],
  image: "src/assets/sunecho-lvl1.png"
},

// 26 ────────────────────────────────────────────────────────────────
{
  id: "dunecrest-king",
  name: "Dunecrest King",
  race: "lion",
  rarity: "legendary",
  stars: 5,
  level: 1,
  maxLevel: 5,

  baseAttack: 5,
  baseHealth: 10,
  attackPerLevel: 2,
  healthPerLevel: 3,
  cost: 5,

  text: "Your Lions gain +1/+1. When this attacks, they gain +1 Attack.",
  imagesByLevel: [
    "src/assets/dunecrestking-lvl1.png",
    "src/assets/dunecrestking-lvl2.png",
    "src/assets/dunecrestking-lvl3.png",
    "src/assets/dunecrestking-lvl4.png",
    "src/assets/dunecrestking-lvl5.png"
  ],
  topImagesByLevel: [
    null,
    null,
    null,
    null,
    "src/assets/dunecrestking-lvl5-nobg.png"
  ],
  image: "src/assets/dunecrestking-lvl1.png"
},

// 27 ────────────────────────────────────────────────────────────────
{
  id: "sunback",
  name: "Sunback Guardian",
  race: "lion",
  rarity: "rare",
  stars: 3,
  level: 1,
  maxLevel: 4,

  baseAttack: 4,
  baseHealth: 7,
  attackPerLevel: 1,
  healthPerLevel: 2,
  cost: 3,

  text: "When summoned, give adjacent allies +1 Health.",
  imagesByLevel: [
    "src/assets/sunback-lvl1.png",
    "src/assets/sunback-lvl2.png",
    "src/assets/sunback-lvl3.png",
    "src/assets/sunback-lvl4.png"
  ],
  image: "src/assets/sunback-lvl1.png"
},

// 28 ────────────────────────────────────────────────────────────────
{
  id: "skyclaw",
  name: "Skyclaw Provoker",
  race: "lion",
  rarity: "rare",
  stars: 3,
  level: 1,
  maxLevel: 4,

  baseAttack: 3,
  baseHealth: 7,
  attackPerLevel: 1,
  healthPerLevel: 2,
  cost: 3,

  text: "When this takes damage, gain +1 Attack.",
  imagesByLevel: [
    "src/assets/skyclaw-lvl1.png",
    "src/assets/skyclaw-lvl2.png",
    "src/assets/skyclaw-lvl3.png",
    "src/assets/skyclaw-lvl4.png"
  ],
  image: "src/assets/skyclaw-lvl1.png"
},

// 29 ────────────────────────────────────────────────────────────────
{
  id: "kingshadow",
  name: "Kingshadow Elder",
  race: "lion",
  rarity: "epic",
  stars: 4,
  level: 1,
  maxLevel: 5,

  baseAttack: 4,
  baseHealth: 8,
  attackPerLevel: 2,
  healthPerLevel: 2,
  cost: 3,

  text: "Allies gain +1 Health when this enters play.",
  imagesByLevel: [
    "src/assets/kingshadow-lvl1.png",
    "src/assets/kingshadow-lvl2.png",
    "src/assets/kingshadow-lvl3.png",
    "src/assets/kingshadow-lvl4.png",
    "src/assets/kingshadow-lvl5.png"
  ],
  topImagesByLevel: [null, null, null, null, "src/assets/kingshadow-lvl5-nobg.png"],
  image: "src/assets/kingshadow-lvl1.png"
},

// 30 ────────────────────────────────────────────────────────────────
{
  id: "sunpride",
  name: "Sunpride Monarch",
  race: "lion",
  rarity: "legendary",
  stars: 5,
  level: 1,
  maxLevel: 5,

  baseAttack: 6,
  baseHealth: 12,
  attackPerLevel: 2,
  healthPerLevel: 3,
  cost: 5,

  text: "All Lions have +1 Attack permanently.",
  imagesByLevel: [
    "src/assets/sunpride-lvl1.png",
    "src/assets/sunpride-lvl2.png",
    "src/assets/sunpride-lvl3.png",
    "src/assets/sunpride-lvl4.png",
    "src/assets/sunpride-lvl5.png"
  ],
  topImagesByLevel: [null, null, null, null, "src/assets/sunpride-lvl5-nobg.png"],
  image: "src/assets/sunpride-lvl1.png"
},


/* ============================================================================
   SERPENTS — 10 CARDS
   ========================================================================== */

// 31 ────────────────────────────────────────────────────────────────
{
  id: "sandadder",
  name: "Sand Adder",
  race: "serpent",
  rarity: "common",
  stars: 1,
  level: 1,
  maxLevel: 3,

  baseAttack: 1,
  baseHealth: 3,
  attackPerLevel: 1,
  healthPerLevel: 1,
  cost: 1,

  text: "",
  imagesByLevel: [
    "src/assets/sandadder-lvl1.png",
    "src/assets/sandadder-lvl2.png",
    "src/assets/sandadder-lvl3.png"
  ],
  image: "src/assets/sandadder-lvl1.png"
},

// 32 ────────────────────────────────────────────────────────────────
{
  id: "desertcoil",
  name: "Desert Coil",
  race: "serpent",
  rarity: "common",
  stars: 1,
  level: 1,
  maxLevel: 3,

  baseAttack: 2,
  baseHealth: 3,
  attackPerLevel: 1,
  healthPerLevel: 1,
  cost: 1,

  text: "",
  imagesByLevel: [
    "src/assets/desertcoil-lvl1.png",
    "src/assets/desertcoil-lvl2.png",
    "src/assets/desertcoil-lvl3.png"
  ],
  image: "src/assets/desertcoil-lvl1.png"
},

// 33 ────────────────────────────────────────────────────────────────
{
  id: "scalehunter",
  name: "Scale Hunter",
  race: "serpent",
  rarity: "common",
  stars: 2,
  level: 1,
  maxLevel: 3,

  baseAttack: 2,
  baseHealth: 5,
  attackPerLevel: 1,
  healthPerLevel: 1,
  cost: 2,

  text: "",
  imagesByLevel: [
    "src/assets/scalehunter-lvl1.png",
    "src/assets/scalehunter-lvl2.png",
    "src/assets/scalehunter-lvl3.png"
  ],
  image: "src/assets/scalehunter-lvl1.png"
},

// 34 ────────────────────────────────────────────────────────────────
{
  id: "venomtail",
  name: "Venomtail Serpent",
  race: "serpent",
  rarity: "common",
  stars: 2,
  level: 1,
  maxLevel: 3,

  baseAttack: 3,
  baseHealth: 4,
  attackPerLevel: 1,
  healthPerLevel: 2,
  cost: 2,

  text: "",
  imagesByLevel: [
    "src/assets/venomtail-lvl1.png",
    "src/assets/venomtail-lvl2.png",
    "src/assets/venomtail-lvl3.png"
  ],
  image: "src/assets/venomtail-lvl1.png"
},

// 35 ────────────────────────────────────────────────────────────────
{
  id: "emeraldcoil",
  name: "Emerald Coil",
  race: "serpent",
  rarity: "rare",
  stars: 3,
  level: 1,
  maxLevel: 4,

  baseAttack: 2,
  baseHealth: 6,
  attackPerLevel: 1,
  healthPerLevel: 2,
  cost: 2,

  text: "When this attacks, deal 1 Poison instead.",
  imagesByLevel: [
    "src/assets/emeraldcoil-lvl1.png",
    "src/assets/emeraldcoil-lvl2.png",
    "src/assets/emeraldcoil-lvl3.png",
    "src/assets/emeraldcoil-lvl4.png"
  ],
  image: "src/assets/emeraldcoil-lvl1.png"
},

// 36 ────────────────────────────────────────────────────────────────
{
  id: "sandspirit",
  name: "Sandspirit Boa",
  race: "serpent",
  rarity: "rare",
  stars: 3,
  level: 1,
  maxLevel: 4,

  baseAttack: 3,
  baseHealth: 7,
  attackPerLevel: 1,
  healthPerLevel: 2,
  cost: 3,

  text: "When summoned, weaken an enemy by -1 Attack this turn.",
  imagesByLevel: [
    "src/assets/sandspirit-lvl1.png",
    "src/assets/sandspirit-lvl2.png",
    "src/assets/sandspirit-lvl3.png",
    "src/assets/sandspirit-lvl4.png"
  ],
  image: "src/assets/sandspirit-lvl1.png"
},

// 37 ────────────────────────────────────────────────────────────────
{
  id: "goldenscale",
  name: "Goldenscale Seraph",
  race: "serpent",
  rarity: "epic",
  stars: 4,
  level: 1,
  maxLevel: 5,

  baseAttack: 4,
  baseHealth: 6,
  attackPerLevel: 1,
  healthPerLevel: 2,
  cost: 3,

  text: "Restore 1 Health to all allies on summon.",
  imagesByLevel: [
    "src/assets/goldenscale-lvl1.png",
    "src/assets/goldenscale-lvl2.png",
    "src/assets/goldenscale-lvl3.png",
    "src/assets/goldenscale-lvl4.png",
    "src/assets/goldenscale-lvl5.png"
  ],
  topImagesByLevel: [
    null, null, null, null,
    "src/assets/goldenscale-lvl5-nobg.png"
  ],
  image: "src/assets/goldenscale-lvl1.png"
},

// 38 ────────────────────────────────────────────────────────────────
{
  id: "crimsoncoil",
  name: "Crimsoncoil Tyrant",
  race: "serpent",
  rarity: "epic",
  stars: 4,
  level: 1,
  maxLevel: 5,

  baseAttack: 5,
  baseHealth: 7,
  attackPerLevel: 1,
  healthPerLevel: 2,
  cost: 4,

  text: "After this destroys a unit, gain +1 Attack permanently.",
  imagesByLevel: [
    "src/assets/crimsoncoil-lvl1.png",
    "src/assets/crimsoncoil-lvl2.png",
    "src/assets/crimsoncoil-lvl3.png",
    "src/assets/crimsoncoil-lvl4.png",
    "src/assets/crimsoncoil-lvl5.png"
  ],
  topImagesByLevel: [
    null, null, null, null,
    "src/assets/crimsoncoil-lvl5-nobg.png"
  ],
  image: "src/assets/crimsoncoil-lvl1.png"
},

// 39 ────────────────────────────────────────────────────────────────
{
  id: "sandviper-queen",
  name: "Sandviper Queen",
  race: "serpent",
  rarity: "legendary",
  stars: 5,
  level: 1,
  maxLevel: 5,

  baseAttack: 6,
  baseHealth: 9,
  attackPerLevel: 2,
  healthPerLevel: 2,
  cost: 5,

  text: "All Serpents gain +1 Attack permanently.",
  imagesByLevel: [
    "src/assets/sandviperqueen-lvl1.png",
    "src/assets/sandviperqueen-lvl2.png",
    "src/assets/sandviperqueen-lvl3.png",
    "src/assets/sandviperqueen-lvl4.png",
    "src/assets/sandviperqueen-lvl5.png"
  ],
  topImagesByLevel: [
    null,null,null,null,
    "src/assets/sandviperqueen-lvl5-nobg.png"
  ],
  image: "src/assets/sandviperqueen-lvl1.png"
},

// 40 ────────────────────────────────────────────────────────────────
{
  id: "dunecoil-emperor",
  name: "Dunecoil Emperor",
  race: "serpent",
  rarity: "legendary",
  stars: 5,
  level: 1,
  maxLevel: 5,

  baseAttack: 7,
  baseHealth: 11,
  attackPerLevel: 2,
  healthPerLevel: 3,
  cost: 5,

  text: "When this attacks, deal 1 Poison to all enemies.",
  imagesByLevel: [
    "src/assets/dunecoil-lvl1.png",
    "src/assets/dunecoil-lvl2.png",
    "src/assets/dunecoil-lvl3.png",
    "src/assets/dunecoil-lvl4.png",
    "src/assets/dunecoil-lvl5.png"
  ],
  topImagesByLevel: [
    null,null,null,null,
    "src/assets/dunecoil-lvl5-nobg.png"
  ],
  image: "src/assets/dunecoil-lvl1.png"
},


/* ============================================================================
   CATS — 10 CARDS
   ========================================================================== */

// 41 ────────────────────────────────────────────────────────────────
{
  id: "sandkit",
  name: "Sandkit",
  race: "cat",
  rarity: "common",
  stars: 1,
  level: 1,
  maxLevel: 3,

  baseAttack: 1,
  baseHealth: 3,
  attackPerLevel: 1,
  healthPerLevel: 1,
  cost: 1,

  text: "",
  imagesByLevel: [
    "src/assets/sandkit-lvl1.png",
    "src/assets/sandkit-lvl2.png",
    "src/assets/sandkit-lvl3.png"
  ],
  image: "src/assets/sandkit-lvl1.png"
},

// 42 ────────────────────────────────────────────────────────────────
{
  id: "dunepouncer",
  name: "Dune Pouncer",
  race: "cat",
  rarity: "common",
  stars: 1,
  level: 1,
  maxLevel: 3,

  baseAttack: 2,
  baseHealth: 3,
  attackPerLevel: 1,
  healthPerLevel: 1,
  cost: 1,

  text: "",
  imagesByLevel: [
    "src/assets/dunepouncer-lvl1.png",
    "src/assets/dunepouncer-lvl2.png",
    "src/assets/dunepouncer-lvl3.png"
  ],
  image: "src/assets/dunepouncer-lvl1.png"
},

// 43 ────────────────────────────────────────────────────────────────
{
  id: "sandclaw",
  name: "Sandclaw Cat",
  race: "cat",
  rarity: "common",
  stars: 2,
  level: 1,
  maxLevel: 3,

  baseAttack: 3,
  baseHealth: 4,
  attackPerLevel: 1,
  healthPerLevel: 1,
  cost: 2,

  text: "",
  imagesByLevel: [
    "src/assets/sandclaw-lvl1.png",
    "src/assets/sandclaw-lvl2.png",
    "src/assets/sandclaw-lvl3.png"
  ],
  image: "src/assets/sandclaw-lvl1.png"
},

// 44 ────────────────────────────────────────────────────────────────
{
  id: "scratcher",
  name: "Dustscratcher",
  race: "cat",
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
  imagesByLevel: [
    "src/assets/dustscratcher-lvl1.png",
    "src/assets/dustscratcher-lvl2.png",
    "src/assets/dustscratcher-lvl3.png"
  ],
  image: "src/assets/dustscratcher-lvl1.png"
},

// 45 ────────────────────────────────────────────────────────────────
{
  id: "sandwhisker",
  name: "Sandwhisker Stalker",
  race: "cat",
  rarity: "rare",
  stars: 3,
  level: 1,
  maxLevel: 4,

  baseAttack: 3,
  baseHealth: 5,
  attackPerLevel: 2,
  healthPerLevel: 2,
  cost: 2,

  text: "When this hits a wounded enemy, deal +1 damage.",
  imagesByLevel: [
    "src/assets/sandwhisker-lvl1.png",
    "src/assets/sandwhisker-lvl2.png",
    "src/assets/sandwhisker-lvl3.png",
    "src/assets/sandwhisker-lvl4.png"
  ],
  image: "src/assets/sandwhisker-lvl1.png"
},

// 46 ────────────────────────────────────────────────────────────────
{
  id: "goldmane",
  name: "Goldmane Prowler",
  race: "cat",
  rarity: "rare",
  stars: 3,
  level: 1,
  maxLevel: 4,

  baseAttack: 3,
  baseHealth: 6,
  attackPerLevel: 1,
  healthPerLevel: 2,
  cost: 3,

  text: "When summoned, you may draw 1 card.",
  imagesByLevel: [
    "src/assets/goldmane-lvl1.png",
    "src/assets/goldmane-lvl2.png",
    "src/assets/goldmane-lvl3.png",
    "src/assets/goldmane-lvl4.png"
  ],
  image: "src/assets/goldmane-lvl1.png"
},

// 47 ────────────────────────────────────────────────────────────────
{
  id: "moonfur",
  name: "Moonfur Mystic",
  race: "cat",
  rarity: "epic",
  stars: 4,
  level: 1,
  maxLevel: 5,

  baseAttack: 4,
  baseHealth: 7,
  attackPerLevel: 1,
  healthPerLevel: 2,
  cost: 3,

  text: "Restore 1 Health to allies on summon.",
  imagesByLevel: [
    "src/assets/moonfur-lvl1.png",
    "src/assets/moonfur-lvl2.png",
    "src/assets/moonfur-lvl3.png",
    "src/assets/moonfur-lvl4.png",
    "src/assets/moonfur-lvl5.png"
  ],
  topImagesByLevel: [null,null,null,null,"src/assets/moonfur-lvl5-nobg.png"],
  image: "src/assets/moonfur-lvl1.png"
},

// 48 ────────────────────────────────────────────────────────────────
{
  id: "sunclaw",
  name: "Sunclaw Ravager",
  race: "cat",
  rarity: "epic",
  stars: 4,
  level: 1,
  maxLevel: 5,

  baseAttack: 5,
  baseHealth: 7,
  attackPerLevel: 2,
  healthPerLevel: 2,
  cost: 4,

  text: "When this attacks, adjacent allies gain +1 Attack.",
  imagesByLevel: [
    "src/assets/sunclaw-lvl1.png",
    "src/assets/sunclaw-lvl2.png",
    "src/assets/sunclaw-lvl3.png",
    "src/assets/sunclaw-lvl4.png",
    "src/assets/sunclaw-lvl5.png"
  ],
  topImagesByLevel: [null,null,null,null,"src/assets/sunclaw-lvl5-nobg.png"],
  image: "src/assets/sunclaw-lvl1.png"
},

// 49 ────────────────────────────────────────────────────────────────
{
  id: "dunewhiskerqueen",
  name: "Dunewhisker Queen",
  race: "cat",
  rarity: "legendary",
  stars: 5,
  level: 1,
  maxLevel: 5,

  baseAttack: 6,
  baseHealth: 9,
  attackPerLevel: 2,
  healthPerLevel: 2,
  cost: 5,

  text: "Cats you control gain +1/+1 permanently.",
  imagesByLevel: [
    "src/assets/dunewhiskerqueen-lvl1.png",
    "src/assets/dunewhiskerqueen-lvl2.png",
    "src/assets/dunewhiskerqueen-lvl3.png",
    "src/assets/dunewhiskerqueen-lvl4.png",
    "src/assets/dunewhiskerqueen-lvl5.png"
  ],
  topImagesByLevel: [
    null,null,null,null,
    "src/assets/dunewhiskerqueen-lvl5-nobg.png"
  ],
  image: "src/assets/dunewhiskerqueen-lvl1.png"
},

// 50 ────────────────────────────────────────────────────────────────
{
  id: "goldpawsovereign",
  name: "Goldpaw Sovereign",
  race: "cat",
  rarity: "legendary",
  stars: 5,
  level: 1,
  maxLevel: 5,

  baseAttack: 7,
  baseHealth: 11,
  attackPerLevel: 2,
  healthPerLevel: 3,
  cost: 5,

  text: "When this attacks, all Cats gain +1 Attack permanently.",
  imagesByLevel: [
    "src/assets/goldpawsovereign-lvl1.png",
    "src/assets/goldpawsovereign-lvl2.png",
    "src/assets/goldpawsovereign-lvl3.png",
    "src/assets/goldpawsovereign-lvl4.png",
    "src/assets/goldpawsovereign-lvl5.png"
  ],
  topImagesByLevel: [
    null,null,null,null,
    "src/assets/goldpawsovereign-lvl5-nobg.png"
  ],
  image: "src/assets/goldpawsovereign-lvl1.png"
},

/* ============================================================================
   DRAGONS — 10 CARDS
   ========================================================================== */

// 51 ────────────────────────────────────────────────────────────────
{
  id: "emberhatch",
  name: "Emberhatch Wyrmling",
  race: "dragon",
  rarity: "common",
  stars: 1,
  level: 1,
  maxLevel: 3,

  baseAttack: 2,
  baseHealth: 3,
  attackPerLevel: 1,
  healthPerLevel: 1,
  cost: 1,

  text: "",
  imagesByLevel: [
    "src/assets/emberhatch-lvl1.png",
    "src/assets/emberhatch-lvl2.png",
    "src/assets/emberhatch-lvl3.png"
  ],
  image: "src/assets/emberhatch-lvl1.png"
},

// 52 ────────────────────────────────────────────────────────────────
{
  id: "sparkwing",
  name: "Sparkwing Drake",
  race: "dragon",
  rarity: "common",
  stars: 2,
  level: 1,
  maxLevel: 3,

  baseAttack: 3,
  baseHealth: 4,
  attackPerLevel: 1,
  healthPerLevel: 1,
  cost: 2,

  text: "",
  imagesByLevel: [
    "src/assets/sparkwing-lvl1.png",
    "src/assets/sparkwing-lvl2.png",
    "src/assets/sparkwing-lvl3.png"
  ],
  image: "src/assets/sparkwing-lvl1.png"
},

// 53 ────────────────────────────────────────────────────────────────
{
  id: "dunescale",
  name: "Dunescale Drake",
  race: "dragon",
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
  imagesByLevel: [
    "src/assets/dunescale-lvl1.png",
    "src/assets/dunescale-lvl2.png",
    "src/assets/dunescale-lvl3.png"
  ],
  image: "src/assets/dunescale-lvl1.png"
},

// 54 ────────────────────────────────────────────────────────────────
{
  id: "flamecrest",
  name: "Flamecrest Drake",
  race: "dragon",
  rarity: "rare",
  stars: 3,
  level: 1,
  maxLevel: 4,

  baseAttack: 4,
  baseHealth: 6,
  attackPerLevel: 1,
  healthPerLevel: 2,
  cost: 3,

  text: "When summoned, deal 1 damage to a random enemy.",
  imagesByLevel: [
    "src/assets/flamecrest-lvl1.png",
    "src/assets/flamecrest-lvl2.png",
    "src/assets/flamecrest-lvl3.png",
    "src/assets/flamecrest-lvl4.png"
  ],
  image: "src/assets/flamecrest-lvl1.png"
},

// 55 ────────────────────────────────────────────────────────────────
{
  id: "ashenwyrm",
  name: "Ashen Wyrm",
  race: "dragon",
  rarity: "rare",
  stars: 3,
  level: 1,
  maxLevel: 4,

  baseAttack: 4,
  baseHealth: 7,
  attackPerLevel: 1,
  healthPerLevel: 2,
  cost: 3,

  text: "Burns the first enemy it damages (1 damage end of turn).",
  imagesByLevel: [
    "src/assets/ashenwyrm-lvl1.png",
    "src/assets/ashenwyrm-lvl2.png",
    "src/assets/ashenwyrm-lvl3.png",
    "src/assets/ashenwyrm-lvl4.png"
  ],
  image: "src/assets/ashenwyrm-lvl1.png"
},

// 56 ────────────────────────────────────────────────────────────────
{
  id: "solarwyrm",
  name: "Solarwyrm Adept",
  race: "dragon",
  rarity: "epic",
  stars: 4,
  level: 1,
  maxLevel: 5,

  baseAttack: 5,
  baseHealth: 7,
  attackPerLevel: 2,
  healthPerLevel: 2,
  cost: 4,

  text: "When this attacks, adjacent allies gain +1 Attack.",
  imagesByLevel: [
    "src/assets/solarwyrm-lvl1.png",
    "src/assets/solarwyrm-lvl2.png",
    "src/assets/solarwyrm-lvl3.png",
    "src/assets/solarwyrm-lvl4.png",
    "src/assets/solarwyrm-lvl5.png"
  ],
  topImagesByLevel: [
    null,null,null,null,
    "src/assets/solarwyrm-lvl5-nobg.png"
  ],
  image: "src/assets/solarwyrm-lvl1.png"
},

// 57 ────────────────────────────────────────────────────────────────
{
  id: "stormwing",
  name: "Stormwing Tyrant",
  race: "dragon",
  rarity: "epic",
  stars: 4,
  level: 1,
  maxLevel: 5,

  baseAttack: 5,
  baseHealth: 8,
  attackPerLevel: 2,
  healthPerLevel: 2,
  cost: 4,

  text: "On summoning, stun a random enemy for 1 turn.",
  imagesByLevel: [
    "src/assets/stormwing-lvl1.png",
    "src/assets/stormwing-lvl2.png",
    "src/assets/stormwing-lvl3.png",
    "src/assets/stormwing-lvl4.png",
    "src/assets/stormwing-lvl5.png"
  ],
  topImagesByLevel: [
    null,null,null,null,
    "src/assets/stormwing-lvl5-nobg.png"
  ],
  image: "src/assets/stormwing-lvl1.png"
},

// 58 ────────────────────────────────────────────────────────────────
{
  id: "dunetitan",
  name: "Dunetitan Dragon",
  race: "dragon",
  rarity: "legendary",
  stars: 5,
  level: 1,
  maxLevel: 5,

  baseAttack: 7,
  baseHealth: 12,
  attackPerLevel: 2,
  healthPerLevel: 3,
  cost: 5,

  text: "All Dragons gain +1 Attack permanently.",
  imagesByLevel: [
    "src/assets/dunetitan-lvl1.png",
    "src/assets/dunetitan-lvl2.png",
    "src/assets/dunetitan-lvl3.png",
    "src/assets/dunetitan-lvl4.png",
    "src/assets/dunetitan-lvl5.png"
  ],
  topImagesByLevel: [
    null,null,null,null,
    "src/assets/dunetitan-lvl5-nobg.png"
  ],
  image: "src/assets/dunetitan-lvl1.png"
},

// 59 ────────────────────────────────────────────────────────────────
{
  id: "aurorawyrm",
  name: "Aurorawyrm Sovereign",
  race: "dragon",
  rarity: "legendary",
  stars: 5,
  level: 1,
  maxLevel: 5,

  baseAttack: 8,
  baseHealth: 11,
  attackPerLevel: 2,
  healthPerLevel: 2,
  cost: 5,

  text: "When this attacks, Dragons gain +1 Health permanently.",
  imagesByLevel: [
    "src/assets/aurorawyrm-lvl1.png",
    "src/assets/aurorawyrm-lvl2.png",
    "src/assets/aurorawyrm-lvl3.png",
    "src/assets/aurorawyrm-lvl4.png",
    "src/assets/aurorawyrm-lvl5.png"
  ],
  topImagesByLevel: [
    null,null,null,null,
    "src/assets/aurorawyrm-lvl5-nobg.png"
  ],
  image: "src/assets/aurorawyrm-lvl1.png"
},

// 60 ────────────────────────────────────────────────────────────────
{
  id: "cinderwyrm",
  name: "Cinderwyrm Incarnate",
  race: "dragon",
  rarity: "legendary",
  stars: 5,
  level: 1,
  maxLevel: 5,

  baseAttack: 9,
  baseHealth: 13,
  attackPerLevel: 2,
  healthPerLevel: 3,
  cost: 6,

  text: "Burn all enemies (1 damage end of turn).",
  imagesByLevel: [
    "src/assets/cinderwyrm-lvl1.png",
    "src/assets/cinderwyrm-lvl2.png",
    "src/assets/cinderwyrm-lvl3.png",
    "src/assets/cinderwyrm-lvl4.png",
    "src/assets/cinderwyrm-lvl5.png"
  ],
  topImagesByLevel: [
    null,null,null,null,
    "src/assets/cinderwyrm-lvl5-nobg.png"
  ],
  image: "src/assets/cinderwyrm-lvl1.png"
},
/* ============================================================================
   GOBLINS — 10 CARDS
   ========================================================================== */

// 61 ────────────────────────────────────────────────────────────────
{
  id: "mudsnout",
  name: "Mudsnout Sneak",
  race: "goblin",
  rarity: "common",
  stars: 1,
  level: 1,
  maxLevel: 3,

  baseAttack: 1,
  baseHealth: 3,
  attackPerLevel: 1,
  healthPerLevel: 1,
  cost: 1,

  text: "",
  imagesByLevel: [
    "src/assets/mudsnout-lvl1.png",
    "src/assets/mudsnout-lvl2.png",
    "src/assets/mudsnout-lvl3.png"
  ],
  image: "src/assets/mudsnout-lvl1.png"
},

// 62 ────────────────────────────────────────────────────────────────
{
  id: "scrapstabber",
  name: "Scrap Stabber",
  race: "goblin",
  rarity: "common",
  stars: 1,
  level: 1,
  maxLevel: 3,

  baseAttack: 2,
  baseHealth: 3,
  attackPerLevel: 1,
  healthPerLevel: 1,
  cost: 1,

  text: "",
  imagesByLevel: [
    "src/assets/scrapstabber-lvl1.png",
    "src/assets/scrapstabber-lvl2.png",
    "src/assets/scrapstabber-lvl3.png"
  ],
  image: "src/assets/scrapstabber-lvl1.png"
},

// 63 ────────────────────────────────────────────────────────────────
{
  id: "rubblegnaw",
  name: "Rubblegnaw Goblin",
  race: "goblin",
  rarity: "common",
  stars: 2,
  level: 1,
  maxLevel: 3,

  baseAttack: 3,
  baseHealth: 4,
  attackPerLevel: 1,
  healthPerLevel: 1,
  cost: 2,

  text: "",
  imagesByLevel: [
    "src/assets/rubblegnaw-lvl1.png",
    "src/assets/rubblegnaw-lvl2.png",
    "src/assets/rubblegnaw-lvl3.png"
  ],
  image: "src/assets/rubblegnaw-lvl1.png"
},

// 64 ────────────────────────────────────────────────────────────────
{
  id: "scrapper",
  name: "Pit Scrapper",
  race: "goblin",
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
  imagesByLevel: [
    "src/assets/pitscrapper-lvl1.png",
    "src/assets/pitscrapper-lvl2.png",
    "src/assets/pitscrapper-lvl3.png"
  ],
  image: "src/assets/pitscrapper-lvl1.png"
},

// 65 ────────────────────────────────────────────────────────────────
{
  id: "bamblast",
  name: "Bamblast Tinkerer",
  race: "goblin",
  rarity: "rare",
  stars: 3,
  level: 1,
  maxLevel: 4,

  baseAttack: 3,
  baseHealth: 6,
  attackPerLevel: 1,
  healthPerLevel: 2,
  cost: 2,

  text: "On summon: deal 1 random damage.",
  imagesByLevel: [
    "src/assets/bamblast-lvl1.png",
    "src/assets/bamblast-lvl2.png",
    "src/assets/bamblast-lvl3.png",
    "src/assets/bamblast-lvl4.png"
  ],
  image: "src/assets/bamblast-lvl1.png"
},

// 66 ────────────────────────────────────────────────────────────────
{
  id: "gearchewer",
  name: "Gearchewer Raider",
  race: "goblin",
  rarity: "rare",
  stars: 3,
  level: 1,
  maxLevel: 4,

  baseAttack: 4,
  baseHealth: 6,
  attackPerLevel: 1,
  healthPerLevel: 2,
  cost: 3,

  text: "When this attacks, deal 1 damage to the enemy board.",
  imagesByLevel: [
    "src/assets/gearcher-lvl1.png",
    "src/assets/gearcher-lvl2.png",
    "src/assets/gearcher-lvl3.png",
    "src/assets/gearcher-lvl4.png"
  ],
  image: "src/assets/gearcher-lvl1.png"
},

// 67 ────────────────────────────────────────────────────────────────
{
  id: "muckshaman",
  name: "Muckshaman",
  race: "goblin",
  rarity: "epic",
  stars: 4,
  level: 1,
  maxLevel: 5,

  baseAttack: 4,
  baseHealth: 7,
  attackPerLevel: 2,
  healthPerLevel: 2,
  cost: 3,

  text: "Restore 1 Health to allies on summon.",
  imagesByLevel: [
    "src/assets/muckshaman-lvl1.png",
    "src/assets/muckshaman-lvl2.png",
    "src/assets/muckshaman-lvl3.png",
    "src/assets/muckshaman-lvl4.png",
    "src/assets/muckshaman-lvl5.png"
  ],
  topImagesByLevel: [null,null,null,null,"src/assets/muckshaman-lvl5-nobg.png"],
  image: "src/assets/muckshaman-lvl1.png"
},

// 68 ────────────────────────────────────────────────────────────────
{
  id: "warlordskragg",
  name: "Warlord Skragg",
  race: "goblin",
  rarity: "epic",
  stars: 4,
  level: 1,
  maxLevel: 5,

  baseAttack: 5,
  baseHealth: 7,
  attackPerLevel: 2,
  healthPerLevel: 2,
  cost: 3,

  text: "Goblins gain +1 Attack this turn when he attacks.",
  imagesByLevel: [
    "src/assets/skragg-lvl1.png",
    "src/assets/skragg-lvl2.png",
    "src/assets/skragg-lvl3.png",
    "src/assets/skragg-lvl4.png",
    "src/assets/skragg-lvl5.png"
  ],
  topImagesByLevel: [null,null,null,null,"src/assets/skragg-lvl5-nobg.png"],
  image: "src/assets/skragg-lvl1.png"
},

// 69 ────────────────────────────────────────────────────────────────
{
  id: "goblinemperor",
  name: "Goblin Emperor",
  race: "goblin",
  rarity: "legendary",
  stars: 5,
  level: 1,
  maxLevel: 5,

  baseAttack: 6,
  baseHealth: 10,
  attackPerLevel: 2,
  healthPerLevel: 2,
  cost: 4,

  text: "Your Goblins have +1/+1 permanently.",
  imagesByLevel: [
    "src/assets/goblinemperor-lvl1.png",
    "src/assets/goblinemperor-lvl2.png",
    "src/assets/goblinemperor-lvl3.png",
    "src/assets/goblinemperor-lvl4.png",
    "src/assets/goblinemperor-lvl5.png"
  ],
  topImagesByLevel: [
    null,null,null,null,
    "src/assets/goblinemperor-lvl5-nobg.png"
  ],
  image: "src/assets/goblinemperor-lvl1.png"
},

// 70 ────────────────────────────────────────────────────────────────
{
  id: "scrapsupreme",
  name: "Scrapsupreme Titan",
  race: "goblin",
  rarity: "legendary",
  stars: 5,
  level: 1,
  maxLevel: 5,

  baseAttack: 8,
  baseHealth: 11,
  attackPerLevel: 2,
  healthPerLevel: 3,
  cost: 5,

  text: "When he attacks, deal 1 damage to all enemies.",
  imagesByLevel: [
    "src/assets/scrapsupreme-lvl1.png",
    "src/assets/scrapsupreme-lvl2.png",
    "src/assets/scrapsupreme-lvl3.png",
    "src/assets/scrapsupreme-lvl4.png",
    "src/assets/scrapsupreme-lvl5.png"
  ],
  topImagesByLevel: [
    null,null,null,null,
    "src/assets/scrapsupreme-lvl5-nobg.png"
  ],
  image: "src/assets/scrapsupreme-lvl1.png"
},
/* ============================================================================
   INSECTOIDS — 10 CARDS
   ========================================================================== */

// 71 ────────────────────────────────────────────────────────────────
{
  id: "sandmite",
  name: "Sand Mite",
  race: "insectoid",
  rarity: "common",
  stars: 1,
  level: 1,
  maxLevel: 3,

  baseAttack: 1,
  baseHealth: 3,
  attackPerLevel: 1,
  healthPerLevel: 1,
  cost: 1,

  imagesByLevel: [
    "src/assets/sandmite-lvl1.png",
    "src/assets/sandmite-lvl2.png",
    "src/assets/sandmite-lvl3.png"
  ],
  image: "src/assets/sandmite-lvl1.png"
},

// 72 ────────────────────────────────────────────────────────────────
{
  id: "scarabclaw",
  name: "Scarabclaw",
  race: "insectoid",
  rarity: "common",
  stars: 1,
  level: 1,
  maxLevel: 3,

  baseAttack: 2,
  baseHealth: 3,
  attackPerLevel: 1,
  healthPerLevel: 1,
  cost: 1,

  imagesByLevel: [
    "src/assets/scarabclaw-lvl1.png",
    "src/assets/scarabclaw-lvl2.png",
    "src/assets/scarabclaw-lvl3.png"
  ],
  image: "src/assets/scarabclaw-lvl1.png"
},

// 73 ────────────────────────────────────────────────────────────────
{
  id: "sandstinger",
  name: "Sandstinger",
  race: "insectoid",
  rarity: "common",
  stars: 2,
  level: 1,
  maxLevel: 3,

  baseAttack: 3,
  baseHealth: 4,
  attackPerLevel: 1,
  healthPerLevel: 1,
  cost: 2,

  imagesByLevel: [
    "src/assets/sandstinger-lvl1.png",
    "src/assets/sandstinger-lvl2.png",
    "src/assets/sandstinger-lvl3.png"
  ],
  image: "src/assets/sandstinger-lvl1.png"
},

// 74 ────────────────────────────────────────────────────────────────
{
  id: "dunebug",
  name: "Dune Bug Warrior",
  race: "insectoid",
  rarity: "common",
  stars: 2,
  level: 1,
  maxLevel: 3,

  baseAttack: 2,
  baseHealth: 6,
  attackPerLevel: 1,
  healthPerLevel: 2,
  cost: 2,

  imagesByLevel: [
    "src/assets/dunebug-lvl1.png",
    "src/assets/dunebug-lvl2.png",
    "src/assets/dunebug-lvl3.png"
  ],
  image: "src/assets/dunebug-lvl1.png"
},

// 75 ────────────────────────────────────────────────────────────────
{
  id: "glistenshell",
  name: "Glistenshell",
  race: "insectoid",
  rarity: "rare",
  stars: 3,
  level: 1,
  maxLevel: 4,

  baseAttack: 3,
  baseHealth: 7,
  attackPerLevel: 1,
  healthPerLevel: 2,
  cost: 2,

  imagesByLevel: [
    "src/assets/glistenshell-lvl1.png",
    "src/assets/glistenshell-lvl2.png",
    "src/assets/glistenshell-lvl3.png",
    "src/assets/glistenshell-lvl4.png"
  ],
  image: "src/assets/glistenshell-lvl1.png"
},

// 76 ────────────────────────────────────────────────────────────────
{
  id: "fleshripper",
  name: "Fleshripper Scarab",
  race: "insectoid",
  rarity: "rare",
  stars: 3,
  level: 1,
  maxLevel: 4,

  baseAttack: 4,
  baseHealth: 6,
  attackPerLevel: 1,
  healthPerLevel: 2,
  cost: 3,

  imagesByLevel: [
    "src/assets/fleshripper-lvl1.png",
    "src/assets/fleshripper-lvl2.png",
    "src/assets/fleshripper-lvl3.png",
    "src/assets/fleshripper-lvl4.png"
  ],
  image: "src/assets/fleshripper-lvl1.png"
},

// 77 ────────────────────────────────────────────────────────────────
{
  id: "dunereaper",
  name: "Dunereaper Mantis",
  race: "insectoid",
  rarity: "epic",
  stars: 4,
  level: 1,
  maxLevel: 5,

  baseAttack: 5,
  baseHealth: 6,
  attackPerLevel: 2,
  healthPerLevel: 2,
  cost: 3,

  text: "On summon: deal 1 damage to a wounded enemy.",
  imagesByLevel: [
    "src/assets/dunereaper-lvl1.png",
    "src/assets/dunereaper-lvl2.png",
    "src/assets/dunereaper-lvl3.png",
    "src/assets/dunereaper-lvl4.png",
    "src/assets/dunereaper-lvl5.png"
  ],
  topImagesByLevel: [null,null,null,null,"src/assets/dunereaper-lvl5-nobg.png"],
  image: "src/assets/dunereaper-lvl1.png"
},

// 78 ────────────────────────────────────────────────────────────────
{
  id: "sandbroodqueen",
  name: "Sandbrood Queen",
  race: "insectoid",
  rarity: "epic",
  stars: 4,
  level: 1,
  maxLevel: 5,

  baseAttack: 4,
  baseHealth: 9,
  attackPerLevel: 1,
  healthPerLevel: 3,
  cost: 4,

  text: "All Insectoids gain +1 Health.",
  imagesByLevel: [
    "src/assets/sandbroodqueen-lvl1.png",
    "src/assets/sandbroodqueen-lvl2.png",
    "src/assets/sandbroodqueen-lvl3.png",
    "src/assets/sandbroodqueen-lvl4.png",
    "src/assets/sandbroodqueen-lvl5.png"
  ],
  topImagesByLevel: [null,null,null,null,"src/assets/sandbroodqueen-lvl5-nobg.png"],
  image: "src/assets/sandbroodqueen-lvl1.png"
},

// 79 ────────────────────────────────────────────────────────────────
{
  id: "stingsovereign",
  name: "Sting Sovereign",
  race: "insectoid",
  rarity: "legendary",
  stars: 5,
  level: 1,
  maxLevel: 5,

  baseAttack: 6,
  baseHealth: 10,
  attackPerLevel: 2,
  healthPerLevel: 2,
  cost: 4,

  text: "Insectoids gain +1 Attack permanently.",
  imagesByLevel: [
    "src/assets/stingsovereign-lvl1.png",
    "src/assets/stingsovereign-lvl2.png",
    "src/assets/stingsovereign-lvl3.png",
    "src/assets/stingsovereign-lvl4.png",
    "src/assets/stingsovereign-lvl5.png"
  ],
  topImagesByLevel: [null,null,null,null,"src/assets/stingsovereign-lvl5-nobg.png"],
  image: "src/assets/stingsovereign-lvl1.png"
},

// 80 ────────────────────────────────────────────────────────────────
{
  id: "dunecharger",
  name: "Dunecharger Colossus",
  race: "insectoid",
  rarity: "legendary",
  stars: 5,
  level: 1,
  maxLevel: 5,

  baseAttack: 7,
  baseHealth: 12,
  attackPerLevel: 2,
  healthPerLevel: 3,
  cost: 5,

  imagesByLevel: [
    "src/assets/dunecharger-lvl1.png",
    "src/assets/dunecharger-lvl2.png",
    "src/assets/dunecharger-lvl3.png",
    "src/assets/dunecharger-lvl4.png",
    "src/assets/dunecharger-lvl5.png"
  ],
  topImagesByLevel: [null,null,null,null,"src/assets/dunecharger-lvl5-nobg.png"],
  image: "src/assets/dunecharger-lvl1.png"
},
/* ============================================================================
   BEARS — 10 CARDS
   ========================================================================== */

// 81 ────────────────────────────────────────────────────────────────
{
  id: "cubclaw",
  name: "Cubclaw Bear",
  race: "bear",
  rarity: "common",
  stars: 1,
  level: 1,
  maxLevel: 3,

  baseAttack: 1,
  baseHealth: 5,
  attackPerLevel: 1,
  healthPerLevel: 1,
  cost: 1,

  imagesByLevel: [
    "src/assets/cubclaw-lvl1.png",
    "src/assets/cubclaw-lvl2.png",
    "src/assets/cubclaw-lvl3.png"
  ],
  image: "src/assets/cubclaw-lvl1.png"
},

// 82 ────────────────────────────────────────────────────────────────
{
  id: "brownback",
  name: "Brownback Forager",
  race: "bear",
  rarity: "common",
  stars: 1,
  level: 1,
  maxLevel: 3,

  baseAttack: 2,
  baseHealth: 5,
  attackPerLevel: 1,
  healthPerLevel: 1,
  cost: 1,

  imagesByLevel: [
    "src/assets/brownback-lvl1.png",
    "src/assets/brownback-lvl2.png",
    "src/assets/brownback-lvl3.png"
  ],
  image: "src/assets/brownback-lvl1.png"
},

// 83 ────────────────────────────────────────────────────────────────
{
  id: "ridgebear",
  name: "Ridge Bear",
  race: "bear",
  rarity: "common",
  stars: 2,
  level: 1,
  maxLevel: 3,

  baseAttack: 3,
  baseHealth: 6,
  attackPerLevel: 1,
  healthPerLevel: 1,
  cost: 2,

  imagesByLevel: [
    "src/assets/ridgebear-lvl1.png",
    "src/assets/ridgebear-lvl2.png",
    "src/assets/ridgebear-lvl3.png"
  ],
  image: "src/assets/ridgebear-lvl1.png"
},

// 84 ────────────────────────────────────────────────────────────────
{
  id: "stonefur",
  name: "Stonefur Bear",
  race: "bear",
  rarity: "common",
  stars: 2,
  level: 1,
  maxLevel: 3,

  baseAttack: 2,
  baseHealth: 7,
  attackPerLevel: 1,
  healthPerLevel: 2,
  cost: 2,

  imagesByLevel: [
    "src/assets/stonefur-lvl1.png",
    "src/assets/stonefur-lvl2.png",
    "src/assets/stonefur-lvl3.png"
  ],
  image: "src/assets/stonefur-lvl1.png"
},

// 85 ────────────────────────────────────────────────────────────────
{
  id: "howlbear",
  name: "Howlbear",
  race: "bear",
  rarity: "rare",
  stars: 3,
  level: 1,
  maxLevel: 4,

  baseAttack: 4,
  baseHealth: 7,
  attackPerLevel: 1,
  healthPerLevel: 2,
  cost: 3,

  text: "Gain +1 Attack when damaged.",
  imagesByLevel: [
    "src/assets/howlbear-lvl1.png",
    "src/assets/howlbear-lvl2.png",
    "src/assets/howlbear-lvl3.png",
    "src/assets/howlbear-lvl4.png"
  ],
  image: "src/assets/howlbear-lvl1.png"
},

// 86 ────────────────────────────────────────────────────────────────
{
  id: "warmane",
  name: "Warmane Guardian",
  race: "bear",
  rarity: "rare",
  stars: 3,
  level: 1,
  maxLevel: 4,

  baseAttack: 3,
  baseHealth: 9,
  attackPerLevel: 1,
  healthPerLevel: 2,
  cost: 3,

  text: "On summon: adjacent allies gain +1 Health.",
  imagesByLevel: [
    "src/assets/warmane-lvl1.png",
    "src/assets/warmane-lvl2.png",
    "src/assets/warmane-lvl3.png",
    "src/assets/warmane-lvl4.png"
  ],
  image: "src/assets/warmane-lvl1.png"
},

// 87 ────────────────────────────────────────────────────────────────
{
  id: "terrabear",
  name: "Terrabear",
  race: "bear",
  rarity: "epic",
  stars: 4,
  level: 1,
  maxLevel: 5,

  baseAttack: 5,
  baseHealth: 9,
  attackPerLevel: 2,
  healthPerLevel: 2,
  cost: 4,

  imagesByLevel: [
    "src/assets/terrabear-lvl1.png",
    "src/assets/terrabear-lvl2.png",
    "src/assets/terrabear-lvl3.png",
    "src/assets/terrabear-lvl4.png",
    "src/assets/terrabear-lvl5.png"
  ],
  topImagesByLevel: [null,null,null,null,"src/assets/terrabear-lvl5-nobg.png"],
  image: "src/assets/terrabear-lvl1.png"
},

// 88 ────────────────────────────────────────────────────────────────
{
  id: "sunfur",
  name: "Sunfur Elder",
  race: "bear",
  rarity: "epic",
  stars: 4,
  level: 1,
  maxLevel: 5,

  baseAttack: 6,
  baseHealth: 8,
  attackPerLevel: 2,
  healthPerLevel: 2,
  cost: 4,

  text: "On summon: restore 1 Health to allies.",
  imagesByLevel: [
    "src/assets/sunfur-lvl1.png",
    "src/assets/sunfur-lvl2.png",
    "src/assets/sunfur-lvl3.png",
    "src/assets/sunfur-lvl4.png",
    "src/assets/sunfur-lvl5.png"
  ],
  topImagesByLevel: [null,null,null,null,"src/assets/sunfur-lvl5-nobg.png"],
  image: "src/assets/sunfur-lvl1.png"
},

// 89 ────────────────────────────────────────────────────────────────
{
  id: "earthshaker",
  name: "Earthshaker",
  race: "bear",
  rarity: "legendary",
  stars: 5,
  level: 1,
  maxLevel: 5,

  baseAttack: 7,
  baseHealth: 12,
  attackPerLevel: 2,
  healthPerLevel: 3,
  cost: 5,

  text: "When this attacks, stun a random enemy.",
  imagesByLevel: [
    "src/assets/earthshaker-lvl1.png",
    "src/assets/earthshaker-lvl2.png",
    "src/assets/earthshaker-lvl3.png",
    "src/assets/earthshaker-lvl4.png",
    "src/assets/earthshaker-lvl5.png"
  ],
  topImagesByLevel: [null,null,null,null,"src/assets/earthshaker-lvl5-nobg.png"],
  image: "src/assets/earthshaker-lvl1.png"
},

// 90 ────────────────────────────────────────────────────────────────
{
  id: "dunebreaker",
  name: "Dunebreaker Colossus",
  race: "bear",
  rarity: "legendary",
  stars: 5,
  level: 1,
  maxLevel: 5,

  baseAttack: 8,
  baseHealth: 13,
  attackPerLevel: 2,
  healthPerLevel: 3,
  cost: 6,

  imagesByLevel: [
    "src/assets/dunebreaker-lvl1.png",
    "src/assets/dunebreaker-lvl2.png",
    "src/assets/dunebreaker-lvl3.png",
    "src/assets/dunebreaker-lvl4.png",
    "src/assets/dunebreaker-lvl5.png"
  ],
  topImagesByLevel: [null,null,null,null,"src/assets/dunebreaker-lvl5-nobg.png"],
  image: "src/assets/dunebreaker-lvl1.png"
},
/* ============================================================================
   DEMONS — 10 CARDS
   ========================================================================== */

// 91 ────────────────────────────────────────────────────────────────
{
  id: "impgrin",
  name: "Impgrin Sneak",
  race: "demon",
  rarity: "common",
  stars: 1,
  level: 1,
  maxLevel: 3,

  baseAttack: 2,
  baseHealth: 3,
  attackPerLevel: 1,
  healthPerLevel: 1,
  cost: 1,

  imagesByLevel: [
    "src/assets/impgrin-lvl1.png",
    "src/assets/impgrin-lvl2.png",
    "src/assets/impgrin-lvl3.png"
  ],
  image: "src/assets/impgrin-lvl1.png"
},

// 92 ────────────────────────────────────────────────────────────────
{
  id: "cinderimp",
  name: "Cinder Imp",
  race: "demon",
  rarity: "common",
  stars: 1,
  level: 1,
  maxLevel: 3,

  baseAttack: 2,
  baseHealth: 4,
  attackPerLevel: 1,
  healthPerLevel: 1,
  cost: 1,

  imagesByLevel: [
    "src/assets/cinderimp-lvl1.png",
    "src/assets/cinderimp-lvl2.png",
    "src/assets/cinderimp-lvl3.png"
  ],
  image: "src/assets/cinderimp-lvl1.png"
},

// 93 ────────────────────────────────────────────────────────────────
{
  id: "shacklefiend",
  name: "Shackle Fiend",
  race: "demon",
  rarity: "common",
  stars: 2,
  level: 1,
  maxLevel: 3,

  baseAttack: 3,
  baseHealth: 5,
  attackPerLevel: 1,
  healthPerLevel: 1,
  cost: 2,

  imagesByLevel: [
    "src/assets/shacklefiend-lvl1.png",
    "src/assets/shacklefiend-lvl2.png",
    "src/assets/shacklefiend-lvl3.png"
  ],
  image: "src/assets/shacklefiend-lvl1.png"
},

// 94 ────────────────────────────────────────────────────────────────
{
  id: "pitgnasher",
  name: "Pit Gnasher",
  race: "demon",
  rarity: "common",
  stars: 2,
  level: 1,
  maxLevel: 3,

  baseAttack: 3,
  baseHealth: 6,
  attackPerLevel: 1,
  healthPerLevel: 2,
  cost: 2,

  imagesByLevel: [
    "src/assets/pitgnasher-lvl1.png",
    "src/assets/pitgnasher-lvl2.png",
    "src/assets/pitgnasher-lvl3.png"
  ],
  image: "src/assets/pitgnasher-lvl1.png"
},

// 95 ────────────────────────────────────────────────────────────────
{
  id: "embergazer",
  name: "Embergazer",
  race: "demon",
  rarity: "rare",
  stars: 3,
  level: 1,
  maxLevel: 4,

  baseAttack: 4,
  baseHealth: 6,
  attackPerLevel: 1,
  healthPerLevel: 2,
  cost: 3,

  text: "On summon: deal 1 damage to a random enemy.",
  imagesByLevel: [
    "src/assets/embergazer-lvl1.png",
    "src/assets/embergazer-lvl2.png",
    "src/assets/embergazer-lvl3.png",
    "src/assets/embergazer-lvl4.png"
  ],
  image: "src/assets/embergazer-lvl1.png"
},

// 96 ────────────────────────────────────────────────────────────────
{
  id: "soulbinder",
  name: "Soulbinder",
  race: "demon",
  rarity: "rare",
  stars: 3,
  level: 1,
  maxLevel: 4,

  baseAttack: 4,
  baseHealth: 7,
  attackPerLevel: 1,
  healthPerLevel: 2,
  cost: 3,

  text: "After this kills a unit, restore 1 Health to allies.",
  imagesByLevel: [
    "src/assets/soulbinder-lvl1.png",
    "src/assets/soulbinder-lvl2.png",
    "src/assets/soulbinder-lvl3.png",
    "src/assets/soulbinder-lvl4.png"
  ],
  image: "src/assets/soulbinder-lvl1.png"
},

// 97 ────────────────────────────────────────────────────────────────
{
  id: "chainborn",
  name: "Chainborn Whelp",
  race: "demon",
  rarity: "epic",
  stars: 4,
  level: 1,
  maxLevel: 5,

  baseAttack: 3,
  baseHealth: 6,
  attackPerLevel: 2,
  healthPerLevel: 2,
  cost: 2,

  text: "When damaged and survives: +1 Attack (max +3).",
  imagesByLevel: [
    "src/assets/chainbornwhelp-lvl1.png",
    "src/assets/chainbornwhelp-lvl2.png",
    "src/assets/chainbornwhelp-lvl3.png",
    "src/assets/chainbornwhelp-lvl4.png",
    "src/assets/chainbornwhelp-lvl5.png"
  ],
  topImagesByLevel: [
    null,null,null,null,
    "src/assets/chainbornwhelp-lvl5-nobg.png"
  ],
  image: "src/assets/chainbornwhelp-lvl1.png"
},

// 98 ────────────────────────────────────────────────────────────────
{
  id: "ashesovereign",
  name: "Ashesovereign",
  race: "demon",
  rarity: "epic",
  stars: 4,
  level: 1,
  maxLevel: 5,

  baseAttack: 5,
  baseHealth: 7,
  attackPerLevel: 2,
  healthPerLevel: 2,
  cost: 4,

  text: "Demons gain +1 Attack this turn when he attacks.",
  imagesByLevel: [
    "src/assets/ashesovereign-lvl1.png",
    "src/assets/ashesovereign-lvl2.png",
    "src/assets/ashesovereign-lvl3.png",
    "src/assets/ashesovereign-lvl4.png",
    "src/assets/ashesovereign-lvl5.png"
  ],
  topImagesByLevel: [
    null,null,null,null,
    "src/assets/ashesovereign-lvl5-nobg.png"
  ],
  image: "src/assets/ashesovereign-lvl1.png"
},

// 99 ────────────────────────────────────────────────────────────────
{
  id: "infernalarchon",
  name: "Infernal Archon",
  race: "demon",
  rarity: "legendary",
  stars: 5,
  level: 1,
  maxLevel: 5,

  baseAttack: 7,
  baseHealth: 10,
  attackPerLevel: 2,
  healthPerLevel: 2,
  cost: 5,

  text: "All Demons gain +1 Attack permanently.",
  imagesByLevel: [
    "src/assets/infernalarchon-lvl1.png",
    "src/assets/infernalarchon-lvl2.png",
    "src/assets/infernalarchon-lvl3.png",
    "src/assets/infernalarchon-lvl4.png",
    "src/assets/infernalarchon-lvl5.png"
  ],
  topImagesByLevel: [null,null,null,null,"src/assets/infernalarchon-lvl5-nobg.png"],
  image: "src/assets/infernalarchon-lvl1.png"
},

// 100 ───────────────────────────────────────────────────────────────
{
  id: "dunefiend",
  name: "Dunefiend Emperor",
  race: "demon",
  rarity: "legendary",
  stars: 5,
  level: 1,
  maxLevel: 5,

  baseAttack: 8,
  baseHealth: 12,
  attackPerLevel: 2,
  healthPerLevel: 3,
  cost: 6,

  text: "When this attacks, deal 1 damage to ALL enemies.",
  imagesByLevel: [
    "src/assets/dunefiend-lvl1.png",
    "src/assets/dunefiend-lvl2.png",
    "src/assets/dunefiend-lvl3.png",
    "src/assets/dunefiend-lvl4.png",
    "src/assets/dunefiend-lvl5.png"
  ],
  topImagesByLevel: [null,null,null,null,"src/assets/dunefiend-lvl5-nobg.png"],
  image: "src/assets/dunefiend-lvl1.png"
},

]
