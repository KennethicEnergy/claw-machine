"use client";

import { isFilled } from "@/lib/validators";
import { useGameStore } from "@/stores/useGameStore";
import { useMachineStore } from "@/stores/useMachineStore";
import { DraftText } from "../edit/fields";

/** Title and subtitle; editable in place while the machine keeper is editing. */
export const Header = () => {
  const title = useMachineStore((state) => state.config.title);
  const subtitle = useMachineStore((state) => state.config.subtitle);
  const updateConfig = useMachineStore((state) => state.updateConfig);
  const editMode = useGameStore((state) => state.editMode);

  if (editMode) {
    return (
      <header className="grid gap-2 px-4 pt-3 sm:grid-cols-2">
        <DraftText
          label="Title"
          value={title}
          onCommit={(next) => updateConfig({ title: next })}
          isValid={isFilled}
          maxLength={60}
        />
        <DraftText
          label="Subtitle"
          value={subtitle}
          onCommit={(next) => updateConfig({ subtitle: next })}
          maxLength={120}
        />
      </header>
    );
  }

  return (
    <header className="px-4 pt-4 text-center">
      <h1 className="text-2xl font-black tracking-tight text-olive-900 sm:text-3xl">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-0.5 text-sm font-semibold text-olive-700">{subtitle}</p>
      )}
    </header>
  );
};
