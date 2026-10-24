import { describe, expect, it } from "vitest";
import { segmentTransform } from "./segment";

/** Where a Y-aligned rod of `length`, rotated by `rotationZ` about its center, ends. */
const ends = ({
  position: [cx, cy],
  rotationZ,
  length,
}: ReturnType<typeof segmentTransform>) => {
  const dx = (-Math.sin(rotationZ) * length) / 2;
  const dy = (Math.cos(rotationZ) * length) / 2;
  return [
    [cx + dx, cy + dy],
    [cx - dx, cy - dy],
  ];
};

describe("segmentTransform", () => {
  it("centers a vertical rod between its ends without rotating it", () => {
    expect(segmentTransform({ x: 0, y: 0 }, { x: 0, y: -2 })).toEqual({
      position: [0, -1, 0],
      rotationZ: 0,
      length: 2,
    });
  });

  it("rotates a Y-aligned rod so its ends land on both points", () => {
    const transform = segmentTransform({ x: 0, y: 0 }, { x: 0.2, y: -0.5 });
    const [[ax, ay], [bx, by]] = ends(transform);
    expect(ax).toBeCloseTo(0);
    expect(ay).toBeCloseTo(0);
    expect(bx).toBeCloseTo(0.2);
    expect(by).toBeCloseTo(-0.5);
  });
});
