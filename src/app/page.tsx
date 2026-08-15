"use client";
import { Canvas } from "@react-three/fiber";
import { PointerLockControls, Stars } from "@react-three/drei";
import FlyControls from "@/components/FlyControls";
function Planet({
  position,
  color,
  size,
}: {
  position: [number, number, number];
  color: string;
  size: number;
}) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial color={color} />
    </mesh>
  );
}
export default function Home() {
  return (
    <div style={{ width: "100vw", height: "100vh", background: "#0a0a0a" }}>
      <Canvas camera={{ position: [0, 5, 20], fov: 60 }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[0, 0, 0]} intensity={200} color="#ffd9a0" />
        <mesh>
          <sphereGeometry args={[2.5, 64, 64]} />
          <meshBasicMaterial color="#ffb84d" />
        </mesh>
        <Planet position={[8, 0, 0]} color="#4d9fff" size={0.8} />
        <Planet position={[-12, 2, -6]} color="#7ddf8a" size={1.1} />
        <Planet position={[4, -3, -14]} color="#d97a6c" size={0.6} />
        <Stars radius={100} depth={50} count={5000} factor={4} fade />
        <PointerLockControls />
        <FlyControls />
      </Canvas>
    </div>
  );
}
