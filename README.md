# Beast Dominion – Code Architecture & Refactor Notes

This document describes the current code structure in `src/`, explains what
each file does, what’s actually used at runtime, and suggests refactors and
next steps — especially around the 3D battle scene and animal-themed card
behavior.

---

## 0. File Inventory (used vs unused)

**Entry & global**

- ✅ `src/main.jsx`
- ✅ `src/App.jsx`
- ✅ `src/index.css`

**Data**

- ✅ `src/data/cards.js`

**Layout / Chrome**

- ✅ `src/components/layout/TopBar.jsx`
- ✅ `src/components/layout/TabBar.jsx`

**Deck building / collection**

- ✅ `src/components/deckbuilder/DeckBuilder.jsx`
- ✅ `src/components/deckbuilder/DeckBuilder.css`
- ✅ `src/components/card/MonsterCard.jsx`
- ✅ `src/components/card/MonsterCard.css`
- ✅ `src/components/inspect/CardInspect.jsx`
- ✅ `src/components/inspect/CardInspect.css`
- ✅ `src/components/ui/DeckNameModal.jsx`
- ✅ `src/components/ui/DeckPreviewTooltip.jsx`

**Campaign / play**

- ✅ `src/components/play/CampaignScreen.jsx`
- ✅ `src/components/play/CampaignScreen.css`

**Battle – used at runtime**

- ✅ `src/components/battle/BattleScreen.jsx`
- ✅ `src/components/battle/Battlefield3D.jsx`
- ✅ `src/components/battle/BattlefieldScene.jsx`
- ✅ `src/components/battle/CameraController.jsx`
- ✅ `src/components/battle/TutorialOverlay.jsx`
- ✅ `src/components/battle/DuelOverlay.jsx`

**Battle – currently unused / redundant**

- ❌ `src/components/battle/BattleScreen.css`
- ❌ `src/components/battle/AttackAnimation.jsx`
- ❌ `src/components/battle/BattleAudio.jsx`
- ❌ `src/components/battle/BattleCinematic.jsx`
- ❌ `src/components/battle/BattlePhaseUI.jsx`
- ❌ `src/components/battle/CardMesh.jsx`
- ❌ `src/components/battle/CardTooltip.jsx`
- ❌ `src/components/battle/DamageEffect.jsx`
- ❌ `src/components/battle/FireEffects.jsx`
- ❌ `src/components/battle/BurningCard.jsx`
- ❌ `src/components/battle/Graveyard.jsx`

All “❌” files are not reachable from `main.jsx` (nothing imports them).

---

## 1. Runtime Flow Overview

1. **`src/main.jsx`**  
   - Standard React entry: renders `<App />` into `#root`.
   - Imports global styling via `index.css`.

2. **`src/App.jsx` (root controller)**  
   - Holds **global state**:
     - `gold`, `shards`
     - `playerDeck` (array of card objects from `cards.js`)
     - `upgrades` (map `{ cardId: upgradeSteps }`)
     - `playMode` (`"campaign"` or `"battle"`)
     - `currentLevelInfo` (selected campaign level)
     - Modal + tooltip state for deck validation and deck preview.
   - Reads/writes **localStorage** under `STORAGE_KEY = "bd-saved-deck-v1"`:
     - `loadDeckFromStorage()` loads `{ deckName, deck: [ids], upgrades }`.
     - Converts card IDs back to card objects using `cards`.
     - On success: updates `playerDeck` & `upgrades`, shows alerts.
   - Renders:
     - `<TopBar gold/shards />`
     - `<TabBar active={activeMainTab} />`
     - Tab content:
       - `"play"` → `<CampaignScreen onStartBattle={handleStartBattle} />`
       - `"collection"` → `<DeckBuilder mode="collection" ... />`
       - `"deck"` → `<DeckBuilder mode="deck" ... />`
       - `"battle"` → `<BattleScreen ... />`
   - `handleStartBattle(levelInfo)`:
     - If `playerDeck.length < 6`, it **does not start a battle**; instead it:
       - Opens “Deck Not Ready” modal.
       - Asks the player to go to the Deck Builder.
     - Otherwise sets `currentLevelInfo` and `playMode = "battle"`.
   - `handleExitBattle()` returns to `"campaign"`.

   **Limitations / notes**
   - `BattleScreen` **does not currently use** `playerDeck` or `levelInfo`,
     even though App passes them as props. Battle data is still hard-coded.
   - Deck validation is only “at least 6 cards”; no max size, no mana curve, etc.
   - LocalStorage is handled both here and in `DeckBuilder` (two places know about
     the same storage schema).

   **Refactor ideas**
   - Introduce a **shared `deckStorage.js` utility** that owns `saveDeck/loadDeck`
     so App + DeckBuilder use the same implementation.
   - Evolve `handleStartBattle` to:
     - Convert `playerDeck` + `upgrades` into a **battle-ready `units` array**.
     - Pass those units and `levelInfo` into `BattleScreen` (see section 6).

3. **`src/index.css`**  
   - Global theme: fonts, colors, layout styles, top bar, tabs, card frame, etc.
   - Defines the general “elegant dark wood + gold” look.

---

## 2. Data Layer

### `src/data/cards.js` ✅

**Behavior**
- Defines the **card catalogue**:
  - `RACES`, `RARITIES`, `STARS` arrays.
  - Many card objects with fields like:
    - `id`, `name`, `race`, `biome`, `rarity`, `stars`
    - Base `attack`, `health`, `cost`
    - Level-scaling (`attackPerLevel`, `healthPerLevel`, `maxLevel`)
    - Unlock fields: `unlockLevel`, `abilityName`, `text`, `detail`, `lore`
    - Artwork: `imagesByLevel` pointing to `.png` assets
- All deckbuilding and card display logic pulls from this file.

**Limitations / notes**
- **No explicit rules** for how abilities apply in battle. The `text`/`abilityName`
  are purely descriptive right now.
- Animal theme is present in the flavour but **not yet wired to mechanics**:
  - There *are* `race` fields like `"wolf"`, `"dog"`, `"serpent"`, `"cat"`, etc.
  - But battle logic in `BattleScreen.jsx` uses **hard-coded sample units**.

**Refactor ideas**
- Add a simple, data-driven ability layer:
  - `abilityId` per card that maps into a `abilities.js` file defining:
    - When it triggers (summon, attack, defend, start of turn, end of turn).
    - What it does (e.g. modify stats, change targets, swap sides).
- Encode the animal behaviors you described:
  - **Wolves**: abilities that check `timeOfDay === 'night'` → +ATK, or gain buffs
    if adjacent wolves exist.
  - **Dogs**: adjacency or “leader” synergies: buff allied units of certain races.
  - **Serpents/snakes**: betrayal — e.g. a chance to switch controller when low HP,
    or extra damage when attacking weakened enemies, etc.
  - **Cats**: evasion / mischief — chance to dodge attacks, reflect damage,
    or randomly change targets.

---

## 3. Layout & Shell

### `src/components/layout/TopBar.jsx` ✅

**Role**
- Displays:
  - Logo “BD”
  - Game title + subtitle (“Prototype Deck Builder”)
  - Gold and Shards balances.

**Limitations / notes**
- Purely cosmetic; no click interactions, no tooltips.

**Refactor ideas**
- Hook into a future progression system:
  - Add hover tooltips describing how to earn/ spend gold & shards.
  - Show current chapter/level or player name on the right.

---

### `src/components/layout/TabBar.jsx` ✅

**Role**
- Three tabs:
  - `play` – campaign map
  - `collection` – card collection
  - `deck` – deck builder
- Calls `onChange(tabId)` when the user switches.

**Limitations / notes**
- No concept of “disabled” tabs based on progress.
- “Back” from battle doesn’t auto-switch tabs (App handles playMode separately).

**Refactor ideas**
- Let `App` drive which tabs are enabled based on campaign progress.
- Add optional icons or badges (e.g. deck invalid, new cards unlocked).

---

## 4. Deck Builder / Collection

### `src/components/deckbuilder/DeckBuilder.jsx` ✅

**Role**
- Main screen for both **Collection** and **Deck Builder** modes.
  - In `"collection"`: shows the full collection grid.
  - In `"deck"`: shows collection grid + right sidebar for the current deck.
- Core responsibilities:
  - Uses `cards`, `RACES`, `RARITIES`, `STARS` from `cards.js`.
  - Applies filters:
    - Race / rarity / stars / text search.
  - Builds **display cards** with upgrades factored in:
    - `getEffectiveLevel(baseCard, upgradesMap[id])`.
    - `getDisplayCard()` merges base stats + per-level increments + art by level.
    - Hides ability text if not yet unlocked.
  - Manages deck composition:
    - `deckCounts` map for how many copies of each card are in the deck.
    - Provides `onDeckChange` to update `playerDeck` in App.
  - Upgrade system:
    - Uses `upgrades` map to represent purchased upgrade steps.
    - Shows cost and level progression per card.
  - Inspection:
    - Uses `<CardInspect />` for a big zoomed view + evolution track.
  - Deck saving:
    - Uses `<DeckNameModal />` to capture a name.
    - Saves `{ deckName, deck: [ids], upgrades }` to `localStorage[STORAGE_KEY]`.

**Limitations / notes**
- `localStorage` save logic lives here **and** App knows about the same structure.
- Deck constraints are fairly loose:
  - No explicit per-card copy limit.
  - No maximum deck size enforced.
- “Start Match” button is currently a stub (just opens a modal).

**Refactor ideas**
- Extract `getEffectiveLevel` and `getDisplayCard` into a shared module like
  `src/game/cardModel.js` so battle code can use the *same* logic.
- Centralise deck I/O into `deckStorage.js`.
- Enforce deck rules:
  - `MIN_DECK_SIZE`, `MAX_DECK_SIZE`, maybe `MAX_DUPLICATES_PER_CARD`.
- Wire “Start Match” to actually call `onStartBattle` from App.

---

### `src/components/card/MonsterCard.jsx` ✅  
### `src/components/card/MonsterCard.css` ✅

**Role**
- Pure 2D card frame UI.
- Props:
  - `card` – a display card object.
  - `size` – `"normal"` or maybe `"small"` (used in various lists).
  - `isLeveling` – indicates if leveling up.
  - Additional event handlers (`onClick`, etc.) are passed via `...handlers`.
- Renders:
  - Name, cost, attack, health, race, rarity, stars, ability name/text, biome tags.
  - Background art and full art overlay when available.

**Limitations / notes**
- Rendering assumes card shape is consistent with `getDisplayCard`.
- No conditional styling based on in-game state (e.g. damaged, silenced).

**Refactor ideas**
- Augment to display **status badges** (burning, stunned, poisoned, etc.)
  once you add battle-state integration.

---

### `src/components/inspect/CardInspect.jsx` ✅  
### `src/components/inspect/CardInspect.css` ✅

**Role**
- Big modal that appears when a card is inspected from DeckBuilder.
- Left side:
  - Large `<MonsterCard />` display.
  - Evolution track (images for each level).
- Right side:
  - Lore, flavour text, ability details.
- Actions:
  - Add / remove from deck.
  - Level up (spend gold).

**Limitations / notes**
- Closely tied to DeckBuilder’s notion of upgrades and gold; not reused elsewhere.

**Refactor ideas**
- Could become a **generic “card detail” modal** used from:
  - Battle (inspect cards in your hand/field).
  - Campaign (inspect enemy bosses before fight).

---

### `src/components/ui/DeckNameModal.jsx` ✅

**Role**
- Generic modal for naming a deck.
- Manages its own `deckName` input, focusing/selecting field when opened.
- Calls `onConfirm(deckName)` on submit, `onClose` on cancel.

**Limitations / notes**
- Styling is reused from DeckBuilder’s `.db-button` classes, so it’s visually
  tied to the deckbuilder theme.

**Refactor ideas**
- Promote to a **generic modal shell** for other forms (e.g. rename deck, confirm
  deletion).

---

### `src/components/ui/DeckPreviewTooltip.jsx` ✅

**Role**
- Tooltip that shows **saved deck preview** when hovering the “Load” button.
- Reads `deckData.deck` (array of IDs), uses `cards` to find the first card,
  and shows:
  - Deck name
  - Deck size
  - First card’s art

**Limitations / notes**
- Validation is minimal:
  - Only checks that `deckData.deck` exists and that the **first** card ID exists.
  - It doesn’t guard against missing/invalid IDs deeper in the deck array.

**Refactor ideas**
- Expand validation to ensure **every** ID maps to a valid card.
- Show a small grid of the first N cards instead of just the first.

---

## 5. Campaign / Play

### `src/components/play/CampaignScreen.jsx` ✅  
### `src/components/play/CampaignScreen.css` ✅

**Role**
- Campaign map & level selection screen.
- Defines `CAMPAIGN_CHAPTERS` with chapters and levels:
  - Each level has id, name, difficulty, recommendedPower, staminaCost, rewards.
  - Also defines a “map graph” with nodes and positions for the map UI.
- Manages:
  - `activeChapterId`
  - `selectedLevelId`
- `handleStartFight`:
  - Calls `onStartBattle({ chapterId, levelId, chapter, level })`.

**Limitations / notes**
- Unlocking is mostly hard-coded (“first node unlocked”).
- Difficulty / power recommendations are not currently connected to:
  - Player deck strength.
  - Actual enemies spawned in battle.
- The “Auto” button does nothing yet.

**Refactor ideas**
- Link campaign level definitions to:
  - Actual enemy card sets (drawn from `cards.js`).
  - Environment (biome, time of day) to drive wolf/dog/snake/cat behaviors.
- Use recommended power as a comparison to a computed deck power score.

---

## 6. Battle System – Used Path

These are the components actually used when you click “Start fight” and App
switches to `playMode = "battle"`.

### `src/components/battle/BattleScreen.jsx` ✅

**Role**
- High-level 2D battle UI + **battle rules**.
- Owns battle state:
  - Player:
    - `playerHand` – some initial sample units.
    - `playerField` – 3 slots.
    - `playerGraveyard`.
  - Enemy:
    - `enemyField` – initial sample units.
    - `enemyGraveyard`.
  - Turn & phase:
    - `isPlayerTurn`
    - `battlePhase` (`"summonOrAttack"`, `"selectTarget"`, `"resolving"`,
      `"enemyTurn"`, etc.)
  - Selection & animation:
    - `selectedAttackerId`, `selectedTargetId`
    - `attackingUnitId`
    - `dyingUnits`
    - `attackAnimations`, `damageEffects`
- Implements simplified rules:
  - Summoning: player can move units from hand to field if a slot is empty.
  - Attacking:
    - Choose attacker and target.
    - Compute damage both ways.
    - Apply HP changes.
    - Push dead units into graveyards, trigger death animations.
  - Enemy turn: AI picks attackers/targets in a simple way.
- Renders:
  - Left side: 2D board “summary UI” for fields, hands, graveyard counts, stats.
  - Right side: `<Battlefield3D />` with 3D board.

**Limitations / notes**
- Signature is `export default function BattleScreen()` — it **ignores** props:
  - `playerDeck`, `upgrades`, `levelInfo` are passed from App but never used.
- Units are **hard-coded sample objects**, not derived from your deck system.
- Damage rules are generic; animal-specific behavior (wolves at night, etc.)
  is not implemented.

**Refactor ideas**
1. Change signature to accept props:
   ```js
   export default function BattleScreen({ playerDeck, upgrades, levelInfo, onExitBattle })











SYSTEM DESIGN
1) Each player starts with 6 cards in hand

PlayerHand = 6

EnemyHand = 6

2) Each player chooses 3 active field slots

PlayerField = 3 cards

EnemyField = 3 cards

3) The remaining 3 cards stay in reserve (bench)

PlayerBench = remaining cards

EnemyBench = remaining cards

4) Battle turns
Turn order:

Turn 1 = Player attacks

Turn 2 = Enemy attacks

Turn 3 = Player attacks

Turn 4 = Enemy attacks
(and so on)

What happens during an attack:

Player selects attacker from their 3 field cards

Player selects a target from opponent’s 3 field cards

Both cards deal damage → simultaneous resolve

defender.hp -= attacker.attack
attacker.hp -= defender.attack


Any killed cards → moved to graveyard

Battle animation:

✓ We will add a medieval-style “jump-hit-shake” animation, TCD style:

Attacker steps forward

Screen shake

Flash / slash effect

Numbers pop (damage)

Attacker steps back

(We can implement this easily using your 3D scene or even CSS animations first.)

✔️ 5) After every attack sequence, field auto-refills

If a field slot becomes empty:

We immediately refill BEFORE the next turn

This avoids complicated logic.

Rules:

If 1 card is missing → draw 1 from bench

If 2 cards missing → draw 2

If 3 cards missing → draw all 3

If bench is empty → slot stays empty

Why immediate refill?

Because:

It keeps the field full

Game stays fair

Easier to implement

Reduces weird double-death timing

✔️ 6) Win condition
If all 6 of your cards died → you lose.
If all 6 of enemy cards died → you win.


Simple.





1. Team structure

Each player brings a team of 6 beasts into battle.

At any time:

Up to 3 active on the field.

Remaining beasts are in hand / reserve (still visible in your current UI).

2. Turn structure

For each player’s turn:

Summon / Swap step

Once per turn, you may:

Summon 1 beast from hand into an empty field slot, or

Swap 1 field beast with 1 in hand.

Attack step

Choose one attacker among your field beasts.

Choose one enemy target (with certain restrictions like “Guard”).

When you hit ATTACK:

Attacker deals damage equal to its ATK to the target’s HP.

Target simultaneously deals damage equal to its ATK to the attacker’s HP.

Any beast with HP ≤ 0 goes to graveyard.

End step

Check passive effects that depend on board state (pack bonuses, alone bonuses, nightfall, etc.).

Win condition:

First player who has no beasts on field AND no beasts in hand loses.

This matches your current implementation quite closely; you’re already most of the way there.

3. Nature-based abilities (dogs, wolves, snakes, etc.)

Here’s a framework of ability types plus concrete examples you can implement later.

Global mechanics

Each beast has:
ATK, HP, Race (dog, wolf, snake, cat, bird, etc.), maybe Element.

Abilities are either:

Passive (always active when on field)

On Attack (trigger when card attacks)

On Death (trigger when it dies)

On Enter (trigger when summoned)

Dogs – Loyal / Allied

Flavor: Good boys, work better with allies, protect the team.

Example passives:

Pack Guardian (Dog)

Passive: As long as this Dog is on the field, the first time another allied beast would die each turn, reduce the damage so that it survives at 1 HP.

Allied Howl (Dog)

Passive: This Dog gains +1 ATK for each other allied Dog on the field (max +3).

Bodyguard (Dog)

Passive: If an allied beast with lower HP is chosen as a target, the opponent must target this Dog instead (classic “Taunt”).

Wolves – Lone vs Pack, night hunters

Flavor: Dangerous alone, terrifying in a pack or under night.

Introduce a simple Nightfall mechanic:

At turn 5, the battlefield becomes “Night” (or after X attacks total).

Wolves and Snakes get bonuses at night; maybe some other races lose stats slightly.

Example abilities:

Lone Howl (Wolf)

Passive: If this is your only beast on the field, it gains +3 ATK / +3 HP.

Pack Hunt (Wolf)

Passive: If you control 2 or more Wolves, all Wolves gain +1 ATK.

Night Stalker (Wolf)

Passive: During Night, this Wolf’s attacks ignore Guard and can target any enemy.

Snakes – Poison, betrayal, trickery

Flavor: Evil, high risk / high reward, hurt enemies and sometimes allies.

Example abilities:

Venom Bite (Snake)

On Attack: After dealing damage, if the target survives, reduce its ATK by 1 (stacking) to simulate “poison weakening”.

Cold Blood (Snake)

Passive: During Night, this Snake gains +2 ATK.

Betrayal (Snake)

On Attack: After resolving damage, if you have 3 or more beasts on the field, randomly deal 1 damage to one of your other beasts (could kill your own weak ally).

This makes Snakes strong but dangerous to play in big boards → nice tension.

Cats / Felines – Agile, evasive, smug 😼

Flavor: hard to hit, opportunistic.

Nine Lives (Cat)

Passive: The first time this Cat would die, instead set its HP to 1 and remove all debuffs (once per game).

Graceful Dodge (Cat)

On Defense: The first time each turn this Cat is attacked, reduce incoming damage by 50% (round up).

Pounce (Cat)

On Attack: If this Cat attacks an enemy with more ATK, it deals damage first (like “First Strike”).

Birds – Flying, backline snipers

Flavor: ignore frontline blockers.

Fly Over (Bird)

Passive: Can target any enemy, even if they have Guard / Taunt beasts.

Sky Scout (Bird)

On Enter: Look at the top 2 cards of your deck (in your game, maybe: “draw 1 extra card” or “get +1 energy next turn”).

Bears – Tanks

Flavor: soak damage, protect others.

Thick Hide (Bear)

Passive: Takes 1 less damage from all attacks (minimum 1).

Roar (Bear)

On Enter: Until your next turn, enemies must attack this Bear if able.

4. How this ties back into your current system

Right now, your core is already:

6 vs 6

3 on field, 3 in hand

choose attacker & target

both lose HP equal to opponent’s ATK

fight continues until one side has no beasts left

My suggestion is:

Keep this structure (it’s solid and already partly implemented).

Start by giving each race ONE passive based on the ideas above.

Later, extend with:

Nightfall after N turns

On-enter effects when summoned from hand

Legendary beasts with 2 abilities.