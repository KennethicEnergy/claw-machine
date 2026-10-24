import { describe, expect, it } from "vitest";
import { cabinetLayout, clampToBounds, isOverChute } from "./layout";

const layout = cabinetLayout({ width: 6, depth: 4, height: 6.5 });

describe("cabinetLayout", () => {
  it("puts the chute in the front-left corner", () => {
    const { chute } = layout;
    expect(chute.x - chute.size / 2).toBeCloseTo(-3);
    expect(chute.z + chute.size / 2).toBeCloseTo(2);
  });

  it("parks the claw above the chute", () => {
    expect(layout.home.x).toBe(layout.chute.x);
    expect(layout.home.z).toBe(layout.chute.z);
    expect(layout.restY).toBeLessThan(layout.railY);
  });

  it("keeps the claw home inside its steering bounds", () => {
    const { bounds, home } = layout;
    expect(home.x).toBeGreaterThanOrEqual(bounds.minX);
    expect(home.z).toBeLessThanOrEqual(bounds.maxZ);
  });

  it("keeps the steering bounds inside the walls", () => {
    expect(layout.bounds.minX).toBeGreaterThan(-3);
    expect(layout.bounds.maxX).toBeLessThan(3);
    expect(layout.bounds.minZ).toBeGreaterThan(-2);
    expect(layout.bounds.maxZ).toBeLessThan(2);
  });
});

describe("clampToBounds", () => {
  it("leaves positions inside the bounds alone", () => {
    expect(clampToBounds({ x: 0.5, z: -0.5 }, layout.bounds)).toEqual({
      x: 0.5,
      z: -0.5,
    });
  });

  it("pulls positions back to the nearest edge", () => {
    expect(clampToBounds({ x: 10, z: -10 }, layout.bounds)).toEqual({
      x: layout.bounds.maxX,
      z: layout.bounds.minZ,
    });
  });
});

describe("isOverChute", () => {
  it("is true at the chute center and false in the middle of the floor", () => {
    expect(isOverChute(layout.chute, layout.chute)).toBe(true);
    expect(isOverChute({ x: 0, z: 0 }, layout.chute)).toBe(false);
  });

  it("can pad the chute so prizes never spawn near its edge", () => {
    const justOutside = {
      x: layout.chute.x + layout.chute.size / 2 + 0.1,
      z: layout.chute.z,
    };
    expect(isOverChute(justOutside, layout.chute)).toBe(false);
    expect(isOverChute(justOutside, layout.chute, 0.3)).toBe(true);
  });
});
