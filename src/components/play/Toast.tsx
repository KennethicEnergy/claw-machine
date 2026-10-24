"use client";

import { useAutoDismiss } from "@/hooks/useAutoDismiss";
import { useGameStore } from "@/stores/useGameStore";

const TOAST_MS = 2600;

/** Gentle one-line messages like "So close, try again". */
export const Toast = () => {
  const toast = useGameStore((state) => state.toast);
  const dismissToast = useGameStore((state) => state.dismissToast);
  useAutoDismiss(toast?.id ?? null, dismissToast, TOAST_MS);

  return (
    <div
      aria-live="polite"
      className="pointer-events-none absolute inset-x-0 top-3 flex justify-center px-4"
    >
      {toast && (
        <p
          key={toast.id}
          className="motion-safe:animate-rise rounded-full bg-cream/95 px-5 py-2 text-center font-extrabold text-olive-900 shadow-lg ring-2 ring-olive-300"
        >
          {toast.text}
        </p>
      )}
    </div>
  );
};
