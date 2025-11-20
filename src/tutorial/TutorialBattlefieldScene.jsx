// src/tutorial/TutorialScreen.jsx
// Top-level tutorial experience. Hosts the 3D battlefield and overlays.

import React, { useState, useEffect, useCallback, useRef } from "react";
import TutorialBattlefield3D from "./TutorialBattlefield3D";
import TutorialOverlay from "./TutorialOverlay";
import { TutorialController } from "./TutorialController";
import { MedievalSounds } from "./MedievalSounds";
import { createTutorialDeck, initialTutorialState } from "./TutorialUtils";

export default function TutorialScreen({ onComplete }) {
  const controllerRef = useRef(null);
  if (!controllerRef.current) {
    controllerRef.current = new TutorialController();
  }
  const controller = controllerRef.current;

  const [tutorialState, setTutorialState] = useState(initialTutorialState());
  const [battleState, setBattleState] = useState(() =>
    controller.bootstrapBattle(createTutorialDeck())
  );
  const [currentStep, setCurrentStep] = useState(controller.getCurrentStep());
  const [locked, setLocked] = useState(false);

  // Attach sounds & listeners
  useEffect(() => {
    const sounds = new MedievalSounds();
    controller.attachSounds(sounds);

    const handleStep = (step) => setCurrentStep(step);
    const handleBattle = (b) => setBattleState({ ...b });
    const handleLock = (v) => setLocked(v);

    controller.on("step", handleStep);
    controller.on("battle", handleBattle);
    controller.on("lock", handleLock);

    controller.start(tutorialState, battleState);

    return () => {
      controller.off("step", handleStep);
      controller.off("battle", handleBattle);
      controller.off("lock", handleLock);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCardClick = useCallback(
    (info) => {
      const result = controller.handleCardClick(
        info,
        battleState,
        tutorialState
      );
      if (!result) return;
      setBattleState({ ...result.battle });
      setTutorialState({ ...result.tutorial });
    },
    [battleState, tutorialState, controller]
  );

  const handleContinue = useCallback(() => {
    const done = controller.nextStep(battleState, tutorialState);
    if (done && typeof onComplete === "function") {
      onComplete({ reward: "medieval_reward_chest" });
    }
  }, [battleState, tutorialState, controller, onComplete]);

  const handleAttack = useCallback(() => {
    const result = controller.executeAttack(battleState, tutorialState);
    if (!result) return;
    setBattleState({ ...result.battle });
    setTutorialState({ ...result.tutorial });
  }, [battleState, tutorialState, controller]);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        background: "radial-gradient(circle at top, #3b2c1a 0%, #080608 60%)",
        overflow: "hidden",
      }}
    >
      <TutorialBattlefield3D
        battleState={battleState}
        tutorialState={tutorialState}
        step={currentStep}
        onCardClick={handleCardClick}
      />

      <TutorialOverlay
        step={currentStep}
        locked={locked}
        onContinue={handleContinue}
        onSkip={() => onComplete && onComplete({ skipped: true })}
        onAttack={handleAttack}
      />
    </div>
  );
}
