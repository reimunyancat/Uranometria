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
  const desiredQuat = useRef(new THREE.Quaternion());
  useEffect(() => {
    if (!target) return;
    const star = new THREE.Vector3(...target);
    dest.current = star.clone().add(new THREE.Vector3(8, 4, 8));
    const m = new THREE.Matrix4().lookAt(dest.current, star, camera.up);
    desiredQuat.current.setFromRotationMatrix(m);
  }, [target]);
  useFrame(() => {
    if (!dest.current) return;
    camera.position.lerp(dest.current, 0.055);
    camera.quaternion.slerp(desiredQuat.current, 0.08);
    if (camera.position.distanceTo(dest.current) < 1.5) {
      camera.quaternion.copy(desiredQuat.current);
      dest.current = null;
    }
  });
  return null;
}
