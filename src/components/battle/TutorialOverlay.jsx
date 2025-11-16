// src/components/battle/TutorialOverlay.jsx
import React, { useState } from "react";


// ============================================================================
// 13. MEDIEVAL TUTORIAL OVERLAY (text boxes controlling steps)
// ============================================================================
function TutorialOverlay({ active, step, hint, onNext, onFinish }) {
  const [ackSteps, setAckSteps] = useState({});

  // Steps where the player is supposed to click in the 3D scene
  const gatingSteps = [2, 3, 4, 5, 6];

  if (!active) return null;

  // If this is a gating step we've already "acknowledged" with Next,
  // hide the big blurred box and show only a tiny hint at the bottom
  if (gatingSteps.includes(step) && ackSteps[step]) {
    let hintText = "👉 Only the relevant cards (highlighted in the scene) will respond during this step.";

    if (step === 2) {
      hintText = "👉 Click the glowing hand card to play your first creature.";
    } else if (step === 3) {
      hintText = "👉 Now play a second card from your hand.";
    } else if (step === 4) {
      hintText = "👉 Play a third card from your hand.";
    } else if (step === 5) {
      hintText = "👉 Click one of YOUR frontline creatures to choose an attacker.";
    } else if (step === 6) {
      hintText = "👉 Now click an ENEMY creature to choose a target.";
    }

    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 30,
        }}
      >
        <div
          style={{
            position: "absolute",
            bottom: 40,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(0,0,0,0.75)",
            borderRadius: 8,
            border: "1px solid rgba(212,175,55,0.9)",
            padding: "6px 10px",
            color: "#f5e6c7",
            fontSize: 12,
            fontFamily: "Georgia, serif",
            boxShadow: "0 0 12px rgba(0,0,0,0.9)",
          }}
        >
          {hintText}
          {hint && (
            <span style={{ marginLeft: 6, color: "#ffb3a3" }}>Hint: {hint}</span>
          )}
        </div>
      </div>
    );
  }
    const handleNextClick = () => {
    // For gating steps, "Next" just dismisses the big box and blur,
    // but does NOT advance the tutorialStep in the parent.
    if (gatingSteps.includes(step)) {
      setAckSteps((prev) => ({ ...prev, [step]: true }));
      return;
    }

    // For pure story steps, keep the old behavior:
    onNext?.();
  };


  if (!active) return null;

  let title = "";
  let body = "";
  let showNext = false;
  let showFinish = false;
  let showClickReminder = false;

  switch (step) {
    case 0:
      title = "Chapter 1 – Darkwood";
      body =
        "The western Isles of the Sun. Cold rain, deep coniferous forests, and beasts that dislike uninvited guests.\n\n" +
        "This first battle is a guided skirmish. We’ll place creatures, attack, and read the battle log together.";
      showNext = true;
      break;
    case 1:
      title = "Your Hand and the Empty Frontline";
      body =
        "At the bottom you hold your starting hand of cards (up to six at the start of this battle).\n" +
        "In the middle, three empty slots are your frontline.\n\n" +
        "We’ll summon three creatures from your hand onto those slots.";
      showNext = true;
      break;
case 2:
  title = "Step 1 – Play Your First Creature";
  body =
    "Click a card in your glowing HAND to summon your first creature onto the wooden board.\n\n" +
    "The card with the blue aura and pointing finger is a good first choice, but any hand card will respond.";

  // no big click reminder here; small hint appears after Next
  showClickReminder = false;
  showNext = true;        // important!
  break;

    case 3:
      title = "Step 2 – Play Your Second Creature";
      body =
        "Now play a second card from your hand.\n\n" +
        "Once you see two creatures standing on your frontline, we’ll move on.";
        showClickReminder = false;
  showNext = true;        // important!
      break;
    case 4:
      title = "Step 3 – Play Your Third Creature";
      body =
        "Play a third card from your hand.\n\n" +
        "When you have three creatures on the board, we’ll choose an attacker.";
  showClickReminder = false;
  showNext = true;        // important!
      break;
    case 5:
      title = "Step 4 – Choose Your Attacker";
      body =
        "Click one of YOUR creatures on the frontline.\n\n" +
        "That card will become the attacker for this tutorial strike.";
  showClickReminder = false;
  showNext = true;        // important!
      break;
    case 6:
      title = "Step 5 – Choose an Enemy Target";
      body =
        "Click an ENEMY creature on their frontline.\n\n" +
        "Your chosen attacker will strike this target. Then we’ll zoom in on the clash.";
  showClickReminder = false;
  showNext = true;        // important!
      break;
    case 7:
      title = "The Clash";
      body =
        "You’ve just seen both cards exchange damage.\n\n" +
        "• Each card deals damage equal to its Attack (ATK).\n" +
        "• If damage ≥ remaining HP, that card dies and goes to the graveyard.\n\n" +
        "Next we’ll look at the log on the right.";
      showNext = true;
      break;
    case 8:
      title = "Reading the Battle Log";
      body =
        "On the right, the log writes entries like:\n" +
        "  Enemy: Dunecrest King hit Chainborn Whelp for 5 (HP → 0)\n\n" +
        "That means:\n" +
        "• WHO acted (Enemy or You)\n" +
        "• WHICH creature attacked\n" +
        "• WHICH creature was hit\n" +
        "• How much damage was dealt\n" +
        "• The target’s HP afterwards\n\n" +
        "If, in testing, you ever see the SAME line repeated dozens of times, it usually means the same attack is being resolved more than once in code.";
      showFinish = true;
      break;
    default:
      showFinish = true;
      title = "You Are Ready";
      body =
        "The Darkwood will not conquer itself.\n\n" +
        "The tutorial is now complete. Play the rest of this battle as you wish.";
      break;
  }

return (
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

      // NEW: darken + blur everything behind the overlay
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

        {/* Top ribbon: title bar */}
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

        {showClickReminder && (
          <div
            style={{
              marginTop: 6,
              padding: "6px 8px",
              borderRadius: 8,
              background: "rgba(0,0,0,0.4)",
              border: "1px dashed rgba(212,175,55,0.8)",
              fontSize: 12,
            }}
          >
            👉 Only the relevant cards (highlighted in the scene) will respond
            during this step.
            {hint && (
              <div style={{ marginTop: 4, color: "#ffb3a3" }}>Hint: {hint}</div>
            )}
          </div>
        )}

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
              onClick={onFinish}
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
  );
}


export default TutorialOverlay;