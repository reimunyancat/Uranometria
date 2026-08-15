"use client";
import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
export default function FlyControls() {
  const { camera } = useThree();
  const keys = useRef<Record<string, boolean>>({});
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keys.current[e.code] = true;
    };
    const up = (e: KeyboardEvent) => {
      keys.current[e.code] = false;
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
    };
  }, []);
  useFrame((_, delta) => {
    const speed = 12 * delta;
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    const right = new THREE.Vector3().crossVectors(dir, camera.up).normalize();
    if (keys.current["KeyW"]) camera.position.addScaledVector(dir, speed);
    if (keys.current["KeyS"]) camera.position.addScaledVector(dir, -speed);
    if (keys.current["KeyD"]) camera.position.addScaledVector(right, speed);
    if (keys.current["KeyA"]) camera.position.addScaledVector(right, -speed);
    if (keys.current["Space"]) camera.position.y += speed;
    if (keys.current["ShiftLeft"]) camera.position.y -= speed;
  });
  return null;
}
