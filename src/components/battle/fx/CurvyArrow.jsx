// src/components/fx/CurvyArrow.jsx

import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export default function CurvyArrow({ 
  start, 
  end, 
  color = '#ff0000ff', 
  opacity = 0.8, 
  width = 0.1,
  isTargeted = false,
  medievalStyle = true
}) {
  const arrowRef = useRef();
  
  // Create a curved path from start to end
  const { curve, points } = useMemo(() => {
    const startPoint = new THREE.Vector3(...start);
    const endPoint = new THREE.Vector3(...end);
    
    // Calculate control points for a quadratic bezier curve
    const midPoint = new THREE.Vector3()
      .addVectors(startPoint, endPoint)
      .multiplyScalar(0.5);
    
    // Add some height to make it curved
    midPoint.y += 2;
    
    const curve = new THREE.QuadraticBezierCurve3(
      startPoint,
      midPoint,
      endPoint
    );
    
    const points = curve.getPoints(50);
    
    return { curve, points };
  }, [start, end]);
  
  // Create tube geometry from the curve
  const geometry = useMemo(() => {
    return new THREE.TubeGeometry(curve, 20, width, 8, false);
  }, [curve, width]);
  
  // Animate the arrow
  useFrame((state) => {
    if (!arrowRef.current) return;
    
    // Add a subtle pulsing effect, more pronounced for targeted arrows
    const pulseIntensity = isTargeted ? 0.1 : 0.05;
    const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * pulseIntensity;
    arrowRef.current.scale.set(scale, scale, scale);
  });
  
  // Medieval-style material with texture pattern
  const material = useMemo(() => {
    // Create a canvas for the medieval pattern
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const context = canvas.getContext('2d');
    
    // Base color
    context.fillStyle = color;
    context.fillRect(0, 0, 256, 256);
    
    // Add medieval pattern
    context.strokeStyle = isTargeted ? '#0a5f0a' : '#4a4a4a';
    context.lineWidth = 2;
    
    // Draw a pattern
    for (let i = 0; i < 16; i++) {
      context.beginPath();
      context.moveTo(i * 16, 0);
      context.lineTo(i * 16, 256);
      context.stroke();
      
      context.beginPath();
      context.moveTo(0, i * 16);
      context.lineTo(256, i * 16);
      context.stroke();
    }
    
    // Add some decorative elements
    context.fillStyle = isTargeted ? '#0a5f0a' : '#ff0000ff';
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        if ((i + j) % 2 === 0) {
          context.fillRect(i * 32, j * 32, 16, 16);
        }
      }
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    
    return new THREE.MeshStandardMaterial({
      map: texture,
      transparent: true,
      opacity: isTargeted ? opacity * 1.5 : opacity * 0.6,
      side: THREE.DoubleSide,
      metalness: 0.3,
      roughness: 0.7,
      emissive: isTargeted ? new THREE.Color(color) : new THREE.Color(0x000000),
      emissiveIntensity: isTargeted ? 0.3 : 0.1
    });
  }, [color, opacity, isTargeted]);
  
  // Create arrowhead at the end
  const arrowheadGeometry = useMemo(() => {
    return new THREE.ConeGeometry(width * 2, width * 3, 4);
  }, [width]);
  
  // Calculate arrowhead position and rotation
  const { arrowheadPosition, arrowheadRotation } = useMemo(() => {
    const lastPoint = points[points.length - 1];
    const secondLastPoint = points[points.length - 2];
    
    const direction = new THREE.Vector3()
      .subVectors(lastPoint, secondLastPoint)
      .normalize();
    
    const arrowheadPosition = new THREE.Vector3()
      .addVectors(lastPoint, direction.clone().multiplyScalar(width * 1.5));
    
    // Calculate rotation to align with direction
    const quaternion = new THREE.Quaternion();
    const up = new THREE.Vector3(0, 1, 0);
    quaternion.setFromUnitVectors(up, direction);
    
    const arrowheadRotation = new THREE.Euler().setFromQuaternion(quaternion);
    
    return { arrowheadPosition, arrowheadRotation };
  }, [points, width]);
  
  return (
    <group>
      <mesh ref={arrowRef} geometry={geometry} material={material} />
      <mesh 
        position={arrowheadPosition} 
        rotation={arrowheadRotation}
        geometry={arrowheadGeometry}
        material={material}
      />
    </group>
  );
}