// src/components/battle/CardTooltip.jsx
import React from "react";
import { Html } from "@react-three/drei";

// ============================================================================
// 7. LEGACY CARD TOOLTIP (debug – kept but hidden)
// ============================================================================
function CardTooltip({ unit, visible }) {
  if (!visible || !unit) return null;
  const {
    name,
    cost,
    attack,
    health,
    race,
    rarity,
    stars,
    text,
    image,
    imageTop,
    maxHealth,
    description,
  } = unit;

  const MAX_STARS = 5;
  const dots = Array.from({ length: MAX_STARS });

  const rarityColors = {
    common: "#9e9e9e",
    rare: "#2196f3",
    epic: "#9c27b0",
    legendary: "#ff9800",
  };
  const rarityColor = rarityColors[rarity] || "#9e9e9e";

  return (
    <Html
      position={[0, 2.5, 0]}
      style={{
        pointerEvents: "none",
        transform: "translateX(-50%)",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          width: 280,
          background: "linear-gradient(to bottom, #1a1a2e, #16213e)",
          borderRadius: 12,
          overflow: "hidden",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.7)",
          border: `1px solid ${rarityColor}`,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "8px 12px",
            background: "rgba(0, 0, 0, 0.3)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 24,
              height: 24,
              borderRadius: "50%",
              background: "#333",
              color: "#fff",
              fontSize: 12,
              fontWeight: "bold",
            }}
          >
            {race ? race[0].toUpperCase() : "?"}
          </div>

          <div style={{ flex: 1, margin: "0 8px" }}>
            <div
              style={{
                color: "#fff",
                fontSize: 14,
                fontWeight: "bold",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {name}
            </div>
            <div style={{ display: "flex", marginTop: 2 }}>
              {dots.map((_, i) => (
                <span
                  key={i}
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    margin: "0 1px",
                    background: i < stars ? "#ffd700" : "#333",
                  }}
                />
              ))}
            </div>
          </div>

          <div
            style={{
              width: 28,
              height: 28,
              borderRadius: "50%",
              background: `radial-gradient(circle, ${rarityColor}, #000)`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#fff",
              fontSize: 14,
              fontWeight: "bold",
            }}
          >
            {cost}
          </div>
        </div>

        <div style={{ height: 120, position: "relative", overflow: "hidden" }}>
          {image && (
            <img
              src={image}
              alt={name}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          )}
          {imageTop && (
            <img
              src={imageTop}
              alt={name}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "contain",
                pointerEvents: "none",
              }}
            />
          )}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "40%",
              background:
                "linear-gradient(to top, rgba(0,0,0,0.8), transparent)",
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            padding: "8px 12px",
            background: "rgba(0, 0, 0, 0.5)",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginRight: "auto",
            }}
          >
            <span style={{ fontSize: 10, color: "#aaa" }}>ATK</span>
            <span style={{ fontSize: 16, fontWeight: "bold", color: "#ff5252" }}>
              {attack}
            </span>
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              marginLeft: "auto",
            }}
          >
            <span style={{ fontSize: 10, color: "#aaa" }}>HP</span>
            <span
              style={{ fontSize: 16, fontWeight: "bold", color: "#4caf50" }}
            >
              {health}/{maxHealth}
            </span>
          </div>
        </div>

        {text && (
          <div
            style={{
              padding: "8px 12px",
              background: "rgba(0, 0, 0, 0.3)",
              borderTop: `1px solid ${rarityColor}40`,
            }}
          >
            <div
              style={{
                fontSize: 12,
                color: "#ddd",
                fontStyle: "italic",
                lineHeight: 1.3,
              }}
            >
              {text}
            </div>
          </div>
        )}

        {description && (
          <div
            style={{
              padding: "8px 12px",
              background: "rgba(0, 0, 0, 0.3)",
              borderTop: `1px solid ${rarityColor}40`,
            }}
          >
            <div
              style={{
                fontSize: 11,
                color: "#bbb",
                lineHeight: 1.4,
              }}
            >
              {description}
            </div>
          </div>
        )}
      </div>
    </Html>
  );
}


export default CardTooltip;