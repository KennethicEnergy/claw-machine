import { describe, expect, it } from "vitest";
import { cabinetBoxes } from "./cabinetGeometry";
import type { Box } from "./cabinetGeometry";
import { cabinetLayout } from "./layout";

const layout = cabinetLayout({ width: 6, depth: 4.5, height: 6.5 });
const boxes = cabinetBoxes(layout);
const { chute, halfWidth, halfDepth } = layout;

const footprint = ({ position: [x, , z], halfExtents: [hx, , hz] }: Box) => ({
  minX: x - hx,
  maxX: x + hx,
  minZ: z - hz,
  maxZ: z + hz,
});

const chuteRect = {
  minX: chute.x - chute.size / 2,
  maxX: chute.x + chute.size / 2,
  minZ: chute.z - chute.size / 2,
  maxZ: chute.z + chute.size / 2,
};

const overlapArea = (a: ReturnType<typeof footprint>, b: ReturnType<typeof footprint>) =>
  Math.max(0, Math.min(a.maxX, b.maxX) - Math.max(a.minX, b.minX)) *
  Math.max(0, Math.min(a.maxZ, b.maxZ) - Math.max(a.minZ, b.minZ));

const top = ({ position: [, y], halfExtents: [, hy] }: Box) => y + hy;

describe("cabinetBoxes", () => {
  it("leaves the chute open in the floor", () => {
    for (const strip of boxes.floor) {
      expect(overlapArea(footprint(strip), chuteRect)).toBeCloseTo(0);
    }
  });

  it("covers the rest of the floor exactly, with its top at y = 0", () => {
    const floorArea = boxes.floor.reduce((sum, strip) => {
      const { minX, maxX, minZ, maxZ } = footprint(strip);
      return sum + (maxX - minX) * (maxZ - minZ);
    }, 0);
    expect(floorArea + chute.size * chute.size).toBeCloseTo(4 * halfWidth * halfDepth);
    expect(boxes.floor.every((strip) => Math.abs(top(strip)) < 1e-9)).toBe(true);
  });

  it("fences the chute on its two open sides", () => {
    for (const wall of boxes.barrier) {
      expect(overlapArea(footprint(wall), chuteRect)).toBeGreaterThan(0);
      expect(top(wall)).toBeGreaterThan(0.3);
    }
  });

  it("puts the win sensor in the pit, under the chute", () => {
    const sensor = footprint(boxes.sensor);
    expect(sensor.minX).toBeGreaterThan(chuteRect.minX);
    expect(sensor.maxX).toBeLessThan(chuteRect.maxX);
    expect(top(boxes.sensor)).toBeLessThan(0);
    expect(boxes.sensor.position[1]).toBeGreaterThan(top(boxes.pit[0]));
  });

  it("encloses the play area with walls reaching above the ceiling line", () => {
    const [left, right, back, front] = boxes.walls;
    expect(left.position[0] + left.halfExtents[0]).toBeCloseTo(-halfWidth);
    expect(right.position[0] - right.halfExtents[0]).toBeCloseTo(halfWidth);
    expect(back.position[2] + back.halfExtents[2]).toBeCloseTo(-halfDepth);
    expect(front.position[2] - front.halfExtents[2]).toBeCloseTo(halfDepth);
    expect(top(front)).toBeGreaterThanOrEqual(layout.height);
  });
});
