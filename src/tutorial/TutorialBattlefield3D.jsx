// src/tutorial/TutorialBattlefield3D.jsx

import React, { Suspense, useState, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import TutorialBattlefieldScene from "./TutorialBattlefieldScene";

export default function TutorialBattlefield3D({
  battleState,
  step,
  tutorialState,
  onCardClick,
}) {
  const [zoomLevel, setZoomLevel] = useState(0.9);
  const [cameraRotation, setCameraRotation] = useState(0);

  const baseDistance = 14;
  const distanceMultiplier = 2.4 - zoomLevel * 1.4;
  const cameraX = Math.sin(cameraRotation) * baseDistance * distanceMultiplier;
  const cameraZ = Math.cos(cameraRotation) * baseDistance * distanceMultiplier;
  const cameraY = 9 + (zoomLevel - 0.9) * 4;

  const cameraPosition = useMemo(
    () => [cameraX, cameraY, cameraZ],
    [cameraX, cameraY, cameraZ]
  );
  const cameraFov = 55 - zoomLevel * 8;

  const applyZoom = (value) => {
    setZoomLevel((prev) => {
      const next = typeof value === "number" ? value : prev + value;
      return Math.min(1.5, Math.max(0.5, next));
    });
  };

  const rotate = (delta) => {
    setCameraRotation((prev) => prev + delta);
  };

  return (
    <div style={{ width: "100%", height: "100%", position: "absolute", inset: 0 }}>
      {/* Camera controls */}
      <div
        style={{
          position: "absolute",
          top: 16,
          right: 16,
          zIndex: 20,
          display: "flex",
          flexDirection: "column",
          gap: 8,
          minWidth: 200,
          fontFamily: "Cinzel, serif",
        }}
      >
        <div
          style={{
            padding: "6px 10px",
            borderRadius: 999,
            border: "1px solid rgba(240,208,144,0.8)",
            background:
              "linear-gradient(90deg, rgba(58,38,19,0.96), rgba(27,18,10,0.96))",
            color: "#f8e6c6",
            fontSize: 12,
            letterSpacing: "0.08em",
            textAlign: "center",
            textTransform: "uppercase",
            boxShadow: "0 0 16px rgba(0,0,0,0.6)",
          }}
        >
          Camera
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <button
            onClick={() => applyZoom(0.6)}
            style={{
              padding: "5px 8px",
              borderRadius: 6,
              border: "1px solid #f1d08b",
              background:
                zoomLevel <= 0.65
                  ? "linear-gradient(90deg, #f2d392, #f8e3b7)"
                  : "rgba(25,17,11,0.95)",
              color: zoomLevel <= 0.65 ? "#3b2613" : "#f8e6c6",
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            − Zoom Out
          </button>
          <button
            onClick={() => applyZoom(0.9)}
            style={{
              padding: "5px 8px",
              borderRadius: 6,
              border: "1px solid #f1d08b",
              background:
                zoomLevel > 0.65 && zoomLevel < 1.1
                  ? "linear-gradient(90deg, #f2d392, #f8e3b7)"
                  : "rgba(25,17,11,0.95)",
              color:
                zoomLevel > 0.65 && zoomLevel < 1.1 ? "#3b2613" : "#f8e6c6",
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            ◎ Default
          </button>
          <button
            onClick={() => applyZoom(1.3)}
            style={{
              padding: "5px 8px",
              borderRadius: 6,
              border: "1px solid #f1d08b",
              background:
                zoomLevel >= 1.1
                  ? "linear-gradient(90deg, #f2d392, #f8e3b7)"
                  : "rgba(25,17,11,0.95)",
              color: zoomLevel >= 1.1 ? "#3b2613" : "#f8e6c6",
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            + Zoom In
          </button>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => rotate(-Math.PI / 8)}
            style={{
              flex: 1,
              padding: "5px 6px",
              borderRadius: 6,
              border: "1px solid #f1d08b",
              background: "rgba(25,17,11,0.95)",
              color: "#f8e6c6",
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            ◀
          </button>
          <button
            onClick={() => rotate(Math.PI / 8)}
            style={{
              flex: 1,
              padding: "5px 6px",
              borderRadius: 6,
              border: "1px solid #f1d08b",
              background: "rgba(25,17,11,0.95)",
              color: "#f8e6c6",
              fontSize: 11,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            ▶
          </button>
        </div>
      </div>

      <Canvas
        camera={{ position: cameraPosition, fov: cameraFov }}
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true }}
      >
        <color attach="background" args={["#050308"]} />
        <ambientLight intensity={0.5} />
        <directionalLight
          position={[5, 10, 5]}
          intensity={1.1}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        <Suspense fallback={null}>
          <TutorialBattlefieldScene
            battleState={battleState}
            step={step}
            tutorialState={tutorialState}
            onCardClick={onCardClick}
          />
        </Suspense>
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.2}
        />
      </Canvas>
    </div>
  );
}
