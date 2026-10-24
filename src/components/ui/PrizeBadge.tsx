import type { PrizeConfig } from "@/game/types";

type PrizeBadgeProps = {
  prize: Pick<PrizeConfig, "shape" | "color" | "secondaryColor">;
  size?: "sm" | "lg";
  /** Plays the little opening animation used on the reveal card. */
  opening?: boolean;
};

const SIZES = { sm: "h-9 w-9", lg: "h-24 w-24" } as const;

/** A flat, CSS-only portrait of a prize in its own colors. */
export const PrizeBadge = ({
  prize: { shape, color, secondaryColor },
  size = "sm",
  opening = false,
}: PrizeBadgeProps) => {
  const box = `relative ${SIZES[size]} shrink-0`;

  if (shape === "capsule-ball") {
    return (
      <span className={box} aria-hidden>
        <span
          className={`absolute inset-x-0 top-0 h-1/2 rounded-t-full ring-2 ring-olive-900/15 ${opening ? "motion-safe:animate-capsule-top" : ""}`}
          style={{ background: color }}
        />
        <span
          className={`absolute inset-x-0 bottom-0 h-1/2 rounded-b-full ring-2 ring-olive-900/15 ${opening ? "motion-safe:animate-capsule-bottom" : ""}`}
          style={{ background: secondaryColor }}
        />
      </span>
    );
  }

  if (shape === "gift" || shape === "box") {
    return (
      <span
        className={`${box} overflow-hidden rounded-xl ring-2 ring-olive-900/15`}
        style={{ background: color }}
        aria-hidden
      >
        <span
          className="absolute inset-y-0 left-1/2 w-1/5 -translate-x-1/2"
          style={{ background: secondaryColor }}
        />
        {shape === "gift" && (
          <span
            className="absolute inset-x-0 top-1/2 h-1/5 -translate-y-1/2"
            style={{ background: secondaryColor }}
          />
        )}
      </span>
    );
  }

  if (shape === "plush") {
    return (
      <span className={box} aria-hidden>
        <span
          className="absolute left-[6%] top-0 h-2/5 w-2/5 rounded-full"
          style={{ background: color }}
        />
        <span
          className="absolute right-[6%] top-0 h-2/5 w-2/5 rounded-full"
          style={{ background: color }}
        />
        <span
          className="absolute inset-x-0 bottom-0 h-4/5 rounded-full ring-2 ring-olive-900/15"
          style={{ background: color }}
        />
        <span
          className="absolute bottom-[18%] left-1/2 h-1/4 w-1/3 -translate-x-1/2 rounded-full"
          style={{ background: secondaryColor }}
        />
      </span>
    );
  }

  return (
    <span
      className={`${box} ${shape === "sphere" ? "rounded-full" : "rounded-[40%]"} ring-4`}
      style={{ background: color, ["--tw-ring-color" as string]: secondaryColor }}
      aria-hidden
    />
  );
};
