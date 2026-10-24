"use client";

import { useState } from "react";
import { useGameStore } from "@/stores/useGameStore";
import { useMachineStore } from "@/stores/useMachineStore";
import { Button } from "../ui/Button";

type PinDialogProps = {
  onClose: () => void;
};

/** Keeps the editor out of the way of accidental taps. Not real security. */
export const PinDialog = ({ onClose }: PinDialogProps) => {
  const editPin = useMachineStore((state) => state.config.editPin);
  const setEditMode = useGameStore((state) => state.setEditMode);
  const [value, setValue] = useState("");
  const [wrong, setWrong] = useState(false);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pin-title"
      className="fixed inset-0 z-50 grid place-items-center bg-olive-900/40 p-4 backdrop-blur-sm"
      onKeyDown={({ key }) => {
        if (key === "Escape") onClose();
      }}
    >
      <form
        className="motion-safe:animate-pop w-full max-w-xs rounded-[2rem] bg-cream p-6 text-center shadow-2xl ring-4 ring-olive-300"
        onSubmit={(event) => {
          event.preventDefault();
          if (value !== editPin) {
            setWrong(true);
            setValue("");
            return;
          }
          setEditMode(true);
          onClose();
        }}
      >
        <h2 id="pin-title" className="text-xl font-black text-olive-900">
          Machine keeper only 🔒
        </h2>
        <p className="mt-1 text-sm text-olive-700">Enter the PIN to edit prizes.</p>
        <input
          type="password"
          inputMode="numeric"
          autoComplete="off"
          autoFocus
          maxLength={8}
          value={value}
          aria-label="PIN"
          aria-invalid={wrong}
          onChange={({ target }) => {
            setValue(target.value.replace(/\D/g, ""));
            setWrong(false);
          }}
          className="mt-4 w-full rounded-2xl bg-olive-100 px-4 py-3 text-center text-2xl font-black tracking-[0.5em] text-olive-900 outline-none ring-2 ring-olive-300 focus:ring-gold"
        />
        {wrong && (
          <p className="mt-2 rounded-full bg-terracotta/20 px-3 py-1 text-sm font-bold text-olive-900">
            Not quite. Try again?
          </p>
        )}
        <div className="mt-5 flex justify-center gap-2">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={value.length < 4}>
            Open editor
          </Button>
        </div>
      </form>
    </div>
  );
};
