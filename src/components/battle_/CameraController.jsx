// src/components/battle/CameraController.jsx

import { useEffect } from "react";
import { useThree, useFrame } from "@react-three/fiber";

/**
 * CameraController
 *
 * - Positions the camera based on zoomLevel + cameraRotation.
 * - Reports live camera position / FOV back to parent via onCameraUpdate
 *   so you can display the debug "CAMERA COORDINATES" panel.
 *
 * Props:
 *   zoomLevel        : number (0.6 = zoomed out, 1.0 = default, 1.5 = zoomed in)
 *   cameraRotation   : number (radians, 0 looks "forward" down the board)
 *   onCameraUpdate   : (info: { x, y, z, fov }) => void
 */
export default function CameraController({
  zoomLevel,
  cameraRotation,
  onCameraUpdate,
}) {
  const { camera } = useThree();

  // Every frame, push current camera info back up to Battlefield3D
  useFrame(() => {
    if (!camera) return;

    onCameraUpdate?.({
      x: camera.position.x,
      y: camera.position.y,
      z: camera.position.z,
      fov: camera.fov,
    });
  });

  // Whenever zoomLevel or rotation changes, recompute camera transform
  useEffect(() => {
    if (!camera) return;

    const baseDistance = 18;
    const distanceMultiplier = 2.8 - zoomLevel * 1.8;

    const cameraX =
      Math.sin(cameraRotation) * baseDistance * distanceMultiplier;
    const cameraZ =
      Math.cos(cameraRotation) * baseDistance * distanceMultiplier;

    // Slight vertical variation with zoom
    const cameraY = 10 + (zoomLevel - 0.7) * 3;

    camera.position.set(cameraX, cameraY, cameraZ);
    camera.lookAt(0, 0, 0);

    // Optional: tweak FOV with zoom if you want it
    camera.fov = 60 - zoomLevel * 10;
    camera.updateProjectionMatrix();
  }, [zoomLevel, cameraRotation, camera]);

  return null;
}
