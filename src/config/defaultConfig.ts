import { machineConfigSchema } from "@/game/schema";
import type { MachineConfig } from "@/game/types";
import raw from "./default-config.json";

/**
 * The config shipped with the app. Replace default-config.json with a file
 * exported from the edit panel to change what she sees on first load.
 */
export const DEFAULT_CONFIG: MachineConfig = machineConfigSchema.parse(raw);
