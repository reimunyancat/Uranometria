import { useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { StarSystem } from "@/lib/galaxy";

function Star({
  system,
  onSelect,
}: {
  system: StarSystem;
  onSelect: (s: StarSystem) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const lightRef = useRef<THREE.PointLight>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const baseColor = useRef(new THREE.Color(system.color));
  useFrame(({ clock }) => {
    if (system.activity <= 0) return;
    const pulse = 0.5 + 0.5 * Math.sin(clock.elapsedTime * 3);
    const boost = 1 + system.activity * pulse * 1.5;
    if (meshRef.current) {
      const mat = meshRef.current.material as THREE.MeshBasicMaterial;
      mat.color.copy(baseColor.current).multiplyScalar(boost);
    }
    if (lightRef.current) {
      lightRef.current.intensity = system.size * 6 * boost;
    }
  });
  return (
    <group position={system.position}>
      <mesh
        ref={meshRef}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => onSelect(system)}
      >
        <sphereGeometry args={[system.size, 32, 32]} />
        <meshBasicMaterial color={system.color} />
      </mesh>
      <pointLight
        ref={lightRef}
        intensity={system.size * 6}
        distance={system.size * 12}
        color={system.color}
      />
      {hovered && (
        <Html center distanceFactor={40} style={{ pointerEvents: "none" }}>
          <div
            style={{
              background: "#141414",
              border: "1px solid #2a2a2a",
              padding: "6px 10px",
              color: "#e5e5e5",
              fontSize: 13,
              whiteSpace: "nowrap",
            }}
          >
            <strong>{system.name}</strong>
            <span style={{ color: "#8b8b8b" }}>
              {" "}
              · {system.language ?? "Unknown"} · {system.stars} stars ·{" "}
              {system.constellation}
            </span>
          </div>
        </Html>
      )}
    </group>
  );
}

export default function StarField({
  systems,
  onSelect,
}: {
  systems: StarSystem[];
  onSelect: (s: StarSystem) => void;
}) {
  return (
    <>
      {systems.map((s) => (
        <Star key={s.name} system={s} onSelect={onSelect} />
      ))}
    </>
  );
}
