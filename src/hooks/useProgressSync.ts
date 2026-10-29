import { useEffect } from "react";
import { PROGRESS_STORAGE_KEY, useGameStore } from "@/stores/useGameStore";

/**
 * Keeps this copy of the app in step with any other one on the phone: picks up
 * gifts saved elsewhere when they are saved, and whenever this one comes back.
 */
export const useProgressSync = () => {
  const syncProgress = useGameStore((state) => state.syncProgress);

  useEffect(() => {
    const handleStorage = ({ key }: StorageEvent) => {
      if (key === PROGRESS_STORAGE_KEY) syncProgress();
    };
    const handleVisibility = () => {
      if (!document.hidden) syncProgress();
    };
    window.addEventListener("storage", handleStorage);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("storage", handleStorage);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [syncProgress]);
};
