"use client";

import { useLayoutEffect } from "react";
import { OrbitControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import type { PerspectiveCamera } from "three";
import { CABINET_BASE_HEIGHT, CABINET_TRIM, MARQUEE_HEIGHT } from "@/config/machine";
import type { CabinetLayout } from "@/game/layout";
import { fitCameraDistance } from "@/lib/camera";

/** How far above the cabinet's middle the camera sits, as a share of its distance. */
const CAMERA_LIFT = 0.18;

type CameraRigProps = {
  layout: CabinetLayout;
  editMode: boolean;
};

/** Frames the whole cabinet for any screen shape; free orbiting in edit mode. */
export const CameraRig = ({ layout, editMode }: CameraRigProps) => {
  const camera = useThree((state) => state.camera) as PerspectiveCamera;
  const width = useThree((state) => state.size.width);
  const height = useThree((state) => state.size.height);
  const top = layout.height + MARQUEE_HEIGHT;
  const bottom = -CABINET_BASE_HEIGHT - 0.25;
  const centerY = (top + bottom) / 2;

  useLayoutEffect(() => {
    const distance = fitCameraDistance({
      width: layout.halfWidth * 2 + CABINET_TRIM * 2 + 0.4,
      height: top - bottom + 0.4,
      fovDeg: camera.fov,
      aspect: width / Math.max(1, height),
      padding: 1.06,
    });
    camera.position.set(0, centerY + distance * CAMERA_LIFT, distance);
    camera.lookAt(0, centerY, 0);
    camera.updateProjectionMatrix();
  }, [camera, width, height, layout, top, bottom, centerY, editMode]);

  if (!editMode) return null;
  return (
    <OrbitControls
      makeDefault
      target={[0, centerY, 0]}
      enablePan={false}
      minDistance={6}
      maxDistance={45}
      maxPolarAngle={Math.PI * 0.6}
    />
  );
};
