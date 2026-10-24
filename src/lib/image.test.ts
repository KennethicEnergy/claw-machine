import { describe, expect, it } from "vitest";
import { fitWithin } from "./image";

describe("fitWithin", () => {
  it("shrinks a landscape photo to the max width, keeping its shape", () => {
    expect(fitWithin(4000, 3000, 640)).toEqual({ width: 640, height: 480 });
  });

  it("shrinks a portrait photo to the max height", () => {
    expect(fitWithin(1080, 1920, 640)).toEqual({ width: 360, height: 640 });
  });

  it("never enlarges small images", () => {
    expect(fitWithin(200, 100, 640)).toEqual({ width: 200, height: 100 });
  });
});
