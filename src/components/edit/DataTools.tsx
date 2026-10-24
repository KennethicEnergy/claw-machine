"use client";

import { useState } from "react";
import { parseMachineConfigJson } from "@/game/schema";
import { downloadJson } from "@/lib/download";
import { useGameStore } from "@/stores/useGameStore";
import { useMachineStore } from "@/stores/useMachineStore";
import { Button, buttonClass } from "../ui/Button";
import { Section } from "./fields";

const MAX_ERRORS_SHOWN = 8;

type Notice = { tone: "ok" | "error"; lines: string[] };

export const DataTools = () => {
  const revision = useMachineStore((state) => state.config.revision);
  const exportConfig = useMachineStore((state) => state.exportConfig);
  const importConfig = useMachineStore((state) => state.importConfig);
  const resetConfig = useMachineStore((state) => state.resetConfig);
  const storageWarning = useMachineStore((state) => state.storageWarning);
  const dismissStorageWarning = useMachineStore((state) => state.dismissStorageWarning);
  const respawnAll = useGameStore((state) => state.respawnAll);
  const resetProgress = useGameStore((state) => state.resetProgress);
  const [notice, setNotice] = useState<Notice | null>(null);

  const handleExport = () => {
    const config = exportConfig();
    downloadJson(`claw-machine-config-r${config.revision}.json`, config);
    setNotice({ tone: "ok", lines: [`Saved revision ${config.revision}.`] });
  };

  const handleImport = async (file: File | undefined) => {
    if (!file) return;
    const result = parseMachineConfigJson(await file.text());
    if (!result.ok) {
      const { errors } = result;
      const hidden = errors.length - MAX_ERRORS_SHOWN;
      setNotice({
        tone: "error",
        lines: [
          ...errors.slice(0, MAX_ERRORS_SHOWN),
          ...(hidden > 0 ? [`…and ${hidden} more`] : []),
        ],
      });
      return;
    }
    importConfig(result.config);
    respawnAll();
    setNotice({
      tone: "ok",
      lines: [`Loaded "${result.config.title}". Fresh prizes are in!`],
    });
  };

  const confirmThen = (question: string, action: () => void) => () => {
    if (window.confirm(question)) action();
  };

  return (
    <div className="space-y-4">
      {storageWarning && (
        <p className="rounded-2xl bg-terracotta/15 p-3 text-sm font-bold text-olive-900 ring-2 ring-terracotta/40">
          {storageWarning}{" "}
          <button type="button" className="underline" onClick={dismissStorageWarning}>
            OK
          </button>
        </p>
      )}

      <Section title="The machine">
        <Button className="w-full" onClick={respawnAll}>
          Respawn all prizes
        </Button>
      </Section>

      <Section title="Save & share">
        <p className="text-sm text-olive-700">
          Export to back up your prizes, or to ship them as the app&apos;s default config
          (revision {revision}).
        </p>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={handleExport}>
            Export JSON
          </Button>
          <label className={buttonClass("secondary", "cursor-pointer")}>
            Import JSON
            <input
              type="file"
              accept="application/json,.json"
              className="sr-only"
              onChange={({ target }) => {
                void handleImport(target.files?.[0]);
                target.value = "";
              }}
            />
          </label>
        </div>
        {notice && (
          <ul
            role={notice.tone === "error" ? "alert" : "status"}
            className={`space-y-1 rounded-xl p-3 text-sm ${notice.tone === "error" ? "bg-terracotta/15 text-olive-900" : "bg-olive-300/30 text-olive-900"}`}
          >
            {notice.tone === "error" && (
              <li className="font-extrabold">That file needs a few fixes:</li>
            )}
            {notice.lines.map((line) => (
              <li key={line} className="break-words">
                {line}
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Start over">
        <Button
          variant="secondary"
          className="w-full"
          onClick={confirmThen(
            "Clear her collected gifts and tonight's pick?",
            resetProgress,
          )}
        >
          Reset progress
        </Button>
        <Button
          variant="danger"
          className="w-full"
          onClick={confirmThen(
            "Replace every prize and setting with the defaults?",
            () => {
              resetConfig();
              respawnAll();
            },
          )}
        >
          Reset to default
        </Button>
      </Section>
    </div>
  );
};
