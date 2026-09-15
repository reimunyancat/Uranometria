"use client";
import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

export default function WarpDriver({
  target,
}: {
  target: [number, number, number] | null;
}) {
  const { camera } = useThree();
  const dest = useRef<THREE.Vector3 | null>(null);
  useEffect(() => {
    if (target) {
      dest.current = new THREE.Vector3(...target).add(
        new THREE.Vector3(8, 4, 8),
      );
    }
  }, [target]);
  useFrame(() => {
    if (!dest.current) return;
    camera.position.lerp(dest.current, 0.055);
    if (camera.position.distanceTo(dest.current) < 1.5) dest.current = null;
  });
  return null;
}
