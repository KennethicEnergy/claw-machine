import type { StateStorage } from "zustand/middleware";

type KeyValueStorage = Pick<Storage, "getItem" | "setItem" | "removeItem">;

const attempt = <T>(action: () => T, fallback: T) => {
  try {
    return action();
  } catch {
    return fallback;
  }
};

/**
 * localStorage that never throws: reads fall back to empty, and failed writes
 * (usually a full quota from large photos) are reported through `onWriteError`.
 */
export const createSafeStorage = (
  getStorage: () => KeyValueStorage,
  onWriteError: (error: unknown) => void,
): StateStorage => ({
  getItem: (name) => attempt(() => getStorage().getItem(name), null),
  setItem: (name, value) => {
    try {
      getStorage().setItem(name, value);
    } catch (error) {
      onWriteError(error);
    }
  },
  removeItem: (name) => attempt(() => getStorage().removeItem(name), undefined),
});
