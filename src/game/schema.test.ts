import { describe, expect, it } from "vitest";
import { makeConfig, makePrize } from "@/test/fixtures";
import { parseMachineConfig, parseMachineConfigJson } from "./schema";

const withDecidePrizes = (...prizes: ReturnType<typeof makePrize>[]) => {
  const config = makeConfig();
  return { ...config, modes: { ...config.modes, decide: { prizes } } };
};

const errorsFor = (input: unknown) => {
  const result = parseMachineConfig(input);
  return result.ok ? [] : result.errors;
};

describe("parseMachineConfig", () => {
  it("accepts a complete config", () => {
    const config = makeConfig();
    expect(parseMachineConfig(config)).toEqual({ ok: true, config });
  });

  it("accepts optional extras like data URL images, links and redeem notes", () => {
    const prize = makePrize({
      imageUrl: "data:image/jpeg;base64,AAAA",
      link: "https://maps.google.com/?q=ramen",
      redeemNote: "Valid for one weekend trip",
      emissive: "#C9A24B",
    });
    expect(parseMachineConfig(withDecidePrizes(prize)).ok).toBe(true);
  });

  it("points at the exact prize field that is out of range", () => {
    const errors = errorsFor(
      withDecidePrizes(makePrize(), makePrize({ id: "b", size: 2 })),
    );
    expect(errors).toEqual([
      "modes.decide.prizes[1].size: Size must be between 0.3 and 1.2",
    ]);
  });

  it("rejects slipperiness outside 0–1", () => {
    expect(errorsFor(withDecidePrizes(makePrize({ slipperiness: 1.5 })))).toEqual([
      "modes.decide.prizes[0].slipperiness: Slipperiness must be between 0 and 1",
    ]);
  });

  it("rejects colors that are not 6-digit hex", () => {
    expect(errorsFor(withDecidePrizes(makePrize({ color: "green" })))).toEqual([
      "modes.decide.prizes[0].color: Use a hex color like #6B7A2E",
    ]);
  });

  it("lists the allowed shapes when the shape is unknown", () => {
    const [error] = errorsFor(
      withDecidePrizes({ ...makePrize(), shape: "star" } as never),
    );
    expect(error).toContain("modes.decide.prizes[0].shape:");
    expect(error).toContain("capsule-ball");
  });

  it("rejects duplicate prize ids within a mode", () => {
    expect(errorsFor(withDecidePrizes(makePrize(), makePrize()))).toEqual([
      'modes.decide.prizes[1].id: Prize id "ramen" is used twice',
    ]);
  });

  it("only allows web links so imported files cannot run scripts", () => {
    expect(
      errorsFor(withDecidePrizes(makePrize({ link: "javascript:alert(1)" }))),
    ).toEqual(["modes.decide.prizes[0].link: Links must start with http:// or https://"]);
  });

  it("only allows web or uploaded images", () => {
    expect(
      errorsFor(withDecidePrizes(makePrize({ imageUrl: "file:///c/me.png" }))),
    ).toEqual([
      "modes.decide.prizes[0].imageUrl: Images must be an http(s) URL or an uploaded image",
    ]);
  });

  it("requires a whole-number pity threshold of at least zero", () => {
    expect(errorsFor(makeConfig({ pityThreshold: 1.5 }))).toEqual([
      "pityThreshold: Pity threshold must be a whole number from 0 to 10",
    ]);
  });

  it("gives configs saved before the daily limit one gift per day", () => {
    const { giftsPerDay, ...older } = makeConfig({ giftsPerDay: 4 });
    void giftsPerDay;
    const result = parseMachineConfig(older);
    expect(result.ok && result.config.giftsPerDay).toBe(1);
  });

  it("rejects a negative daily gift limit", () => {
    expect(errorsFor(makeConfig({ giftsPerDay: -1 }))).toEqual([
      "giftsPerDay: Gifts per day must be a whole number from 0 to 20",
    ]);
  });

  it("reports every problem at once", () => {
    expect(errorsFor(makeConfig({ title: "", clawStrength: 4 }))).toHaveLength(2);
  });

  it("explains a missing section", () => {
    const { modes, ...withoutModes } = makeConfig();
    void modes;
    expect(errorsFor(withoutModes)).toEqual(["modes: This section is missing"]);
  });
});

describe("parseMachineConfigJson", () => {
  it("parses and validates JSON text", () => {
    const config = makeConfig();
    expect(parseMachineConfigJson(JSON.stringify(config))).toEqual({ ok: true, config });
  });

  it("reports text that is not JSON", () => {
    expect(parseMachineConfigJson("{ nope")).toEqual({
      ok: false,
      errors: ["That file isn't valid JSON. Export a fresh copy and try again."],
    });
  });
});
