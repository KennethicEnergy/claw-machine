import { useEffect } from "react";

/** Disposes a three.js resource when it is replaced or the component unmounts. */
export const useDispose = (resource: { dispose: () => void } | null) => {
  useEffect(() => () => resource?.dispose(), [resource]);
};
