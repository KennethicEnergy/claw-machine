"use client";

import dynamic from "next/dynamic";
import { LoadingScreen } from "./play/LoadingScreen";

/**
 * Client-only: progress and prizes live in localStorage, so rendering on the
 * server would only show the defaults and then flash.
 */
const ClawMachineApp = dynamic(() => import("./ClawMachineApp"), {
  ssr: false,
  loading: () => <LoadingScreen />,
});

export const ClawMachineLoader = () => <ClawMachineApp />;
