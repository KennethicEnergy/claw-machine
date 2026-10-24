import { describe, expect, it } from "vitest";
import { fitCameraDistance } from "./camera";

describe("fitCameraDistance", () => {
  it("fits the height when the screen is wide", () => {
    // fov 90 -> tan(45deg) = 1, so half the height is the distance
    expect(fitCameraDistance({ width: 4, height: 6, fovDeg: 90, aspect: 2 })).toBeCloseTo(
      3,
    );
  });

  it("backs away to fit the width on a narrow phone", () => {
    // half width 2 / (tan 45 * aspect 0.5) = 4
    expect(
      fitCameraDistance({ width: 4, height: 6, fovDeg: 90, aspect: 0.5 }),
    ).toBeCloseTo(4);
  });

  it("adds breathing room with padding", () => {
    expect(
      fitCameraDistance({ width: 4, height: 6, fovDeg: 90, aspect: 2, padding: 1.1 }),
    ).toBeCloseTo(3.3);
  });
});
