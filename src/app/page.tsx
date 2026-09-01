"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Canvas } from "@react-three/fiber";
import { Stars } from "@react-three/drei";

export default function Home() {
  const [name, setName] = useState("");
  const router = useRouter();
  const go = () => {
    const user = name.trim();
    if (user) router.push(`/g/${encodeURIComponent(user)}`);
  };
  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        background: "#0a0a0a",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", inset: 0 }}>
        <Canvas camera={{ position: [0, 0, 0], fov: 60 }}>
          <Stars
            radius={150}
            depth={60}
            count={6000}
            factor={4}
            fade
            speed={0.6}
          />
        </Canvas>
      </div>
      <div
        style={{
          position: "relative",
          zIndex: 1,
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 380,
            background: "#0d0d0d",
            border: "1px solid #2a2a2a",
            padding: "36px 32px",
            display: "flex",
            flexDirection: "column",
            gap: 18,
          }}
        >
          <div>
            <h1
              style={{
                color: "#e5e5e5",
                fontSize: 26,
                letterSpacing: 6,
                fontWeight: 600,
                margin: 0,
              }}
            >
              URANOMETRIA
            </h1>
            <p style={{ color: "#8b8b8b", fontSize: 13, margin: "10px 0 0" }}>
              Turn a GitHub account into an explorable galaxy.
            </p>
          </div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") go();
            }}
            placeholder="GitHub username"
            autoFocus
            style={{
              background: "#141414",
              border: "1px solid #2a2a2a",
              color: "#e5e5e5",
              padding: "10px 12px",
              fontSize: 14,
              outline: "none",
            }}
          />
          <button
            onClick={go}
            style={{
              background: "#1a1a1a",
              border: "1px solid #3a3a3a",
              borderLeft: "3px solid #4d9fff",
              color: "#e5e5e5",
              padding: "10px 0",
              fontSize: 14,
              cursor: "pointer",
            }}
          >
            Explore
          </button>
          <p style={{ color: "#555", fontSize: 12, margin: 0 }}>
            Press Enter. Your own username works too.
          </p>
        </div>
      </div>
    </div>
  );
}
