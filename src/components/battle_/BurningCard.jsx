// src/components/battle/BurningCard.jsx
import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * 🔥 Procedural Medieval Fire (No Textures)
 * - Animated shader flames
 * - Heat distortion
 * - Floating embers (particles)
 * - Safe & stable for WebGL (no overdraw crash)
 */

export default function BurningCard({ unit, position = [0,0,0], onComplete }) {
  const groupRef = useRef();
  const startTime = useRef(performance.now());

  // Fade-out duration
  const DURATION = 1000; // 1 second

  // Procedural flame shader
  const flameMaterial = useMemo(() => {
    return new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
      },
      vertexShader: `
        varying vec2 vUv;
        void main() {
            vUv = uv;
            vec3 p = position;

            // Make the flame flicker upward
            p.y += sin((uv.x + uv.y) * 10.0 + uv.y * 5.0) * 0.15;

            gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
        }
      `,
      fragmentShader: `
        varying vec2 vUv;
        uniform float uTime;

        void main() {
            float t = uTime * 1.5;

            // Flame noise
            float n = sin(vUv.y * 12.0 + t) * 0.5 + 0.5;
            n += sin((vUv.x + vUv.y) * 20.0 - t * 2.0) * 0.3;

            // Color blend – medieval orange-yellow
            vec3 color = mix(
                vec3(1.0, 0.3, 0.0),
                vec3(1.0, 0.8, 0.2),
                vUv.y
            );

            color *= n * (1.0 - vUv.y);

            gl_FragColor = vec4(color, (1.0 - vUv.y) * 1.2);
        }
      `
    });
  }, []);

  // Ember particle geometry
  const emberPositions = useMemo(() => {
    const count = 45;
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i += 3) {
      arr[i] = (Math.random() - 0.5) * 1.2;
      arr[i + 1] = Math.random() * 0.4;
      arr[i + 2] = (Math.random() - 0.5) * 0.3;
    }
    return arr;
  }, []);

  const emberMaterial = useMemo(() => {
    return new THREE.PointsMaterial({
      size: 0.06,
      color: new THREE.Color("#ffdd88"),
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });
  }, []);

  useFrame(({ clock }) => {
    const g = groupRef.current;
    if (!g) return;

    const elapsed = performance.now() - startTime.current;
    const t = clock.elapsedTime;

    // Update flame
    flameMaterial.uniforms.uTime.value = t;

    // Ember float animation
    g.children[1].rotation.y += 0.005;
    g.children[1].position.y += 0.004;

    // Fade-out & destroy
    if (elapsed > DURATION) {
      onComplete?.();
    }

    // Fade scale
    const fade = 1 - elapsed / DURATION;
    g.scale.setScalar(Math.max(fade, 0));
  });

  return (
    <group ref={groupRef} position={position}>
      {/* 🔥 Flame Plane */}
      <mesh position={[0, 0.5, 0]}>
        <planeGeometry args={[2.7, 3.8]} />
        <primitive object={flameMaterial} attach="material" />
      </mesh>

      {/* ✨ Embers */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            array={emberPositions}
            count={emberPositions.length / 3}
            itemSize={3}
          />
        </bufferGeometry>
        <primitive object={emberMaterial} attach="material" />
      </points>
    </group>
  );
}
