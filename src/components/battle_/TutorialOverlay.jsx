// src/components/battle/TutorialOverlay.jsx
import React, { useState } from "react";
import "./TutorialOverlay.css";

/**
 * MEDIEVAL TUTORIAL OVERLAY
 *
 * This version is intentionally SIMPLE:
 * - Steps 0–7 only.
 * - No extra “Enemy’s Turn / Taking Damage / Finish It!” chain.
 * - Step 7 explains:
 *    • ATK vs HP
 *    • Burning card → Graveyard
 *    • How to read Battle Log
 *
 * Battlefield3D controls:
 *   - `active` (show/hide)
 *   - `step` (0..7)
 *   - `onNext` and `onFinish`
 */

function TutorialOverlay({ active, step, hint, onNext, onFinish }) {
  const [ackSteps, setAckSteps] = useState({});
  const [locallyFinished, setLocallyFinished] = useState(false);

  // Steps where we want to hide the big box after “Next”
  // so the player can clearly click in 3D.
  const gatingSteps = [2, 3, 4, 5, 6];

  // If the tutorial is not active or user finished it locally, show nothing.
  if (!active || locallyFinished) return null;

  // If this is a gating step that has already been acknowledged by "Next",
  // we show only a small hint bar at the bottom of the screen.
  if (gatingSteps.includes(step) && ackSteps[step]) {
    let hintText =
      "👉 Only the relevant cards (highlighted in the scene) will respond during this step.";

    if (step === 2) {
      hintText = "👉 Click a glowing hand card to play your first creature.";
    } else if (step === 3) {
      hintText = "👉 Now play a second creature from your hand.";
    } else if (step === 4) {
      hintText = "👉 Play a third creature to fill your frontline.";
    } else if (step === 5) {
      hintText = "👉 Click one of YOUR frontline creatures to choose an attacker.";
    } else if (step === 6) {
      hintText = "👉 Click an ENEMY creature to choose your target.";
    }

    return (
      <div className="tutorial-hint-container">
        <div className="tutorial-hint-box">
          {hintText}
          {hint && <span className="tutorial-hint-text">Hint: {hint}</span>}
        </div>
      </div>
    );
  }

  // Handle NEXT button
  const handleNextClick = () => {
    // For gating steps, "Next" just dismisses the big box (keeps same step)
    // and lets Battlefield3D advance the step when the player performs
    // the required action.
    if (gatingSteps.includes(step)) {
      setAckSteps((prev) => ({ ...prev, [step]: true }));
      return;
    }

    // For regular steps, ask parent to go to the next step.
    onNext?.();
  };

  // Handle FINISH button
  const handleFinishClick = () => {
    // Let parent know we’re done
    if (onFinish) onFinish();
    // And always hide locally so we don’t get stuck with an overlay
    setLocallyFinished(true);
  };

  let title = "";
  let body = "";
  let showNext = false;
  let showFinish = false;
  let isFireStep = false; // can be used for special CSS if you want

  switch (step) {
    case 0:
      title = "Chapter 1 – Darkwood";
      body =
        "The western Isles of the Sun. Cold rain, deep coniferous forests, " +
        "and beasts that dislike uninvited guests.\n\n" +
        "This first skirmish is guided. We’ll place creatures, launch an attack, " +
        "and read the battle log together.";
      showNext = true;
      break;

    case 1:
      title = "Your Hand and Frontline";
      body =
        "At the bottom you see your starting hand of cards.\n" +
        "In the middle, the three empty slots form your frontline.\n\n" +
        "We’ll summon three creatures from your hand onto those slots.";
      showNext = true;
      break;

    case 2:
      title = "Step 1 – Play Your First Creature";
      body =
        "Click a card in your glowing HAND to summon your first creature " +
        "onto the wooden board.\n\n" +
        "Once it stands on the frontline, we’ll move on.";
      showNext = true;
      break;

    case 3:
      title = "Step 2 – Play a Second Creature";
      body =
        "Now play a second card from your hand.\n\n" +
        "You’re building a small pack to face the enemy.";
      showNext = true;
      break;

    case 4:
      title = "Step 3 – Fill Your Frontline";
      body =
        "Play a third card from your hand.\n\n" +
        "With three creatures on the frontline, you’re ready to strike.";
      showNext = true;
      break;

    case 5:
      title = "Step 4 – Choose Your Attacker";
      body =
        "Click one of YOUR frontline creatures.\n\n" +
        "That card will become your attacker for this tutorial strike.";
      showNext = true;
      break;

    case 6:
      title = "Step 5 – Choose an Enemy Target";
      body =
        "Click an ENEMY creature in their frontline.\n\n" +
        "Your chosen attacker will strike this target. The clash will follow.";
      showNext = true;
      break;

    case 7:
      // This is the key “Clash & Graveyard & Log” step you asked for.
      title = "The Clash, the Flames, and the Log";
      body =
        "You’ve just seen both cards exchange damage.\n\n" +
        "• Each card deals damage equal to its Attack (ATK).\n" +
        "• The damage is subtracted from the target’s HP.\n" +
        "• If damage is enough to bring HP to 0, that creature is defeated.\n\n" +
        "When a creature falls, you’ll often see it burn away – that is the " +
        "moment it leaves the board and is sent to the Graveyard.\n\n" +
        "On the right, the Battle Log writes lines such as:\n" +
        "  Enemy: Dunecrest King hit Chainborn Whelp for 5 (HP → 0)\n\n";
      showFinish = true;
      isFireStep = true; // optional use in CSS for a fiery frame
      break;

    default:
      // Safety fallback – let player close tutorial if some unknown step pops up
      title = "You Are Ready";
      body =
        "The Darkwood will not conquer itself.\n\n" +
        "The tutorial is complete. Play the rest of this battle as you wish.";
      showFinish = true;
      break;
  }

  const overlayClass = isFireStep ? "tutorial-box-fire" : "";

  return (
    <div className="tutorial-overlay-base">
      <div className={`tutorial-box ${overlayClass}`}>
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "flex-start",
            paddingTop: 40,
            zIndex: 30,
            pointerEvents: "none",
            background: "rgba(0, 0, 0, 0.45)",
            backdropFilter: "blur(4px)",
          }}
        >
          <div
            style={{
              pointerEvents: "auto",
              maxWidth: 500,
              background:
                "linear-gradient(135deg, rgba(32,24,16,0.96), rgba(10,6,3,0.98))",
              borderRadius: 12,
              border: "2px solid #d4af37",
              boxShadow:
                "0 0 24px rgba(0,0,0,0.9), inset 0 0 8px rgba(0,0,0,0.7)",
              padding: "18px 20px 16px",
              color: "#f5e6c7",
              fontFamily: "Georgia, serif",
              position: "relative",
            }}
          >
            {/* Top ribbon */}
            <div
              style={{
                position: "absolute",
                top: -12,
                left: 20,
                right: 20,
                height: 24,
                borderRadius: 12,
                background:
                  "linear-gradient(90deg, rgba(120,86,40,1), rgba(180,130,60,1))",
                border: "1px solid #d4af37",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: "bold",
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#1a0f05",
              }}
            >
              Darkwood Tutorial
            </div>

            {/* Title */}
            <h3
              style={{
                marginTop: 18,
                marginBottom: 8,
                fontSize: 18,
                color: "#ffe9a3",
              }}
            >
              {title}
            </h3>

            {/* Body */}
            <p
              style={{
                whiteSpace: "pre-wrap",
                fontSize: 13,
                lineHeight: 1.5,
                marginBottom: 8,
              }}
            >
              {body}
            </p>

            {/* Buttons */}
            <div
              style={{
                marginTop: 10,
                display: "flex",
                justifyContent: "flex-end",
                gap: 10,
              }}
            >
              {showNext && (
                <button
                  onClick={handleNextClick}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 8,
                    border: "1px solid #d4af37",
                    background: "linear-gradient(180deg, #f4d582, #c5973d)",
                    color: "#22130b",
                    fontSize: 12,
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  Next
                </button>
              )}

              {showFinish && (
                <button
                  onClick={handleFinishClick}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 8,
                    border: "1px solid #6bcf7f",
                    background: "linear-gradient(180deg, #9be08f, #54b864)",
                    color: "#0a150a",
                    fontSize: 12,
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  Finish Tutorial
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TutorialOverlay;
