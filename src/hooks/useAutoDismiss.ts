import { useEffect } from "react";

/** Calls `dismiss` after `ms` whenever `id` changes (e.g. a new toast). */
export const useAutoDismiss = (
  id: number | null,
  dismiss: (id: number) => void,
  ms: number,
) => {
  useEffect(() => {
    if (id === null) return;
    const timer = window.setTimeout(() => dismiss(id), ms);
    return () => window.clearTimeout(timer);
  }, [id, dismiss, ms]);
};
