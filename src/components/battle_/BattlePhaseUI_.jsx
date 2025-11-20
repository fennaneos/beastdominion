// ---------------------------------------------------------------------------
// BattlePhaseUI.jsx — COMPLETE REWRITE
// ---------------------------------------------------------------------------
// This UI sits OVER the 3D battlefield, and controls:
//  • Current Phase ("Choose an attacker", "Choose target", "Enemy turn"...)
//  • Turn banner
//  • Attack button activation
//  • Tutorial hints
//  • Player lockouts
// ---------------------------------------------------------------------------

import React from "react";
import { Html } from "@react-three/drei";
import "./BattlePhaseUI_.css";

export default function BattlePhaseUI({
  phase,
  isPlayerTurn,
  selectedAttackerId,
  selectedTargetId,
  onAttackConfirm,
  tutorialStep,
  isTutorialActive
}) {


}
