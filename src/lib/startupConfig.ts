import { parseMachineConfig } from "@/game/schema";
import type { MachineConfig } from "@/game/types";

/**
 * Picks the config to start with: the one saved on this device, unless it is
 * broken or a newer revision has been shipped with the app.
 */
export const chooseStartupConfig = (saved: unknown, bundled: MachineConfig) => {
  const result = parseMachineConfig(saved);
  if (!result.ok || result.config.revision < bundled.revision) return bundled;
  return result.config;
};
