// src/tutorial/TutorialOverlay.jsx
// Top tutorial UI: blur background except focus zone, text at top.

import React from "react";

export default function TutorialOverlay({
  step,
  locked,
  onContinue,
  onSkip,
  onAttack,
}) {
  if (!step) return null;

  const { title, description, isFinal, focus, hasAttackButton } = step;

  const renderFocusMask = () => {
    if (!focus) return null;

    return (
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          zIndex: 1,
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            backdropFilter: "blur(3px)",
          }}
        />
        {focus === "playerHand" && (
          <div
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              bottom: "6%",
              width: "70%",
              height: "22%",
              borderRadius: 24,
              border: "2px solid #f1d08b",
              boxShadow:
                "0 0 30px rgba(0,0,0,0.9), 0 0 40px rgba(241,208,139,0.8)",
            }}
          />
        )}
        {focus === "playerField" && (
          <div
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              bottom: "32%",
              width: "55%",
              height: "20%",
              borderRadius: 24,
              border: "2px solid #f1d08b",
              boxShadow:
                "0 0 30px rgba(0,0,0,0.9), 0 0 40px rgba(241,208,139,0.8)",
            }}
          />
        )}
        {focus === "enemyField" && (
          <div
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              top: "16%",
              width: "55%",
              height: "20%",
              borderRadius: 24,
              border: "2px solid #f1d08b",
              boxShadow:
                "0 0 30px rgba(0,0,0,0.9), 0 0 40px rgba(241,208,139,0.8)",
            }}
          />
        )}
        {focus === "attackButton" && (
          <div
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              top: "32%",
              width: "260px",
              height: "56px",
              borderRadius: 999,
              border: "2px solid #f1d08b",
              boxShadow:
                "0 0 30px rgba(0,0,0,0.9), 0 0 40px rgba(241,208,139,0.8)",
            }}
          />
        )}
      </div>
    );
  };

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        zIndex: 10,
      }}
    >
      {renderFocusMask()}

      {/* Everything is at the top now */}
      <div
        style={{
          marginTop: 16,
          maxWidth: 720,
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          pointerEvents: "auto",
          position: "relative",
          zIndex: 2,
        }}
      >
        <div
          style={{
            padding: "8px 18px",
            borderRadius: 999,
            border: "1px solid rgba(255,230,180,0.7)",
            background:
              "linear-gradient(90deg, rgba(69,46,24,0.94), rgba(43,29,21,0.96))",
            boxShadow: "0 0 18px rgba(0,0,0,0.6)",
            color: "#f8e6c6",
            fontFamily: "'Cinzel', serif",
            fontSize: 14,
            letterSpacing: "0.08em",
            marginBottom: 8,
          }}
        >
          {title || "Tutorial"}
        </div>

        <div
          style={{
            padding: "12px 16px 10px",
            borderRadius: 16,
            border: "2px solid #c29c67",
            background:
              "radial-gradient(circle at top, #f7e7c7, #e0c396 70%, #b8905b)",
            boxShadow:
              "0 8px 30px rgba(0,0,0,0.8), inset 0 0 20px rgba(151,102,45,0.5)",
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 16,
            lineHeight: 1.35,
            color: "#2b1b10",
            width: "100%",
          }}
        >
          <p style={{ margin: 0 }}>{description}</p>
          <div
            style={{
              display: "flex",
              justifyContent: "flex-end",
              gap: 8,
              marginTop: 10,
            }}
          >
            <button
              onClick={onSkip}
              style={{
                padding: "4px 10px",
                borderRadius: 999,
                border: "1px solid rgba(0,0,0,0.2)",
                background: "rgba(0,0,0,0.1)",
                color: "#3b2613",
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              Skip tutorial
            </button>

            {hasAttackButton && (
              <button
                onClick={onAttack}
                style={{
                  padding: "4px 14px",
                  borderRadius: 999,
                  border: "1px solid #e8523c",
                  background:
                    "linear-gradient(90deg, #f53d3d, #ff8a4a)",
                  color: "#fff5e2",
                  fontWeight: 800,
                  fontSize: 13,
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  boxShadow:
                    "0 3px 12px rgba(0,0,0,0.6), 0 0 16px rgba(255,80,60,0.8)",
                }}
              >
                ⚔ Attack
              </button>
            )}

            <button
              onClick={onContinue}
              disabled={locked}
              style={{
                padding: "4px 14px",
                borderRadius: 999,
                border: "1px solid #f1d08b",
                background: locked
                  ? "linear-gradient(90deg, #7d6b4b, #6d5a3f)"
                  : "linear-gradient(90deg, #f2d392, #f8e3b7)",
                color: locked ? "#c0b08a" : "#3b2613",
                fontWeight: 700,
                fontSize: 13,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                cursor: locked ? "default" : "pointer",
                boxShadow: locked
                  ? "0 2px 4px rgba(0,0,0,0.3)"
                  : "0 3px 10px rgba(0,0,0,0.5)",
              }}
            >
              {isFinal ? "Finish" : "Continue"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
