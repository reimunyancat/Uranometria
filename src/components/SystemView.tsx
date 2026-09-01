"use client";
import { useState } from "react";
import { Html } from "@react-three/drei";
import { extColor, Orbital, StarSystem } from "@/lib/galaxy";

function Body({
  orbital,
  onFileClick,
}: {
  orbital: Orbital;
  onFileClick: (path: string) => void;
}) {
  const [hovered, setHovered] = useState(false);
  const x = Math.cos(orbital.angle) * orbital.radius;
  const z = Math.sin(orbital.angle) * orbital.radius;
  return (
    <group position={[x, orbital.y, z]}>
      <mesh
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
        onClick={() => {
          if (orbital.kind === "file") onFileClick(orbital.path);
        }}
      >
        <sphereGeometry args={[orbital.size, 24, 24]} />
        {orbital.kind === "dir" ? (
          <meshStandardMaterial color="#4d9fff" />
        ) : (
          <meshStandardMaterial color={extColor(orbital.path)} />
        )}
      </mesh>
      {hovered && (
        <Html center distanceFactor={30} style={{ pointerEvents: "none" }}>
          <div
            style={{
              background: "#141414",
              border: "1px solid #2a2a2a",
              padding: "4px 8px",
              color: "#e5e5e5",
              fontSize: 12,
              whiteSpace: "nowrap",
            }}
          >
            {orbital.path}
          </div>
        </Html>
      )}
    </group>
  );
}

export default function SystemView({
  system,
  orbitals,
  onFileClick,
}: {
  system: StarSystem;
  orbitals: Orbital[];
  onFileClick: (path: string) => void;
}) {
  return (
    <group>
      <mesh>
        <sphereGeometry args={[system.size * 1.5, 48, 48]} />
        <meshBasicMaterial color={system.color} />
      </mesh>
      <pointLight
        intensity={system.size * 30}
        distance={60}
        color={system.color}
      />
      {[10, 17].map((r) => (
        <mesh key={r} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[r - 0.03, r + 0.03, 96]} />
          <meshBasicMaterial color="#2a2a2a" />
        </mesh>
      ))}
      {orbitals.map((o) => (
        <Body key={o.path} orbital={o} onFileClick={onFileClick} />
      ))}
    </group>
  );
}
