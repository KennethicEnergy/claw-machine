import { useCallback, useRef } from "react";
import type { PointerEvent } from "react";
import { isDoubleTap } from "@/lib/doubleTap";
import type { Tap } from "@/lib/doubleTap";
import type { Point } from "@/lib/shatter";

/** Pointer-up handler that calls `onDoubleTap` with the spot, relative to the element. */
export const useDoubleTap = (onDoubleTap: (point: Point) => void) => {
  const lastTap = useRef<Tap | null>(null);

  return useCallback(
    (event: PointerEvent<HTMLElement>) => {
      if (!event.isPrimary) return;
      const bounds = event.currentTarget.getBoundingClientRect();
      const tap = {
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
        time: event.timeStamp,
      };
      if (isDoubleTap(lastTap.current, tap)) {
        lastTap.current = null;
        onDoubleTap(tap);
      } else {
        lastTap.current = tap;
      }
    },
    [onDoubleTap],
  );
};
