"use client";
import { useRef, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const BASE_SPEED = 30;
const SPRINT_MULT = 3.5;
const ACCEL = 8;

export default function FlyControls() {
  const { camera } = useThree();
  const keys = useRef<Record<string, boolean>>({});
  const velocity = useRef(new THREE.Vector3());
  const speedScale = useRef(1);
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      keys.current[e.code] = true;
    };
    const up = (e: KeyboardEvent) => {
      keys.current[e.code] = false;
    };
    const wheel = (e: WheelEvent) => {
      speedScale.current = THREE.MathUtils.clamp(
        speedScale.current * (e.deltaY > 0 ? 0.85 : 1.18),
        0.2,
        8,
      );
    };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    window.addEventListener("wheel", wheel);
    return () => {
      window.removeEventListener("keydown", down);
      window.removeEventListener("keyup", up);
      window.removeEventListener("wheel", wheel);
    };
  }, []);
  useFrame((_, delta) => {
    const sprint = keys.current["ShiftLeft"] || keys.current["ShiftRight"];
    const targetSpeed =
      BASE_SPEED * speedScale.current * (sprint ? SPRINT_MULT : 1);
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    const right = new THREE.Vector3().crossVectors(dir, camera.up).normalize();
    const wish = new THREE.Vector3();
    if (keys.current["KeyW"]) wish.add(dir);
    if (keys.current["KeyS"]) wish.sub(dir);
    if (keys.current["KeyD"]) wish.add(right);
    if (keys.current["KeyA"]) wish.sub(right);
    if (keys.current["KeyE"]) wish.y += 1;
    if (keys.current["KeyQ"]) wish.y -= 1;
    if (wish.lengthSq() > 0)
      wish.normalize().multiplyScalar(targetSpeed * delta);
    velocity.current.lerp(wish, Math.min(ACCEL * delta, 1));
    camera.position.add(velocity.current);
  });
  return null;
}
