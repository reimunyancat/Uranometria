"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Canvas } from "@react-three/fiber";
import { PointerLockControls, Stars } from "@react-three/drei";
import FlyControls from "@/components/FlyControls";
import StarField from "@/components/StarField";
import SystemView from "@/components/SystemView";
import FileViewer from "@/components/FileViewer";
import {
  fetchDemo,
  fetchFile,
  fetchGalaxy,
  fetchTree,
  layoutGalaxy,
  layoutSystem,
  Orbital,
  StarSystem,
} from "@/lib/galaxy";

const MY_ACCOUNT = "reimunyancat";

export default function GalaxyPage() {
  const params = useParams();
  const router = useRouter();
  const user = decodeURIComponent(params.user as string);
  const isMine = user.toLowerCase() === MY_ACCOUNT;
  const [systems, setSystems] = useState<StarSystem[]>([]);
  const [selected, setSelected] = useState<StarSystem | null>(null);
  const [orbitals, setOrbitals] = useState<Orbital[]>([]);
  const [viewer, setViewer] = useState<{
    path: string;
    content: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const load = isMine ? fetchGalaxy() : fetchDemo(user);
    load
      .then((repos) => setSystems(layoutGalaxy(repos)))
      .catch((e) => setError(String(e)));
  }, [user, isMine]);
  const enterSystem = (s: StarSystem) => {
    setSelected(s);
    setViewer(null);
    fetchTree(user, s.name)
      .then((tree) => setOrbitals(layoutSystem(tree)))
      .catch((e) => setError(String(e)));
  };
  const openFile = (path: string) => {
    if (!selected) return;
    fetchFile(user, selected.name, path)
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
      <div
        style={{
          position: "absolute",
          top: 16,
          left: 16,
          zIndex: 1,
          display: "flex",
          gap: 8,
        }}
      >
        <button
          onClick={() => router.push("/")}
          style={{
            background: "#141414",
            border: "1px solid #2a2a2a",
            color: "#e5e5e5",
            padding: "6px 12px",
            cursor: "pointer",
          }}
        >
          Home
        </button>
        {selected && (
          <button
            onClick={() => setSelected(null)}
            style={{
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
      </div>
      <p
        style={{
          position: "absolute",
          bottom: 14,
          left: 16,
          zIndex: 1,
          color: "#555",
          fontSize: 12,
          margin: 0,
        }}
      >
        Click to fly · WASD move · Q/E down/up · Shift sprint · Wheel speed ·
        Esc release
      </p>
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
