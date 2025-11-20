// ============================================================================
// BurningCardFX.jsx
// Fully procedural medieval fire VFX for card death animations.
// No textures. No external deps. GPU-stable.
// ============================================================================

import React, { useRef, useEffect } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

// Utility: random range
const rand = (a, b) => a + Math.random() * (b - a);

// ============================================================================
// 1. Procedural Flame Shader Material
// Gothic flame with animated noise + glow
// ============================================================================
const FlameMaterial = new THREE.ShaderMaterial({
  transparent: true,
  depthWrite: false,
  blending: THREE.AdditiveBlending,
  uniforms: {
    time: { value: 0 },
    intensity: { value: 1 },
  },
  vertexShader: `
    varying vec2 vUv;
    varying float vHeight;

    void main() {
      vUv = uv;
      vHeight = position.y; 
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    varying float vHeight;

    uniform float time;
    uniform float intensity;

    // Classic cheap noise
    float hash(vec2 p) {
      return fract(sin(dot(p, vec2(12.9898,78.233))) * 43758.5453);
    }

    float noise(vec2 p) {
      vec2 i = floor(p);
      vec2 f = fract(p);
      float a = hash(i);
      float b = hash(i + vec2(1.0, 0.0));
      float c = hash(i + vec2(0.0, 1.0));
      float d = hash(i + vec2(1.0, 1.0));
      vec2 u = f * f * (3.0 - 2.0 * f);
      return mix(a, b, u.x) + (c - a) * u.y * (1.0 - u.x)
           + (d - b) * u.x * u.y;
    }

    void main() {
      float n = noise(vUv * 4.0 + time * 1.5);
      float flameShape = smoothstep(0.1, 1.0, vUv.y + n * 0.25);

      vec3 color =
        mix(vec3(0.9, 0.3, 0.05), vec3(1.0, 0.8, 0.3), vUv.y) *
        flameShape * intensity;

      float alpha = flameShape * intensity;

      gl_FragColor = vec4(color, alpha);
    }
  `,
});

// ============================================================================
// 2. Smoke Particle Material (soft black-purple)
// ============================================================================
const SmokeMaterial = new THREE.ShaderMaterial({
  transparent: true,
  depthWrite: false,
  uniforms: {
    time: { value: 0 },
  },
  vertexShader: `
    varying vec2 vUv;
    varying float vy;
    void main() {
      vUv = uv;
      vy = position.y;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
    }
  `,
  fragmentShader: `
    varying vec2 vUv;
    varying float vy;
    uniform float time;

    void main() {
      float d = 1.0 - distance(vUv, vec2(0.5));
      float puff = smoothstep(0.0, 0.7, d);
      float alpha = puff * 0.6 * (1.0 - vy);

      vec3 col = vec3(0.05, 0.02, 0.04);

      gl_FragColor = vec4(col, alpha);
    }
  `,
});

// ============================================================================
// 3. Ember Particles (gpu-instanced quads)
// ============================================================================
function EmberParticles() {
  const COUNT = 40;
  const refs = useRef([]);

  useEffect(() => {
    refs.current = refs.current.slice(0, COUNT);
  }, []);

  useFrame((_, dt) => {
    refs.current.forEach((m) => {
      if (!m) return;
      m.position.y += dt * m.userData.vy;
      m.position.x += dt * m.userData.vx;
      m.position.z += dt * m.userData.vz;
      m.material.opacity -= dt * 0.35;

      if (m.material.opacity <= 0) {
        m.position.set(rand(-1, 1), 0, rand(-1, 1));
        m.material.opacity = 1;
      }
    });
  });

  return (
    <group>
      {Array.from({ length: COUNT }).map((_, i) => (
        <mesh
          key={i}
          ref={(el) => (refs.current[i] = el)}
          position={[rand(-1, 1), rand(0, 0.2), rand(-1, 1)]}
          userData={{
            vy: rand(0.6, 1.2),
            vx: rand(-0.2, 0.2),
            vz: rand(-0.2, 0.2),
          }}
        >
          <planeGeometry args={[0.12, 0.12]} />
          <meshBasicMaterial
            color="#ffb37a"
            transparent
            opacity={1}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

// ============================================================================
// 4. BurningCardFX (main component)
// Card size reference: 2.8 × 4.3 × 0.25 (Option B envelope)
// ============================================================================
export default function BurningCardFX({ onComplete }) {
  const group = useRef();
  const time = useRef(0);

  useFrame((_, dt) => {
    time.current += dt;

    // Update shaders
    FlameMaterial.uniforms.time.value = time.current;
    SmokeMaterial.uniforms.time.value = time.current;

    // Fade-out over 1.4s
    const fade = Math.max(0, 1 - time.current / 1.4);
    FlameMaterial.uniforms.intensity.value = fade;

    group.current.position.y += dt * 0.2; // slight rising effect

    if (fade <= 0.01 && onComplete) onComplete();
  });

  return (
    <group ref={group}>
      {/* Flame wrap around card */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[2.8, 4.3, 0.25]} />
        <primitive object={FlameMaterial.clone()} attach="material" />
      </mesh>

      {/* Smoke column */}
      <mesh position={[0, 2.0, 0]}>
        <planeGeometry args={[2.5, 5]} />
        <primitive object={SmokeMaterial.clone()} attach="material" />
      </mesh>

      {/* Embers */}
      <EmberParticles />
    </group>
  );
}
