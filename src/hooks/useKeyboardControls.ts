import { useEffect } from "react";
import type { ClawInput } from "@/game/types";
import { keysToVector, MOVE_KEYS } from "@/lib/controls";

const INTERACTIVE_TAGS = new Set(["INPUT", "TEXTAREA", "SELECT", "BUTTON", "A"]);

/** Typing in the editor or pressing a focused button should not steer the claw. */
const isInteractive = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || INTERACTIVE_TAGS.has(target.tagName));

type KeyboardControls = {
  input: ClawInput;
  onDrop: () => void;
  onEditShortcut: () => void;
};

/** Arrows/WASD steer, Space drops, Shift+E asks for the edit PIN. */
export const useKeyboardControls = ({
  input,
  onDrop,
  onEditShortcut,
}: KeyboardControls) => {
  useEffect(() => {
    const pressed = new Set<string>();
    const sync = () => Object.assign(input, keysToVector(pressed));

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "KeyE" && event.shiftKey && !isInteractive(event.target)) {
        onEditShortcut();
        return;
      }
      if (isInteractive(event.target)) return;
      if (event.code === "Space") {
        event.preventDefault();
        if (!event.repeat) onDrop();
        return;
      }
      if (!MOVE_KEYS.has(event.code)) return;
      event.preventDefault();
      pressed.add(event.code);
      sync();
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      if (pressed.delete(event.code)) sync();
    };
    const handleBlur = () => {
      pressed.clear();
      sync();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", handleBlur);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", handleBlur);
    };
  }, [input, onDrop, onEditShortcut]);
};
