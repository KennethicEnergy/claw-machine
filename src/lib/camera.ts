export type CameraFit = {
  width: number;
  height: number;
  fovDeg: number;
  aspect: number;
  padding?: number;
};

/** Distance at which a width x height box fills the view for the given vertical fov. */
export const fitCameraDistance = ({
  width,
  height,
  fovDeg,
  aspect,
  padding = 1,
}: CameraFit) => {
  const tanHalf = Math.tan((fovDeg * Math.PI) / 360);
  const forHeight = height / 2 / tanHalf;
  const forWidth = width / 2 / (tanHalf * aspect);
  return Math.max(forHeight, forWidth) * padding;
};
