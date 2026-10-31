import { describe, expect, it } from "vitest";
import { shatterPieces } from "./shatter";

describe("shatterPieces", () => {
  it("breaks the same way for the same seed", () => {
    expect(shatterPieces(7)).toEqual(shatterPieces(7));
  });

  it("starts every crack at the impact", () => {
    const { cracks } = shatterPieces(7);
    expect(cracks.length).toBeGreaterThan(0);
    for (const crack of cracks) expect(crack[0]).toEqual({ x: 0, y: 0 });
  });

  it("makes shards that fall down", () => {
    const { shards } = shatterPieces(7);
    expect(shards.length).toBeGreaterThan(0);
    for (const shard of shards) {
      expect(shard.points.length).toBeGreaterThanOrEqual(3);
      expect(shard.fall.y).toBeGreaterThan(0);
    }
  });
});
