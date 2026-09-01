"use client";
import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { PointerLockControls, Stars } from "@react-three/drei";
import FlyControls from "@/components/FlyControls";
import StarField from "@/components/StarField";
import SystemView from "@/components/SystemView";
import {
  fetchGalaxy,
  fetchTree,
  layoutGalaxy,
  layoutSystem,
  Orbital,
  StarSystem,
  fetchFile,
} from "@/lib/galaxy";
import FileViewer from "@/components/FileViewer";

export default function Home() {
  const [systems, setSystems] = useState<StarSystem[]>([]);
  const [selected, setSelected] = useState<StarSystem | null>(null);
  const [orbitals, setOrbitals] = useState<Orbital[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [viewer, setViewer] = useState<{
    path: string;
    content: string;
  } | null>(null);
  useEffect(() => {
    fetchGalaxy()
      .then((repos) => setSystems(layoutGalaxy(repos)))
      .catch((e) => setError(String(e)));
  }, []);
  const enterSystem = (s: StarSystem) => {
    setSelected(s);
    fetchTree("reimunyancat", s.name)
      .then((tree) => setOrbitals(layoutSystem(tree)))
      .catch((e) => setError(String(e)));
  };
  const openFile = (path: string) => {
    if (!selected) return;
    fetchFile("reimunyancat", selected.name, path)
      .then((content) => setViewer({ path, content }))
      .catch((e) => setError(String(e)));
  };
  return (
    <div style={{ width: "100vw", height: "100vh", background: "#0a0a0a" }}>
      {error && (
        <p
          style={{
            color: "#d97a6c",
            position: "absolute",
            top: 16,
            left: 16,
            zIndex: 1,
          }}
        >
          Failed to load: {error}
        </p>
      )}
      {selected && (
        <button
          onClick={() => setSelected(null)}
          style={{
            position: "absolute",
            top: 16,
            left: 16,
            zIndex: 1,
            background: "#141414",
            border: "1px solid #2a2a2a",
            color: "#e5e5e5",
            padding: "6px 12px",
            cursor: "pointer",
          }}
        >
          Back to galaxy
        </button>
      )}
      <Canvas
        camera={{ position: [0, 30, 90], fov: 60 }}
        key={selected?.name ?? "galaxy"}
      >
        <ambientLight intensity={0.15} />
        <Stars radius={200} depth={80} count={8000} factor={4} fade />
        {selected ? (
          <SystemView
            system={selected}
            orbitals={orbitals}
            onFileClick={openFile}
          />
        ) : (
          <StarField systems={systems} onSelect={enterSystem} />
        )}
        <PointerLockControls />
        <FlyControls />
      </Canvas>
      {viewer && (
        <FileViewer
          repo={selected?.name ?? ""}
          path={viewer.path}
          content={viewer.content}
          onClose={() => setViewer(null)}
        />
      )}
    </div>
  );
}
