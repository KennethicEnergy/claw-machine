"use client";

import { useId, useState } from "react";
import type { HTMLAttributes, ReactNode } from "react";

const INPUT =
  "mt-1 w-full rounded-xl bg-cream px-3 py-2 text-olive-900 ring-2 ring-olive-300/70 outline-none transition focus:ring-gold";

type FieldProps = {
  label: string;
  hint?: string;
  children: ReactNode;
};

export const Field = ({ label, hint, children }: FieldProps) => (
  <label className="block">
    <span className="text-xs font-extrabold uppercase tracking-wide text-olive-700">
      {label}
    </span>
    {children}
    {hint && <span className="mt-1 block text-xs text-olive-700">{hint}</span>}
  </label>
);

type DraftTextProps = {
  label: string;
  value: string;
  onCommit: (value: string) => void;
  /** Values that fail this stay as a local draft and are never saved. */
  isValid?: (value: string) => boolean;
  hint?: string;
  placeholder?: string;
  maxLength?: number;
  multiline?: boolean;
  type?: "text" | "password" | "url";
  inputMode?: HTMLAttributes<HTMLInputElement>["inputMode"];
};

const always = () => true;

/** Text input that only commits valid values, so the saved config never breaks. */
export const DraftText = ({
  label,
  value,
  onCommit,
  isValid = always,
  hint,
  placeholder,
  maxLength,
  multiline = false,
  type = "text",
  inputMode,
}: DraftTextProps) => {
  const [draft, setDraft] = useState(value);
  const [synced, setSynced] = useState(value);
  if (value !== synced) {
    setSynced(value);
    setDraft(value);
  }
  const valid = isValid(draft);
  const handleChange = (next: string) => {
    setDraft(next);
    if (isValid(next)) onCommit(next);
  };
  const shared = {
    value: draft,
    placeholder,
    maxLength,
    "aria-invalid": !valid,
    onBlur: () => {
      if (!valid) setDraft(value);
    },
    className: `${INPUT} ${valid ? "" : "ring-terracotta"}`,
  };
  return (
    <Field label={label} hint={hint}>
      {multiline ? (
        <textarea
          rows={3}
          {...shared}
          onChange={({ target }) => handleChange(target.value)}
        />
      ) : (
        <input
          type={type}
          inputMode={inputMode}
          {...shared}
          onChange={({ target }) => handleChange(target.value)}
        />
      )}
    </Field>
  );
};

type SliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  format?: (value: number) => string;
  hint?: string;
  /** Commit only when the thumb is released (for changes that respawn prizes). */
  commitOnRelease?: boolean;
};

export const Slider = ({
  label,
  value,
  min,
  max,
  step,
  onChange,
  format = String,
  hint,
  commitOnRelease = false,
}: SliderProps) => {
  const [draft, setDraft] = useState(value);
  const [synced, setSynced] = useState(value);
  if (value !== synced) {
    setSynced(value);
    setDraft(value);
  }
  const commit = () => {
    if (draft !== value) onChange(draft);
  };
  return (
    <Field label={`${label} · ${format(draft)}`} hint={hint}>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={draft}
        className="mt-2 w-full accent-olive-500"
        onChange={({ target }) => {
          const next = Number(target.value);
          setDraft(next);
          if (!commitOnRelease) onChange(next);
        }}
        onPointerUp={commitOnRelease ? commit : undefined}
        onKeyUp={commitOnRelease ? commit : undefined}
        onBlur={commitOnRelease ? commit : undefined}
      />
    </Field>
  );
};

type ColorFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  swatches: readonly string[];
};

export const ColorField = ({ label, value, onChange, swatches }: ColorFieldProps) => (
  <Field label={label}>
    <div className="mt-1 flex flex-wrap items-center gap-1.5">
      <input
        type="color"
        value={value}
        onChange={({ target }) => onChange(target.value.toUpperCase())}
        className="h-9 w-11 cursor-pointer rounded-lg bg-cream p-0.5 ring-2 ring-olive-300/70"
      />
      {swatches.map((swatch) => (
        <button
          key={swatch}
          type="button"
          aria-label={`Use ${swatch}`}
          onClick={() => onChange(swatch)}
          className={`h-6 w-6 rounded-full ring-2 transition hover:scale-110 ${swatch.toUpperCase() === value.toUpperCase() ? "ring-gold" : "ring-olive-900/10"}`}
          style={{ background: swatch }}
        />
      ))}
    </div>
  </Field>
);

type SelectFieldProps<T extends string> = {
  label: string;
  value: T;
  options: readonly { value: T; label: string }[];
  onChange: (value: T) => void;
};

export const SelectField = <T extends string>({
  label,
  value,
  options,
  onChange,
}: SelectFieldProps<T>) => (
  <Field label={label}>
    <select
      value={value}
      onChange={({ target }) => onChange(target.value as T)}
      className={INPUT}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </Field>
);

type ToggleProps = {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
};

export const Toggle = ({ label, checked, onChange }: ToggleProps) => {
  const id = useId();
  return (
    <div className="flex items-center gap-2">
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={({ target }) => onChange(target.checked)}
        className="h-4 w-4 accent-olive-500"
      />
      <label htmlFor={id} className="text-sm font-bold text-olive-700">
        {label}
      </label>
    </div>
  );
};

type SectionProps = {
  title: string;
  children: ReactNode;
};

export const Section = ({ title, children }: SectionProps) => (
  <section className="space-y-3 rounded-2xl bg-cream/70 p-4 ring-1 ring-olive-300/50">
    <h3 className="font-black text-olive-900">{title}</h3>
    {children}
  </section>
);
